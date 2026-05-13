import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY_PROD") || Deno.env.get("STRIPE_SECRET_KEY")!;

    const body = await req.json();
    const { action } = body;

    const REDIRECT_URI = body.redirect_uri || Deno.env.get("STRIPE_CONNECT_REDIRECT_URI") || "https://app.aplikei.com/settings/payment-methods";

    // ── 0. Save client_id: persiste o client_id antes do OAuth ───────────────
    if (action === "save-client-id") {
      const { user_id, client_id } = body;
      if (!user_id || !client_id) throw new Error("user_id e client_id são obrigatórios.");

      const { data: existing } = await supabase
        .from("admin_lawyer_payment_methods")
        .select("config")
        .eq("user_id", user_id)
        .eq("provider", "stripe")
        .maybeSingle();

      const currentConfig = (existing?.config as Record<string, unknown>) || {};
      await supabase
        .from("admin_lawyer_payment_methods")
        .upsert(
          { user_id, provider: "stripe", is_active: false, config: { ...currentConfig, client_id } },
          { onConflict: "user_id,provider" },
        );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 1. Init: gera a URL de autorização OAuth do Stripe Connect ────────────
    if (action === "init") {
      const { user_id } = body;
      if (!user_id) throw new Error("user_id é obrigatório.");

      // Lê o client_id salvo no banco (fonte de verdade)
      const { data: stripeRow } = await supabase
        .from("admin_lawyer_payment_methods")
        .select("config")
        .eq("user_id", user_id)
        .eq("provider", "stripe")
        .maybeSingle();

      const resolvedClientId = (
        (stripeRow?.config as Record<string, string>)?.client_id ||
        Deno.env.get("STRIPE_CONNECT_CLIENT_ID") ||
        ""
      ).trim();

      if (!resolvedClientId) throw new Error("Client ID do Stripe Connect não encontrado. Salve-o antes de conectar.");

      console.log("[stripe-connect] init — client_id:", resolvedClientId, "redirect_uri:", REDIRECT_URI);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: resolvedClientId,
        scope: "read_write",
        state: user_id,
        redirect_uri: REDIRECT_URI,
      });

      const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

      // Retorna também o client_id e redirect_uri usados para facilitar debug
      return new Response(JSON.stringify({ url, debug: { client_id: resolvedClientId, redirect_uri: REDIRECT_URI } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. Callback: troca o code pelo account_id e salva no banco ────────────
    if (action === "callback") {
      const { code, state: user_id } = body;
      if (!code || !user_id) throw new Error("code e state são obrigatórios.");

      // Exchange authorization code for access token
      const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_secret: STRIPE_SECRET_KEY,
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const stripeAccountId: string = tokenData.stripe_user_id;
      if (!stripeAccountId) throw new Error("Stripe não retornou o account ID.");

      // Upsert na tabela admin_lawyer_payment_methods
      const { error } = await supabase
        .from("admin_lawyer_payment_methods")
        .upsert(
          {
            user_id,
            provider: "stripe",
            is_active: true,
            config: { account_id: stripeAccountId },
          },
          { onConflict: "user_id,provider" },
        );

      if (error) throw new Error(error.message);

      return new Response(
        JSON.stringify({ success: true, account_id: stripeAccountId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 3. Disconnect: remove o account_id do banco ───────────────────────────
    if (action === "disconnect") {
      const { user_id } = body;
      if (!user_id) throw new Error("user_id é obrigatório.");

      const { error } = await supabase
        .from("admin_lawyer_payment_methods")
        .upsert(
          {
            user_id,
            provider: "stripe",
            is_active: false,
            config: {},
          },
          { onConflict: "user_id,provider" },
        );

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Ação desconhecida: ${action}`);
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
