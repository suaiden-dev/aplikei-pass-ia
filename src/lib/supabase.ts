import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables.",
  );
}

// Store the client on `window` so it survives Vite HMR module re-evaluations.
// Without this, each HMR cycle creates a NEW client with its own auto-refresh
// timer, while the old timer keeps running — causing 429 errors.
const WINDOW_KEY = "__aplikei_supabase_client__";
const SESSION_STATE_KEY = "__aplikei_supabase_session_state__";
const SUPABASE_PROJECT_REF = new URL(supabaseUrl).hostname.split(".")[0];
const AUTH_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
const LEGACY_AUTH_STORAGE_KEYS = ["aplikei.supabase.auth"];

declare global {
  interface Window {
    [WINDOW_KEY]?: SupabaseClient;
    [SESSION_STATE_KEY]?: SupabaseSessionState;
  }
}

type StoredAuthSession = Session & {
  expires_at?: number;
};

type SupabaseAuthInternals = {
  autoRefreshToken?: boolean;
  storageKey?: string;
  getSession: SupabaseClient["auth"]["getSession"];
  __aplikei_original_get_session__?: SupabaseClient["auth"]["getSession"];
  __aplikei_get_session_patched__?: boolean;
};

type SupabaseSessionState = {
  cachedSession: Session | null;
  cachedAt: number;
  sessionInFlight: Promise<Session | null> | null;
  refreshBlockedUntil: number;
};

type GetSessionResult = Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>;

function isBrowser() {
  return typeof window !== "undefined";
}

function hasLocalStorage() {
  return (
    isBrowser()
    && typeof window.localStorage?.getItem === "function"
    && typeof window.localStorage?.setItem === "function"
    && typeof window.localStorage?.removeItem === "function"
  );
}

function getAuthStorageKeys() {
  return [AUTH_STORAGE_KEY, ...LEGACY_AUTH_STORAGE_KEYS];
}

function migrateLegacySessionStorage() {
  if (!hasLocalStorage() || window.localStorage.getItem(AUTH_STORAGE_KEY)) return;

  for (const legacyKey of LEGACY_AUTH_STORAGE_KEYS) {
    const legacySession = window.localStorage.getItem(legacyKey);
    if (!legacySession) continue;

    window.localStorage.setItem(AUTH_STORAGE_KEY, legacySession);

    const legacyCodeVerifier = window.localStorage.getItem(`${legacyKey}-code-verifier`);
    if (legacyCodeVerifier) {
      window.localStorage.setItem(`${AUTH_STORAGE_KEY}-code-verifier`, legacyCodeVerifier);
    }

    const legacyUser = window.localStorage.getItem(`${legacyKey}-user`);
    if (legacyUser) {
      window.localStorage.setItem(`${AUTH_STORAGE_KEY}-user`, legacyUser);
    }

    return;
  }
}

function readStoredSession(): Session | null {
  if (!hasLocalStorage()) return null;

  try {
    const storageKey = getAuthStorageKeys().find((key) => window.localStorage.getItem(key));
    const raw = storageKey ? window.localStorage.getItem(storageKey) : null;
    if (!raw) return null;

    const session = JSON.parse(raw) as StoredAuthSession | null;
    if (!session?.access_token || !session.user) return null;

    return session;
  } catch (error) {
    console.warn("[supabase] Failed to read stored session:", error);
    return null;
  }
}

function shouldReuseClient(client: SupabaseClient | undefined): client is SupabaseClient {
  if (!client) return false;

  const auth = client.auth as unknown as SupabaseAuthInternals;
  return auth.autoRefreshToken === false && auth.storageKey === AUTH_STORAGE_KEY;
}

function createSupabaseClient(): SupabaseClient {
  migrateLegacySessionStorage();

  // If we have a session that is expired (even by a little), it's risky to let Supabase 
  // try to auto-refresh it during init if we are seeing "Refresh Token Not Found" errors.
  // We'll clear anything expired by more than 1 minute.
  const session = readStoredSession();
  if (session && session.expires_at && session.expires_at < (Date.now() / 1000) - 60) {
    console.info("[supabase] Proactively clearing expired session to avoid refresh token errors.");
    const keys = getAuthStorageKeys();
    if (hasLocalStorage()) {
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
      // Avoid refresh-token storms during app boot/HMR. Expired sessions should
      // send the user back to login instead of hammering /auth/v1/token.
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
    db: { schema: "public" },
  });
}

