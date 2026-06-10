import { supabase } from "@shared/lib/supabase";
import type { SubscriptionPlan } from "../types";

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, percentage_fee, available_after_minutes, is_active, category_minimums")
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
