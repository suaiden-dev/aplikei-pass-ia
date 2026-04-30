import type { UserAccount } from "../models/user.model";
import { requireSupabaseClient } from "../lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  passport_photo_url?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserAccount["role"];
  signedInAt: string;
}

type UserAccountsRow = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  passport_photo_url: string | null;
  preferred_language: string | null;
  role: UserAccount["role"];
  email: string | null;
  created_at: string;
  updated_at: string;
};

type AuthUserRow = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  last_sign_in_at?: string | null;
};

const RESET_STORAGE_KEY = "aplikei.auth.reset-email";

let cachedUser: UserAccount | null = null;
let cachedSession: AuthSession | null = null;
let loadCurrentUser_inFlight = false;

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
  } else {
    window.localStorage.removeItem(RESET_STORAGE_KEY);
  }
}

function mapFromUserAccountRow(row: UserAccountsRow): UserAccount {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    phoneNumber: row.phone_number ?? "",
    avatarUrl: row.avatar_url,
    passportPhotoUrl: row.passport_photo_url,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const VALID_ROLES = ["customer", "admin", "seller", "master"] as const;

function mapFromAuthUser(user: AuthUserRow): UserAccount {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : user.email ?? "Aplikei User";

  // Try to read role from user_metadata (set via admin tools or seed)
  const metaRole = metadata.role;
  const role: UserAccount["role"] =
    typeof metaRole === "string" && VALID_ROLES.includes(metaRole as UserAccount["role"])
      ? (metaRole as UserAccount["role"])
      : "customer";

  return {
    id: user.id,
    fullName,
    email: user.email ?? "",
    phoneNumber: typeof metadata.phone === "string" ? metadata.phone : "",
    avatarUrl: null,
    passportPhotoUrl:
      typeof metadata.passport_photo_url === "string"
        ? metadata.passport_photo_url
        : null,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchAccountById(userId: string): Promise<UserAccount | null> {
  const supabase = requireSupabaseClient();

  try {
    // Short timeout — if the view hangs we fall back to metadata immediately
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 2000),
    );

    const queryPromise = supabase
      .from("user_accounts")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return null;
        return data ? mapFromUserAccountRow(data as UserAccountsRow) : null;
      });

    return await Promise.race([queryPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

function setCache(user: UserAccount | null, session: AuthSession | null) {
  cachedUser = user;
  cachedSession = session;
}

async function resolveCurrentUserFromSession(session: Session | null): Promise<UserAccount | null> {
  if (!session) {
    setCache(null, null);
    return null;
  }

  if (cachedUser && cachedUser.id === session.user.id) {
    cachedSession = {
      userId: cachedUser.id,
      email: cachedUser.email ?? "",
      role: cachedUser.role,
      signedInAt: session.user.last_sign_in_at ?? new Date().toISOString(),
    };
    return cachedUser;
  }

  const account = await fetchAccountById(session.user.id);
  const fallback = mapFromAuthUser({
    id: session.user.id,
    email: session.user.email,
    user_metadata: session.user.user_metadata,
    last_sign_in_at: session.user.last_sign_in_at,
  });
  const resolved = account ?? fallback;

  setCache(resolved, {
    userId: resolved.id,
    email: resolved.email ?? "",
    role: resolved.role,
    signedInAt: session.user.last_sign_in_at ?? new Date().toISOString(),
  });

  return resolved;
}

export function getDashboardPathForRole(role: UserAccount["role"]) {
  if (role === "master") return "/master";
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller/payments";
  return "/dashboard";
}

export const authService = {
  getCurrentAccount(): UserAccount | null {
    return cachedUser;
  },

  getSession(): AuthSession | null {
    return cachedSession;
  },

  getPendingResetEmail() {
    return readPendingResetEmail();
  },

  async loadCurrentUser(): Promise<UserAccount | null> {
    // Guard against concurrent calls — if already in-flight, skip
    if (loadCurrentUser_inFlight) {
      return cachedUser;
    }
    loadCurrentUser_inFlight = true;

    try {
      const supabase = requireSupabaseClient();
      // getSession() reads from localStorage and only hits the network when the
      // token is actually expired. Safe to call frequently.
      const { data: sessionData } = await supabase.auth.getSession();
      return resolveCurrentUserFromSession(sessionData.session);
    } finally {
      loadCurrentUser_inFlight = false;
    }
  },

  async loadCurrentUserFromSession(session: Session | null): Promise<UserAccount | null> {
    if (loadCurrentUser_inFlight) {
      return cachedUser;
    }
    loadCurrentUser_inFlight = true;

    try {
      return await resolveCurrentUserFromSession(session);
    } finally {
      loadCurrentUser_inFlight = false;
    }
  },

  async getAccount(userId: string): Promise<UserAccount | null> {
    return fetchAccountById(userId);
  },

  async updateAccount(userId: string, updates: UserUpdateInput): Promise<UserAccount> {
    const supabase = requireSupabaseClient();
    const patch: Record<string, unknown> = {};

    if (updates.full_name !== undefined) patch.full_name = updates.full_name;
    if (updates.email !== undefined) patch.email = updates.email;
    if (updates.phone_number !== undefined) patch.phone_number = updates.phone_number;
    if (updates.avatar_url !== undefined) patch.avatar_url = updates.avatar_url;
    if (updates.passport_photo_url !== undefined) patch.passport_photo_url = updates.passport_photo_url;

    const { data, error } = await supabase
      .from("user_accounts")
      .update(patch)
      .eq("id", userId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not update account.");
    }

    const account = mapFromUserAccountRow(data as UserAccountsRow);
    setCache(account, cachedSession);
    return account;
  },

  async signIn(input: { email: string; password: string }) {
    const supabase = requireSupabaseClient();

    type SignInResult = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
    const signInWithTimeout = (): Promise<SignInResult> =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Login request timed out. Please try again.")),
          10000,
        );
        supabase.auth
          .signInWithPassword({
            email: normalizeEmail(input.email),
            password: input.password,
          })
          .then((result) => {
            clearTimeout(timer);
            resolve(result);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });

    const { data, error } = await signInWithTimeout();
    if (error || !data.user) {
      throw new Error(error?.message ?? "Invalid email or password.");
    }

    const account = await fetchAccountById(data.user.id);
    const resolvedAccount = account ?? mapFromAuthUser({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      last_sign_in_at: data.user.last_sign_in_at,
    });

    setCache(resolvedAccount, {
      userId: resolvedAccount.id,
      email: resolvedAccount.email ?? "",
      role: resolvedAccount.role,
      signedInAt: new Date().toISOString(),
    });

    return { user: resolvedAccount, session: cachedSession };
  },

  async signUp(input: { fullName: string; email: string; password: string; termsAccepted: boolean }) {
    if (!input.termsAccepted) {
      throw new Error("Terms must be accepted.");
    }

    const supabase = requireSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(input.email),
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

    const account = await fetchAccountById(data.user.id);
    const resolvedAccount = account ?? mapFromAuthUser({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      last_sign_in_at: data.user.last_sign_in_at,
    });

    setCache(resolvedAccount, {
      userId: resolvedAccount.id,
      email: resolvedAccount.email ?? "",
      role: resolvedAccount.role,
      signedInAt: new Date().toISOString(),
    });

    return resolvedAccount;
  },

  async requestPasswordReset(email: string) {
    const supabase = requireSupabaseClient();
    const redirectTo = isBrowser() ? `${window.location.origin}/reset-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), redirectTo ? { redirectTo } : undefined);
    if (error) throw new Error(error.message);

    writePendingResetEmail(normalizeEmail(email));
    return { email: normalizeEmail(email), requestedAt: new Date().toISOString() };
  },

  async resetPassword(input: { password: string; email?: string }) {
    const supabase = requireSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: input.password });
    if (error) throw new Error(error.message);

    writePendingResetEmail(null);
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error("Could not reload user after password reset.");

    const account = await fetchAccountById(data.user.id);
    const resolvedAccount = account ?? mapFromAuthUser({
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      last_sign_in_at: data.user.last_sign_in_at,
    });

    setCache(resolvedAccount, cachedSession);
    return resolvedAccount;
  },

  async logout() {
    const supabase = requireSupabaseClient();
    await supabase.auth.signOut();
    setCache(null, null);
  },
};
