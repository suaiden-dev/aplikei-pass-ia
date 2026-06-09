import { supabase } from "@shared/lib/supabase";
import { getCanonicalSlug } from "@shared/data/services";

export interface FinalPreparationState {
  processOfficeId: string | null;
  freshStepData: Record<string, unknown> | null;
  purchasedMentorship: Record<string, unknown> | null;
  purchasedConsultation: Record<string, unknown> | null;
  hasConsultationInCurrentProcess: boolean;
}

export interface FinalPlanPriceConfig {
  slugsToResolve: string[];
  defaults: Record<string, number>;
  aliases: Record<string, string[]>;
}

export function extractProcessPurchaseSlugs(stepData: Record<string, unknown> | null): Set<string> {
  const purchases = Array.isArray(stepData?.purchases)
    ? (stepData?.purchases as Array<Record<string, unknown>>)
    : [];

  const slugs = new Set<string>();
  purchases.forEach((purchase) => {
    const candidates = [
      purchase.slug,
      purchase.service_slug,
      purchase.product_slug,
      purchase.productSlug,
      purchase.serviceSlug,
    ];
    candidates.forEach((candidate) => {
      const raw = String(candidate || "").trim();
      if (!raw) return;
      slugs.add(raw);
      slugs.add(getCanonicalSlug(raw));
    });
  });
  return slugs;
}

async function fetchScopedUserService(params: {
  userId: string;
  procId: string;
  slugs: string[];
}): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", params.userId)
    .in("service_slug", params.slugs)
    .neq("status", "cancelled")
    .contains("step_data", { parent_process_id: params.procId })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as Record<string, unknown> | null) ?? null;
}

export async function fetchFinalPreparationState(params: {
  userId: string;
  procId: string;
  mentorshipSlugs: string[];
  consultationSlugs: string[];
  detectConsultationInPurchases?: boolean;
}): Promise<FinalPreparationState> {
  const { data, error } = await supabase
    .from("user_services")
    .select("office_id, step_data")
    .eq("id", params.procId)
    .single();

  if (error) throw Error(error.message);

  const freshStepData = (data?.step_data as Record<string, unknown> | null) ?? null;
  const [purchasedMentorship, purchasedConsultation] = await Promise.all([
    fetchScopedUserService({
      userId: params.userId,
      procId: params.procId,
      slugs: params.mentorshipSlugs,
    }),
    fetchScopedUserService({
      userId: params.userId,
      procId: params.procId,
      slugs: params.consultationSlugs,
    }),
  ]);

  const purchaseSlugs = extractProcessPurchaseSlugs(freshStepData);
  const hasConsultationInPurchases =
    params.detectConsultationInPurchases === true &&
    params.consultationSlugs.some((slug) => purchaseSlugs.has(slug) || purchaseSlugs.has(getCanonicalSlug(slug)));

  return {
    processOfficeId: (data?.office_id as string | null | undefined) ?? null,
    freshStepData,
    purchasedMentorship,
    purchasedConsultation,
    hasConsultationInCurrentProcess: Boolean(purchasedConsultation) || hasConsultationInPurchases,
  };
}

export async function loadFinalPlanPrices(
  officeId: string,
  config: FinalPlanPriceConfig,
): Promise<Record<string, number>> {
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, slug")
    .in("slug", config.slugsToResolve);

  if (servicesError) throw Error(servicesError.message);
  if (!services?.length) return config.defaults;

  const serviceIds = services.map((service) => service.id);
  const { data: officePrices, error: pricesError } = await supabase
    .from("user_service_prices")
    .select("service_id, price, is_active")
    .eq("office_id", officeId)
    .in("service_id", serviceIds)
    .or("is_active.is.true,is_active.is.null");

  if (pricesError) throw Error(pricesError.message);
  if (!officePrices?.length) return config.defaults;

  const slugById = new Map(services.map((service) => [service.id, service.slug]));
  const priceBySlug = new Map<string, number>();
  officePrices.forEach((row) => {
    const slug = slugById.get(row.service_id);
    if (slug) priceBySlug.set(slug, Number(row.price));
  });

  return Object.fromEntries(
    Object.entries(config.aliases).map(([targetSlug, aliases]) => [
      targetSlug,
      aliases.map((alias) => priceBySlug.get(alias)).find((price): price is number => typeof price === "number") ??
        config.defaults[targetSlug],
    ]),
  );
}

export async function incrementScheduledCount(record: Record<string, unknown>): Promise<Record<string, unknown>> {
  const stepData = (record.step_data as Record<string, unknown>) || {};
  const nextCount = ((stepData.scheduled_count as number) || 0) + 1;
  const nextStepData = { ...stepData, scheduled_count: nextCount };

  const { error } = await supabase
    .from("user_services")
    .update({ step_data: nextStepData })
    .eq("id", record.id);

  if (error) throw Error(error.message);

  return {
    ...record,
    step_data: nextStepData,
  };
}

export async function reportInterviewOutcome(params: {
  procId: string;
  freshStepData: Record<string, unknown>;
  outcome: "approved" | "rejected";
}): Promise<Record<string, unknown>> {
  const outcomeStatus = params.outcome === "approved" ? "completed" : "rejected";
  const reportedAt = new Date().toISOString();
  const nextStepData = {
    ...(params.freshStepData || {}),
    interview_outcome: params.outcome,
    reported_at: reportedAt,
  };

  const { error } = await supabase
    .from("user_services")
    .update({
      status: outcomeStatus,
      step_data: nextStepData,
    })
    .eq("id", params.procId);

  if (error) throw Error(error.message);
  return nextStepData;
}

export async function fetchLatestPurchasedService(params: {
  userId: string;
  slugs: string[];
}): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", params.userId)
    .in("service_slug", params.slugs)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as Record<string, unknown> | null) ?? null;
}

export async function openFinalPreparationSupportChat(params: {
  processId: string;
  customerId: string;
  officeId?: string | null;
  initialMessage: string;
}): Promise<void> {
  const { data: active, error: activeError } = await supabase
    .from("conversations")
    .select("id")
    .eq("process_id", params.processId)
    .eq("is_closed", false)
    .maybeSingle();

  if (activeError) throw Error(activeError.message);

  let conversationId = active?.id;
  if (!conversationId) {
    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert({
        process_id: params.processId,
        customer_id: params.customerId,
        office_id: params.officeId ?? null,
        is_closed: false,
      })
      .select("id")
      .single();

    if (createError) throw Error(createError.message);
    conversationId = created?.id;
  }

  const { count, error: countError } = await supabase
    .from("conversation_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  if (countError) throw Error(countError.message);

  if ((count ?? 0) === 0) {
    const { error } = await supabase.from("conversation_messages").insert({
      conversation_id: conversationId,
      content: params.initialMessage,
      sender_id: params.customerId,
      sender_role: "customer",
      created_at: new Date().toISOString(),
    });

    if (error) throw Error(error.message);
  }
}
