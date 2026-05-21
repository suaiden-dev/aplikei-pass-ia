import { FALLBACK_PRICES, getDependentServiceId, getSlugCandidates } from "../domain/catalog.ts";
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
  const slugCandidates = input.slugCandidates?.length
    ? input.slugCandidates
    : getSlugCandidates(input.slug);
  const dependentId = getDependentServiceId(input.slug);

  const { data: dbPrices } = await input.supabase
    .from("services_prices")
    .select("service_id, name, price")
    .in("service_id", [...slugCandidates, dependentId]);

  let dependentPriceInfo = dbPrices?.find((price: { service_id: string }) =>
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

  if (!mainPriceInfo || !dependentPriceInfo) {
    const { data: serviceCatalog } = await input.supabase
      .from("services")
      .select("slug, name, default_price")
      .in("slug", [...slugCandidates, dependentId]);

    if (!mainPriceInfo) {
      const fromServices = serviceCatalog?.find((row: { slug: string }) =>
        slugCandidates.includes(String(row.slug || "").toLowerCase())
      );
      if (fromServices) {
        mainPriceInfo = {
          service_id: fromServices.slug,
          name: fromServices.name,
          price: Number(fromServices.default_price || 0),
        };
      }
    }

    if (!dependentPriceInfo) {
      const depFromServices = serviceCatalog?.find((row: { slug: string }) =>
        String(row.slug || "").toLowerCase() === dependentId
      );
      if (depFromServices) {
        dependentPriceInfo = {
          service_id: depFromServices.slug,
          name: depFromServices.name,
          price: Number(depFromServices.default_price || 0),
        };
      }
    }
  }

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
