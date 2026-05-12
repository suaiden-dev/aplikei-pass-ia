import type { Session } from "@supabase/supabase-js";
import { authService } from "../lib/auth";

interface LoginInput {
  email: string;
  password: string;
}

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  terms?: boolean;
  role?: string;
  officeId?: string;
}

export function useAuthForm() {
  const login = async ({ email, password }: LoginInput): Promise<{ session: Session | null }> =>
    authService.login({ email, password });

  const signUp = async ({ email, password, fullName, phoneNumber, role, officeId }: SignUpInput): Promise<void> => {
    await authService.signUp({ email, password, fullName, phoneNumber, role, officeId });
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
  };

  return { login, signUp, logout };
}
