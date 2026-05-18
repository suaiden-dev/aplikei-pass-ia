const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables.",
  );
}

const WINDOW_KEY = "__aplikei_supabase_client__";
const SESSION_STATE_KEY = "__aplikei_supabase_session_state__";
const SUPABASE_PROJECT_REF = new URL(supabaseUrl).hostname.split(".")[0];
const AUTH_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
const LEGACY_AUTH_STORAGE_KEYS = ["aplikei.supabase.auth"];

export {
  AUTH_STORAGE_KEY,
  LEGACY_AUTH_STORAGE_KEYS,
  SESSION_STATE_KEY,
  SUPABASE_PROJECT_REF,
  WINDOW_KEY,
  supabaseAnonKey,
  supabaseUrl,
};

export function requireSupabaseEnv() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    functionsUrl: `${supabaseUrl}/functions/v1`,
  };
}
