import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSessionSafe, supabase } from "../../../shared/lib/supabase";
import type { LoginInput, SignUpInput } from "../schemas/auth.schema";
import type { UserAccount } from "../types";
import { normalizeRole, getDashboardPathForRole } from "../../../shared/auth/roles";

export { getDashboardPathForRole };

type AvatarPrefs = {
  avatarUrl: string | null;
  avatarOffsetX: number;
  avatarOffsetY: number;
  avatarZoom: number;
};

function getAvatarPrefsStorageKey(userId: string) {
  return `aplikei.avatar_prefs.${userId}`;
}

function readAvatarPrefs(userId: string): AvatarPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getAvatarPrefsStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AvatarPrefs>;
    return {
      avatarUrl: parsed.avatarUrl ?? null,
      avatarOffsetX: Number.isFinite(parsed.avatarOffsetX) ? Number(parsed.avatarOffsetX) : 0,
      avatarOffsetY: Number.isFinite(parsed.avatarOffsetY) ? Number(parsed.avatarOffsetY) : 0,
      avatarZoom: Number.isFinite(parsed.avatarZoom) ? Number(parsed.avatarZoom) : 1,
    };
  } catch {
    return null;
  }
}

function writeAvatarPrefs(userId: string, prefs: AvatarPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getAvatarPrefsStorageKey(userId), JSON.stringify(prefs));
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string | null;
  avatar_offset_x?: number;
  avatar_offset_y?: number;
  avatar_zoom?: number;
  passport_photo_url?: string | null;
}

interface UserAccountRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  avatar_offset_x: number | null;
  avatar_offset_y: number | null;
  avatar_zoom: number | null;
  passport_photo_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UserAccountRow): UserAccount {
  const localPrefs = readAvatarPrefs(row.id);
  const mapped: UserAccount = {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    phoneNumber: row.phone_number ?? "",
    avatarUrl: row.avatar_url,
    avatarOffsetX: row.avatar_offset_x ?? 0,
    avatarOffsetY: row.avatar_offset_y ?? 0,
    avatarZoom: row.avatar_zoom ?? 1,
    passportPhotoUrl: row.passport_photo_url,
    role: normalizeRole(row.role),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const normalized: UserAccount = {
    ...mapped,
    avatarUrl: mapped.avatarUrl ?? localPrefs?.avatarUrl ?? null,
    avatarOffsetX: row.avatar_offset_x ?? localPrefs?.avatarOffsetX ?? 0,
    avatarOffsetY: row.avatar_offset_y ?? localPrefs?.avatarOffsetY ?? 0,
    avatarZoom: row.avatar_zoom ?? localPrefs?.avatarZoom ?? 1,
  };
  writeAvatarPrefs(row.id, {
    avatarUrl: normalized.avatarUrl,
    avatarOffsetX: normalized.avatarOffsetX,
    avatarOffsetY: normalized.avatarOffsetY,
    avatarZoom: normalized.avatarZoom,
  });
  return normalized;
}

async function findAccount(id: string): Promise<UserAccount | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as UserAccountRow);
}

async function createAccount(input: {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
}): Promise<UserAccount | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .insert(input)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapRow(data as UserAccountRow);
}

async function updateAccount(id: string, input: UserUpdateInput): Promise<UserAccount | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return mapRow(data as UserAccountRow);
}

// ── Auth subscription ─────────────────────────────────────────────────────────

type AuthStateHandler = (event: AuthChangeEvent, session: Session | null) => void;

let authSubscription: { unsubscribe: () => void } | null = null;
let lastAuthState: { event: AuthChangeEvent; session: Session | null } | null = null;
const authListeners = new Set<AuthStateHandler>();

function ensureAuthSubscription() {
  if (authSubscription) return;
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    lastAuthState = { event, session };
    for (const listener of authListeners) {
      listener(event, session);
    }
  });
  authSubscription = subscription;
}

function disposeAuthSubscription() {
  authSubscription?.unsubscribe();
  authSubscription = null;
  lastAuthState = null;
  authListeners.clear();
}

if (import.meta.hot) {
  import.meta.hot.dispose(disposeAuthSubscription);
}

export function subscribeToAuthChanges(handler: AuthStateHandler) {
  authListeners.add(handler);
  ensureAuthSubscription();
  if (lastAuthState) {
    handler(lastAuthState.event, lastAuthState.session);
  }
  return () => {
    authListeners.delete(handler);
  };
}

