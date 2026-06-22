import { supabase } from "@shared/lib/supabase";
import type { OfficeRow } from "@features/offices/types/office";

export interface CheckoutLogInput {
  event_name: string;
  email: string;
  office_id: string | null;
  details: string;
}

export interface CheckoutOfficeBrand {
  name: string;
  logoSrc: string | null;
}

export interface CheckoutServiceRow {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  dependent_service_id?: string | null;
  is_active?: boolean | null;
}

export interface CheckoutServicePrice {
  price: number;
  is_active: boolean | null;
}

interface PublicOfficePaymentMethodRow {
  user_id: string;
  provider: string;
  is_active: boolean;
  display_name: string | null;
  config: {
    recipient_name?: string | null;
    email?: string | null;
    phone?: string | null;
    instructions?: string | null;
  } & Record<string, unknown>;
}

export interface PublicOfficeCheckoutData {
  office: OfficeRow | null;
  service: CheckoutServiceRow | null;
  paymentMethods: PublicOfficePaymentMethodRow[];
  price: CheckoutServicePrice | null;
  dependentPrice: CheckoutServicePrice | null;
}

export async function logCheckoutInteraction(input: CheckoutLogInput): Promise<void> {
  const { error } = await supabase.from("checkout_logs").insert(input);
  if (error) throw Error(error.message);
}

export function logCheckoutInteractionEventually(input: CheckoutLogInput): void {
  void supabase.from("checkout_logs").insert(input);
}

export async function fetchOfficeIdByProcess(processId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("office_id")
    .eq("id", processId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data?.office_id as string | null) ?? null;
}

export async function fetchOfficeSubscriptionStatus(officeId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("v_office_current_subscription")
    .select("status")
    .eq("office_id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.status ?? null;
}

export async function fetchCheckoutOfficeBrand(officeId: string): Promise<CheckoutOfficeBrand | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("name, logo_url, landing_page_config")
    .eq("id", officeId)
    .maybeSingle();

  if (error) throw Error(error.message);
  if (!data) return null;

  const landingConfig = data.landing_page_config as { logoUrl?: string | null } | null;
  return {
    name: data.name,
    logoSrc: data.logo_url || landingConfig?.logoUrl || null,
  };
}

export async function fetchCheckoutServiceBySlugs(slugs: string[]): Promise<CheckoutServiceRow | null> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, description, category, dependent_service_id, is_active")
    .in("slug", slugs)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as CheckoutServiceRow | null) ?? null;
}

export async function fetchOfficeServicePrice(
  officeId: string,
  serviceId: string,
): Promise<CheckoutServicePrice | null> {
  const { data, error } = await supabase
    .from("user_service_prices")
    .select("price, is_active")
    .eq("office_id", officeId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as CheckoutServicePrice | null) ?? null;
}

export async function fetchOfficeBySlug(officeSlug: string): Promise<OfficeRow | null> {
  const primary = await supabase
    .from("offices")
    .select("*")
    .eq("slug", officeSlug)
    .maybeSingle();

  if (primary.error) throw Error(primary.error.message);
  if (primary.data) return primary.data;

  const fallback = await supabase
    .from("offices")
    .select("*")
    .ilike("slug", officeSlug)
    .maybeSingle();

  if (fallback.error) throw Error(fallback.error.message);
  return (fallback.data as OfficeRow | null) ?? null;
}

export async function fetchPublicOfficePaymentMethods(ownerId: string): Promise<PublicOfficePaymentMethodRow[]> {
  const { data, error } = await supabase
    .from("view_public_office_payment_methods")
    .select("*")
    .eq("user_id", ownerId);

  if (error) throw Error(error.message);
  return (data as PublicOfficePaymentMethodRow[] | null) ?? [];
}

export async function fetchPublicOfficeCheckoutData(
  officeSlug: string,
  serviceSlugs: string[],
): Promise<PublicOfficeCheckoutData> {
  const office = await fetchOfficeBySlug(officeSlug);
  if (!office) {
    return { office: null, service: null, paymentMethods: [], price: null, dependentPrice: null };
  }

  const [service, paymentMethods] = await Promise.all([
    fetchCheckoutServiceBySlugs(serviceSlugs),
    fetchPublicOfficePaymentMethods(office.owner_id),
  ]);

  if (!service) {
    return { office, service: null, paymentMethods, price: null, dependentPrice: null };
  }

  const [price, dependentPrice] = await Promise.all([
    fetchOfficeServicePrice(office.id, service.id),
    service.dependent_service_id
      ? fetchOfficeServicePrice(office.id, service.dependent_service_id)
      : Promise.resolve(null),
  ]);

  return { office, service, paymentMethods, price, dependentPrice };
}
