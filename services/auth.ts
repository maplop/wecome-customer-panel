import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-config";

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

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  message?: string;
  success: boolean;
}

/**
 * Register a new web client
 */
export async function registerWebClient(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  console.log("Registering user with data:", data);

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

/**
 * Login with email and password
 */
export async function loginWebClient(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    {
      email: data.email,
      password: data.password,
    },
  );

  return {
    ...response.data,
    success: true,
  };
}

/**
 * Logout
 */
export async function logoutWebClient(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error: any) {
    console.error("Error during logout:", error);
  }
}
