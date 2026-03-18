import { createContext, useContext, useEffect, useState } from "react";
import { UserSession, IAuthService } from "@/application/ports/IAuthService";
import { SupabaseAuthService } from "@/infrastructure/services/SupabaseAuthService";

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authService: IAuthService = new SupabaseAuthService();

    // Busca inicial síncrona/imediata da sessão
    const initAuth = async () => {
      try {
        const initialSession = await authService.getSession();
        setSession(initialSession);
      } catch (err) {
        console.error("Erro na busca de sessão inicial:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // ÚNICO ouvinte para todo o app
    const { unsubscribe } = authService.onAuthStateChange((newSession) => {
      setSession((prev) => {
        if (
          prev?.user?.id === newSession?.user?.id &&
          prev?.accessToken === newSession?.accessToken
        ) {
          return prev;
        }
        return newSession;
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const authService: IAuthService = new SupabaseAuthService();
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook and provider are intentionally co-located
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
