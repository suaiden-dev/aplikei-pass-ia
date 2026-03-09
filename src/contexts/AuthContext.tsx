import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca inicial síncrona/imediata da sessão
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Erro na busca de sessão inicial:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // ÚNICO ouvinte para todo o app
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Only update state if the user actually changed (by ID)
      // This prevents cascading re-renders when token refresh
      // returns the same user with a new object reference
      setSession((prev) => {
        if (
          prev?.user?.id === newSession?.user?.id &&
          prev?.access_token === newSession?.access_token
        ) {
          return prev;
        }
        return newSession;
      });
      setUser((prev) => {
        const newUser = newSession?.user ?? null;
        if (prev?.id === newUser?.id) {
          return prev;
        }
        return newUser;
      });
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
