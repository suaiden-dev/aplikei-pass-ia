import { supabaseAdmin } from "../../core/supabase.ts";
import { registerPaymentEvent } from "./register-payment-event.ts";
import { createLogger } from "../../core/logger.ts";

const log = createLogger("update-payment-from-stripe");


type Params = {
  sessionId: string;
  status: "succeeded" | "failed";
  eventType: string;
  payload: unknown;
};

export async function updatePaymentFromStripe({
  sessionId,
  status,
  eventType,
  payload,
}: Params) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, order_id")
    .eq("external_id", sessionId)
    .maybeSingle();

  if (!payment) {
    log.warn("payment not found for session", { session_id: sessionId });
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from("payments")
    .update({ status })
    .eq("id", payment.id);

  if (updateError) {
    throw new Error(`Payment update failed: ${updateError.message}`);
  }

  const { error: syncError } = await supabaseAdmin.rpc("sync_order_status", {
    p_order_id: payment.order_id,
  });

  if (syncError) {
    throw new Error(`Order sync failed: ${syncError.message}`);
  }

  if (status === "succeeded") {
    const { error: fulfillError } = await supabaseAdmin.rpc("fulfill_paid_order", {
      p_order_id: payment.order_id,
    });

    if (fulfillError) {
      throw new Error(`Order fulfillment failed: ${fulfillError.message}`);
    }
  }

  await registerPaymentEvent({
    paymentId: payment.id,
    eventType,
    payload,
  });
}
