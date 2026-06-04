export const COGNITO_AUTH_STORAGE_KEY = "cognito_auth";

interface StoredAuthenticationResult {
  AccessToken?: string;
  IdToken?: string;
  RefreshToken?: string;
  ExpiresIn?: number;
  TokenType?: string;
}

interface StoredCognitoAuth {
  AuthenticationResult?: StoredAuthenticationResult;
  [key: string]: unknown;
}

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

let refreshInFlight: Promise<string | undefined> | null = null;

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function setCognitoAuthSession(data: unknown): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(COGNITO_AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function getCognitoAuthSession(): StoredCognitoAuth | null {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(COGNITO_AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredCognitoAuth;
  } catch {
    return null;
  }
}

export function clearCognitoAuthSession(): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(COGNITO_AUTH_STORAGE_KEY);
}

export function getAccessToken(): string | undefined {
  return getCognitoAuthSession()?.AuthenticationResult?.AccessToken;
}

export function getRefreshToken(): string | undefined {
  return getCognitoAuthSession()?.AuthenticationResult?.RefreshToken;
}

export function isAccessTokenValid(): boolean {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

function getCognitoConfig(): { apiUrl?: string; clientId?: string } {
  return {
    apiUrl: process.env.NEXT_PUBLIC_AWS_COGNITO_API_URL,
    clientId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID || "",
  };
}

async function performRefresh(): Promise<string | undefined> {
  if (!hasWindow()) {
    return undefined;
  }

  const currentSession = getCognitoAuthSession();
  const refreshToken = currentSession?.AuthenticationResult?.RefreshToken;
  if (!refreshToken) {
    return undefined;
  }

  const { apiUrl, clientId } = getCognitoConfig();
  if (!apiUrl || !clientId) {
    return undefined;
  }

  const response = await fetch(`${apiUrl}InitiateAuth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    }),
  });

  if (!response.ok) {
    return undefined;
  }

  const refreshed = (await response.json()) as StoredCognitoAuth;
  const nextAuthResult: StoredAuthenticationResult = {
    ...(currentSession?.AuthenticationResult || {}),
    ...(refreshed.AuthenticationResult || {}),
    RefreshToken:
      refreshed.AuthenticationResult?.RefreshToken ||
      currentSession?.AuthenticationResult?.RefreshToken,
  };

  const nextSession: StoredCognitoAuth = {
    ...currentSession,
    ...refreshed,
    AuthenticationResult: nextAuthResult,
  };

  setCognitoAuthSession(nextSession);
  return nextAuthResult.AccessToken;
}

export async function refreshAccessToken(): Promise<string | undefined> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}
