import { supabase } from "@shared/lib/supabase";
import type { SellerEarningsData, SellerOfficeInfo, SellerOrderRow, SellerService } from "../types";

const PAID_STATUSES = ["paid", "approved", "complete", "completed", "succeeded"];

type SellerServicePriceRow = {
  price: number;
  services: {
    id: string;
    name: string;
    slug: string;
    category: string;
  } | Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
  }> | null;
};

export async function fetchSellerEarningsData(params: {
  sellerId: string;
  officeId?: string | null;
}): Promise<SellerEarningsData> {
  let office: SellerOfficeInfo | null = null;
  let services: SellerService[] = [];

  if (params.officeId) {
    const [{ data: officeRow }, { data: priceRows }] = await Promise.all([
      supabase
        .from("offices")
        .select("id, slug, name")
        .eq("id", params.officeId)
        .maybeSingle(),
      supabase
        .from("user_service_prices")
        .select("price, services(id, name, slug, category)")
        .eq("office_id", params.officeId)
        .eq("is_active", true),
    ]);

    office = officeRow as SellerOfficeInfo | null;
    services = ((priceRows ?? []) as SellerServicePriceRow[]).flatMap((row) => {
      const relatedServices = Array.isArray(row.services)
        ? row.services
        : row.services
          ? [row.services]
          : [];

      return relatedServices
        .filter((service) => service.category === "main_visa")
        .map((service) => ({
          id: service.id,
          name: service.name,
          slug: service.slug,
          category: service.category,
          price: row.price,
        }));
    });
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id, total_price_usd, payment_status, created_at, client_name, product_slug")
    .eq("seller_id", params.sellerId)
    .in("payment_status", PAID_STATUSES)
    .order("created_at", { ascending: false });

  if (ordersError) throw Error(ordersError.message);

  return {
    office,
    services,
    orders: (ordersData as SellerOrderRow[]) ?? [],
  };
}
