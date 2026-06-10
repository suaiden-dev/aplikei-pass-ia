import { supabase } from "@shared/lib/supabase";
import type { SellerEarningsData, SellerOfficeInfo, SellerOrderRow, SellerService } from "../types";

const PAID_STATUSES = ["paid", "approved", "complete", "completed", "succeeded"];

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
    services = ((priceRows ?? []) as any[])
      .filter((row) => row.services?.category === "main_visa")
      .map((row) => ({
        id: row.services.id,
        name: row.services.name,
        slug: row.services.slug,
        category: row.services.category,
        price: row.price,
      }));
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
