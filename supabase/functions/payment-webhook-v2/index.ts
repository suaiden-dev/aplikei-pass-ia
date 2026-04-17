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
          status: "complete",
          payment_id: session.id,
          applied_coupon_id: session.metadata.applied_coupon_id || null
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
          status: "complete",
          payment_id: payload.id || reference
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
  const { user_id, service_slug, payment_method, status, proc_id, paid_amount, dependents, payment_id, applied_coupon_id } = data;

  if (!user_id || !service_slug) {
    console.error("Dados insuficientes no webhook:", data);
    return;
  }

  console.log(`🚀 Ativando serviço ${service_slug} para ${user_id}`);

  // Consumir cupom se houver
  if (applied_coupon_id) {
    console.log(`[Coupon] Consumindo cupom: ${applied_coupon_id}`);
    await supabase.rpc("increment_coupon_usage", { p_coupon_id: applied_coupon_id });
  }

  let targetProcId = proc_id;

  // FALLBACK: Procurar processo principal ativo se for um serviço auxiliar ou se proc_id não foi passado
  // Suporta slugs Legados (dependente-, analise-) e Otimizados (slot-, apoio-, revisao-)
  const isAuxiliary = service_slug.includes("dependente") || 
                      service_slug.includes("slot-") ||
                      service_slug.startsWith("analise-") || 
                      service_slug.startsWith("apoio-") || 
                      service_slug.startsWith("revisao-") || 
                      service_slug.startsWith("mentoria-") ||
                      service_slug.startsWith("consultoria-") ||
                      service_slug.includes("rfe-motion") ||
                      service_slug.includes("-support");

  if (!targetProcId && isAuxiliary) {
     const mainSlugsByGroup = {
        cos: ["troca-status", "extensao-status"],
        consular: ["visto-b1-b2", "visto-f1"]
     };
     
     // Determina o grupo baseado no slug (legados ou novos específicos)
     const isCOS = service_slug.includes("cos") || service_slug.includes("eos") || service_slug.includes("-status");
     const group = isCOS ? "cos" : "consular";
     const mainSlugs = mainSlugsByGroup[group];

     const { data: activeMain } = await supabase
       .from("user_services")
       .select("id")
       .eq("user_id", user_id)
       .in("service_slug", mainSlugs)
       .in("status", ["active", "awaiting_review", "awaiting_payment", "paid"])
       .order("created_at", { ascending: false })
       .limit(1)
       .maybeSingle();
     
     if (activeMain) {
       targetProcId = activeMain.id;
       console.log(`[Webhook] Vínculo dinâmico: Atribuindo ${service_slug} ao processo ${targetProcId}`);
     }
  }

  // 1. Marcar visa_orders como "complete" para evitar duplicidade de processamento manual
  await supabase
    .from("visa_orders")
    .update({ payment_status: "complete" })
    .match({ user_id: user_id, product_slug: service_slug, payment_status: "pending" });

  // 2. Criar ou Atualizar user_services
  if (!targetProcId) {
    // Verificar se já existe um serviço ativo para este slug (IDEMPOTÊNCIA)
    const { data: existing } = await supabase
      .from("user_services")
      .select("id, step_data")
      .eq("user_id", user_id)
      .eq("service_slug", service_slug)
      .in("status", ["active", "awaiting_review", "awaitingInterview", "casvPaymentPending", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`[Webhook] Serviço já existe: ${existing.id}. Pulando insert.`);
      targetProcId = existing.id;
    } else {
      // Nova Compra de Serviço Principal
      const newPurchase = {
        id: payment_id || `TRX_${Date.now()}`,
        method: payment_method,
        amount: paid_amount || 0,
        dependents: dependents || 0,
        slug: service_slug,
        date: new Date().toISOString()
      };

      const { error: insertError } = await supabase.from("user_services").insert({
        user_id: user_id,
        service_slug: service_slug,
        status: "active",
        current_step: 0,
        step_data: { 
          paid_dependents: dependents || 0,
          purchases: [newPurchase]
        },
        data: {}
      });

      if (insertError) {
        console.error("Erro ao criar user_services:", insertError.message);
      } else {
        await supabase.from("notifications").insert({
            user_id: user_id,
            target_role: "client",
            type: "system",
            title: "Pagamento Confirmado! 🎉",
            message: `Seu processo para ${service_slug} está liberado no dashboard.`
        });
      }
      return;
    }
  }

  if (targetProcId) {
     console.log(`[Webhook] Atualizando histórico no processo: ${targetProcId}`);
     
     const { data: currentProc } = await supabase
       .from("user_services")
       .select("step_data, service_slug")
       .eq("id", targetProcId)
       .single();

     if (currentProc) {
       const stepData = currentProc.step_data || {};
       const purchases = (stepData.purchases as any[]) || [];
       
       // Idempotency: Check if this payment was already processed
       if (payment_id && purchases.some(p => p.id === payment_id)) {
         console.log(`[Webhook] Pagamento ${payment_id} já registrado em ${targetProcId}.`);
         return;
       }

       const currentCount = parseInt(String(stepData.paid_dependents ?? 0), 10);
       let newCount = currentCount;
       const isAdditionalSlot = service_slug.includes("dependente-adicional") || service_slug.includes("slot-dependente");

       if (isAdditionalSlot) {
         newCount += (dependents || 1);
       } else if (dependents > currentCount && service_slug === currentProc.service_slug) {
         // Repagamento/Upgrade do mesmo serviço
         newCount = dependents;
       }

       const newPurchase = {
         id: payment_id || `TRX_${Date.now()}`,
         method: payment_method,
         amount: paid_amount || 0,
         dependents: dependents || 0,
         slug: service_slug,
         date: new Date().toISOString()
       };
       
       purchases.push(newPurchase);

       const isProposal = service_slug === "proposta-rfe-motion";
       let nextStep = currentProc.current_step;
       
       if (isProposal && nextStep !== null) {
         nextStep = nextStep + 1;
       }

       await supabase
         .from("user_services")
         .update({ 
           current_step: nextStep,
           step_data: { 
             ...stepData, 
             paid_dependents: newCount,
             purchases: purchases
           } 
         })
         .eq("id", targetProcId);

        if (isProposal) {
          await supabase.from("notifications").insert({
            user_id: user_id,
            target_role: "client",
            type: "system",
            title: "Estratégia Paga! 🚀",
            message: "Seu pagamento foi confirmado. Iniciamos agora a preparação para o envio final ao USCIS."
          });
        }

       console.log(`[Webhook] Sucesso: Histórico e status atualizados no processo ${targetProcId}`);
     }
  }
}
