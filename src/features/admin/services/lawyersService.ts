import { supabase } from "@shared/lib/supabase";
import type { LawyerRow } from "../types";

export async function listLawyers(): Promise<LawyerRow[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, name, full_name, email, avatar_url, role, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  const rows = (data ?? []) as LawyerRow[];
  return rows.filter((row) => row.role === "admin_lawyer" || row.role === "admin");
}
