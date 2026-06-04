// _shared/payments/application/payment-types.ts

import type { Supabase } from "../core/supabase.ts";
export type SupabaseClient = Supabase;

export type ApplySuccessfulPaymentInput = {
  supabase: SupabaseClient;
  user_id: string;
  service_slug: string;
  payment_method?: string | null;
  paid_amount?: number | null;
  dependents?: number | null;
  proc_id?: string | null;
  payment_id?: string | null;
  order_id?: string | null;
  parent_service_slug?: string | null;
  office_id?: string | null;
  order_update?: Record<string, unknown>;
};

export type PurchaseRecord = {
  id: string;
  method: string;
  amount: number;
  dependents: number;
  slug: string;
  date: string;
  order_id: string | null;
};
