import { useState, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import type { UserAccount } from "../../models/user.model";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileCreateAttempted = useRef(false);
  const fetchPromise = useRef<Promise<void> | null>(null);

  const fetchAccount = async (userId: string, authUser?: User): Promise<void> => {
    if (fetchPromise.current) {
      return fetchPromise.current;
    }

    const performFetch = async () => {
      // Safety timeout: don't wait more than 10 seconds for DB profile
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      );

      try {
        const fetchOp = (async () => {
          const { data: existingData, error } = await supabase
            .from("user_accounts")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          let data = existingData;

          if (error) {
            console.error("[AuthContext] fetchAccount error:", error.message);
            if (authUser) setUser(buildFallbackUser(authUser));
            return;
          }

          if (!data && authUser && !profileCreateAttempted.current) {
            profileCreateAttempted.current = true;
            const { data: newData, error: insertError } = await supabase
              .from("user_accounts")
              .insert({
                id: userId,
                full_name: authUser.user_metadata?.full_name || "Usuário",
                email: authUser.email,
                phone_number: authUser.user_metadata?.phone_number || "",
                role: "customer",
              })
              .select()
              .maybeSingle();

            if (insertError) {
              console.error("[AuthContext] Erro ao criar perfil:", insertError.message);
              if (authUser) setUser(buildFallbackUser(authUser));
              return;
            }
            data = newData;
          }

          if (!data) {
            if (authUser) setUser(buildFallbackUser(authUser));
            return;
          }

          profileCreateAttempted.current = false;
          setUser({
            id: data.id,
            fullName: data.full_name,
            email: data.email ?? "",
            phoneNumber: data.phone_number ?? "",
            avatarUrl: data.avatar_url ?? null,
            passportPhotoUrl: data.passport_photo_url ?? null,
            role: data.role,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        })();

        await Promise.race([fetchOp, timeoutPromise]);
      } catch (err) {
        console.warn("[AuthContext] Profile fetch failed or timed out, using fallback:", err);
        if (authUser) setUser(buildFallbackUser(authUser));
      } finally {
        fetchPromise.current = null;
      }
    };

    fetchPromise.current = performFetch();
    return fetchPromise.current;
  };

  useEffect(() => {
    // 1. Check for initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAccount(session.user.id, session.user).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Set up a STABLE listener for subsequent events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        profileCreateAttempted.current = false;
        setIsLoading(false);
        return;
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        try {
          await fetchAccount(session.user.id, session.user);
        } catch (err) {
          console.error("[AuthContext] Error in onAuthStateChange handler:", err);
        } finally {
          setIsLoading(false);
        }
      } else if (event === "INITIAL_SESSION") {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            fetchAccount(session.user.id, session.user);
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    profileCreateAttempted.current = false;
  };

  // Debug state changes
  useEffect(() => {
    if (user) {
      console.log("[AuthContext] User state updated:", user.email, "Role:", user.role);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout, refreshAccount: () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) fetchAccount(session.user.id, session.user);
      });
    } }}>
      {children}
    </AuthContext.Provider>
  );
}

function buildFallbackUser(authUser: User): UserAccount {
  return {
    id: authUser.id,
    fullName: authUser.user_metadata?.full_name || "Usuário",
    email: authUser.email || "",
    phoneNumber: authUser.user_metadata?.phone_number || "",
    avatarUrl: null,
    passportPhotoUrl: null,
    role: "customer",
    createdAt: authUser.created_at,
    updatedAt: authUser.updated_at || authUser.created_at,
  };
}
