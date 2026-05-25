import { AxiosResponse } from "axios";

import { createHttpClient } from "@/api/core";

import { API_CONTEXT, API_ENDPOINTS, API_URL } from "./constants";
import { ClientBody, ClientMethod, ClientResponse } from "./types";

export const apiClient = createHttpClient({
  baseURL: API_URL,
  context: API_CONTEXT,
  authEndpoints: [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.LOGOUT,
    API_ENDPOINTS.AUTH.REGISTER,
  ],
  redirectOnUnauthorized: true,
});

function toClientResponse<T>(response: AxiosResponse<T>): ClientResponse {
  return {
    code: response.status,
    data: response.data as ClientResponse["data"],
    headers: Object.fromEntries(
      Object.entries(response.headers).map(([key, value]) => [
        key,
        String(value),
      ]),
    ),
  };
}

export async function client(
  service: string,
  method: ClientMethod = "GET",
  payload: ClientBody = {},
): Promise<ClientResponse> {
  const response = await apiClient.request({
    url: service,
    method,
    ...(method === "GET" || method === "DELETE"
      ? { params: payload }
      : { data: payload }),
  });

  if (process.env.NODE_ENV !== "production" && method !== "GET") {
    console.log(`[${new Date().toISOString()}]`, `${method}:`, service);
    console.log(
      JSON.stringify(
        {
          code: response.status,
          data: response.data,
        },
        null,
        " ",
      ),
    );
  }

  return toClientResponse(response);
}
