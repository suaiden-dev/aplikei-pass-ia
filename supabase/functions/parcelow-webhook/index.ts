import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { applySuccessfulPayment, parseCount } from "../_shared/payment-slot-logic.ts";
import { buildNotifContent, getUserLang } from "../_shared/notif-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventType = safeString(payload?.event);
    const parcelowOrder = payload?.order as Record<string, unknown>;

    const parcelowOrderId = safeString(parcelowOrder?.id);
    if (!parcelowOrderId) {
      throw new Error("Payload inválido. ID da ordem do Parcelow ausente.");
    }

    const reference = safeString(parcelowOrder?.reference);
    const internalOrderId = reference.startsWith("APK_") ? reference.replace("APK_", "") : "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const isPaid =
      eventType.includes("order_paid") ||
      safeString(parcelowOrder?.status_text) === "Paid" ||
      parcelowOrder?.status === 2 ||
      safeString(payload?.status) === "paid" ||
      safeString(parcelowOrder?.status) === "paid";

    const isDeclined =
      eventType.includes("order_declined") ||
      parcelowOrder?.status === 3 ||
      safeString(payload?.status) === "declined" ||
      safeString(parcelowOrder?.status) === "declined";

    const isCanceled =
      eventType.includes("order_canceled") ||
      parcelowOrder?.status === 4 ||
      safeString(payload?.status) === "canceled" ||
      safeString(parcelowOrder?.status) === "canceled";

    if (!isPaid && !isDeclined && !isCanceled) {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: byRemote } = await supabase
      .from("orders")
      .select("*")
      .eq("parcelow_order_id", parcelowOrderId)
      .maybeSingle();

    let order = byRemote;

    if (!order && internalOrderId) {
      const { data: byId } = await supabase
        .from("orders")
        .select("*")
        .eq("id", internalOrderId)
        .maybeSingle();
      order = byId;
    }

    if (!order && reference) {
      const { data: byNumber } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", reference)
        .maybeSingle();
      order = byNumber;
    }

    if (!order) {
      return new Response(JSON.stringify({ received: true, error: "Order not found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.parcelow_order_id) {
      await supabase.from("orders").update({ parcelow_order_id: parcelowOrderId }).eq("id", order.id);
    }

    const eventKey = `${parcelowOrderId}:${eventType || safeString(parcelowOrder?.status) || safeString(payload?.status)}`;
    const { data: eventRegistered, error: eventRegisterError } = await supabase
      .rpc("register_payment_event", {
        p_provider: "parcelow",
        p_event_id: eventKey,
        p_order_id: order.id,
        p_payment_id: parcelowOrderId,
        p_payload: {
          parcelow_order_id: parcelowOrderId,
          event: eventType,
          status: parcelowOrder?.status,
        },
      });

    if (eventRegisterError) throw eventRegisterError;
    if (!eventRegistered) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = isPaid ? "paid" : "failed";
    if (newStatus !== order.payment_status) {
      await supabase
        .from("orders")
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", order.id);
    }

    if (!isPaid) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderMetadata = order.payment_metadata || {};
    const serviceSlug = order.product_slug || orderMetadata.service_slug || orderMetadata.slug;
    const email = order.client_email || orderMetadata.email || "";
    const fullName = order.client_name || orderMetadata.fullName || "Client";

    let userId: string | null = order.user_id || orderMetadata.user_id || orderMetadata.userId || null;

    if (!userId && email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingAuthUser = usersData?.users?.find((u: Record<string, unknown>) => u.email === email);

      if (existingAuthUser) {
        userId = existingAuthUser.id;
      } else {
        const originUrl = orderMetadata.origin_url || Deno.env.get("FRONTEND_URL") || "https://aplikeipass.com";
        const redirectTo = `${originUrl}/auth/confirm-password`;
        const { data: authUser } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo, data: { full_name: fullName } });
        if (authUser?.user) userId = authUser.user.id;
      }
    }

    if (userId) {
      if (!order.user_id) {
        await supabase.from("orders").update({ user_id: userId }).eq("id", order.id);
      }

      const dependents = parseCount(orderMetadata.dependents, 0);
      const procId = orderMetadata.proc_id || orderMetadata.processId || orderMetadata.parent_process_id || null;
      const parentServiceSlug = orderMetadata.parent_service_slug || null;

      await applySuccessfulPayment({
        supabase,
        user_id: userId,
        service_slug: serviceSlug,
        payment_method: order.payment_method || "parcelow",
        paid_amount: order.total_price_usd || null,
        dependents,
        proc_id: procId,
        payment_id: parcelowOrderId,
        order_id: order.id,
        parent_service_slug: parentServiceSlug,
        order_update: { parcelow_order_id: parcelowOrderId },
      });

      const appliedCouponId = orderMetadata.applied_coupon_id;
      if (appliedCouponId) {
        await supabase.rpc("increment_coupon_usage", { p_coupon_id: appliedCouponId });
      }

      const lang = await getUserLang(supabase, userId);
      const serviceName = serviceSlug === "visa-f1f2" ? "F-1/F-2 Visa" : serviceSlug?.replace(/-/g, " ").toUpperCase();
      const { title, message } = buildNotifContent("payment_confirmed", { service_name: serviceName }, lang);

      await supabase.from("notifications").insert({
        user_id: userId,
        target_role: "client",
        type: "client_action",
        title,
        message,
        email_sent: false,
        send_email: true,
        link: "/dashboard",
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
