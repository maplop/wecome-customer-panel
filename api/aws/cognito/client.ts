import { createHttpClient } from "@/api/core";

import { API_CLIENT_ID, API_URL } from "./constants";
import { ClientResponse, Payload } from "./types";

export const cognitoApiClient = createHttpClient({
  baseURL: API_URL,
  redirectOnUnauthorized: false,
});

export async function client(
  service: string,
  payload: Payload = {},
): Promise<ClientResponse> {
  const response = await cognitoApiClient.post(
    service,
    {
      ...payload,
      ClientId: API_CLIENT_ID,
    },
    {
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": `AWSCognitoIdentityProviderService.${service}`,
      },
    },
  );

  if (process.env.NODE_ENV !== "production") {
    console.log(`[${new Date().toISOString()}]`, "POST:", service);
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

  return {
    code: response.status,
    data: response.data,
  };
}
