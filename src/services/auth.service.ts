import { supabase } from "../lib/supabase";
import { userRepository, type UserUpdateInput } from "../repositories";
import type { LoginInput, SignUpInput } from "../schemas/auth.schema";
import type { UserAccount } from "../models";

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

    if (data.user) {
      await userRepository.update(data.user.id, {
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
      });
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
    return userRepository.findById(userId);
  },

  async updateAccount(userId: string, updates: UserUpdateInput) {
    const result = await userRepository.update(userId, updates);
    if (!result) throw new Error("Failed to update account");
    return result;
  },

  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return data;
  }
};
