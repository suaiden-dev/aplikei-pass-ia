import { supabase } from "../../../../shared/lib/supabase";

export type ManagedRole = "master" | "admin_lawyer" | "admin" | "manager" | "seller" | "customer";

export interface UserAccountRow {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  is_active?: boolean | null;
  created_at: string;
}

export const STAFF_ROLES: ManagedRole[] = ["master", "admin_lawyer", "admin", "manager", "seller"];

export async function fetchStaffUsers(): Promise<UserAccountRow[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, full_name, email, role, is_active, created_at")
    .in("role", STAFF_ROLES)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as UserAccountRow[] | null) || [];
}

export async function searchUsersByEmail(term: string): Promise<UserAccountRow[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, full_name, email, role, is_active, created_at")
    .ilike("email", `%${term}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as UserAccountRow[] | null) || [];
}

export async function updateUserRole(userId: string, role: ManagedRole){
  const { data, error } = await supabase
    .from("user_accounts")
    .update({ role: role })
    .eq("id", userId)
    .select("id, role")
    .single();

  if (error) throw Error(error.message);

  return data;
}

export async function updateUserActive(userId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from("user_accounts")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) throw Error(error.message);
}
