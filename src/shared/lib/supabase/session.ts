import type { SupabaseClient, Session } from "@supabase/supabase-js";
import { AUTH_STORAGE_KEY, LEGACY_AUTH_STORAGE_KEYS } from "./env";

export type StoredAuthSession = Session & {
  expires_at?: number;
};

export type SupabaseAuthInternals = {
  autoRefreshToken?: boolean;
  storageKey?: string;
  getSession: SupabaseClient["auth"]["getSession"];
  __aplikei_original_get_session__?: SupabaseClient["auth"]["getSession"];
  __aplikei_get_session_patched__?: boolean;
};

export type SupabaseSessionState = {
  cachedSession: Session | null;
  cachedAt: number;
  sessionInFlight: Promise<Session | null> | null;
  refreshBlockedUntil: number;
};

type GetSessionResult = Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>;

function isBrowser() {
  return typeof window !== "undefined";
}

export function hasLocalStorage() {
  return (
    isBrowser()
    && typeof window.localStorage?.getItem === "function"
    && typeof window.localStorage?.setItem === "function"
    && typeof window.localStorage?.removeItem === "function"
  );
}

export function getAuthStorageKeys() {
  return [AUTH_STORAGE_KEY, ...LEGACY_AUTH_STORAGE_KEYS];
}

export function migrateLegacySessionStorage() {
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

export function readStoredSession(): Session | null {
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

export function shouldReuseClient(client: SupabaseClient | undefined): client is SupabaseClient {
  if (!client) return false;

  const auth = client.auth as unknown as SupabaseAuthInternals;
  return auth.autoRefreshToken === false && auth.storageKey === AUTH_STORAGE_KEY;
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

  const win = window as Window & {
    __aplikei_supabase_session_state__?: SupabaseSessionState;
  };

  win.__aplikei_supabase_session_state__ ??= {
    cachedSession: null,
    cachedAt: 0,
    sessionInFlight: null,
    refreshBlockedUntil: 0,
  };

  return win.__aplikei_supabase_session_state__!;
}

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

const SESSION_CACHE_MS = 2000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

export async function clearStoredSession(
  reason: string,
  signOutLocal: () => Promise<void>,
): Promise<void> {
  const state = getSessionState();
  state.cachedSession = null;
  state.cachedAt = Date.now();

  try {
    await signOutLocal();
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

async function runGetSessionSingleFlight(
  originalGetSession: SupabaseClient["auth"]["getSession"],
  signOutLocal: () => Promise<void>,
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
          await clearStoredSession(error.message, signOutLocal);
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
        await clearStoredSession(error instanceof Error ? error.message : "unknown", signOutLocal);
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

export function patchGetSession(
  client: SupabaseClient,
  signOutLocal: () => Promise<void>,
) {
  const auth = client.auth as unknown as SupabaseAuthInternals;
  if (auth.__aplikei_get_session_patched__) return;

  auth.__aplikei_original_get_session__ = auth.getSession.bind(client.auth);
  auth.getSession = () => runGetSessionSingleFlight(auth.__aplikei_original_get_session__!, signOutLocal);
  auth.__aplikei_get_session_patched__ = true;
}
