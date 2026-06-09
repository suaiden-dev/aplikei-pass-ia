import { supabase } from "@shared/lib/supabase";
import type { Withdrawal } from "../types";

export async function listOfficeWithdrawals(officeId: string): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from("office_withdrawals")
    .select("*")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  return (data ?? []) as Withdrawal[];
}
