import { supabase } from "../../../../shared/lib/supabase";

export type ManagedRole = "master" | "admin_lawyer" | "manager" | "seller" | "customer";

export interface UserAccountRow {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  is_active?: boolean | null;
  created_at: string;
}

export const STAFF_ROLES: ManagedRole[] = ["master", "admin_lawyer", "manager", "seller"];

// Includes legacy "admin" value so DB rows created before the rename are still fetched.
export const STAFF_ROLES_QUERY = [...STAFF_ROLES, "admin"] as string[];

function normalizeEmailTerm(term: string) {
  return term.trim().toLowerCase();
}

function isExactEmailSearch(term: string) {
  return term.includes("@");
}

function escapeLikeTerm(term: string) {
  return term.replace(/[%_]/g, "\\$&");
}

type AccountRow = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email: string | null;
  role: string | null;
  is_active?: boolean | null;
  created_at: string;
};

function mapAccountRow(row: AccountRow): UserAccountRow {
  return {
    id: row.id,
    full_name: row.full_name ?? row.name ?? null,
    email: row.email || "",
    role: row.role,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function fetchStaffUsers(): Promise<UserAccountRow[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, name, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = ((data as AccountRow[] | null) || []).map(mapAccountRow);
  return rows.filter((row) => STAFF_ROLES_QUERY.includes((row.role || "").toLowerCase()));
}

export async function searchUsersByEmail(term: string): Promise<UserAccountRow[]> {
  const normalizedTerm = normalizeEmailTerm(term);
  const table = supabase.from("user_accounts").select("id, name, full_name, email, role, is_active, created_at");
  const request = isExactEmailSearch(normalizedTerm)
    ? table.eq("email", normalizedTerm)
    : table.ilike("email", `%${escapeLikeTerm(normalizedTerm)}%`);

  const { data, error } = await request.order("created_at", { ascending: false });
  if (error) throw error;

  return ((data as AccountRow[] | null) || []).map(mapAccountRow);
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