// ── Account helpers ───────────────────────────────────────────────────────────

export function buildFallbackAccount(authUser: User): UserAccount {
  const localPrefs = readAvatarPrefs(authUser.id);
  return {
    id: authUser.id,
    fullName: authUser.user_metadata?.full_name || "Usuário",
    email: authUser.email || "",
    phoneNumber: authUser.user_metadata?.phone_number || "",
    avatarUrl: localPrefs?.avatarUrl ?? null,
    avatarOffsetX: localPrefs?.avatarOffsetX ?? 0,
    avatarOffsetY: localPrefs?.avatarOffsetY ?? 0,
    avatarZoom: localPrefs?.avatarZoom ?? 1,
    passportPhotoUrl: null,
    role: normalizeRole(authUser.user_metadata?.role),
    createdAt: authUser.created_at,
    updatedAt: authUser.updated_at || authUser.created_at,
  };
}

function mergeAccountWithFallback(authUser: User, account: UserAccount | null): UserAccount {
  const fallback = buildFallbackAccount(authUser);
  if (!account) return fallback;
  return {
    ...account,
    fullName: account.fullName || fallback.fullName,
    email: account.email || fallback.email,
    phoneNumber: account.phoneNumber || fallback.phoneNumber,
    avatarUrl: account.avatarUrl ?? fallback.avatarUrl,
    avatarOffsetX: account.avatarOffsetX ?? fallback.avatarOffsetX,
    avatarOffsetY: account.avatarOffsetY ?? fallback.avatarOffsetY,
    avatarZoom: account.avatarZoom ?? fallback.avatarZoom,
    passportPhotoUrl: account.passportPhotoUrl ?? fallback.passportPhotoUrl,
  };
}

// ── authService ───────────────────────────────────────────────────────────────

export const authService = {

  async login({ email, password }: LoginInput) {
    
    const { data: canLogin, error: gateError } = await supabase.rpc("can_login_with_email", {
      p_email: email,
    });

    if (gateError) {
      throw new Error("Erro ao validar usuário");
    }

    if (!canLogin) {
      throw new Error("Sua conta está desativada.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (!userId) {
      throw new Error("Usuário não encontrado");
    }

    const {data: account, error: accountError } = await supabase
      .from("users_accounts")
      .select("is_active")
      .eq("id", userId)
      .single();

      if (accountError) {
        await supabase.auth.signOut();
        throw new Error("Erro ao validar usuário");
      }

      if (!account.is_active) {
        await supabase.auth.signOut();
        throw new Error("Sua conta está desativada.");
      }

    return data;
  },

  async signUp({ email, password, fullName, phoneNumber }: Omit<SignUpInput, "terms">) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone_number: phoneNumber } },
    });
    if (error) throw new Error(error.message);
    if (data.session && data.user) {
      await this.ensureAccount(data.user);
    }
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    return getSessionSafe();
  },

  async hasSession(expectedUserId?: string): Promise<boolean> {
    const session = await getSessionSafe();
    const userId = session?.user?.id ?? null;
    if (!expectedUserId) return !!userId;
    return userId === expectedUserId;
  },

  async getAccount(userId: string): Promise<UserAccount | null> {
    return findAccount(userId);
  },

  async resolveAccount(authUser: User): Promise<UserAccount> {
    const account = await findAccount(authUser.id);
    return mergeAccountWithFallback(authUser, account);
  },

  async ensureAccount(authUser: User): Promise<UserAccount> {
    const existing = await findAccount(authUser.id);
    if (existing) return mergeAccountWithFallback(authUser, existing);

    try {
      const created = await createAccount({
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || "Usuário",
        email: authUser.email || "",
        phone_number: authUser.user_metadata?.phone_number || "",
        role: normalizeRole(authUser.user_metadata?.role),
      });
      if (created) return created;
    } catch {
      // provável race condition — tenta recuperar
    }

    const recovered = await findAccount(authUser.id);
    if (recovered) return mergeAccountWithFallback(authUser, recovered);

    throw new Error("Failed to resolve authenticated account");
  },

  async updateAccount(userId: string, updates: UserUpdateInput) {
    const result = await updateAccount(userId, updates);
    if (!result) throw new Error("Failed to update account");
    return result;
  },

  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return data;
  },
};
