import { createContext } from "react";
import type { UserAccount } from "../../models/user.model";

export interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAccount?: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
