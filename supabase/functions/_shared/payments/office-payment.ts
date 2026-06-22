import type { Supabase as SupabaseClient } from "../core/supabase.ts";

export interface ZelleConfig {
  recipient_name: string;
  email?: string;
  phone?: string;
}

export interface ParcelowConfig {
  merchant_id?: string;
  api_key?: string;
}

/**
 * Verifica se o office usa contas da Aplikei.
 * Se o registro provider='aplikei' estiver ativo para o dono do office, retorna true.
 */
export async function resolveUseAplicei(
  supabase: SupabaseClient,
  office_id: string
): Promise<boolean> {
  const { data: office } = await supabase
    .from("offices")
    .select("owner_id")
    .eq("id", office_id)
    .single();

  if (!office) return true; // Fallback para Aplikei se office não encontrado

  const { data: aplikeiConfig } = await supabase
    .from("admin_lawyer_payment_methods")
    .select("is_active")
    .eq("user_id", office.owner_id)
    .eq("provider", "aplikei")
    .maybeSingle();

  return aplikeiConfig?.is_active ?? true;
}

export interface OfficeStripeConfig {
  /** Stripe Connect account ID (acct_xxx) — used with platform key */
  accountId: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
}

/**
 * Resolve the Stripe configuration for an office.
 * Priority: Connect account ID (acct_xxx) → own secret key → null.
 */
export async function getOfficeStripeConfig(
  supabase: SupabaseClient,
  office_id: string
): Promise<OfficeStripeConfig> {
  const { data: office } = await supabase
    .from("offices")
    .select("owner_id")
    .eq("id", office_id)
    .single();

  if (!office) return { accountId: null, secretKey: null, webhookSecret: null };

  const { data: stripeConfig } = await supabase
    .from("admin_lawyer_payment_methods")
    .select("config, is_active")
    .eq("user_id", office.owner_id)
    .eq("provider", "stripe")
    .maybeSingle();

  if (!stripeConfig?.is_active) return { accountId: null, secretKey: null, webhookSecret: null };

  return {
    accountId: (stripeConfig.config?.account_id as string) || null,
    secretKey: (stripeConfig.config?.secret_key as string) || null,
    webhookSecret: (stripeConfig.config?.webhook_secret as string) || null,
  };
}

/** @deprecated Use getOfficeStripeConfig instead */
export async function getOfficeStripeKey(
  supabase: SupabaseClient,
  office_id: string
): Promise<string | null> {
  const cfg = await getOfficeStripeConfig(supabase, office_id);
  return cfg.secretKey;
}

/**
 * Resolve configuração Zelle: do office ou global da Aplikei.
 */
export async function resolveZelleConfig(
  supabase: SupabaseClient,
  office_id: string
): Promise<ZelleConfig> {
  const useAplicei = await resolveUseAplicei(supabase, office_id);

  if (useAplicei) {
    return {
      recipient_name: Deno.env.get("APLIKEI_ZELLE_RECIPIENT") || "",
      email: Deno.env.get("APLIKEI_ZELLE_EMAIL") || "",
      phone: Deno.env.get("APLIKEI_ZELLE_PHONE") || "",
    };
  }

  const { data: office } = await supabase
    .from("offices")
    .select("owner_id")
    .eq("id", office_id)
    .single();

  if (!office) throw new Error("Office not found");

  const { data: zelleConfig } = await supabase
    .from("admin_lawyer_payment_methods")
    .select("config, is_active")
    .eq("user_id", office.owner_id)
    .eq("provider", "zelle")
    .maybeSingle();

  if (zelleConfig?.is_active) {
    return zelleConfig.config as unknown as ZelleConfig;
  }

  // Fallback se não houver config ativa no office
  return {
    recipient_name: Deno.env.get("APLIKEI_ZELLE_RECIPIENT") || "",
    email: Deno.env.get("APLIKEI_ZELLE_EMAIL") || "",
    phone: Deno.env.get("APLIKEI_ZELLE_PHONE") || "",
  };
}

/**
 * Resolve configuração Parcelow do office.
 */
export async function resolveParcelowConfig(
  supabase: SupabaseClient,
  office_id: string
): Promise<ParcelowConfig> {
  const { data: office } = await supabase
    .from("offices")
    .select("owner_id")
    .eq("id", office_id)
    .single();

  if (!office) throw new Error("Office not found");

  const { data: parcelowConfig } = await supabase
    .from("admin_lawyer_payment_methods")
    .select("config, is_active")
    .eq("user_id", office.owner_id)
    .eq("provider", "parcelow")
    .maybeSingle();

  if (parcelowConfig?.is_active) {
    return parcelowConfig.config as unknown as ParcelowConfig;
  }

  return {};
}

/**
 * Busca preço de um serviço para um office.
 */
export async function resolveServicePrice(
  supabase: SupabaseClient,
  office_id: string,
  service_id: string
): Promise<{ price: number; currency: string; name: string }> {
  const { data, error } = await supabase
    .from("user_service_prices")
    .select("price, currency, services(name)")
    .eq("office_id", office_id)
    .eq("service_id", service_id)
    .single();

  if (error || !data) {
    throw new Error(`Price not found for office ${office_id} and service ${service_id}`);
  }

  const serviceRow = data as { services?: { name?: string | null } | null };

  return {
    price: data.price,
    currency: data.currency,
    name: serviceRow.services?.name ?? "",
  };
}
