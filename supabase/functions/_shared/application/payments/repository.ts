import type { Supabase } from "../../core/supabase.ts";
import {
  isAuxiliaryService,
  resolveSlugBehavior,
  shouldForceStandalone,
  shouldUseChatOnly,
} from "../../domain/catalog/slugs.ts";
import {
  FINAL_ORDER_STATUSES,
  LINKABLE_PARENT_STATUSES,
  parseCount,
} from "../../domain/payments/slot-rules.ts";
import {
  type PurchaseRecord,
  hasMatchingPurchaseRecord,
} from "../../domain/payments/purchase-record.ts";

export async function getProcessServiceSlug(
  supabase: Supabase,
  processId: string | null | undefined,
): Promise<string | null> {
  if (!processId) return null;
  const { data } = await supabase
    .from("user_services")
    .select("service_slug")
    .eq("id", processId)
    .maybeSingle();
  return data?.service_slug || null;
}

export async function resolveTargetProcessId(data: {
  supabase: Supabase;
  user_id: string;
  service_slug: string;
  proc_id?: string | null;
  parent_service_slug?: string | null;
}): Promise<{ targetProcId: string | null; parentServiceSlug: string | null }> {
  const { supabase, user_id, service_slug } = data;

  if (shouldForceStandalone(service_slug) && !shouldUseChatOnly(service_slug)) {
    return { targetProcId: null, parentServiceSlug: null };
  }

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
      .in("status", LINKABLE_PARENT_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (exactParent) {
      targetProcId = exactParent.id;
      parentServiceSlug = exactParent.service_slug;
    }
  }

  if (!targetProcId && isAuxiliaryService(service_slug)) {
    const isCOS = service_slug.includes("cos") || service_slug.includes("eos") || service_slug.includes("-status");
    const mainSlugs = isCOS ? ["troca-status", "extensao-status"] : ["visto-b1-b2", "visto-f1"];

    const { data: activeMain } = await supabase
      .from("user_services")
      .select("id, service_slug")
      .eq("user_id", user_id)
      .in("service_slug", mainSlugs)
      .in("status", LINKABLE_PARENT_STATUSES)
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

export async function syncParentOrderMetadata(data: {
  supabase: Supabase;
  user_id: string;
  targetProcId: string;
  parentServiceSlug: string;
  newCount: number;
  purchaseRecord: PurchaseRecord;
}): Promise<void> {
  const { supabase, user_id, targetProcId, parentServiceSlug, newCount, purchaseRecord } = data;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, product_slug, payment_status, payment_metadata, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  const parentOrder = (orders || []).find((order: Record<string, unknown>) => {
    const metadata = (order.payment_metadata as Record<string, unknown>) || {};
    const metadataProcId = metadata.proc_id || metadata.processId || metadata.parent_process_id;
    return !isAuxiliaryService(order.product_slug as string) &&
      order.product_slug === parentServiceSlug &&
      (
        metadataProcId === targetProcId ||
        (!metadataProcId && FINAL_ORDER_STATUSES.includes(order.payment_status as typeof FINAL_ORDER_STATUSES[number]))
      );
  });

  if (!parentOrder) return;

  const metadata = (parentOrder.payment_metadata as Record<string, unknown>) || {};
  const existingPurchases = Array.isArray(metadata.dependent_slot_purchases)
    ? metadata.dependent_slot_purchases
    : [];
  const hasPurchase = existingPurchases.some(
    (p: unknown) => (p as Record<string, unknown>)?.id === purchaseRecord.id,
  );
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
        dependent_slot_purchases: hasPurchase ? existingPurchases : [...existingPurchases, purchaseRecord],
      },
    })
    .eq("id", parentOrder.id);
}

export async function mirrorPurchaseToParentProcess(data: {
  supabase: Supabase;
  targetProcId: string;
  office_id?: string | null;
  purchaseRecord: PurchaseRecord;
}): Promise<void> {
  const { supabase, targetProcId, office_id, purchaseRecord } = data;

  const { data: proc } = await supabase
    .from("user_services")
    .select("step_data")
    .eq("id", targetProcId)
    .maybeSingle();

  if (!proc) return;

  const stepData = (proc.step_data as Record<string, unknown>) || {};
  const purchases = Array.isArray(stepData.purchases) ? [...stepData.purchases] : [];

  if (hasMatchingPurchaseRecord(purchases, purchaseRecord)) return;

  await supabase
    .from("user_services")
    .update({
      office_id: office_id || null,
      step_data: { ...stepData, purchases: [...purchases, purchaseRecord] },
    })
    .eq("id", targetProcId);
}

