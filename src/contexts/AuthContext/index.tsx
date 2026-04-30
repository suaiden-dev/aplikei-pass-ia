import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./context";
import { authService } from "../../services/auth.service";
import { getSupabaseClient } from "../../lib/supabase/client";

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

    await authService.loadCurrentUser();
    setUser(authService.getCurrentAccount());
    setIsLoading(false);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
