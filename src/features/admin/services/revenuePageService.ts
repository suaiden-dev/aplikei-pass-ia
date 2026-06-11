import { supabase } from "@shared/lib/supabase";

export type RevenueTab = "zelle" | "office_requests" | "approved_payments";

export interface OfficeNameRow {
  id: string;
  name: string | null;
}

export interface ZellePaymentRow {
  id: string;
  guest_name?: string | null;
  guest_email?: string | null;
  service_slug: string;
  amount: number;
  created_at: string;
  office_id?: string | null;
  status: string;
  image_url?: string | null;
  proof_path?: string | null;
  confirmation_code?: string | null;
}

export interface WithdrawalRow {
  id: string;
  office_id?: string | null;
  amount?: number | string | null;
  status?: string | null;
  method?: string | null;
  payment_method?: string | null;
  payment_link?: string | null;
  reviewed_by_name?: string | null;
  created_at: string;
  offices?: { name?: string | null } | null;
}

export interface PayoutSettingsRow {
  office_id: string;
  zelle_name?: string | null;
  zelle_identifier?: string | null;
}

export interface OrderPaymentRow {
  id: string;
  office_id?: string | null;
  seller_id?: string | null;
  user_id?: string | null;
  total_price_usd?: number | string | null;
  office_net_amount_usd?: number | string | null;
  client_name?: string | null;
  client_email?: string | null;
  product_slug?: string | null;
  payment_method?: string | null;
  created_at: string;
  payment_status?: string | null;
}

export async function listOfficeNames(officeIds: string[]): Promise<OfficeNameRow[]> {
  if (officeIds.length === 0) return [];
  const { data, error } = await supabase.from("offices").select("id, name").in("id", officeIds);
  if (error) throw Error(error.message);
  return (data ?? []) as OfficeNameRow[];
}

export async function listPendingZellePayments(params: {
  isMaster: boolean;
  officeId?: string | null;
}): Promise<ZellePaymentRow[]> {
  let query = supabase
    .from("zelle_payments")
    .select("id, guest_name, guest_email, service_slug, amount, created_at, office_id, status, image_url, proof_path, confirmation_code")
    .eq("status", "pending_verification")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!params.isMaster && params.officeId) query = query.eq("office_id", params.officeId);

  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as ZellePaymentRow[];
}

export async function listOfficeWithdrawals(params: {
  isMaster: boolean;
  officeId?: string | null;
}): Promise<WithdrawalRow[]> {
  let query = supabase
    .from("office_withdrawals")
    .select("id, office_id, amount, status, method, payment_method, payment_link, reviewed_by_name, created_at, offices(name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (!params.isMaster && params.officeId) query = query.eq("office_id", params.officeId);

  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as WithdrawalRow[];
}

export async function listPayoutSettings(officeIds: string[]): Promise<PayoutSettingsRow[]> {
  if (officeIds.length === 0) return [];
  const { data, error } = await supabase
    .from("office_payment_settings")
    .select("office_id, zelle_name, zelle_identifier")
    .in("office_id", officeIds);

  if (error) throw Error(error.message);
  return (data ?? []) as PayoutSettingsRow[];
}

export async function listApprovedOrders(params: {
  isMaster: boolean;
  officeId?: string | null;
}): Promise<OrderPaymentRow[]> {
  let query = supabase
    .from("orders")
    .select("id, office_id, seller_id, user_id, total_price_usd, office_net_amount_usd, client_name, client_email, product_slug, payment_method, created_at, payment_status")
    .in("payment_status", ["paid", "approved", "complete", "completed", "succeeded", "pending"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (!params.isMaster && params.officeId) query = query.eq("office_id", params.officeId);

  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as OrderPaymentRow[];
}

export async function inferOfficeIdsByOwner(ownerIds: string[]): Promise<Map<string, string>> {
  const inferredOfficeByOwnerId = new Map<string, string>();
  if (ownerIds.length === 0) return inferredOfficeByOwnerId;

  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, office_id")
    .in("id", ownerIds);

  if (error) throw Error(error.message);

  ((data ?? []) as Array<{ id: string; office_id?: string | null }>).forEach((owner) => {
    if (owner?.id && owner?.office_id) inferredOfficeByOwnerId.set(owner.id, owner.office_id);
  });

  return inferredOfficeByOwnerId;
}

export async function updateOrderOfficeIds(updates: Array<{ id: string; office_id: string }>): Promise<void> {
  if (updates.length === 0) return;

  const { error } = await supabase.rpc("bulk_update_order_office_ids", {
    p_updates: updates,
  });

  if (error) throw Error(error.message);
}

export async function updateOrderPaymentStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", id);

  if (error) throw Error(error.message);
}

export async function updateWithdrawalStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<{ id: string; office_id: string; amount: number; payment_link?: string | null; requested_by?: string | null }> {
  const { data, error } = await supabase.functions.invoke("withdrawals", {
    body: {
      action: "approve",
      withdrawal_id: id,
      status,
    },
  });

  if (error) throw Error(error.message);
  if (!data?.success || !data?.withdrawal) {
    throw Error(data?.error || "Failed to update withdrawal.");
  }

  return data.withdrawal;
}
