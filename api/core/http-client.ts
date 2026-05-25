import axios, { AxiosError, AxiosInstance } from "axios";

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

export interface CreateHttpClientOptions {
  baseURL: string;
  context?: string;
  timeout?: number;
  authEndpoints?: string[];
  redirectOnUnauthorized?: boolean;
}

let isRedirectingToHome = false;

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

function shouldMatchEndpoint(url: string, endpoint: string): boolean {
  const normalizedUrl = url.toLowerCase();
  const normalizedEndpoint = endpoint.toLowerCase();

  return (
    normalizedUrl === normalizedEndpoint ||
    normalizedUrl.endsWith(normalizedEndpoint) ||
    normalizedUrl.includes(normalizedEndpoint)
  );
}

function isAuthRequest(url: string | undefined, authEndpoints: string[]): boolean {
  if (!url) {
    return false;
  }

  for (const endpoint of authEndpoints) {
    if (shouldMatchEndpoint(url, endpoint)) {
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

export function createHttpClient(
  options: CreateHttpClientOptions,
): AxiosInstance {
  const {
    baseURL,
    context = "",
    timeout = 10000,
    authEndpoints = [],
    redirectOnUnauthorized = true,
  } = options;

  const httpClient = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
      ...(context ? { context } : {}),
    },
  });

  httpClient.interceptors.request.use(
    (config) => {
      if (context && !config.headers["context"]) {
        config.headers["context"] = context;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const normalizedError = normalizeAxiosError(error);

      if (
        redirectOnUnauthorized &&
        normalizedError.status === 401 &&
        !isAuthRequest(error.config?.url, authEndpoints)
      ) {
        redirectToHomeOnUnauthorized();
      }

      return Promise.reject(normalizedError);
    },
  );

  return httpClient;
}