const existingClient =
  typeof window !== "undefined" ? window[WINDOW_KEY] : undefined;

if (existingClient && !shouldReuseClient(existingClient)) {
  (existingClient as SupabaseClient).auth.stopAutoRefresh();
}

export const supabase: SupabaseClient = shouldReuseClient(existingClient)
  ? existingClient
  : createSupabaseClient();

patchGetSession(supabase);

if (typeof window !== "undefined") {
  window[WINDOW_KEY] = supabase;
  supabase.auth.stopAutoRefresh();
}

const SESSION_CACHE_MS = 2000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message ?? "") : "";
  const normalized = message.toLowerCase();
  return (
    normalized.includes("refresh token")
    && (normalized.includes("invalid") || normalized.includes("not found"))
  );
}

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message ?? "") : "";
  const status = "status" in error ? Number(error.status) : NaN;
  return status === 429 || message.toLowerCase().includes("rate limit");
}

function getSessionState(): SupabaseSessionState {
  if (!isBrowser()) {
    return {
      cachedSession: null,
      cachedAt: 0,
      sessionInFlight: null,
      refreshBlockedUntil: 0,
    };
  }

  window[SESSION_STATE_KEY] ??= {
    cachedSession: null,
    cachedAt: 0,
    sessionInFlight: null,
    refreshBlockedUntil: 0,
  };

  return window[SESSION_STATE_KEY]!;
}

async function runGetSessionSingleFlight(
  originalGetSession: SupabaseClient["auth"]["getSession"],
): Promise<GetSessionResult> {
  const toResult = (session: Session | null): GetSessionResult => {
    if (session) return { data: { session }, error: null };
    return { data: { session: null }, error: null };
  };

  const state = getSessionState();
  const now = Date.now();

  if (state.cachedSession && now - state.cachedAt < SESSION_CACHE_MS) {
    return toResult(state.cachedSession);
  }

  if (now < state.refreshBlockedUntil) {
    return toResult(readStoredSession());
  }

  if (state.sessionInFlight) {
    const session = await state.sessionInFlight;
    return toResult(session);
  }

  state.sessionInFlight = (async () => {
    try {
      const { data, error } = await originalGetSession();
      if (error) {
        if (isInvalidRefreshTokenError(error)) {
          await clearStoredSession(error.message);
          return null;
        }

        if (isRateLimitError(error)) {
          state.refreshBlockedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
          return readStoredSession();
        }

        console.warn("[supabase] getSession failed:", error);
        return readStoredSession();
      }

      state.cachedSession = data.session ?? null;
      state.cachedAt = Date.now();
      state.refreshBlockedUntil = 0;
      return state.cachedSession;
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearStoredSession(error instanceof Error ? error.message : "unknown");
        return null;
      }

      if (isRateLimitError(error)) {
        state.refreshBlockedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
        return readStoredSession();
      }

      console.warn("[supabase] getSession threw:", error);
      return readStoredSession();
    } finally {
      state.sessionInFlight = null;
    }
  })();

  const session = await state.sessionInFlight;
  return toResult(session);
}

function patchGetSession(client: SupabaseClient) {
  const auth = client.auth as unknown as SupabaseAuthInternals;
  if (auth.__aplikei_get_session_patched__) return;

  auth.__aplikei_original_get_session__ = auth.getSession.bind(client.auth);
  auth.getSession = () => runGetSessionSingleFlight(auth.__aplikei_original_get_session__!);
  auth.__aplikei_get_session_patched__ = true;
}

async function clearStoredSession(reason: string) {
  const state = getSessionState();
  state.cachedSession = null;
  state.cachedAt = Date.now();

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.warn(`[supabase] Failed to clear invalid session (${reason}):`, error);
  }

  if (!hasLocalStorage()) return;
  for (const storageKey of getAuthStorageKeys()) {
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(`${storageKey}-code-verifier`);
    window.localStorage.removeItem(`${storageKey}-user`);
  }
}

export async function getSessionSafe(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// 👉 Helpers mínimos (sem acoplamento ao storage interno)
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

// 👉 Expor para testes (E2E)
if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || import.meta.env.MODE === "test")
) {
  (window as unknown as Window & { supabase: SupabaseClient }).supabase = supabase;
}
