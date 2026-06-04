// _shared/payments/application/payment-orders.ts

import type { ApplySuccessfulPaymentInput } from "../payment-types.ts";

export type OrderRow = Record<string, unknown> & {
  id: string;
  payment_metadata: Record<string, unknown>;
  office_id: string | null;
};

export async function updateOrderSuccess(input: ApplySuccessfulPaymentInput) {
  const {
    supabase,
    user_id,
    service_slug,
    payment_id,
    order_id,
    order_update,
    office_id,
  } = input;

  const now = new Date().toISOString();
  let order: OrderRow | null = null;

  if (order_id) {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    order = existingOrder || null;

    if (existingOrder) {
      const { data: updatedOrder } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: now,
          office_id: office_id || existingOrder.office_id || null,
          ...(order_update || {}),
        })
        .eq("id", order_id)
        .select("*")
        .single();

      order = updatedOrder || existingOrder;
    }
  }

  if (!order && payment_id) {
    const { data: byPaymentRef } = await supabase
      .from("orders")
      .select("*")
      .or(
        `stripe_session_id.eq.${payment_id},parcelow_order_id.eq.${payment_id},order_number.eq.${payment_id}`,
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byPaymentRef) {
      const { data: updatedByPaymentRef } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: now,
          office_id: office_id || byPaymentRef.office_id || null,
          ...(order_update || {}),
        })
        .eq("id", byPaymentRef.id)
        .select("*")
        .single();

      order = updatedByPaymentRef || byPaymentRef;
    }
  }

  if (!order) {
    const { data: fallbackOrder } = await supabase
      .from("orders")
      .select("*")
      .match({
        user_id,
        product_slug: service_slug,
        payment_status: "pending",
      })
      .gte(
        "created_at",
        new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackOrder) {
      const { data: updatedFallback } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: now,
          office_id: office_id || fallbackOrder.office_id || null,
          ...(order_update || {}),
        })
        .eq("id", fallbackOrder.id)
        .select("*")
        .single();

      order = updatedFallback || fallbackOrder;
    }
  }

  return order;
}
