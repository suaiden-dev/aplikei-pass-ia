export interface SupabaseEnvConfig {
  url: string;
  anonKey: string;
  functionsUrl: string;
}

function readEnv(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readSupabaseKey() {
  return readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
}

export function hasSupabaseConfig() {
  return Boolean(readEnv("VITE_SUPABASE_URL") && readSupabaseKey());
}

export function getSupabaseEnv() {
  const url = readEnv("VITE_SUPABASE_URL");
  const anonKey = readSupabaseKey();
  const functionsUrl = readEnv("VITE_SUPABASE_FUNCTIONS_URL") ?? (url ? `${url}/functions/v1` : undefined);

  return {
    url,
    anonKey,
    functionsUrl,
  };
}

export function requireSupabaseEnv(): SupabaseEnvConfig {
  const config = getSupabaseEnv();

  if (!config.url || !config.anonKey || !config.functionsUrl) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in your environment.",
    );
  }

  return config as SupabaseEnvConfig;
}