export async function findExistingStandalonePurchaseProcess(data: {
  supabase: Supabase;
  user_id: string;
  service_slug: string;
  purchaseRecord: PurchaseRecord;
}): Promise<Record<string, unknown> | null> {
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

export async function findExistingRecoveryChildByPurchaseRef(data: {
  supabase: Supabase;
  user_id: string;
  service_slug: string;
  parent_process_id: string;
  purchaseRecord: PurchaseRecord;
  order_id?: string | null;
}): Promise<Record<string, unknown> | null> {
  const { supabase, user_id, service_slug, parent_process_id, purchaseRecord, order_id } = data;

  const { data: candidates } = await supabase
    .from("user_services")
    .select("id, step_data")
    .eq("user_id", user_id)
    .eq("service_slug", service_slug)
    .order("created_at", { ascending: false })
    .limit(20);

  return (candidates || []).find((candidate: Record<string, unknown>) => {
    const sd = (candidate.step_data as Record<string, unknown>) || {};
    const purchaseRef = (sd.purchase_ref as Record<string, unknown>) || {};
    const parentId = String(sd.parent_process_id || "").trim();
    if (parentId !== parent_process_id) return false;
    if (order_id && String(purchaseRef.order_id || "") === String(order_id)) return true;
    if (purchaseRecord.id && String(purchaseRef.purchase_id || "") === String(purchaseRecord.id)) return true;
    return hasMatchingPurchaseRecord(sd.purchases, purchaseRecord);
  }) || null;
}

export async function createConversationThread(data: {
  supabase: Supabase;
  processId: string;
  senderId: string;
  customerId: string;
  officeId?: string | null;
  content: string;
}): Promise<void> {
  const { supabase, processId, senderId, customerId, officeId, content } = data;
  let finalOfficeId = officeId || null;

  if (!finalOfficeId) {
    const { data: processRow } = await supabase
      .from("user_services")
      .select("office_id")
      .eq("id", processId)
      .maybeSingle();
    finalOfficeId = processRow?.office_id || null;
  }

  if (!finalOfficeId) {
    const { data: accountRow } = await supabase
      .from("user_accounts")
      .select("office_id")
      .eq("id", customerId)
      .maybeSingle();
    finalOfficeId = accountRow?.office_id || null;
  }

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({
      process_id: processId,
      customer_id: customerId,
      office_id: finalOfficeId,
      is_closed: false,
    })
    .select("id")
    .single();

  if (!insertError && created) {
    const { error: msgError } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: created.id,
        sender_id: senderId,
        sender_role: "customer",
        content,
        created_at: new Date().toISOString(),
      });
    if (msgError) throw msgError;
  }
  // Conversation already existed — unique constraint handled idempotency at DB level
}

export async function createRecoveryChildProcess(data: {
  supabase: Supabase;
  user_id: string;
  service_slug: string;
  parent_process_id: string;
  parent_service_slug: string | null;
  office_id?: string | null;
  purchaseRecord: PurchaseRecord;
  order_id?: string | null;
}): Promise<string> {
  const existing = await findExistingRecoveryChildByPurchaseRef({
    supabase: data.supabase,
    user_id: data.user_id,
    service_slug: data.service_slug,
    parent_process_id: data.parent_process_id,
    purchaseRecord: data.purchaseRecord,
    order_id: data.order_id,
  });
  if (existing) return existing.id as string;

  const workflowType = resolveSlugBehavior(data.service_slug).recoveryWorkflow ?? "rfe";
  const now = new Date().toISOString();
  const { data: inserted, error } = await data.supabase
    .from("user_services")
    .insert({
      user_id: data.user_id,
      service_slug: data.service_slug,
      office_id: data.office_id || null,
      status: "active",
      current_step: 0,
      step_data: {
        parent_process_id: data.parent_process_id,
        parent_service_slug: data.parent_service_slug,
        origin: "recovery_child",
        workflow_type: workflowType,
        purchase_ref: {
          order_id: data.order_id || null,
          purchase_id: data.purchaseRecord.id || null,
          created_at: now,
        },
        purchases: [data.purchaseRecord],
      },
      data: {},
    })
    .select("id")
    .single();

  if (error) throw error;

  if (workflowType === "rfe") {
    await createConversationThread({
      supabase: data.supabase,
      processId: data.parent_process_id,
      senderId: data.user_id,
      customerId: data.user_id,
      officeId: data.office_id || null,
      content: "Olá! Quero falar com o especialista sobre a minha RFE.",
    });
  }

  return inserted?.id as string;
}

export async function ensureLegacyProfileForUser(
  supabase: Supabase,
  userId: string,
): Promise<void> {
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
  if (!account) throw new Error(`Cannot create user service: user ${userId} was not found in user_accounts`);

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

export async function ensureSupportChatThread(data: {
  supabase: Supabase;
  processId: string;
  senderId: string;
  customerId: string;
  officeId?: string | null;
}): Promise<void> {
  await createConversationThread({
    supabase: data.supabase,
    processId: data.processId,
    senderId: data.senderId,
    customerId: data.customerId,
    officeId: data.officeId,
    content: "Chat iniciado automaticamente após confirmação do pagamento da proposta.",
  });
}
