import { supabase } from '../lib/supabase';
import type { UserAccount, UserRole } from '../models';

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string | null;
  passport_photo_url?: string | null;
}

export interface UserCreateInput {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
}

interface UserAccountRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  passport_photo_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

function mapUserAccountRow(row: UserAccountRow): UserAccount {
  return {
    id: row.id,
    fullName: row.full_name ?? '',
    email: row.email ?? '',
    phoneNumber: row.phone_number ?? '',
    avatarUrl: row.avatar_url,
    passportPhotoUrl: row.passport_photo_url,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const userRepository = {
  async findById(id: string): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[userRepository.findById]', error);
      return null;
    }

    return data ? mapUserAccountRow(data as UserAccountRow) : null;
  },

  async findByEmail(email: string): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('[userRepository.findByEmail]', error);
      return null;
    }

    return data ? mapUserAccountRow(data as UserAccountRow) : null;
  },

  async create(input: UserCreateInput): Promise<UserAccount | null> {
    const { data, error } = await supabase
      .from('user_accounts')
      .insert(input)
      .select('*')
      .single();

    if (error) {
      console.error('[userRepository.create]', error);
      return null;
    }

    return mapUserAccountRow(data as UserAccountRow);
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

    return mapUserAccountRow(data as UserAccountRow);
  },

  async getRole(id: string): Promise<UserRole | null> {
    const user = await this.findById(id);
    return (user?.role as UserRole) ?? null;
  },
};
