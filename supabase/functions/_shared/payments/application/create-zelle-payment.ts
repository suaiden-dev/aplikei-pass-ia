import { resolveZelleConfig } from "../office-payment.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export interface CreateZellePaymentInput {
  userId: string | null;
  supabaseUrl: string;
  clientIp: string | null;
  amount: number;
  confirmation_code?: string;
  payment_date?: string;
  recipient_name?: string;
  recipient_email?: string;
  proof_path: string;
  service_slug: string;
  visa_order_id?: string;
  contract_selfie_url?: string;
  terms_accepted_at?: string;
  guest_email?: string;
  guest_name?: string;
  coupon_code?: string;
  dependents?: number;
  office_id?: string;
  service_id?: string;
}

export async function createZellePayment(
  supabase: SupabaseClient,
  input: CreateZellePaymentInput,
) {
  let finalRecipientName = input.recipient_name;
  let finalRecipientEmail = input.recipient_email;

  if (input.office_id) {
    try {
      const zelleConfig = await resolveZelleConfig(supabase, input.office_id);
      finalRecipientName = zelleConfig.recipient_name || finalRecipientName;
      finalRecipientEmail = zelleConfig.email || finalRecipientEmail;
    } catch (error) {
      console.warn("[Zelle] Could not resolve office config, falling back to frontend data:", error);
    }
  }

  const actualPaymentDate = input.payment_date || new Date().toISOString().split("T")[0];
  const imageUrl = `${input.supabaseUrl}/storage/v1/object/public/zelle_comprovantes/${input.proof_path}`;

  let discountAmount = 0;
  let finalCouponCode = input.coupon_code || null;

  if (input.coupon_code) {
    const { data: couponData, error: couponError } = await supabase.rpc("validate_coupon", {
      p_code: input.coupon_code.toUpperCase().trim(),
      p_slug: input.service_slug,
    });

    if (!couponError && couponData?.valid) {
      if (couponData.discount_type === "percentage") {
        console.log(`[Zelle Coupon] Cupom ${input.coupon_code} identificado (Porcentagem).`);
      } else {
        discountAmount = couponData.discount_value;
        console.log(`[Zelle Coupon] Cupom ${input.coupon_code} identificado (Valor Fixo: $${discountAmount}).`);
      }
    } else {
      console.warn(`[Zelle Coupon] Cupom ${input.coupon_code} inválido ou não aplicado.`);
      finalCouponCode = null;
    }
  }

  const { data: payment, error: dbError } = await supabase
    .from("zelle_payments")
    .insert({
      user_id: input.userId,
      guest_email: input.guest_email || null,
      guest_name: input.guest_name || null,
      amount: input.amount,
      confirmation_code: input.confirmation_code || null,
      payment_date: actualPaymentDate,
      recipient_name: finalRecipientName || null,
      recipient_email: finalRecipientEmail || null,
      proof_path: input.proof_path,
      image_url: imageUrl,
      service_slug: input.service_slug,
      service_id: input.service_id || null,
      status: "pending_verification",
      visa_order_id: input.visa_order_id || null,
      office_id: input.office_id || null,
    })
    .select("id")
    .single();

  if (dbError) throw dbError;

  if (input.visa_order_id) {
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("payment_metadata")
      .eq("id", input.visa_order_id)
      .single();

    await supabase
      .from("orders")
      .update({
        payment_method: "zelle",
        payment_metadata: {
          ...(currentOrder?.payment_metadata || {}),
          coupon_code: finalCouponCode || "",
          discount_amount: discountAmount.toString(),
          dependents: input.dependents || 0,
          office_id: input.office_id || "",
        },
        office_id: input.office_id || null,
        ...(input.contract_selfie_url ? { contract_selfie_url: input.contract_selfie_url } : {}),
        ...(input.terms_accepted_at ? { terms_accepted_at: input.terms_accepted_at } : {}),
        ...(input.clientIp ? { client_ip: input.clientIp } : {}),
      })
      .eq("id", input.visa_order_id);
  }

  try {
    const { data: zelleMsg } = await supabase
      .from("notifications_messages")
      .insert({
        status: "sent",
        category: "payment",
        action: "zelle_approved",
        title: "New Zelle Payment Submitted",
        body: `A new Zelle payment of $${input.amount} was submitted and is pending manual verification.`,
        send_email: true,
        metadata: { payment_id: payment.id, amount: input.amount },
      })
      .select("id")
      .single();

    if (zelleMsg && input.userId) {
      await supabase.from("notifications_groups").insert({
        notification_id: zelleMsg.id,
        user_id: input.userId,
        viewed: false,
        email_sent: false,
      });
    }
  } catch (error) {
    console.error("Failed to insert admin notification:", error);
  }

  return {
    success: true,
    payment_id: payment.id,
    auto_approved: false,
  };
}
