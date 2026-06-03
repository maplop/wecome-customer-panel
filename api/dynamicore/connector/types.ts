export interface ConnectorResponse {
  code: number;
  data: unknown;
}

export interface ConnectorError extends Error {
  code?: number;
  message: string;
}

export type ConnectorMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ConnectorBody = Record<string, unknown>;
