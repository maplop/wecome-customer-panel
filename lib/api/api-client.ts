import axios, { AxiosError, AxiosInstance } from "axios";

import { API_ENDPOINTS } from "@/lib/api/api-config";

export interface ApiErrorResponse {
  object?: string;
  code?: number;
  status?: string;
  message?: string;
  request?: number;
  url?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export type ApiClientError = Error & {
  code?: string;
  data?: ApiErrorResponse | unknown;
  isApiClientError: true;
  response?: AxiosError["response"];
  status?: number;
  apiCode?: number;
  apiDetail?: string;
  apiError?: string;
  apiMessage?: string;
  apiStatus?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://front.dynamicore.io";
const CONTEXT = process.env.NEXT_PUBLIC_DYNAMICORE_MORAL_CONTEXT || "";
let isRedirectingToHome = false;

const AUTH_ENDPOINTS = new Set<string>([
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.LOGOUT,
  API_ENDPOINTS.AUTH.REGISTER,
]);

export function isApiClientError(error: unknown): error is ApiClientError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "isApiClientError" in error &&
    (error as ApiClientError).isApiClientError,
  );
}

function getApiErrorResponse(data: unknown): ApiErrorResponse | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  return data as ApiErrorResponse;
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  const apiErrorResponse = getApiErrorResponse(data);
  if (!apiErrorResponse) {
    return undefined;
  }

  const candidates = [
    apiErrorResponse.detail,
    apiErrorResponse.message,
    apiErrorResponse.error,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function getDefaultErrorMessage(error: AxiosError): string {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "La solicitud excedio el tiempo de espera.";
    }

    return "No fue posible comunicarse con el servidor.";
  }

  switch (error.response.status) {
    case 400:
      return "La solicitud no es valida.";
    case 401:
      return "Tu sesion expiro. Inicia sesion nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta accion.";
    case 404:
      return "No se encontro el recurso solicitado.";
    default:
      if (error.response.status >= 500) {
        return "Ocurrio un error del servidor.";
      }

      return "Ocurrio un error inesperado.";
  }
}

function normalizeAxiosError(error: AxiosError): ApiClientError {
  const apiErrorResponse = getApiErrorResponse(error.response?.data);
  const message =
    extractServerMessage(apiErrorResponse || error.response?.data) ||
    getDefaultErrorMessage(error);

  const normalizedError = new Error(message) as ApiClientError;
  normalizedError.name = "ApiClientError";
  normalizedError.code = error.code;
  normalizedError.data = apiErrorResponse || error.response?.data;
  normalizedError.isApiClientError = true;
  normalizedError.response = error.response;
  normalizedError.status = error.response?.status;
  normalizedError.apiCode = apiErrorResponse?.code;
  normalizedError.apiDetail = apiErrorResponse?.detail;
  normalizedError.apiError = apiErrorResponse?.error;
  normalizedError.apiMessage = apiErrorResponse?.message;
  normalizedError.apiStatus = apiErrorResponse?.status;

  return normalizedError;
}

function isAuthRequest(url?: string): boolean {
  if (!url) {
    return false;
  }

  const normalizedUrl = url.toLowerCase();

  for (const endpoint of AUTH_ENDPOINTS) {
    const normalizedEndpoint = endpoint.toLowerCase();
    if (
      normalizedUrl === normalizedEndpoint ||
      normalizedUrl.endsWith(normalizedEndpoint) ||
      normalizedUrl.includes(normalizedEndpoint)
    ) {
      return true;
    }
  }

  return false;
}

function redirectToHomeOnUnauthorized(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (isRedirectingToHome || window.location.pathname === "/") {
    return;
  }

  isRedirectingToHome = true;
  window.location.assign("/");
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    context: CONTEXT,
  },
});

// Interceptor for requests
apiClient.interceptors.request.use(
  (config) => {
    // Ensure context header is always set
    if (!config.headers["context"]) {
      config.headers["context"] = CONTEXT;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      console.error("API Error:", error);
      return Promise.reject(error);
    }

    const normalizedError = normalizeAxiosError(error);

    if (normalizedError.status === 401 && !isAuthRequest(error.config?.url)) {
      redirectToHomeOnUnauthorized();
    }

    console.error("API Error:", normalizedError);
    return Promise.reject(normalizedError);
  },
);

export default apiClient;
