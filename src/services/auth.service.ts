import { supabase } from "../lib/supabase";
import type { LoginInput, SignUpInput } from "../schemas/auth.schema";

export interface UserAccount {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "customer" | "admin";
  avatar_url?: string;
  passport_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signUp({ email, password, fullName, phoneNumber }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone_number: phoneNumber },
      },
    });
    if (error) throw new Error(error.message);

    // Cria o perfil na tabela user_accounts se o usuário for criado com sucesso
    if (data.user) {
      const { error: profileError } = await supabase
        .from("user_accounts")
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          phone_number: phoneNumber,
          role: "customer",
        });

      if (profileError) {
        console.error("Erro ao criar perfil de usuário:", profileError.message);
      }
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  async getAccount(userId: string): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as UserAccount | null;
  },

  async updateAccount(userId: string, updates: Partial<UserAccount>) {
    const { error } = await supabase
      .from("user_accounts")
      .update(updates)
      .eq("id", userId);

    if (error) throw new Error(error.message);
  },

  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return data;
  }
};
