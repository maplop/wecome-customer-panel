import { AxiosResponse } from "axios";

import { createHttpClient } from "@/sdk/core";

import { CONNECTOR_API_URL } from "./constants";
import {
  ConnectorBody,
  ConnectorMethod,
  ConnectorResponse,
} from "./types";

export const connectorApiClient = createHttpClient({
  baseURL: CONNECTOR_API_URL,
  redirectOnUnauthorized: false,
});

function toConnectorResponse<T>(response: AxiosResponse<T>): ConnectorResponse {
  return {
    code: response.status,
    data: response.data,
  };
}

export async function client(
  service: string,
  method: ConnectorMethod = "GET",
  payload: ConnectorBody = {},
): Promise<ConnectorResponse> {
  const response = await connectorApiClient.request({
    url: service,
    method,
    ...(method === "GET" || method === "DELETE"
      ? { params: payload }
      : { data: payload }),
  });

  if (process.env.NODE_ENV !== "production") {
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

  return toConnectorResponse(response);
}
