export type HttpOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  credentials?: RequestCredentials;
};

export type RequestConfig = HttpOptions & {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export type HttpClient = {
  request<T = unknown>(path: string, config?: RequestConfig): Promise<T>;
  get<T = unknown>(path: string, config?: HttpOptions): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, config?: HttpOptions): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, config?: HttpOptions): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, config?: HttpOptions): Promise<T>;
  delete<T = unknown>(path: string, config?: HttpOptions): Promise<T>;
};


