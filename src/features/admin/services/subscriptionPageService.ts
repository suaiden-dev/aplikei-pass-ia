import { supabase } from "@shared/lib/supabase";

export interface DBPlan {
  id: string;
  name: string;
  description: string;
  type: "FIXED" | "PERCENTAGE" | "HYBRID";
  fixed_fee: number;
  percentage_fee: number;
  min_fee_per_transaction_usd?: number | null;
  features: string[];
  is_active: boolean;
  is_exclusive: boolean;
}

export interface BillingHistoryItem {
  id: string;
  planName: string;
  amountLabel: string;
  signedAt: string | null;
}

export async function fetchOfficeName(officeId: string): Promise<string> {
  const { data, error } = await supabase
    .from("offices")
    .select("name")
    .eq("id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.name ?? "";
}

export async function fetchActiveSubscriptionPlans(): Promise<DBPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, description, type, fixed_fee, percentage_fee, min_fee_per_transaction_usd, features, is_active, is_exclusive")
    .eq("is_active", true)
    .limit(20);

  if (error) throw Error(error.message);
  return (data ?? []) as DBPlan[];
}

interface SubscriptionHistoryRow {
  id: string;
  created_at: string;
  current_period_start: string | null;
  subscription_plans: {
    name: string | null;
    type: string | null;
    fixed_fee: number | null;
    percentage_fee: number | null;
    min_fee_per_transaction_usd: number | null;
  } | null;
}

export async function fetchBillingHistory(
  officeId: string,
  noPlanLabel: string,
): Promise<BillingHistoryItem[]> {
  const { data, error } = await supabase
    .from("office_subscriptions")
    .select("id, created_at, current_period_start, subscription_plans(name, type, fixed_fee, percentage_fee, min_fee_per_transaction_usd)")
    .eq("office_id", officeId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw Error(error.message);

  return ((data ?? []) as unknown as SubscriptionHistoryRow[]).map((row) => {
    const plan = row.subscription_plans;
    const amountLabel = plan?.type === "PERCENTAGE"
      ? `${plan?.percentage_fee ?? 0}%`
      : plan?.type === "HYBRID"
        ? `$ ${plan?.fixed_fee ?? 0} + ${plan?.percentage_fee ?? 0}%`
        : `$ ${plan?.fixed_fee ?? 0}`;

    return {
      id: row.id,
      planName: plan?.name || noPlanLabel,
      amountLabel,
      signedAt: row.current_period_start || row.created_at || null,
    };
  });
}

export function normalizePlanName(name: string): string {
  const key = String(name || "").trim().toLowerCase();
  if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
  if (key === "plano fixo") return "Fixed Plan";
  return name;
}

export function normalizePlanDescription(description: string, type: DBPlan["type"], lang: string): string {
  const raw = String(description || "").trim();
  if (lang === "en") {
    if (raw.toLowerCase() === "pague apenas uma porcentagem do que faturar.") return "Pay only a percentage of what you bill.";
    if (type === "PERCENTAGE" && raw) return raw;
  }
  return raw;
}

export function getPlanColor(type: string): "primary" | "secondary" | "warning" {
  if (type === "FIXED") return "primary";
  if (type === "PERCENTAGE") return "secondary";
  if (type === "HYBRID") return "warning";
  return "primary";
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function replaceAmount(text: string, value: number): string {
  return text.split("{{amount}}").join(formatUsd(value));
}

export async function cancelOfficeSubscription(officeId: string): Promise<void> {
  const { error } = await supabase
    .from("office_subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("office_id", officeId)
    .filter("status", "in", '("active","trialing")');

  if (error) throw Error(error.message);
}

export async function activateOfficeSubscription(params: {
  officeId: string;
  planId: string;
}): Promise<void> {
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const { error } = await supabase
    .from("office_subscriptions")
    .upsert({
      office_id: params.officeId,
      plan_id: params.planId,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "office_id" });

  if (error) throw Error(error.message);
}
