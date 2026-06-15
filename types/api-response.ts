export interface ApiResponse<T> {
  object: string;
  code: number;
  status: string;
  message: string;
  request: number;
  url: string;
  data: T;
  total?: number;
}
