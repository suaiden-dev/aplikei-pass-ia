import { useState, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import type { UserAccount } from "../../models/user.model";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileCreateAttempted = useRef(false);
  const fetchInProgress = useRef(false);

  const fetchAccount = async (userId: string, authUser?: User) => {
    // Prevent concurrent/duplicate calls
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;

    try {
      const { data: existingData, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      let data = existingData;

      if (error) {
        console.error("[AuthContext] fetchAccount error:", error.message);
        return;
      }

      // Lazy Fix: Se o perfil não existir e temos dados do Auth, tentamos criar agora
      // Mas só tentamos UMA VEZ para evitar loop infinito com erro de RLS
      if (!data && authUser && !profileCreateAttempted.current) {
        profileCreateAttempted.current = true;
        console.log("[AuthContext] Perfil ausente. Criando perfil automaticamente para ID:", userId);
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
          console.error("[AuthContext] Erro ao criar perfil automaticamente:", insertError.message);
          return;
        }
        data = newData;
      }

      if (!data) {
        if (!profileCreateAttempted.current) {
          console.warn("[AuthContext] Perfil de usuário não encontrado para o ID:", userId);
        }
        return;
      }

      // Reset the flag on success so future logins can retry if needed
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
    } finally {
      fetchInProgress.current = false;
    }
  };

  useEffect(() => {
    // 1. Check for initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAccount(session.user.id, session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Set up a STABLE listener for subsequent events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] event: ${event}`);

      if (event === "SIGNED_OUT") {
        setUser(null);
        profileCreateAttempted.current = false;
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        await fetchAccount(session.user.id, session.user);
        setIsLoading(false);
      }
      
      // On TOKEN_REFRESHED, we ALREADY have the user data, so we don't need to fetch.
      // This is the CRITICAL fix to prevent the infinite loop.
    });

    return () => subscription.unsubscribe();
  }, []); // Stable listener

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    profileCreateAttempted.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
