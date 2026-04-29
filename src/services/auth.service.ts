import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSessionSafe, supabase } from "../lib/supabase";
import { userRepository, type UserUpdateInput } from "../repositories";
import type { LoginInput, SignUpInput } from "../schemas/auth.schema";
import type { UserAccount, UserRole } from "../models";

type AuthStateHandler = (event: AuthChangeEvent, session: Session | null) => void;

let authSubscription: { unsubscribe: () => void } | null = null;
let lastAuthState: { event: AuthChangeEvent; session: Session | null } | null = null;
const authListeners = new Set<AuthStateHandler>();

function normalizeRole(role: unknown): UserRole {
  if (role === "master") return "master";
  if (role === "admin") return "admin";
  if (role === "seller") return "seller";
  return "customer";
}

export function getDashboardPathForRole(role: UserRole) {
  if (role === "master") return "/master";
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller/payments";
  return "/dashboard";
}

function buildAccountDraft(authUser: User) {
  return {
    id: authUser.id,
    full_name: authUser.user_metadata?.full_name || "Usuário",
    email: authUser.email || "",
    phone_number: authUser.user_metadata?.phone_number || "",
    role: normalizeRole(authUser.user_metadata?.role),
  };
}

function ensureAuthSubscription() {
  if (authSubscription) return;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    lastAuthState = { event, session };

    // 👉 aqui você pode reagir a eventos se quiser
    if (event === "SIGNED_OUT") {
      // limpar estado global, cache, etc
    }

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

export function buildFallbackAccount(authUser: User): UserAccount {
  return {
    id: authUser.id,
    fullName: authUser.user_metadata?.full_name || "Usuário",
    email: authUser.email || "",
    phoneNumber: authUser.user_metadata?.phone_number || "",
    avatarUrl: null,
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
    passportPhotoUrl: account.passportPhotoUrl ?? fallback.passportPhotoUrl,
  };
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signUp({ email, password, fullName, phoneNumber }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone_number: phoneNumber },
      },
    });

    if (error) throw new Error(error.message);

    // 👉 só cria account se realmente tiver sessão
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
    return userRepository.findById(userId);
  },

  async resolveAccount(authUser: User): Promise<UserAccount> {
    const account = await this.getAccount(authUser.id);
    return mergeAccountWithFallback(authUser, account);
  },

  async ensureAccount(authUser: User): Promise<UserAccount> {
    const existing = await userRepository.findById(authUser.id);
    if (existing) return mergeAccountWithFallback(authUser, existing);

    try {
      const created = await userRepository.create(buildAccountDraft(authUser));
      if (created) return created;
    } catch {
      // 👉 provável race condition, tenta recuperar
    }

    const recovered = await userRepository.findById(authUser.id);
    if (recovered) return mergeAccountWithFallback(authUser, recovered);

    throw new Error("Failed to resolve authenticated account");
  },

  async updateAccount(userId: string, updates: UserUpdateInput) {
    const result = await userRepository.update(userId, updates);
    if (!result) throw new Error("Failed to update account");
    return result;
  },

  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return data;
  }
};
