export const FINAL_ORDER_STATUSES = ["paid", "complete", "completed", "succeeded"] as const;

export function parseCount(value: unknown, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function isAdditionalDependentPurchaseSlug(serviceSlug: string): boolean {
  return serviceSlug.includes("dependente-adicional") ||
    serviceSlug.includes("slot-dependente") ||
    serviceSlug.includes("slot-vip") ||
    serviceSlug.includes("dependente-estudante") ||
    serviceSlug.includes("dependente-f1") ||
    serviceSlug.includes("dependente-b1-b2");
}

export function isAuxiliaryServiceSlug(serviceSlug: string): boolean {
  return serviceSlug.includes("dependente") ||
    serviceSlug.includes("slot-") ||
    serviceSlug.startsWith("analise-") ||
    serviceSlug.startsWith("apoio-") ||
    serviceSlug.startsWith("revisao-") ||
    serviceSlug.startsWith("mentoria-") ||
    serviceSlug.startsWith("consultoria-") ||
    serviceSlug.includes("rfe-motion") ||
    serviceSlug.includes("-support");
}

export function calculateIncrementedSlots(
  currentCount: number,
  dependentsMetadata: number,
  serviceSlug: string,
  mainServiceSlug: string,
): number {
  if (isAdditionalDependentPurchaseSlug(serviceSlug)) {
    return currentCount + parseCount(dependentsMetadata, 1);
  }

  if (dependentsMetadata > currentCount && serviceSlug === mainServiceSlug) {
    return dependentsMetadata;
  }

  return currentCount;
}

function buildPurchaseRecord(data: {
  payment_id?: string | null;
  payment_method?: string | null;
  paid_amount?: number | null;
  dependents: number;
  service_slug: string;
  order_id?: string | null;
}) {
  return {
    id: data.payment_id || `TRX_${Date.now()}`,
    method: data.payment_method || "unknown",
    amount: data.paid_amount || 0,
    dependents: data.dependents,
    slug: data.service_slug,
    date: new Date().toISOString(),
    order_id: data.order_id || null,
  };
}

async function getProcessServiceSlug(supabase: any, processId: string | null | undefined): Promise<string | null> {
  if (!processId) return null;

  const { data } = await supabase
    .from("user_services")
    .select("service_slug")
    .eq("id", processId)
    .maybeSingle();

  return data?.service_slug || null;
}

async function resolveTargetProcessId(data: {
  supabase: any;
  user_id: string;
  service_slug: string;
  proc_id?: string | null;
  parent_service_slug?: string | null;
}) {
  const { supabase, user_id, service_slug } = data;
  let targetProcId = data.proc_id || null;
  let parentServiceSlug = data.parent_service_slug || null;

  if (targetProcId && !parentServiceSlug) {
    parentServiceSlug = await getProcessServiceSlug(supabase, targetProcId);
  }

  if (!targetProcId && parentServiceSlug) {
    const { data: exactParent } = await supabase
      .from("user_services")
      .select("id, service_slug")
      .eq("user_id", user_id)
      .eq("service_slug", parentServiceSlug)
      .in("status", ["active", "awaiting_review", "awaiting_payment", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exactParent) {
      targetProcId = exactParent.id;
      parentServiceSlug = exactParent.service_slug;
    }
  }

  if (!targetProcId && isAuxiliaryServiceSlug(service_slug)) {
    const isCOS = service_slug.includes("cos") || service_slug.includes("eos") || service_slug.includes("-status");
    const mainSlugs = isCOS
      ? ["troca-status", "extensao-status"]
      : ["visto-b1-b2", "visto-f1"];

    const { data: activeMain } = await supabase
      .from("user_services")
      .select("id, service_slug")
      .eq("user_id", user_id)
      .in("service_slug", mainSlugs)
      .in("status", ["active", "awaiting_review", "awaiting_payment", "paid"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeMain) {
      targetProcId = activeMain.id;
      parentServiceSlug = activeMain.service_slug;
    }
  }

  return { targetProcId, parentServiceSlug };
}

async function syncParentOrderMetadata(data: {
  supabase: any;
  user_id: string;
  targetProcId: string;
  parentServiceSlug: string;
  newCount: number;
  purchaseRecord: ReturnType<typeof buildPurchaseRecord>;
}) {
  const { supabase, user_id, targetProcId, parentServiceSlug, newCount, purchaseRecord } = data;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, product_slug, payment_status, payment_metadata, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  const parentOrder = (orders || []).find((order: any) => {
    const metadata = order.payment_metadata || {};
    const metadataProcId = metadata.proc_id || metadata.processId || metadata.parent_process_id;

    return !isAuxiliaryServiceSlug(order.product_slug) &&
      order.product_slug === parentServiceSlug &&
      (
        metadataProcId === targetProcId ||
        (!metadataProcId && FINAL_ORDER_STATUSES.includes(order.payment_status))
      );
  });

  if (!parentOrder) return;

  const metadata = parentOrder.payment_metadata || {};
  const existingPurchases = Array.isArray(metadata.dependent_slot_purchases)
    ? metadata.dependent_slot_purchases
    : [];
  const hasPurchase = existingPurchases.some((purchase: any) => purchase?.id === purchaseRecord.id);
  const previousCount = parseCount(metadata.paid_dependents ?? metadata.dependents, 0);

  await supabase
    .from("orders")
    .update({
      payment_metadata: {
        ...metadata,
        proc_id: targetProcId,
        parent_process_id: targetProcId,
        parent_service_slug: parentServiceSlug,
        paid_dependents: Math.max(previousCount, newCount),
        dependents: Math.max(previousCount, newCount),
        dependent_slot_purchases: hasPurchase
          ? existingPurchases
          : [...existingPurchases, purchaseRecord],
      },
    })
    .eq("id", parentOrder.id);
}

export async function applySuccessfulPayment(data: {
  supabase: any;
  user_id: string;
  service_slug: string;
  payment_method?: string | null;
  paid_amount?: number | null;
  dependents?: number | null;
  proc_id?: string | null;
  payment_id?: string | null;
  order_id?: string | null;
  parent_service_slug?: string | null;
  order_update?: Record<string, unknown>;
}) {
  const {
    supabase,
    user_id,
    service_slug,
    payment_method,
    paid_amount,
    payment_id,
    order_id,
    order_update,
  } = data;

  const now = new Date().toISOString();
  let order: any = null;

  if (order_id) {
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    order = existingOrder || null;

    if (existingOrder) {
      const { data: updatedOrder } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: now,
          ...(order_update || {}),
        })
        .eq("id", order_id)
        .select("*")
        .single();

      order = updatedOrder || existingOrder;
    }
  }

  if (!order) {
    const { data: fallbackOrder } = await supabase
      .from("orders")
      .select("*")
      .match({ user_id, product_slug: service_slug, payment_status: "pending" })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackOrder) {
      const { data: updatedFallback } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: now,
          ...(order_update || {}),
        })
        .eq("id", fallbackOrder.id)
        .select("*")
        .single();

      order = updatedFallback || fallbackOrder;
    }
  }

  const orderMetadata = order?.payment_metadata || {};
  const effectiveDependents = parseCount(orderMetadata.dependents ?? data.dependents, 0);
  const effectiveProcId = data.proc_id ||
    orderMetadata.proc_id ||
    orderMetadata.processId ||
    orderMetadata.parent_process_id ||
    null;
  const effectiveParentServiceSlug = data.parent_service_slug ||
    orderMetadata.parent_service_slug ||
    null;

  const { targetProcId, parentServiceSlug } = await resolveTargetProcessId({
    supabase,
    user_id,
    service_slug,
    proc_id: effectiveProcId,
    parent_service_slug: effectiveParentServiceSlug,
  });

  const purchaseRecord = buildPurchaseRecord({
    payment_id,
    payment_method,
    paid_amount,
    dependents: effectiveDependents,
    service_slug,
    order_id: order?.id || order_id || null,
  });

  if (!targetProcId) {
    const { data: existingByPurchase } = await supabase
      .from("user_services")
      .select("id")
      .contains("step_data->purchases", [{ id: purchaseRecord.id }])
      .maybeSingle();

    if (existingByPurchase) return;

    await supabase.from("user_services").insert({
      user_id,
      service_slug,
      status: "active",
      current_step: 0,
      step_data: {
        paid_dependents: effectiveDependents,
        purchases: [purchaseRecord],
      },
      data: {},
    });

    return;
  }

  const { data: currentProc } = await supabase
    .from("user_services")
    .select("step_data, service_slug, current_step")
    .eq("id", targetProcId)
    .single();

  if (!currentProc) return;

  const stepData = currentProc.step_data || {};
  const purchases = Array.isArray(stepData.purchases) ? [...stepData.purchases] : [];

  if (purchaseRecord.id && purchases.some((purchase: any) => purchase?.id === purchaseRecord.id)) {
    return;
  }

  const currentCount = parseCount(stepData.paid_dependents, 0);
  const mainServiceSlug = currentProc.service_slug || parentServiceSlug || service_slug;
  const newCount = calculateIncrementedSlots(
    currentCount,
    effectiveDependents,
    service_slug,
    mainServiceSlug,
  );

  purchases.push(purchaseRecord);

  await supabase
    .from("user_services")
    .update({
      current_step: currentProc.current_step,
      step_data: {
        ...stepData,
        paid_dependents: newCount,
        purchases,
      },
    })
    .eq("id", targetProcId);

  if (parentServiceSlug || currentProc.service_slug) {
    await syncParentOrderMetadata({
      supabase,
      user_id,
      targetProcId,
      parentServiceSlug: parentServiceSlug || currentProc.service_slug,
      newCount,
      purchaseRecord,
    });
  }
}
