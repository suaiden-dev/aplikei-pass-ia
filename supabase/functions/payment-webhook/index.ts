import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import Stripe from "npm:stripe@14.14.0";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";
import { buildNotifContent, getUserLang } from "../_shared/notif-templates.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const url = new URL(req.url);
    let provider = url.searchParams.get("provider");
    const signature = req.headers.get("stripe-signature");

    // Auto-detect Stripe if signature is present and provider is missing
    if (!provider && signature) {
      provider = "stripe";
    }

    // === STRIPE WEBHOOK HANDLER ===
    if (provider === "stripe") {
      if (!signature) throw new Error("Sem assinatura do Stripe");

      const body = await req.text();
      let event;
      
      const secrets = [
        Deno.env.get("STRIPE_WEBHOOK_SECRET"),
        Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST"),
        Deno.env.get("STRIPE_WEBHOOK_SECRET_PROD")
      ].filter(Boolean);

      let lastError = null;
      console.log(`[Webhook Debug] Origin IP: ${req.headers.get("x-forwarded-for") || "unknown"}`);
      console.log(`[Webhook Debug] User-Agent: ${req.headers.get("user-agent") || "unknown"}`);
      console.log(`[Webhook Debug] Signature: ${signature?.substring(0, 20)}...`);

      for (const secret of secrets) {
        try {
          event = stripe.webhooks.constructEvent(body, signature, secret!);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (lastError) {
        console.error(`[Webhook Error] Signature validation failed: ${lastError.message}`);
        return new Response(`Webhook Error: ${lastError.message}`, { status: 400 });
      }

      console.log(`[Webhook Success] Evento validado: ${event.type} (ID: ${event.id})`);
      console.log(`[Webhook Success] Metadata recebida:`, JSON.stringify(event.data.object.metadata));

      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object;

        const { data: eventRegistered, error: eventRegisterError } = await supabase
          .rpc("register_payment_event", {
            p_provider: "stripe",
            p_event_id: event.id,
            p_order_id: session.metadata.order_id || null,
            p_payment_id: session.id,
            p_payload: { type: event.type, session_id: session.id },
          });

        if (eventRegisterError) throw eventRegisterError;
        if (!eventRegistered) {
          return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
        }

        await handlePaymentSuccess({
          user_id: session.metadata.user_id || session.metadata.userId || null,
          email: session.metadata.email || session.customer_details?.email || null,
          fullName: session.metadata.fullName || session.customer_details?.name || null,
          origin_url: session.metadata.origin_url || null,
          service_slug: session.metadata.service_slug || session.metadata.slug,
          paid_amount: session.amount_total / 100,
          dependents: parseInt(session.metadata.dependents || "0", 10),
          proc_id: session.metadata.proc_id || session.metadata.processId,
          payment_method: session.metadata.paymentMethod === "pix" ? "stripe_pix" : "stripe_card",
          payment_id: session.id,
          order_id: session.metadata.order_id || null,
          applied_coupon_id: session.metadata.applied_coupon_id || null,
        });
      }

      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    // === PARCELOW WEBHOOK HANDLER ===
    if (provider === "parcelow") {
      const payload = await req.json();
      console.log(`✅ Recebido evento Parcelow:`, payload);

      const isPaid = payload.status === "PAID" || payload.status === "APPROVED" || payload.order_status === "PAID";
      
      if (isPaid) {
        const reference = payload.reference || payload.order_reference;
        let userId = null;
        let serviceSlug = null;
        let dependents = 0;
        let procId = null;

        if (reference && reference.startsWith("APK_")) {
          const orderUuid = reference.replace("APK_", "");
          const { data: orderData } = await supabase
            .from("orders")
            .select("user_id, product_slug, payment_metadata")
            .eq("id", orderUuid)
            .single();

          if (orderData) {
            userId = orderData.user_id;
            serviceSlug = orderData.product_slug;
            dependents = orderData.payment_metadata?.dependents || 0;
            procId = orderData.payment_metadata?.proc_id || orderData.payment_metadata?.processId;
          }
        }

        const meta = payload.metadata || {};
        userId = userId || meta.user_id || meta.userId;
        serviceSlug = serviceSlug || meta.service_slug || meta.slug;

        await handlePaymentSuccess({
          user_id: userId,
          service_slug: serviceSlug,
          paid_amount: payload.amount || payload.total_amount,
          dependents: dependents,
          proc_id: procId,
          status: "complete",
          payment_id: payload.id || reference,
          order_id: reference?.startsWith("APK_") ? reference.replace("APK_", "") : (payload.metadata?.order_id || null)
        });
      }

      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Provedor não suportado na URL.", { status: 400 });

  } catch (error) {
    console.error("❌ Erro fatal no Webhook:", error.message);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
});

async function handlePaymentSuccess(data) {
  const { service_slug, payment_method, proc_id, paid_amount, dependents, payment_id, applied_coupon_id, order_id, parent_service_slug } = data;
  let { user_id } = data;

  if (!service_slug) {
    console.error("Dados insuficientes no webhook (service_slug ausente):", data);
    return;
  }

  // Guest checkout: resolve user by email or create via invite
  if (!user_id && data.email) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingUser = usersData?.users?.find((u: Record<string, unknown>) => u.email === data.email);
    if (existingUser) {
      user_id = existingUser.id;
    } else {
      const originUrl = data.origin_url || Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
      const { data: authUser } = await supabase.auth.admin.inviteUserByEmail(data.email, {
        redirectTo: `${originUrl}/auth/confirm-password`,
        data: { full_name: data.fullName || "" },
      });
      if (authUser?.user) user_id = authUser.user.id;
    }

    if (user_id && order_id) {
      await supabase.from("orders").update({ user_id }).eq("id", order_id);
    }
  }

  if (!user_id) {
    console.error("Não foi possível resolver user_id para o webhook:", data);
    return;
  }

  console.log(`🚀 [Webhook] Processando sucesso. OrderId: ${order_id || 'N/A'}, Session: ${payment_id}`);

  if (applied_coupon_id) {
    console.log(`[Coupon] Consumindo cupom: ${applied_coupon_id}`);
    await supabase.rpc("increment_coupon_usage", { p_coupon_id: applied_coupon_id });
  }

  await applySuccessfulPayment({
    supabase,
    user_id,
    service_slug,
    payment_method,
    paid_amount,
    dependents,
    proc_id,
    payment_id,
    order_id,
    parent_service_slug,
    order_update: {
      stripe_session_id: payment_id,
    },
  });

  const lang = await getUserLang(supabase, user_id);
  const template = service_slug === "proposta-rfe-motion" ? "motion_submitted" : "payment_confirmed";
  const { title, message } = buildNotifContent(template, { service_name: service_slug }, lang);

  await supabase.from("notifications").insert({
    user_id,
    target_role: "client",
    type: "client_action",
    title,
    message,
    link: "/dashboard",
    send_email: false,
    email_sent: false,
  });
}
