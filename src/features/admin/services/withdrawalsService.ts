import { supabase } from "@shared/lib/supabase";
import type { Withdrawal } from "../types";

export async function listOfficeWithdrawals(officeId: string): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from("office_withdrawals")
    .select("id, amount, status, method, created_at, completed_at, payment_link")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw Error(error.message);
  return (data ?? []) as Withdrawal[];
}
