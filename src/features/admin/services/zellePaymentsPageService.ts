import { supabase } from "@shared/lib/supabase";

export interface ZelleRecord {
  id: string;
  user_id?: string | null;
  guest_name?: string;
  guest_email?: string;
  service_slug: string;
  amount: number;
  created_at: string;
  status: string;
  image_url?: string;
  proof_path?: string;
  confirmation_code?: string;
  payment_date?: string;
  admin_notes?: string;
  expected_amount?: number;
  coupon_code?: string;
  discount_amount?: number;
}

export interface StripeRecord {
  id: string;
  client_name?: string;
  client_email?: string;
  product_slug?: string;
  total_price_usd: string | number;
  payment_method?: string;
  created_at: string;
  payment_status?: string;
  coupon_code?: string;
  discount_amount?: string | number;
}

function applyOfficeFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  officeId: string | null | undefined,
  isMaster: boolean,
) {
  return !isMaster && officeId ? query.eq("office_id", officeId) : query;
}

export async function listZellePaymentsByStatus(params: {
  status: "pending_verification" | "approved" | "rejected";
  officeId?: string | null;
  isMaster: boolean;
}): Promise<ZelleRecord[]> {
  let query = supabase
    .from("zelle_payments")
    .select("*")
    .eq("status", params.status)
    .order("created_at", { ascending: false });

  query = applyOfficeFilter(query, params.officeId, params.isMaster);
  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as ZelleRecord[];
}

export async function listOrderPaymentsByStatus(params: {
  statuses: string[];
  officeId?: string | null;
  isMaster: boolean;
}): Promise<StripeRecord[]> {
  let query = supabase
    .from("orders")
    .select("id, client_name, client_email, product_slug, total_price_usd, payment_method, created_at, payment_status")
    .in("payment_status", params.statuses)
    .order("created_at", { ascending: false });

  query = applyOfficeFilter(query, params.officeId, params.isMaster);
  const { data, error } = await query;
  if (error) throw Error(error.message);
  return (data ?? []) as StripeRecord[];
}
