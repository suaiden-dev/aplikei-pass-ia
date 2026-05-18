import { HttpClientError } from "./errors";
import type {
  HttpClient,
  HttpQueryParams,
  HttpQueryValue,
  HttpRequestOptions,
  HttpResponseType,
} from "./types";

interface FetchHttpClientConfig {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  fetchFn?: typeof fetch;
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    typeof value === "string"
  );
}

function appendQueryValue(searchParams: URLSearchParams, key: string, value: HttpQueryValue) {
  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryValue(searchParams, key, entry));
    return;
  }

  if (value === undefined || value === null) {
    return;
  }

  searchParams.append(key, String(value));
}

function buildQueryString(query?: HttpQueryParams) {
  if (!query) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(searchParams, key, value);
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

async function parseResponseBody(response: Response, responseType: HttpResponseType) {
  if (responseType === "void" || response.status === 204) {
    return undefined;
  }

  if (responseType === "text") {
    return response.text();
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const textBody = await response.text();
  return textBody ? textBody : undefined;
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl?: string;
  private readonly defaultHeaders: HeadersInit;
  private readonly fetchFn: typeof fetch;

  constructor(config: FetchHttpClientConfig = {}) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.fetchFn = config.fetchFn ?? fetch;
  }

  async request<TResponse = unknown, TBody = unknown>(
    path: string,
    options: HttpRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const {
      method = "GET",
      headers,
      query,
      body,
      signal,
      authToken,
      responseType = "json",
    } = options;

    const mergedHeaders = new Headers(this.defaultHeaders);

    if (headers) {
      new Headers(headers).forEach((value, key) => mergedHeaders.set(key, value));
    }

    if (authToken) {
      mergedHeaders.set("Authorization", `Bearer ${authToken}`);
    }

    let requestBody: BodyInit | undefined;

    if (body !== undefined) {
      if (isBodyInit(body)) {
        requestBody = body;
      } else {
        mergedHeaders.set("Content-Type", "application/json");
        requestBody = JSON.stringify(body);
      }
    }

    const url = `${this.baseUrl ?? ""}${path}${buildQueryString(query)}`;
    const response = await this.fetchFn(url, {
      method,
      headers: mergedHeaders,
      body: requestBody,
      signal,
    });

    const parsedBody = await parseResponseBody(response, responseType);

    if (!response.ok) {
      throw new HttpClientError(
        `HTTP ${response.status} while requesting ${url}`,
        {
          status: response.status,
          url,
          body: parsedBody,
        },
      );
    }

    return parsedBody as TResponse;
  }

  get<TResponse = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions, "method" | "body">,
  ) {
    return this.request<TResponse>(path, { ...options, method: "GET" });
  }

  post<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ) {
    return this.request<TResponse, TBody>(path, { ...options, method: "POST" });
  }

  put<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ) {
    return this.request<TResponse, TBody>(path, { ...options, method: "PUT" });
  }

  patch<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions<TBody>, "method">,
  ) {
    return this.request<TResponse, TBody>(path, { ...options, method: "PATCH" });
  }

  delete<TResponse = unknown>(
    path: string,
    options?: Omit<HttpRequestOptions, "method" | "body">,
  ) {
    return this.request<TResponse>(path, { ...options, method: "DELETE" });
  }
}

export function createHttpClient(config: FetchHttpClientConfig = {}) {
  return new FetchHttpClient(config);
}
