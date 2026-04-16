import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import Stripe from "npm:stripe@14.14.0"; // Note: adjust version if needed

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

serve(async (req) => {
  // CORS check
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider"); // ?provider=stripe or ?provider=parcelow

    // === STRIPE WEBHOOK HANDLER ===
    if (provider === "stripe") {
      const signature = req.headers.get("stripe-signature");
      if (!signature) throw new Error("Sem assinatura do Stripe");

      const body = await req.text();
      let event;

      try {
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error(`⚠️  Webhook signature falhou:`, err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }

      console.log(`✅ Recebido evento do Stripe: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        // Metadados flexíveis para suportar slugs antigos e novos
        const service_slug = session.metadata.service_slug || session.metadata.slug;
        const user_id = session.metadata.user_id || session.metadata.userId;

        await handlePaymentSuccess({
          user_id: user_id,
          service_slug: service_slug,
          paid_amount: session.amount_total / 100,
          dependents: parseInt(session.metadata.dependents || "0", 10),
          proc_id: session.metadata.proc_id || session.metadata.processId,
          payment_method: "stripe",
          status: "complete"
        });
      }

      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    // === PARCELOW WEBHOOK HANDLER ===
    if (provider === "parcelow") {
      const payload = await req.json();
      console.log(`✅ Recebido evento Parcelow:`, payload);

      // Parcelow costuma enviar 'status' no objeto raiz e referências em 'reference'
      const isPaid = payload.status === "PAID" || payload.status === "APPROVED" || payload.order_status === "PAID";
      
      if (isPaid) {
        // Se a Parcelow envia o reference que criamos (Ex: APK_uuid)
        const reference = payload.reference || payload.order_reference;
        let userId = null;
        let serviceSlug = null;
        let dependents = 0;
        let procId = null;

        if (reference && reference.startsWith("APK_")) {
          const orderUuid = reference.replace("APK_", "");
          const { data: orderData } = await supabase
            .from("visa_orders")
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

        // Fallback para metadados se o reference falhar
        const meta = payload.metadata || {};
        userId = userId || meta.user_id || meta.userId;
        serviceSlug = serviceSlug || meta.service_slug || meta.slug;

        await handlePaymentSuccess({
          user_id: userId,
          service_slug: serviceSlug,
          paid_amount: payload.amount || payload.total_amount,
          dependents: dependents,
          proc_id: procId,
          payment_method: "parcelow",
          status: "complete"
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

// === FUNÇÃO CENTRALIZADA DE ATIVAÇÃO ===
async function handlePaymentSuccess(data) {
  const { user_id, service_slug, payment_method, status, proc_id, paid_amount, dependents } = data;

  if (!user_id || !service_slug) {
    console.error("Dados insuficientes no webhook:", data);
    return;
  }

  console.log(`🚀 Ativando serviço ${service_slug} para ${user_id}`);

  // 1. Marcar visa_orders como "complete"
  // (Caso o sistema já tenha criado como pending ao gerar o link)
  await supabase
    .from("visa_orders")
    .update({ payment_status: "complete" })
    .match({ user_id: user_id, product_slug: service_slug, payment_status: "pending" });

  // 2. Criar ou Atualizar user_services se não for avanço ou dependente extra
  if (!proc_id) {
    // IDEMPOTÊNCIA: Verifica se já existe um serviço ativo idêntico criado recentemente
    const { data: existing } = await supabase
      .from("user_services")
      .select("id")
      .eq("user_id", user_id)
      .eq("service_slug", service_slug)
      .in("status", ["active", "awaiting_review", "awaitingInterview", "casvPaymentPending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`[Webhook] Serviço já existe para o usuário: ${existing.id}. Pulando insert.`);
      return;
    }

    // Nova Compra de Serviço Principal
    const { error: insertError } = await supabase.from("user_services").insert({
      user_id: user_id,
      service_slug: service_slug,
      status: "active",
      current_step: 0,
      step_data: { paid_dependents: dependents },
      data: {}
    });

    if (insertError) {
      console.error("Erro ao criar user_services:", insertError.message);
    } else {
       // Opcional: Criar notificação para o usuário informando que ativou
       await supabase.from("notifications").insert({
          user_id: user_id,
          type: "system",
          title: "Pagamento Confirmado! 🎉",
          message: `Seu processo para ${service_slug} está liberado no dashboard.`
       });
    }
  } else {
     // Lógica de avanço/dependente extra: atualizar o proc_id existente
     console.log(`Fazendo update no proc_id: ${proc_id}`);
     // ... (a lógica depende dos metadados para adicionar slots de pagamento)
  }
}
