import Stripe from "https://esm.sh/stripe@14.16.0";
import { applySuccessfulPayment } from "../payment-slot-logic.ts";

type SupabaseClient = any;

type ConfirmStripeCheckoutPaymentParams = {
  supabase: SupabaseClient;
  session: Stripe.Checkout.Session;
  source: "stripe_webhook" | "stripe_verify";
};

export async function confirmStripeCheckoutPayment({
  supabase,
  session,
  source,
}: ConfirmStripeCheckoutPaymentParams) {
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return {
      success: false,
      status: session.payment_status,
      message: "Pagamento ainda não confirmado no Stripe.",
    };
  }

  const serviceSlug = session.metadata?.service_slug || session.metadata?.slug;
  const userId = session.metadata?.user_id || session.metadata?.userId;
  const dependents = parseInt(session.metadata?.dependents || "0", 10);
  const procId = session.metadata?.proc_id || session.metadata?.processId;
  const orderId = session.metadata?.order_id || null;
  const officeId = session.metadata?.office_id || null;
  const parentServiceSlug = session.metadata?.parent_service_slug || null;

  if (!userId || !serviceSlug) {
    throw new Error("Sessão válida, mas metadados ausentes (user_id/slug).");
  }

  const { data: eventRegistered, error: eventRegisterError } =
    await supabase.rpc("register_payment_event", {
      p_provider: source,
      p_event_id: session.id,
      p_order_id: orderId,
      p_payment_id: session.id,
      p_payload: {
        session_id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      },
    });

  if (eventRegisterError) {
    throw eventRegisterError;
  }

  if (!eventRegistered) {
    console.log(
      `[ConfirmStripePayment] Evento já registrado, evitando duplicidade: ${session.id}`,
    );

    return {
      success: true,
      already_processed: true,
      message: "Pagamento já havia sido processado.",
    };
  }

  await applySuccessfulPayment({
    user_id: userId,
    service_slug: serviceSlug,
    paid_amount: session.amount_total ? session.amount_total / 100 : 0,
    dependents,
    proc_id: procId,
    order_id: orderId,
    office_id: officeId,
    parent_service_slug: parentServiceSlug,
    payment_method: source,
    payment_id: session.id,
    supabase,
    order_update: {
      stripe_session_id: session.id,
    },
  });

  return {
    success: true,
    already_processed: false,
    message: "Pagamento confirmado e serviço ativado com sucesso.",
  };
}
