export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type HttpQueryParams = Record<string, HttpQueryValue>;

export type HttpResponseType = "json" | "text" | "void";

export interface HttpRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: HeadersInit;
  query?: HttpQueryParams;
  body?: TBody;
  signal?: AbortSignal;
  authToken?: string;
  responseType?: HttpResponseType;
}

export interface HttpClient {
  request<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: HttpRequestOptions<TBody>,
  ): Promise<TResponse>;
  get<TResponse = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions, "method" | "body">,
  ): Promise<TResponse>;
  post<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ): Promise<TResponse>;
  put<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ): Promise<TResponse>;
  patch<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ): Promise<TResponse>;
  delete<TResponse = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions, "method" | "body">,
  ): Promise<TResponse>;
}
