type NormalizeCheckoutInputParams = {
  req: Request;
  body: Record<string, any>;
  supabase: any;
};

export type NormalizedCheckoutInput = {
  orderId: string;
  action: string;
  serviceId: string;
  slug: string;
  email: string;
  fullName: string;
  targetUserId: string;
  targetProcId: string;
  parentServiceSlug: string;
  dependents: number;
  requestAmount: number | null;
  phone: string;
  originUrl: string;
  env: "TEST" | "PROD";
  paymentMethod: "card" | "pix";
  officeId: string;
  couponCode: string;
  discountPct: number;
};

export async function normalizeCheckoutInput({
  req,
  body,
  supabase,
}: NormalizeCheckoutInputParams): Promise<NormalizedCheckoutInput> {
  const orderId = String(body.order_id || "");
  const action = String(body.action || "");
  const serviceId = String(body.serviceId || "");
  const officeId = String(body.office_id || "");

  const paymentMethod = body.paymentMethod === "pix" ? "pix" : "card";
  const couponCode = String(body.coupon_code || "");
  const discountPct = Number(body.discountPct || 0);

  let orderData: any = null;

  if (orderId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar pedido: ${error.message}`);
    }

    orderData = data;
  }

  if (!orderData && !body.slug) {
    throw new Error("ID do pedido ou Slug do serviço não fornecido.");
  }

  const slug = String(orderData?.product_slug || body.slug || "");
  const email = String(orderData?.client_email || body.email || "");
  const fullName = String(orderData?.client_name || body.fullName || "");

  const targetUserId = String(
    orderData?.user_id ||
    body.user_id ||
    body.userId ||
    "",
  );

  const targetProcId = String(
    orderData?.payment_metadata?.proc_id ||
    orderData?.payment_metadata?.parent_process_id ||
    body.proc_id ||
    body.processId ||
    "",
  );

  const parentServiceSlug = String(
    orderData?.payment_metadata?.parent_service_slug ||
    body.parent_service_slug ||
    "",
  );

  const dependents = Number(
    orderData?.payment_metadata?.dependents ||
    body.dependents ||
    0,
  );

  const rawAmount = orderData?.total_price_usd || body.amount;
  const requestAmount = rawAmount ? Number(rawAmount) : null;

  const phone = String(
    orderData?.payment_metadata?.phone ||
    body.phone ||
    "",
  );

  let originUrl = String(
    body.origin_url ||
    body.originUrl ||
    req.headers.get("origin") ||
    req.headers.get("referer") ||
    "https://aplikei.com",
  );

  if (!originUrl.startsWith("http")) {
    originUrl = `https://${originUrl}`;
  }

  const urlObj = new URL(originUrl);

  const env: "TEST" | "PROD" = urlObj.hostname === "aplikei.com"
    ? "PROD"
    : "TEST";

  validateRecoveryCheckout({
    slug,
    targetProcId,
    parentServiceSlug,
    orderId,
  });

  return {
    orderId,
    action,
    serviceId,
    slug,
    email,
    fullName,
    targetUserId,
    targetProcId,
    parentServiceSlug,
    dependents,
    requestAmount,
    phone,
    originUrl,
    env,
    paymentMethod,
    officeId,
    couponCode,
    discountPct,
  };
}

function validateRecoveryCheckout({
  slug,
  targetProcId,
  parentServiceSlug,
  orderId,
}: {
  slug: string;
  targetProcId: string;
  parentServiceSlug: string;
  orderId: string;
}) {
  const recoverySlug = slug.toLowerCase();

  const isRecoveryChild =
    recoverySlug.includes("motion") ||
    recoverySlug.includes("rfe") ||
    recoverySlug.includes("recovery-") ||
    recoverySlug.startsWith("analise-") ||
    recoverySlug.startsWith("analysis-") ||
    recoverySlug.startsWith("apoio-");

  if (isRecoveryChild && (!targetProcId || !parentServiceSlug)) {
    console.warn("[stripe-checkout] Recovery checkout without full parent metadata", {
      slug,
      targetProcId: targetProcId || null,
      parentServiceSlug: parentServiceSlug || null,
      order_id: orderId || null,
    });
  }
}
