import { buildNotifContent, getUserLang } from "../../notifications/templates.ts";
import { applySuccessfulPayment } from "../payment-slot-logic.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export type ZelleDecision = "approved" | "rejected";

export async function validateZellePayment(
  supabase: SupabaseClient,
  input: { paymentId: string; decision: ZelleDecision; adminNotes?: string },
) {
  const { data: payment, error: fetchError } = await supabase
    .from("zelle_payments")
    .select("id, user_id, guest_email, guest_name, amount, service_slug, visa_order_id, status")
    .eq("id", input.paymentId)
    .single();

  if (fetchError || !payment) {
    return { kind: "not_found" as const, details: fetchError?.message };
  }

  if (payment.status === "approved" || payment.status === "rejected") {
    return {
      kind: "already_processed" as const,
      status: payment.status,
    };
  }

  if (input.decision === "approved") {
    const { error: updateError } = await supabase
      .from("zelle_payments")
      .update({
        status: "approved",
        admin_notes: input.adminNotes || "Aprovado via validação automática (n8n) ou admin",
      })
      .eq("id", input.paymentId);

    if (updateError) throw updateError;

    if (payment.visa_order_id) {
      await supabase.from("orders").update({ payment_status: "paid" }).eq("id", payment.visa_order_id);
    }

    try {
      const { data: order } = payment.visa_order_id
        ? await supabase.from("orders").select("payment_metadata").eq("id", payment.visa_order_id).single()
        : { data: null };

      const meta = (order?.payment_metadata as Record<string, unknown>) || {};
      const dependentsCount = parseInt(String(meta.dependents ?? 0), 10);
      const proc_id = (meta.proc_id || meta.processId) as string | undefined;
      const parent_service_slug = (meta.parent_service_slug as string | null) || null;

      await applySuccessfulPayment({
        user_id: payment.user_id,
        service_slug: payment.service_slug,
        payment_method: "zelle",
        paid_amount: payment.amount,
        dependents: dependentsCount,
        proc_id,
        parent_service_slug,
        payment_id: payment.id,
        order_id: payment.visa_order_id || null,
        supabase,
      });

      if (payment.service_slug === "proposta-rfe-motion" && payment.user_id) {
        const lang = await getUserLang(supabase, payment.user_id);
        const localized = buildNotifContent("motion_submitted", {}, lang);
        await supabase.from("notifications").insert({
          user_id: payment.user_id,
          target_role: "client",
          type: "client_action",
          title: localized.title,
          message: localized.message,
          link: "/dashboard",
          send_email: true,
          email_sent: false,
        });
      }
    } catch (error) {
      console.error("[validate-zelle] Erro ao ativar slots:", error);
    }

    if (payment.user_id) {
      const lang = await getUserLang(supabase, payment.user_id);
      const { title, message } = buildNotifContent(
        "zelle_payment_approved",
        {
          amount: String(payment.amount),
          service_name: payment.service_slug,
        },
        lang,
      );

      await supabase.from("notifications").insert({
        type: "client_action",
        target_role: "client",
        user_id: payment.user_id,
        service_id: null,
        title,
        message,
        link: "/dashboard",
        send_email: true,
        email_sent: false,
        metadata: {
          payment_id: input.paymentId,
          service_slug: payment.service_slug,
          amount: payment.amount,
        },
      });
    }

    return { kind: "processed" as const, result: "approved" as const };
  }

  const { error: updateError } = await supabase
    .from("zelle_payments")
    .update({
      status: "rejected",
      admin_notes: input.adminNotes || "Rejeitado via n8n ou admin",
    })
    .eq("id", input.paymentId);

  if (updateError) throw updateError;

  if (payment.visa_order_id) {
    await supabase.from("orders").update({ payment_status: "pending" }).eq("id", payment.visa_order_id);
  }

  if (payment.user_id) {
    const lang = await getUserLang(supabase, payment.user_id);
    const { title, message } = buildNotifContent(
      "zelle_payment_rejected",
      { reason: input.adminNotes || "" },
      lang,
    );

    await supabase.from("notifications").insert({
      type: "client_action",
      target_role: "client",
      user_id: payment.user_id,
      service_id: null,
      title,
      message,
      link: "/dashboard",
      send_email: true,
      email_sent: false,
      metadata: {
        payment_id: input.paymentId,
        service_slug: payment.service_slug,
        amount: payment.amount,
        reason: input.adminNotes || "Não especificado",
      },
    });
  }

  return { kind: "processed" as const, result: "rejected" as const };
}
