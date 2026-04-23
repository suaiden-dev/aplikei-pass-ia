import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import Stripe from "npm:stripe@14.14.0";
import { applySuccessfulPayment } from "../_shared/payment-slot-logic.ts";
import { buildNotifContent, getUserLang } from "../_shared/notif-templates.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const NOTIFICATIONS_WEBHOOK = Deno.env.get("NOTIFICATIONS_WEBHOOK_URL");

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

async function sendAlert(message: string, metadata: any = {}) {
  if (!NOTIFICATIONS_WEBHOOK) return;
  try {
    await fetch(NOTIFICATIONS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *Erro Fatal no Webhook (Payment)*\n*Erro:* ${message}\n*Email:* ${metadata.email || 'unknown'}\n*Payload:* ${JSON.stringify(metadata)}`
      })
    });
  } catch (e) {
    console.error("Failed to send alert:", e);
  }
}

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

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await handlePaymentSuccess({
          user_id: session.metadata.user_id || session.metadata.userId,
          service_slug: session.metadata.service_slug || session.metadata.slug,
          paid_amount: session.amount_total / 100,
          dependents: parseInt(session.metadata.dependents || "0", 10),
          proc_id: session.metadata.proc_id || session.metadata.processId,
          payment_method: "stripe",
          status: "complete",
          payment_id: session.id,
          order_id: session.metadata.order_id || null,
          applied_coupon_id: session.metadata.applied_coupon_id || null
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
  const { user_id, service_slug, payment_method, proc_id, paid_amount, dependents, payment_id, applied_coupon_id, order_id, parent_service_slug } = data;

  if (!user_id || !service_slug) {
    console.error("Dados insuficientes no webhook:", data);
    return;
  }

  console.log(`🚀 [Webhook] Processando sucesso. OrderId: ${order_id || 'N/A'}, Session: ${payment_id}`);

  // 🛡️ LOG DE DETECÇÃO:
  // Em vez de deletar, vamos apenas logar se um registro duplicado for encontrado
  if (payment_id) {
    const { data: existingDupe } = await supabase.from("orders")
      .select("id, product_slug, created_at")
      .eq("stripe_session_id", payment_id)
      .neq("id", order_id || "")
      .maybeSingle();
    
    if (existingDupe) {
      console.warn(`[DEBUG DUPLICIDADE] Detectado registro concorrente! ID: ${existingDupe.id}, Slug: ${existingDupe.product_slug}, Criado em: ${existingDupe.created_at}`);
      console.warn(`[DEBUG DUPLICIDADE] Isso confirma que um serviço externo inseriu este dado antes do nosso webhook.`);
    }
  }

  // 1. Tentar atualizar o pedido original pelo ID ou Fallback
  let orderUpdated = false;

  if (order_id) {
    const { data: order } = await supabase.from("orders").select("id, payment_status").eq("id", order_id).maybeSingle();

    if (order) {
      if (order.payment_status === "paid" || order.payment_status === "complete") {
        console.log(`[Webhook] ⚠️ Pedido ${order_id} já estava marcado como pago.`);
        orderUpdated = true;
      } else {
        const { error: updateError } = await supabase.from("orders").update({ 
          payment_status: "paid", 
          stripe_session_id: payment_id,
          updated_at: new Date().toISOString() 
        }).eq("id", order_id);
        
        if (updateError) {
          console.error(`[Webhook] ❌ Falha ao atualizar pedido original: ${updateError.message}`);
        } else {
          console.log(`[Webhook] ✅ Pedido original ${order_id} atualizado para 'paid'.`);
          orderUpdated = true;
        }
      }
    } else {
      console.warn(`[Webhook] ⚠️ Pedido original ${order_id} não encontrado.`);
    }
  }  

  // Fallback: Se não veio order_id ou se não conseguimos atualizar pelo ID, tenta pelo match (user + slug + pending)
  if (!orderUpdated) {
    console.log(`[Webhook] Fallback: Buscando pedido pendente por match: ${user_id} + ${service_slug}`);
    const { data: matchedOrder } = await supabase.from("orders")
      .select("id")
      .match({ user_id: user_id, product_slug: service_slug, payment_status: "pending" })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (matchedOrder) {
      const { error: fallbackError } = await supabase.from("orders")
        .update({ payment_status: "paid", stripe_session_id: payment_id, updated_at: new Date().toISOString() })
        .eq("id", matchedOrder.id);
      
      if (!fallbackError) {
        console.log(`[Webhook] ✅ Pedido fallback ${matchedOrder.id} atualizado para 'paid'.`);
        orderUpdated = true;
      } else {
        console.error(`[Webhook] ❌ Falha ao atualizar pedido fallback: ${fallbackError.message}`);
      }
    } else {
      console.warn(`[Webhook] ❌ Nenhum pedido pendente encontrado para fallback.`);
    }
  }

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
