import { supabase } from '../lib/supabase';
import type { UserAccount, UserRole } from '../models';

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string | null;
  passport_photo_url?: string | null;
}

export const userRepository = {
  async findById(id: string): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[userRepository.findById]', error);
      return null;
    }

    return data as UserAccount;
  },

  async findByEmail(email: string): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[userRepository.findByEmail]', error);
      return null;
    }

    return data as UserAccount;
  },

  async update(id: string, input: UserUpdateInput): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[userRepository.update]', error);
      return null;
    }

    return data as UserAccount;
  },

  async getRole(id: string): Promise<UserRole | null> {
    const user = await this.findById(id);
    return (user?.role as UserRole) ?? null;
  },
};
