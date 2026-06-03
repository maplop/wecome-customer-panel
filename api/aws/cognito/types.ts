export type Payload = Record<string, unknown>;

export interface ClientError extends Error {
  code?: number;
  message: string;
}

export interface ClientResponse {
  code: number;
  data: Payload | Payload[];
}
