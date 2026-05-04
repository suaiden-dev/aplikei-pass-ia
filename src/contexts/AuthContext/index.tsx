<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./context";
import { authService } from "../../services/auth.service";
import { getSupabaseClient } from "../../lib/supabase/client";
=======
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { UserAccount } from "../../features/auth/types";
import type { User } from "@supabase/supabase-js";
import { AuthContext, type AuthStatus } from "./context";
import {
  authService,
  buildFallbackAccount,
  subscribeToAuthChanges,
} from "../../features/auth/lib/auth";
import { getSessionSafe, supabase } from "../../shared/lib/supabase";
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(authService.getCurrentAccount());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
    const cached = authService.getCurrentAccount();
    if (cached) {
      setUser(cached);
      setIsLoading(false);
      return;
    }

<<<<<<< HEAD
    await authService.loadCurrentUser();
    setUser(authService.getCurrentAccount());
    setIsLoading(false);
=======
    const { data: canStayAuthenticated, error: gateError } = await supabase.rpc("can_login_with_email", {
      p_email: authUser.email ?? "",
    });

    if (gateError) {
      console.error("[AuthContext] Failed to validate active session:", gateError);
    } else if (!canStayAuthenticated) {
      setUser(null);
      setStatus("anonymous");
      setAccountHydrated(true);
      await authService.logout();
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
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();

    if (!supabase) {
      const loadingTimer = setTimeout(() => {
        if (!cancelled) setIsLoading(false);
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(loadingTimer);
      };
    }

    // Debounce rapid auth state changes (HMR reconnects, Vite hot reloads).
    // Use the session payload from onAuthStateChange instead of calling
    // getSession() again; duplicated getSession() calls can race Supabase's
    // internal refresh and hit refresh-token rate limits.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      if (event === "SIGNED_OUT" || !session) {
        debounceTimer = setTimeout(() => {
          void authService.loadCurrentUserFromSession(null).then(() => {
            if (!cancelled) {
              setUser(null);
              setIsLoading(false);
            }
          });
        }, 100);
        return;
      }

      debounceTimer = setTimeout(() => {
        void authService.loadCurrentUserFromSession(session).then((account) => {
          if (!cancelled) {
            setUser(account);
            setIsLoading(false);
          }
        });
      }, 300);
    });

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    logout,
    refreshAccount,
  }), [isLoading, logout, refreshAccount, user]);

<<<<<<< HEAD
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
=======
  const isLoading = status === "loading" || (status === "authenticated" && !accountHydrated);
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
>>>>>>> ca1a9af (feat: Implemented a color-coding system, atomic components, an organized)
}
