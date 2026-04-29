import { createContext } from "react";
import type { UserAccount } from "../../models/user.model";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextType {
  user: UserAccount | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  accountHydrated: boolean;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
