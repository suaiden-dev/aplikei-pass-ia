// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function handleStripeConnectAction(
  supabase: SupabaseClient,
  body: Record<string, any>,
) {
  const action = body.action;
  const redirectUri = body.redirect_uri ||
    Deno.env.get("STRIPE_CONNECT_REDIRECT_URI") ||
    "https://app.aplikei.com/settings/payment-methods";

  if (action === "save-client-id") {
    const { user_id, client_id } = body;
    if (!user_id || !client_id) throw new Error("user_id e client_id são obrigatórios.");
    const { data: existing } = await supabase.from("admin_lawyer_payment_methods")
      .select("config").eq("user_id", user_id).eq("provider", "stripe").maybeSingle();
    await supabase.from("admin_lawyer_payment_methods").upsert({
      user_id,
      provider: "stripe",
      is_active: false,
      config: { ...((existing?.config as Record<string, unknown>) || {}), client_id },
    }, { onConflict: "user_id,provider" });
    return { success: true };
  }

  if (action === "init") {
    const { user_id } = body;
    if (!user_id) throw new Error("user_id é obrigatório.");
    const { data: stripeRow } = await supabase.from("admin_lawyer_payment_methods")
      .select("config").eq("user_id", user_id).eq("provider", "stripe").maybeSingle();
    const clientId = ((stripeRow?.config as Record<string, string>)?.client_id ||
      Deno.env.get("STRIPE_CONNECT_CLIENT_ID") || "").trim();
    if (!clientId) throw new Error("Client ID do Stripe Connect não encontrado. Salve-o antes de conectar.");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_write",
      state: user_id,
      redirect_uri: redirectUri,
    });
    return {
      url: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
      debug: { client_id: clientId, redirect_uri: redirectUri },
    };
  }

  if (action === "callback") {
    const { code, state: user_id } = body;
    if (!code || !user_id) throw new Error("code e state são obrigatórios.");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY_PROD") || Deno.env.get("STRIPE_SECRET_KEY")!;
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: stripeSecretKey,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
    if (!tokenData.stripe_user_id) throw new Error("Stripe não retornou o account ID.");
    const { error } = await supabase.from("admin_lawyer_payment_methods").upsert({
      user_id,
      provider: "stripe",
      is_active: true,
      config: { account_id: tokenData.stripe_user_id },
    }, { onConflict: "user_id,provider" });
    if (error) throw new Error(error.message);
    return { success: true, account_id: tokenData.stripe_user_id };
  }

  if (action === "disconnect") {
    const { user_id } = body;
    if (!user_id) throw new Error("user_id é obrigatório.");
    const { error } = await supabase.from("admin_lawyer_payment_methods").upsert({
      user_id,
      provider: "stripe",
      is_active: false,
      config: {},
    }, { onConflict: "user_id,provider" });
    if (error) throw new Error(error.message);
    return { success: true };
  }

  throw new Error(`Ação desconhecida: ${action}`);
}
