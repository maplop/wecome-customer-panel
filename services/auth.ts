import {
  apiClient,
  API_ENDPOINTS,
} from "@/api/dynamicore/frontend";
import AwsCognito, { SERVICES as COGNITO_SERVICES } from "@/api/aws/cognito";
import { isApiClientError } from "@/api/core";
import {
  clearCognitoAuthSession,
  getAccessToken,
  setCognitoAuthSession,
} from "@/lib/auth-session";
import { getClientData } from "@/services/client-data";

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

export interface ForgotPasswordRequest {
  username: string;
}

export interface ConfirmForgotPasswordRequest {
  username: string;
  code: string;
  password: string;
}

export interface ConfirmUserRequest {
  username: string;
  confirmEmail?: boolean;
  confirmPhone?: boolean;
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

async function confirmUser(data: ConfirmUserRequest): Promise<void> {
  const payload: Record<string, unknown> = {
    username: data.username,
    confirmEmail: data.confirmEmail ?? true,
  };

  if (typeof data.confirmPhone === "boolean") {
    payload.confirmPhone = data.confirmPhone;
  }

  await apiClient.post(API_ENDPOINTS.AUTH.CONFIRM_USER, payload);
}

export async function login(data: LoginRequest): Promise<CognitoAuthResponse> {
  const auth = await initiateCognitoAuth(data);
  setCognitoAuthSession(auth);
  try {
    const clientData = await getClientData("company", "people");
    console.log("clientData", clientData);
  } catch (error) {
    if (
      isApiClientError(error) &&
      (error.status === 401 || error.status === 403)
    ) {
      console.warn(
        "No se pudo obtener user info por permisos/contexto:",
        error.status,
      );
    } else {
      console.warn("No se pudo obtener user info post-login.", error);
    }
  }
  console.log("auth", auth);
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

  await confirmUser({
    username: data.username,
    confirmEmail: true,
    confirmPhone: true,
  });

  return { register: registerResp, auth };
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<void> {
  await AwsCognito(COGNITO_SERVICES.FORGOT_PASSWORD, {
    Username: data.username,
  });
}

export async function confirmForgotPassword(
  data: ConfirmForgotPasswordRequest,
): Promise<void> {
  await AwsCognito(COGNITO_SERVICES.CONFIRM_FORGOT_PASSWORD, {
    ConfirmationCode: data.code,
    Password: data.password,
    Username: data.username,
  });
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
  }
}
