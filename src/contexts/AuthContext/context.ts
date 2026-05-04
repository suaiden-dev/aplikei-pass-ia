import { createContext } from "react";
import type { UserAccount } from "../../features/auth/types";

export interface AuthContextValue {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
