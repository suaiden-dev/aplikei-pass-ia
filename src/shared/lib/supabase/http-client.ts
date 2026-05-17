import { createHttpClient, type HttpClient } from "../http";
import { requireSupabaseEnv } from "./env";

export type SupabaseHttpTarget = "functions" | "rest";

export interface SupabaseHttpClientOptions {
  target?: SupabaseHttpTarget;
  schema?: string;
  accessToken?: string;
  headers?: HeadersInit;
}

export function createSupabaseHttpClient(
  options: SupabaseHttpClientOptions = {},
): HttpClient {
  const { url, anonKey, functionsUrl } = requireSupabaseEnv();
  const { target = "functions", schema = "public", accessToken, headers } = options;

  const baseUrl = target === "rest" ? `${url}/rest/v1` : functionsUrl;
  const defaultHeaders = new Headers(headers);

  defaultHeaders.set("apikey", anonKey);

  if (target === "rest") {
    defaultHeaders.set("Accept-Profile", schema);
    defaultHeaders.set("Content-Profile", schema);
  }

  if (accessToken) {
    defaultHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return createHttpClient({
    baseUrl,
    defaultHeaders,
  });
}
