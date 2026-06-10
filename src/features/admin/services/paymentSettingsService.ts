import { supabase } from "@shared/lib/supabase";
import type { PaymentSettings } from "../types";

export function createDefaultPaymentSettings(officeId: string): PaymentSettings {
  return {
    office_id: officeId,
    default_payout_method: "stripe",
    stripe_enabled: false,
    zelle_enabled: false,
    zelle_name: "",
    zelle_identifier: "",
  };
}

export async function fetchOfficePaymentSettings(officeId: string): Promise<PaymentSettings | null> {
  const { data, error } = await supabase
    .from("office_payment_settings")
    .select("id, office_id, default_payout_method, stripe_enabled, zelle_enabled, zelle_name, zelle_identifier")
    .eq("office_id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  if (!data) return null;

  return {
    ...(data as PaymentSettings),
    stripe_enabled: Boolean(data.stripe_enabled),
    zelle_enabled: Boolean(data.zelle_enabled),
  };
}

export async function saveOfficePaymentSettings(settings: PaymentSettings, officeId: string): Promise<void> {
  const defaultPayoutMethod =
    settings.default_payout_method === "zelle" && settings.zelle_enabled
      ? "zelle"
      : settings.stripe_enabled
      ? "stripe"
      : "zelle";

  const { error } = await supabase
    .from("office_payment_settings")
    .upsert(
      {
        ...settings,
        default_payout_method: defaultPayoutMethod,
        office_id: officeId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "office_id" },
    );

  if (error) throw Error(error.message);
}

export async function hasOfficeWithdrawalMethod(officeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("office_payment_settings")
    .select("stripe_enabled, zelle_enabled")
    .eq("office_id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return Boolean(data?.stripe_enabled || data?.zelle_enabled);
}
