import type { ApplySuccessfulPaymentInput } from "../../payments/payment-types.ts";
import { createLogger } from "../../core/logger.ts";

const log = createLogger("apply-payment");
import { updateOrderSuccess } from "../../payments/application/payment-orders.ts";
import { isRecoveryChild, resolveSlugBehavior, shouldForceStandalone, shouldUseChatOnly } from "../../domain/catalog/slugs.ts";
import { parseCount, calculateIncrementedSlots } from "../../domain/payments/slot-rules.ts";
import { buildPurchaseRecord } from "../../domain/payments/purchase-record.ts";
import {
  getProcessServiceSlug,
  resolveTargetProcessId,
  syncParentOrderMetadata,
  mirrorPurchaseToParentProcess,
  findExistingStandalonePurchaseProcess,
  createRecoveryChildProcess,
  ensureLegacyProfileForUser,
  ensureSupportChatThread,
} from "./repository.ts";
import { applyAutoAdvance } from "./auto-advance/index.ts";

export async function applySuccessfulPayment(data: ApplySuccessfulPaymentInput): Promise<void> {
  const { supabase, user_id, service_slug, payment_method, paid_amount, payment_id, order_id, office_id } = data;
  const now = new Date().toISOString();

  const order = await updateOrderSuccess(data);

  const orderMetadata = (order?.payment_metadata as Record<string, unknown>) ?? {};
  const effectiveDependents = parseCount(orderMetadata.dependents ?? data.dependents, 0);
  const effectiveProcId = (
    data.proc_id ||
    (orderMetadata.proc_id as string | null) ||
    (orderMetadata.processId as string | null) ||
    (orderMetadata.parent_process_id as string | null) ||
    null
  ) as string | null;
  const effectiveParentServiceSlug = (
    data.parent_service_slug ||
    (orderMetadata.parent_service_slug as string | null) ||
    null
  ) as string | null;

  const { targetProcId, parentServiceSlug } = await resolveTargetProcessId({
    supabase,
    user_id,
    service_slug,
    proc_id: effectiveProcId,
    parent_service_slug: effectiveParentServiceSlug,
  });

  let effectiveTargetProcId = targetProcId;
  let effectiveParentSlug = parentServiceSlug;

  // Recovery payments can arrive when parent was still marked as rejected.
  if (!effectiveTargetProcId && isRecoveryChild(service_slug)) {
    const { data: latestParent } = await supabase
      .from("user_services")
      .select("id, service_slug")
      .eq("user_id", user_id)
      .in("service_slug", ["troca-status", "extensao-status"])
      .in("status", ["active", "awaiting_review", "awaiting_payment", "paid", "rejected"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestParent) {
      effectiveTargetProcId = latestParent.id;
      effectiveParentSlug = latestParent.service_slug;
    }
  }

  const purchaseRecord = buildPurchaseRecord({
    payment_id,
    payment_method,
    paid_amount,
    dependents: effectiveDependents,
    service_slug,
    order_id: (order?.id as string | undefined) || order_id || null,
  });

  const officeIdToUse = office_id || (order?.office_id as string | null) || null;

  // Chat-only: attach to parent and open support chat, no new process
  const chatOnlyParentProcessId = effectiveTargetProcId || effectiveProcId;
  if (shouldUseChatOnly(service_slug)) {
    if (chatOnlyParentProcessId) {
      await mirrorPurchaseToParentProcess({ supabase, targetProcId: chatOnlyParentProcessId, office_id: officeIdToUse, purchaseRecord });
      await ensureSupportChatThread({ supabase, processId: chatOnlyParentProcessId, senderId: user_id, customerId: user_id, officeId: officeIdToUse });
    } else {
      log.warn("chat-only purchase without parent process, skipping", { user_id, service_slug, order_id: order?.id || order_id || null });
    }
    return;
  }

  // Recovery child: create child process linked to parent
  if (effectiveTargetProcId && isRecoveryChild(service_slug)) {
    await ensureLegacyProfileForUser(supabase, user_id);
    const inferredParentSlug = effectiveParentSlug || await getProcessServiceSlug(supabase, effectiveProcId);
    await createRecoveryChildProcess({
      supabase,
      user_id,
      service_slug,
      parent_process_id: effectiveTargetProcId,
      parent_service_slug: inferredParentSlug,
      office_id: officeIdToUse,
      purchaseRecord,
      order_id: (order?.id as string | undefined) || order_id || null,
    });
  }

  // Standalone: create new process (or update parent via forceStandalone)
  if (!effectiveTargetProcId) {
    await ensureLegacyProfileForUser(supabase, user_id);

    const existing = await findExistingStandalonePurchaseProcess({ supabase, user_id, service_slug, purchaseRecord });
    if (existing) return;

    const inferredParentSlug = effectiveParentServiceSlug || await getProcessServiceSlug(supabase, effectiveProcId);
    const { error: insertServiceError } = await supabase.from("user_services").insert({
      user_id,
      service_slug,
      office_id: officeIdToUse,
      status: "active",
      current_step: 0,
      step_data: {
        parent_process_id: effectiveProcId,
        parent_service_slug: inferredParentSlug,
        paid_dependents: effectiveDependents,
        purchases: [purchaseRecord],
      },
      data: {},
    });
    if (insertServiceError) throw insertServiceError;

    if (shouldForceStandalone(service_slug)) {
      if (!effectiveProcId) throw new Error(`Missing proc_id for standalone service purchase: ${service_slug}`);
      await mirrorPurchaseToParentProcess({ supabase, targetProcId: effectiveProcId, office_id: officeIdToUse, purchaseRecord });
    }
    return;
  }

  // Update-parent path: apply slots + auto-advance on existing process
  const { data: currentProc } = await supabase
    .from("user_services")
    .select("step_data, service_slug, current_step, negativa")
    .eq("id", effectiveTargetProcId)
    .single();

  if (!currentProc) return;

  const stepData = (currentProc.step_data as Record<string, unknown>) || {};
  const purchases = Array.isArray(stepData.purchases) ? [...stepData.purchases] : [];

  if (purchaseRecord.id && purchases.some((p: unknown) => (p as Record<string, unknown>)?.id === purchaseRecord.id)) {
    return; // idempotent — already recorded
  }

  const mainServiceSlug = currentProc.service_slug || parentServiceSlug || service_slug;
  const currentCount = parseCount(stepData.paid_dependents, 0);
  const newCount = calculateIncrementedSlots(currentCount, effectiveDependents, service_slug, mainServiceSlug);

  purchases.push(purchaseRecord);

  const isCOSorEOS = mainServiceSlug === "troca-status" || mainServiceSlug === "extensao-status";
  const currentNegativa = (currentProc.negativa as Record<string, unknown>) || {};

  const advance = isCOSorEOS
    ? applyAutoAdvance({
        service_slug,
        paid_amount,
        current_step: currentProc.current_step,
        step_data: stepData,
        negativa: currentNegativa,
        now,
      })
    : null;

  const next_step = advance ? advance.next_step : currentProc.current_step;
  const extra_metadata = advance ? advance.extra_metadata : {};
  const next_negativa = advance ? advance.next_negativa : currentNegativa;

  await supabase
    .from("user_services")
    .update({
      current_step: next_step,
      office_id: officeIdToUse,
      negativa: {
        ...next_negativa,
        ...(extra_metadata.rfe_cycles !== undefined ? { rfe_cycles: extra_metadata.rfe_cycles } : {}),
        ...(extra_metadata.history !== undefined ? { motion_history: extra_metadata.history } : {}),
      },
      step_data: {
        ...stepData,
        ...extra_metadata,
        paid_dependents: newCount,
        purchases,
      },
    })
    .eq("id", effectiveTargetProcId);

  const isProposalPayment = resolveSlugBehavior(service_slug).autoAdvance === "motion-proposal";
  if (isProposalPayment) {
    await ensureSupportChatThread({ supabase, processId: effectiveTargetProcId, senderId: user_id, customerId: user_id, officeId: officeIdToUse });
  }

  const parentSlugToSync = effectiveParentSlug || (currentProc.service_slug as string | null);
  if (parentSlugToSync) {
    await syncParentOrderMetadata({ supabase, user_id, targetProcId: effectiveTargetProcId, parentServiceSlug: parentSlugToSync, newCount, purchaseRecord });
  }
}
