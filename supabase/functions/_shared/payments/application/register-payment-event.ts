import { supabaseAdmin } from "../../core/supabase.ts";

type Params = {
  paymentId: string;
  eventType: string;
  payload: unknown;
};

export async function registerPaymentEvent({
  paymentId,
  eventType,
  payload,
}: Params) {
  const { error } = await supabaseAdmin.from("payment_events").insert({
    payment_id: paymentId,
    event_type: eventType,
    payload,
  });

  if (error) {
    throw new Error(`Payment event insert failed: ${error.message}`);
  }
}
