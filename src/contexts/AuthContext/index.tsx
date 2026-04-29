import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { UserAccount } from "../../models/user.model";
import type { User } from "@supabase/supabase-js";
import { AuthContext, type AuthStatus } from "./context";
import {
  authService,
  buildFallbackAccount,
  subscribeToAuthChanges,
} from "../../services/auth.service";
import { getSessionSafe } from "../../lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [accountHydrated, setAccountHydrated] = useState(false);

  const hydrateAccount = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      setStatus("anonymous");
      setAccountHydrated(true);
      return;
    }

    // Define fallback inicial para evitar flicker
    setUser(current => current || buildFallbackAccount(authUser));
    setStatus("authenticated");
    setAccountHydrated(false);

    try {
      const account = await authService.resolveAccount(authUser);
      setUser(account);
    } catch (error) {
      console.error("[AuthContext] Failed to hydrate account:", error);
      setUser(buildFallbackAccount(authUser));
    } finally {
      setAccountHydrated(true);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    const session = await getSessionSafe();
    if (session?.user) {
      await hydrateAccount(session.user);
    }
  }, [hydrateAccount]);

  useEffect(() => {
    let isActive = true;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Escuta mudanças na autenticação (login, logout, token refresh).
    // Use o session recebido do onAuthStateChange para evitar chamadas
    // duplicadas ao getSession() que podem bater rate limit.
    const unsubscribe = subscribeToAuthChanges((event, session) => {
      if (!isActive) return;
      if (debounceTimer) clearTimeout(debounceTimer);

      if (event === "SIGNED_OUT" || !session) {
        debounceTimer = setTimeout(() => {
          if (!isActive) return;
          void hydrateAccount(null);
        }, 100);
        return;
      }

      debounceTimer = setTimeout(() => {
        if (!isActive) return;
        void hydrateAccount(session.user);
      }, 300);
    });

    return () => {
      isActive = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  }, [hydrateAccount]);

  const logout = async () => {
    await authService.logout();
    hydrateAccount(null);
  };

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated,
        isLoading,
        accountHydrated,
        logout,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
