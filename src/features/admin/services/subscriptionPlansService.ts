import { supabase } from "@shared/lib/supabase";
import type { SubscriptionPlan } from "../types";

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, description, type, fixed_fee, percentage_fee, available_after_minutes, min_fee_per_transaction_usd, min_monthly_fee, max_monthly_fee, is_active, is_exclusive, category_minimums, version, billing_model, rules, effective_from, effective_to, features")
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  return (data ?? []) as SubscriptionPlan[];
}

export async function updateSubscriptionPlanPercentage(planId: string, percentageFee: number): Promise<void> {
  const { error } = await supabase
    .from("subscription_plans")
    .update({ percentage_fee: percentageFee })
    .eq("id", planId);

  if (error) throw Error(error.message);
}

export interface CreateSubscriptionPlanPayload {
  name: string;
  description: string | null;
  type: SubscriptionPlan["type"];
  fixed_fee: number;
  percentage_fee: number;
  available_after_minutes: number;
  min_fee_per_transaction_usd: number | null;
  min_monthly_fee: number | null;
  max_monthly_fee: number | null;
  is_active: boolean;
  is_exclusive: boolean;
  billing_model: string;
  rules: Record<string, unknown>;
}

export interface UpdateSubscriptionPlanPayload {
  name: string;
  description: string | null;
  type: SubscriptionPlan["type"];
  fixed_fee: number;
  percentage_fee: number;
  available_after_minutes: number;
  min_fee_per_transaction_usd: number | null;
  min_monthly_fee: number | null;
  max_monthly_fee: number | null;
  is_active: boolean;
  is_exclusive: boolean;
  billing_model: string;
  rules: Record<string, unknown>;
}

export async function createSubscriptionPlan(payload: CreateSubscriptionPlanPayload): Promise<void> {
  const { error } = await supabase
    .from("subscription_plans")
    .insert({
      ...payload,
      version: 1,
      effective_from: new Date().toISOString(),
    });

  if (error) throw Error(error.message);
}

export async function updateSubscriptionPlan(planId: string, payload: UpdateSubscriptionPlanPayload): Promise<void> {
  const { data: currentPlan, error: readError } = await supabase
    .from("subscription_plans")
    .select("version")
    .eq("id", planId)
    .maybeSingle();

  if (readError) throw Error(readError.message);

  const nextVersion = (currentPlan?.version ?? 1) + 1;

  const { error } = await supabase
    .from("subscription_plans")
    .update({
      ...payload,
      version: nextVersion,
      effective_from: new Date().toISOString(),
    })
    .eq("id", planId);

  if (error) throw Error(error.message);
}
