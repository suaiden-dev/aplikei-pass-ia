import type { UserAccount, UserAccountRole } from "../models/users-account";
import { mockAuthAccountHints } from "../mocks/auth-users";
import { getSupabaseClient, requireSupabaseClient } from "../lib/supabase/client";

const RESET_STORAGE_KEY = "aplikei.auth.reset-email";

export interface MockAuthSession {
  userId: string;
  email: string;
  role: UserAccountRole;
  signedInAt: string;
}

export interface MockSignInInput {
  email: string;
  password: string;
}

export interface MockSignUpInput {
  fullName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface MockResetPasswordInput {
  password: string;
  email?: string;
}

export function getDashboardPathForRole(role: UserAccountRole) {
  if (role === "master") return "/master";
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller/payments";
  if (role === "customer") return "/dashboard";
  return "/login";
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readPendingResetEmail() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(RESET_STORAGE_KEY);
}

function writePendingResetEmail(email: string | null) {
  if (!isBrowser()) return;
  if (email) {
    window.localStorage.setItem(RESET_STORAGE_KEY, email);
    return;
  }
  window.localStorage.removeItem(RESET_STORAGE_KEY);
}

interface UsersAccountsRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  passport_photo_url: string | null;
  preferred_language: string | null;
  role: UserAccountRole;
  created_at: string;
  updated_at: string;
}

function rowToUserAccount(row: UsersAccountsRow): UserAccount {
  return {
    id: row.id,
    role: row.role,
    email: row.email,
    name: row.full_name ?? "",
    profileUrl: row.avatar_url,
    phone: row.phone_number,
    metadata: {
      preferredLanguage: row.preferred_language ?? "en",
      passportPhotoUrl: row.passport_photo_url ?? undefined,
    },
    isActive: true,
    termsAcceptedAt: null,
    lastSignInAt: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function authUserToAccount(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email ?? "Aplikei User";
  return {
    id: user.id,
    role: "customer" as UserAccountRole,
    email: user.email ?? null,
    name: fullName,
    profileUrl: null,
    phone: null,
    metadata: {},
    isActive: true,
    termsAcceptedAt: null,
    lastSignInAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchAccountById(userId: string): Promise<UserAccount | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] failed to load user_accounts row:", error);
    return null;
  }

  return data ? rowToUserAccount(data as UsersAccountsRow) : null;
}

// ─── Cache em memória pro consumo síncrono (RoleDashboardLayout, auth.service) ─
let cachedUser: UserAccount | null = null;
let cachedSession: MockAuthSession | null = null;

export function setCachedAuth(user: UserAccount | null, session: MockAuthSession | null) {
  cachedUser = user;
  cachedSession = session;
}

class AuthService {
  /** Lista de credenciais demo exibida na tela de login. */
  listDemoAccounts() {
    return mockAuthAccountHints;
  }

  /** Lista todos os usuários (somente admins/master por RLS). */
  async listUsers(): Promise<UserAccount[]> {
    const supabase = requireSupabaseClient();
    const { data, error } = await supabase
      .from("user_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[auth] failed to list user_accounts:", error);
      return [];
    }

    return (data ?? []).map((row) => rowToUserAccount(row as UsersAccountsRow));
  }

  /** Sessão em cache — preenchida pelo AuthContext via supabase.auth.onAuthStateChange. */
  getSession(): MockAuthSession | null {
    return cachedSession;
  }

  /** Usuário em cache — síncrono pra consumo direto em layouts. */
  getCurrentUser(): UserAccount | null {
    return cachedUser;
  }

  /** Versão async: força fetch fresco via Supabase. AuthContext usa essa. */
  async loadCurrentUser(): Promise<UserAccount | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      cachedUser = null;
      cachedSession = null;
      return null;
    }

    // getSession() reads from localStorage — only makes a network call when the
    // token is actually expired. Safe to call without rate limit concerns.
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      cachedUser = null;
      cachedSession = null;
      return null;
    }

    const account = await fetchAccountById(session.user.id);
    if (!account) {
      const fallback = authUserToAccount(session.user as {
        id: string;
        email?: string | null;
        user_metadata?: Record<string, unknown>;
      });
      cachedUser = fallback;
      cachedSession = {
        userId: fallback.id,
        email: fallback.email ?? "",
        role: fallback.role,
        signedInAt: session.user.last_sign_in_at ?? new Date().toISOString(),
      };
      return fallback;
    }
    cachedUser = account;
    cachedSession = account
      ? {
          userId: account.id,
          email: account.email ?? "",
          role: account.role,
          signedInAt: session.user.last_sign_in_at ?? new Date().toISOString(),
        }
      : null;

    return account;
  }

  getPendingResetEmail() {
    return readPendingResetEmail();
  }

  async signIn(input: MockSignInInput) {
    const supabase = requireSupabaseClient();
    const email = normalizeEmail(input.email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Invalid email or password.");
    }

    const account = await fetchAccountById(data.user.id);
    const resolvedAccount = account ?? authUserToAccount(data.user as {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    });

    if (!resolvedAccount.isActive) {
      await supabase.auth.signOut();
      throw new Error("This account is inactive.");
    }

    cachedUser = resolvedAccount;
    cachedSession = {
      userId: resolvedAccount.id,
      email: resolvedAccount.email ?? "",
      role: resolvedAccount.role,
      signedInAt: new Date().toISOString(),
    };

    return { user: resolvedAccount, session: cachedSession };
  }

  async signUp(input: MockSignUpInput) {
    if (!input.termsAccepted) {
      throw new Error("Terms must be accepted.");
    }

    const supabase = requireSupabaseClient();
    const email = normalizeEmail(input.email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          name: input.fullName.trim(),
          full_name: input.fullName.trim(),
        },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Could not create account.");
    }

    // Trigger handle_new_auth_user já criou a linha em user_accounts.
    const account = await fetchAccountById(data.user.id);
    const resolvedAccount = account ?? authUserToAccount(data.user as {
      id: string;
      email?: string | null;
      user_metadata?: Record<string, unknown>;
    });

    cachedUser = resolvedAccount;
    cachedSession = {
      userId: resolvedAccount.id,
      email: resolvedAccount.email ?? "",
      role: resolvedAccount.role,
      signedInAt: new Date().toISOString(),
    };
    return resolvedAccount;
  }

  async requestPasswordReset(email: string) {
    const supabase = requireSupabaseClient();
    const normalizedEmail = normalizeEmail(email);
    const redirectTo = isBrowser()
      ? `${window.location.origin}/reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      redirectTo ? { redirectTo } : undefined,
    );

    if (error) {
      throw new Error(error.message);
    }

    writePendingResetEmail(normalizedEmail);
    return {
      email: normalizedEmail,
      requestedAt: new Date().toISOString(),
    };
  }

  async resetPassword(input: MockResetPasswordInput) {
    const supabase = requireSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: input.password });

    if (error) {
      throw new Error(error.message);
    }

    writePendingResetEmail(null);

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw new Error("Could not reload user after password reset.");
    }

    const account = await fetchAccountById(data.user.id);
    if (!account) {
      throw new Error("Account profile not found.");
    }

    cachedUser = account;
    return account;
  }

  async logout() {
    const supabase = requireSupabaseClient();
    await supabase.auth.signOut();
    cachedUser = null;
    cachedSession = null;
  }
}

export const mockAuthService = new AuthService();
