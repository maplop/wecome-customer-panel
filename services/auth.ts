import { apiClient, API_ENDPOINTS } from "@/api/dynamicore/frontend";
import AwsCognito, { SERVICES as COGNITO_SERVICES } from "@/api/aws/cognito";
import { isApiClientError } from "@/api/core";
import {
  clearCognitoAuthSession,
  getAccessToken,
  setCognitoAuthSession,
} from "@/lib/auth-session";
import { getClientData } from "@/services/client-data";
import { useClientDataStore } from "@/stores/client-data-store";

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  attributes?: Array<{
    Name: string;
    Value: string;
  }>;
}

export interface RegisterResponse {
  id?: string;
  email: string;
  username: string;
  message?: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CognitoAuthResponse {
  AuthenticationResult?: {
    AccessToken?: string;
    IdToken?: string;
    RefreshToken?: string;
    ExpiresIn?: number;
    TokenType?: string;
  };
  ChallengeName?: string;
  Session?: string;
  [key: string]: unknown;
}

async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    {
      username: data.username,
      password: data.password,
      attributes: data.attributes || [
        {
          Name: "email",
          Value: data.email,
        },
      ],
    },
  );

  return {
    ...response.data,
    success: true,
  };
}

async function initiateCognitoAuth(
  data: LoginRequest,
): Promise<CognitoAuthResponse> {
  const { data: cognitoData } = await AwsCognito(
    COGNITO_SERVICES.INITIATE_AUTH,
    {
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password,
      },
    },
  );

  return cognitoData as CognitoAuthResponse;
}

export async function login(data: LoginRequest): Promise<CognitoAuthResponse> {
  const auth = await initiateCognitoAuth(data);
  setCognitoAuthSession(auth);
  try {
    await getClientData("company", "people");
  } catch (error) {
    if (isApiClientError(error) && (error.status === 401 || error.status === 403)) {
      console.warn("No se pudo obtener user info por permisos/contexto:", error.status);
    } else {
      console.warn("No se pudo obtener user info post-login.", error);
    }
  }

  return auth;
}

export async function registerAndLogin(
  data: RegisterRequest,
): Promise<{ register: RegisterResponse; auth: CognitoAuthResponse }> {
  const registerResp = await register(data);
  const auth = await login({
    email: data.email,
    password: data.password,
  });

  return { register: registerResp, auth };
}

export async function logout(): Promise<void> {
  try {
    const accessToken = getAccessToken();
    if (accessToken) {
      await AwsCognito(COGNITO_SERVICES.GLOBAL_SIGN_OUT, {
        AccessToken: accessToken,
      });
    }
  } catch {
    // Even if Cognito sign out fails, clear local session data.
  } finally {
    clearCognitoAuthSession();
    useClientDataStore.getState().clearClientData();
  }
}


