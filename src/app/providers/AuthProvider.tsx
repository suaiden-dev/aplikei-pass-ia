import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@features/auth/services/authService";
import { supabase } from "@shared/lib/supabase";
import type { UserAccount } from "@features/auth/types";

export interface AuthContextValue {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(authService.getCurrentAccount());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
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

      const cached = authService.getCurrentAccount();
      if (cached && cached.id === session.user.id) {
        if (!cancelled) {
          setUser(cached);
          setIsLoading(false);
        }
        return;
      }

      debounceTimer = setTimeout(() => {
        void authService.loadCurrentUserFromSession(session).then((account) => {
          if (!cancelled) {
            setUser(account);
            setIsLoading(false);
          }
        });
      }, 100);
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
