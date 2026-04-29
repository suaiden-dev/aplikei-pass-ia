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
    serviceSlug === "analise-motion" ||
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
    id: data.payment_id || data.order_id || `TRX_${Date.now()}`,
    method: data.payment_method || "unknown",
    amount: data.paid_amount || 0,
    dependents: data.dependents,
    slug: data.service_slug,
    date: new Date().toISOString(),
    order_id: data.order_id || null,
  };
}

function hasMatchingPurchaseRecord(
  purchases: unknown,
  purchaseRecord: ReturnType<typeof buildPurchaseRecord>,
): boolean {
  if (!Array.isArray(purchases)) return false;

  return purchases.some((purchase) => {
    const row = purchase as Record<string, unknown>;
    return row?.id === purchaseRecord.id ||
      (purchaseRecord.order_id && row?.order_id === purchaseRecord.order_id);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

async function getProcessServiceSlug(supabase: SupabaseClient, processId: string | null | undefined): Promise<string | null> {
  if (!processId) return null;

  const { data } = await supabase
    .from("user_services")
    .select("service_slug")
    .eq("id", processId)
    .maybeSingle();

  return data?.service_slug || null;
}

async function resolveTargetProcessId(data: {
  supabase: SupabaseClient;
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
  supabase: SupabaseClient;
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

  const parentOrder = (orders || []).find((order: Record<string, unknown>) => {
    const metadata = (order.payment_metadata as Record<string, unknown>) || {};
    const metadataProcId = metadata.proc_id || metadata.processId || metadata.parent_process_id;

    return !isAuxiliaryServiceSlug(order.product_slug as string) &&
      order.product_slug === parentServiceSlug &&
      (
        metadataProcId === targetProcId ||
        (!metadataProcId && FINAL_ORDER_STATUSES.includes(order.payment_status as string))
      );
  });

  if (!parentOrder) return;

  const metadata = (parentOrder.payment_metadata as Record<string, unknown>) || {};
  const existingPurchases = Array.isArray(metadata.dependent_slot_purchases)
    ? metadata.dependent_slot_purchases
    : [];
  const hasPurchase = existingPurchases.some((purchase: unknown) => (purchase as Record<string, unknown>)?.id === purchaseRecord.id);
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

async function findExistingStandalonePurchaseProcess(data: {
  supabase: SupabaseClient;
  user_id: string;
  service_slug: string;
  purchaseRecord: ReturnType<typeof buildPurchaseRecord>;
}) {
  const { supabase, user_id, service_slug, purchaseRecord } = data;

  const { data: candidates } = await supabase
    .from("user_services")
    .select("id, step_data, created_at")
    .eq("user_id", user_id)
    .eq("service_slug", service_slug)
    .order("created_at", { ascending: false })
    .limit(10);

  return (candidates || []).find((candidate: Record<string, unknown>) => {
    const stepData = (candidate.step_data as Record<string, unknown>) || {};
    return hasMatchingPurchaseRecord(stepData.purchases, purchaseRecord);
  }) || null;
}

async function ensureLegacyProfileForUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (existingProfile) return;

  const { data: account, error: accountError } = await supabase
    .from("user_accounts")
    .select("id, full_name, email, phone_number, avatar_url, passport_photo_url, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (accountError) throw accountError;
  if (!account) {
    throw new Error(`Cannot create user service: user ${userId} was not found in user_accounts`);
  }

  const { error: insertProfileError } = await supabase
    .from("profiles")
    .upsert({
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      phone: account.phone_number,
      avatar_url: account.avatar_url,
      passport_photo_url: account.passport_photo_url,
      updated_at: account.updated_at || new Date().toISOString(),
    }, { onConflict: "id" });

  if (insertProfileError) throw insertProfileError;
}

export async function applySuccessfulPayment(data: {
  supabase: SupabaseClient;
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
  let order: Record<string, unknown> | null = null;

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
    if (payment_id) {
      const { data: byPaymentRef } = await supabase
        .from("orders")
        .select("*")
        .or(`stripe_session_id.eq.${payment_id},parcelow_order_id.eq.${payment_id},order_number.eq.${payment_id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (byPaymentRef) {
        const { data: updatedByPaymentRef } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            updated_at: now,
            ...(order_update || {}),
          })
          .eq("id", byPaymentRef.id)
          .select("*")
          .single();

        order = updatedByPaymentRef || byPaymentRef;
      }
    }
  }

  if (!order) {
    const { data: fallbackOrder } = await supabase
      .from("orders")
      .select("*")
      .match({ user_id, product_slug: service_slug, payment_status: "pending" })
      .gte("created_at", new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
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
    await ensureLegacyProfileForUser(supabase, user_id);

    const existingByPurchase = await findExistingStandalonePurchaseProcess({
      supabase,
      user_id,
      service_slug,
      purchaseRecord,
    });

    if (existingByPurchase) return;

    const { error: insertServiceError } = await supabase.from("user_services").insert({
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

    if (insertServiceError) throw insertServiceError;

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

  if (purchaseRecord.id && purchases.some((purchase: unknown) => (purchase as Record<string, unknown>)?.id === purchaseRecord.id)) {
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

  // --- AUTO-ADVANCE LOGIC FOR COS/EOS (RFE & Motion) ---
  let nextStep = currentProc.current_step;
  const isCOSorEOS = mainServiceSlug === "troca-status" || mainServiceSlug === "extensao-status";
  const extraMetadata: Record<string, unknown> = {};

    if (isCOSorEOS) {
      if (service_slug === "analise-motion") {
        const history = Array.isArray(stepData.history) ? [...stepData.history] : [];
        const activeCycleIndex = typeof stepData.active_cycle_index === "number"
          ? stepData.active_cycle_index
        : history.length - 1;
      if (history[activeCycleIndex]) {
        history[activeCycleIndex] = { ...history[activeCycleIndex], status: "waitingProposal" };
      }
      extraMetadata.history = history;
        extraMetadata.workflow_status = "waitingProposal";
        extraMetadata.recover = "waitingProposal";
        extraMetadata.motion_analysis_paid = true;
        nextStep = (currentProc.current_step ?? 0) + 1;
      } else if (service_slug === "apoio-rfe-motion-inicio") {
        extraMetadata.motion_initial_paid = true;
        extraMetadata.rfe_initial_paid = true;
        const uscisResult = String(stepData.uscis_official_result || "").toLowerCase();
        const rfeResult = String(stepData.uscis_rfe_result || "").toLowerCase();
        const isMotionFlow =
          uscisResult === "denied" ||
          uscisResult === "rejected" ||
          rfeResult === "denied" ||
          rfeResult === "rejected" ||
          (nextStep ?? 0) >= 19;

        if (isMotionFlow) nextStep = Math.max(nextStep ?? 0, 20);
        else if (nextStep === 13) nextStep = 14;

        // Update RFE Cycle status
        const rfeCycles = Array.isArray(stepData.rfe_cycles) ? [...stepData.rfe_cycles] : [];
        const activeRfeIdx = (Number(stepData.active_rfe_cycle) || 1) - 1;
        if (rfeCycles[activeRfeIdx]) {
          rfeCycles[activeRfeIdx] = { 
            ...rfeCycles[activeRfeIdx], 
            status: 'paid', 
            paid_at: now 
          };
        }
        extraMetadata.rfe_cycles = rfeCycles;
      } else if (service_slug === "proposta-rfe-motion") {
        const uscisResult = String(stepData.uscis_official_result || "").toLowerCase();
        const rfeResult = String(stepData.uscis_rfe_result || "").toLowerCase();
        const isMotionFlow =
          uscisResult === "denied" ||
          uscisResult === "rejected" ||
          rfeResult === "denied" ||
          rfeResult === "rejected" ||
          (nextStep ?? 0) >= 19;

        if (isMotionFlow) {
          extraMetadata.motion_proposal_paid = true;
          extraMetadata.motion_payment_completed_at = now;
          extraMetadata.motion_amount_paid = paid_amount ?? null;
        } else {
          extraMetadata.rfe_proposal_paid = true;
          
          // Update RFE Cycle status
          const rfeCycles = Array.isArray(stepData.rfe_cycles) ? [...stepData.rfe_cycles] : [];
          const activeRfeIdx = (Number(stepData.active_rfe_cycle) || 1) - 1;
          if (rfeCycles[activeRfeIdx]) {
            rfeCycles[activeRfeIdx] = { 
              ...rfeCycles[activeRfeIdx], 
              status: 'paid', 
              paid_at: now 
            };
          }
          extraMetadata.rfe_cycles = rfeCycles;
        }
        
        extraMetadata.workflow_status = "in_progress";
        nextStep = (currentProc.current_step ?? 0) + 1;
      }
    }

  await supabase
    .from("user_services")
    .update({
      current_step: nextStep,
      step_data: {
        ...stepData,
        ...extraMetadata,
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
