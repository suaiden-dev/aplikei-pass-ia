export type PurchaseRecord = {
  id: string;
  method: string;
  amount: number;
  dependents: number;
  slug: string;
  date: string;
  order_id: string | null;
};

export function buildPurchaseRecord(data: {
  payment_id?: string | null;
  payment_method?: string | null;
  paid_amount?: number | null;
  dependents: number;
  service_slug: string;
  order_id?: string | null;
}): PurchaseRecord {
  return {
    id: data.payment_id || data.order_id || `TRX_${Date.now()}`,
    method: data.payment_method || "unknown",
    amount: data.paid_amount || 0,
    dependents: data.dependents,
    slug: data.service_slug,
    date: new Date().toISOString(),
    order_id: data.order_id || null,
  };
}

export function hasMatchingPurchaseRecord(
  purchases: unknown,
  record: PurchaseRecord,
): boolean {
  if (!Array.isArray(purchases)) return false;
  return purchases.some((p) => {
    const row = p as Record<string, unknown>;
    return row?.id === record.id || (record.order_id && row?.order_id === record.order_id);
  });
}
