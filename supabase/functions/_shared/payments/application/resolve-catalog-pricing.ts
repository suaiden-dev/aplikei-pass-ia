import { FALLBACK_PRICES, getDependentServiceId } from "../domain/catalog.ts";
import { resolveServicePrice } from "../office-payment.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function resolveCatalogPricing(input: {
  supabase: SupabaseClient;
  slug: string;
  slugCandidates?: string[];
  officeId?: string;
  serviceId?: string;
}) {
  const slugCandidates = input.slugCandidates?.length ? input.slugCandidates : [input.slug];
  const dependentId = getDependentServiceId(input.slug);

  const { data: dbPrices } = await input.supabase
    .from("services_prices")
    .select("service_id, name, price")
    .in("service_id", [...slugCandidates, dependentId]);

  const dependentPriceInfo = dbPrices?.find((price: { service_id: string }) =>
    price.service_id === dependentId
  );

  if (input.officeId && input.serviceId) {
    const officePrice = await resolveServicePrice(
      input.supabase,
      input.officeId,
      input.serviceId,
    );

    return {
      dependentId,
      mainPriceName: officePrice.name,
      basePriceUSD: officePrice.price,
      dependentPriceUSD: dependentPriceInfo ? Number(dependentPriceInfo.price) : 0,
    };
  }

  let mainPriceInfo = dbPrices?.find((price: { service_id: string }) =>
    slugCandidates.includes(String(price.service_id || "").toLowerCase())
  );

  if (!mainPriceInfo) {
    const fallbackKey = slugCandidates.find((candidate) =>
      Boolean(FALLBACK_PRICES[candidate])
    );
    if (fallbackKey) {
      mainPriceInfo = { service_id: fallbackKey, ...FALLBACK_PRICES[fallbackKey] };
    }
  }

  if (!mainPriceInfo) {
    throw new Error(`Serviço não encontrado no catálogo: ${input.slug}`);
  }

  return {
    dependentId,
    mainPriceName: mainPriceInfo.name,
    basePriceUSD: Number(mainPriceInfo.price),
    dependentPriceUSD: dependentPriceInfo ? Number(dependentPriceInfo.price) : 0,
  };
}
