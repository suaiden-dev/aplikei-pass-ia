import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, requireSupabaseEnv } from "./env";

// Store the client on `window` so it survives Vite HMR module re-evaluations.
// Without this, each HMR cycle resets the module-level variable to null,
// creates a NEW client with its own auto-refresh timer, while the old timer
// keeps running — causing duplicate token refresh requests and 429 errors.
const WINDOW_KEY = "__aplikei_supabase_client__";
const AUTH_STORAGE_KEY = "aplikei.supabase.auth";

declare global {
  interface Window {
    [WINDOW_KEY]?: SupabaseClient;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (typeof window !== "undefined" && window[WINDOW_KEY]) {
    return window[WINDOW_KEY]!;
  }

  const { url, anonKey } = requireSupabaseEnv();

  const options = {
    auth: {
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      // Avoid refresh-token storms during app boot/HMR. Explicit auth actions
      // still create fresh sessions; expired sessions should send the user back
      // to login instead of hammering /auth/v1/token and triggering 429.
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
    db: { schema: "public" },
  } as unknown as Parameters<typeof createClient>[2];

  const client = createClient(url, anonKey, options) as unknown as SupabaseClient;

  if (typeof window !== "undefined") {
    window[WINDOW_KEY] = client;
  }

  return client;
}

export function requireSupabaseClient() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(
      "Supabase client is not available. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) first.",
    );
  }

  return client;
}
