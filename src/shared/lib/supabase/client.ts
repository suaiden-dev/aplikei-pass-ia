import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { AUTH_STORAGE_KEY, supabaseAnonKey, supabaseUrl } from "./env";
import {
  migrateLegacySessionStorage,
  patchGetSession,
  readStoredSession,
  shouldReuseClient,
} from "./session";

function createSupabaseClient(): SupabaseClient {
  migrateLegacySessionStorage();

  const session = readStoredSession();
  if (session && session.expires_at && session.expires_at < (Date.now() / 1000) - 60) {
    console.info("[supabase] Proactively clearing expired session to avoid refresh token errors.");
    const keys = [AUTH_STORAGE_KEY, "aplikei.supabase.auth"];
    if (typeof window !== "undefined") {
      for (const key of keys) {
        window.localStorage.removeItem(key);
        window.localStorage.removeItem(`${key}-code-verifier`);
        window.localStorage.removeItem(`${key}-user`);
      }
    }
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
    db: { schema: "public" },
  });
}

const existingClient =
  typeof window !== "undefined"
    ? (window as Window & { __aplikei_supabase_client__?: SupabaseClient }).__aplikei_supabase_client__
    : undefined;

if (existingClient && !shouldReuseClient(existingClient)) {
  (existingClient as SupabaseClient).auth.stopAutoRefresh();
}

export const supabase: SupabaseClient = shouldReuseClient(existingClient)
  ? existingClient
  : createSupabaseClient();

patchGetSession(supabase, async () => {
  await supabase.auth.signOut({ scope: "local" });
});

if (typeof window !== "undefined") {
  (window as Window & { __aplikei_supabase_client__?: SupabaseClient }).__aplikei_supabase_client__ = supabase;
  supabase.auth.stopAutoRefresh();
}

export async function getSessionSafe(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSessionSafe();
  return session?.access_token ?? null;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionSafe();
  return !!session;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || import.meta.env.MODE === "test")
) {
  (window as unknown as Window & { supabase: SupabaseClient }).supabase = supabase;
}
