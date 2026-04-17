import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import Stripe from "npm:stripe@14.14.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-customer-auth",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
        status: 200, 
        headers: corsHeaders 
    });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id is required" }), { status: 400, headers: corsHeaders });
    }

    console.log(`[VerifySession] Verificando sessão: ${session_id}`);

    // 1. Busca a sessão diretamente no Stripe (SEGURANÇA TOTAL)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return new Response(JSON.stringify({ 
            success: false, 
            status: session.payment_status,
            message: "Pagamento ainda não confirmado no Stripe." 
        }), { status: 200, headers: corsHeaders });
    }

    // 2. Extrai metadados (Mesma lógica do Webhook)
    const service_slug = session.metadata?.service_slug || session.metadata?.slug;
    const user_id = session.metadata?.user_id || session.metadata?.userId;
    const dependents = parseInt(session.metadata?.dependents || "0", 10);
    const proc_id = session.metadata?.proc_id || session.metadata?.processId;

    if (!user_id || !service_slug) {
        throw new Error("Sessão válida, mas metadados ausentes (user_id/slug).");
    }

    // 3. Executa a ativação (Reutilizando a lógica centralizada)
    await handlePaymentSuccess({
        user_id,
        service_slug,
        paid_amount: session.amount_total ? session.amount_total / 100 : 0,
        dependents,
        proc_id,
        payment_method: "stripe_verify",
        payment_id: session.id,
        supabase
    });

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Pagamento verificado e serviço ativado com sucesso." 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("[VerifySession] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

// --- HELPER DE ATIVAÇÃO (Sincronizado com o Webhook) ---
async function handlePaymentSuccess(data: any) {
  const { user_id, service_slug, paid_amount, dependents, proc_id, payment_id, supabase } = data;

  console.log(`🚀 [VerifySession] Ativando ${service_slug} para ${user_id}`);

  let targetProcId = proc_id;

  // Fallback de Vínculo
  if (!targetProcId) {
    const isAuxiliary = service_slug.includes("dependente") || service_slug.includes("slot-") || service_slug.includes("rfe-motion");
    if (isAuxiliary) {
        const { data: activeMain } = await supabase
            .from("user_services")
            .select("id")
            .eq("user_id", user_id)
            .in("service_slug", ["troca-status", "extensao-status", "visto-b1-b2", "visto-f1"])
            .in("status", ["active", "awaiting_review", "paid"])
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (activeMain) targetProcId = activeMain.id;
    }
  }

  // Se não tem ID, busca por slug existente ou cria novo
  if (!targetProcId) {
    const { data: existing } = await supabase
      .from("user_services")
      .select("id")
      .eq("user_id", user_id)
      .eq("service_slug", service_slug)
      .in("status", ["active", "awaiting_review", "paid"])
      .maybeSingle();
    
    if (existing) {
        targetProcId = existing.id;
    } else {
        // Novo insert
        await supabase.from("user_services").insert({
            user_id,
            service_slug,
            status: "active",
            current_step: 0,
            step_data: { 
                paid_dependents: dependents || 0,
                purchases: [{ id: payment_id, amount: paid_amount, date: new Date().toISOString() }]
            }
        });
        return;
    }
  }

  // Update existente
  if (targetProcId) {
    const { data: proc } = await supabase.from("user_services").select("step_data").eq("id", targetProcId).single();
    if (proc) {
        const stepData = proc.step_data || {};
        const purchases = stepData.purchases || [];

        if (purchases.some((p: any) => p.id === payment_id)) return;

        const isSlot = service_slug.includes("slot-") || service_slug.includes("dependente-adicional");
        const currentCount = parseInt(String(stepData.paid_dependents ?? 0), 10);
        const newCount = isSlot ? (currentCount + dependents) : Math.max(currentCount, dependents);

        purchases.push({ id: payment_id, amount: paid_amount, date: new Date().toISOString(), slug: service_slug });

        await supabase.from("user_services").update({
            step_data: { ...stepData, paid_dependents: newCount, purchases }
        }).eq("id", targetProcId);

        // Marca a ordem como completa
        await supabase.from("visa_orders").update({ payment_status: "complete" })
            .match({ user_id: user_id, product_slug: service_slug, payment_status: "pending" });
    }
  }
}
