import { supabase } from "@shared/lib/supabase";
import type { 
  UserProductInstance, 
  UserStep, 
  InstanceStatus, 
  ProductStep,
  FileRef,
  StepReview
} from "../types";

function sortStepsByProductOrder<T extends { product_step?: { order?: number | null } | null }>(steps: T[]): T[] {
  return [...steps].sort(
    (a, b) => (a.product_step?.order ?? Number.MAX_SAFE_INTEGER) - (b.product_step?.order ?? Number.MAX_SAFE_INTEGER),
  );
}

// ── Instances ───────────────────────────────────────────────────────────────

/** Retorna a instância ativa do usuário para um produto (cria se não existir). */
export async function getOrCreateInstance(
  userId:    string,
  productId: string,
  orderId?:  string,
): Promise<UserProductInstance> {
  // Look for the most recent non-canceled/rejected instance
  const { data: existing, error: existingError } = await supabase
    .from("user_product_instances")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .not("status", "in", '("canceled","rejected")')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) return existing as UserProductInstance;

  // No existing instance — create one via RPC
  const { data: instanceId, error } = await supabase
    .rpc("start_product_instance", {
      p_user_id:    userId,
      p_product_id: productId,
      p_order_id:   orderId ?? null,
    });

  if (error) throw new Error(`Erro ao criar instância: ${error.message}`);

  if (instanceId) {
    const { data: created, error: fetchErr } = await supabase
      .from("user_product_instances")
      .select("*")
      .eq("id", instanceId)
      .maybeSingle();

    if (!fetchErr && created) return created as UserProductInstance;
  }

  // Fallback: fetch the most recent instance
  const { data: fallback, error: fallbackErr } = await supabase
    .from("user_product_instances")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallbackErr) throw new Error(fallbackErr.message);
  if (fallback) return fallback as UserProductInstance;

  throw new Error("Falha ao criar ou recuperar instância do produto.");
}

/** Lista instâncias de um usuário com os steps embutidos. */
export async function listInstances(userId: string): Promise<UserProductInstance[]> {
  const { data, error } = await supabase
    .from("user_product_instances")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as UserProductInstance[];
}

// ── Steps ────────────────────────────────────────────────────────────────────

/** Carrega todos os steps de uma instância, ordenados. */
export async function getSteps(instanceId: string): Promise<UserStep[]> {
  const { data, error } = await supabase
    .from("user_steps")
    .select("*, product_step:product_steps(*)")
    .eq("user_product_id", instanceId)
    .order("product_step(order)", { ascending: true });

  if (error) throw new Error(error.message);
  return sortStepsByProductOrder((data ?? []) as UserStep[]);
}

/** Carrega um step específico pelo product_step_id. */
export async function getStep(instanceId: string, productStepId: string): Promise<UserStep | null> {
  const { data, error } = await supabase
    .from("user_steps")
    .select("*, product_step:product_steps(*)")
    .eq("user_product_id", instanceId)
    .eq("product_step_id", productStepId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserStep | null;
}

/** Salva rascunho — status fica in_progress, dados são persistidos sem submeter. */
export async function saveDraft(
  userStepId: string,
  data:       Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from("user_steps")
    .update({ data, status: "in_progress" })
    .eq("id", userStepId);

  if (error) throw new Error(error.message);
}

/** Submete o step para revisão — status muda para in_review + registra submitted_at. */
export async function submitStep(
  userStepId: string,
  data:       Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from("user_steps")
    .update({
      data,
      status:       "in_review",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", userStepId);

  if (error) throw new Error(error.message);
}

export async function submitStepFiles(
  userStepId: string,
  files: FileRef[],
): Promise<void> {
  const { error } = await supabase
    .from("user_steps")
    .update({
      files,
      status: "in_review",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", userStepId);

  if (error) throw new Error(error.message);
}

/** Marca step como completed sem enviar para revisão (steps do tipo info/admin_action). */
export async function completeStep(userStepId: string): Promise<void> {
  const { error } = await supabase
    .from("user_steps")
    .update({ status: "completed" })
    .eq("id", userStepId);

  if (error) throw new Error(error.message);
}

/**
 * Registra o resultado final da instância (USCIS / Motion / RFE).
 * Atualiza status da instância e persiste metadata de resultado.
 */
export async function updateInstanceOutcome(
  instanceId: string,
  outcome: {
    type: 'uscis' | 'motion' | 'rfe'
    result: 'approved' | 'denied' | 'rfe' | 'rejected'
    reportedAt?: string
  },
): Promise<void> {
  function outcomeToInstanceStatus(
    result: 'approved' | 'denied' | 'rfe' | 'rejected',
  ): InstanceStatus {
    if (result === 'approved') return 'approved'
    if (result === 'denied' || result === 'rejected') return 'rejected'
    return 'in_progress'
  }

  const isFinal =
    outcome.result === 'approved' ||
    outcome.result === 'denied' ||
    outcome.result === 'rejected'
  const newStatus = outcomeToInstanceStatus(outcome.result)

  const { error } = await supabase
    .from('user_product_instances')
    .update({
      status: newStatus,
      completed_at: isFinal ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', instanceId)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Admin: reviews ────────────────────────────────────────────────────────────

/** Admin aprova um step. */
export async function approveStep(
  userStepId: string,
  adminId:    string,
  comment?:   string,
): Promise<void> {
  await supabase.from("user_steps").update({
    status:      "approved",
    reviewed_at: new Date().toISOString(),
  }).eq("id", userStepId);

  await supabase.from("step_reviews").insert({
    user_step_id: userStepId,
    admin_id:     adminId,
    action:       "approved",
    comment:      comment ?? null,
  });
}

/** Admin pede revisão de um step. */
export async function requestRevision(
  userStepId: string,
  adminId:    string,
  comment:    string,
): Promise<void> {
  await supabase.from("user_steps").update({
    status:      "revision_requested",
    reviewed_at: new Date().toISOString(),
  }).eq("id", userStepId);

  await supabase.from("step_reviews").insert({
    user_step_id: userStepId,
    admin_id:     adminId,
    action:       "revision_requested",
    comment,
  });
}

/** Histórico de revisões de um step. */
export async function getReviews(userStepId: string): Promise<StepReview[]> {
  const { data, error } = await supabase
    .from("step_reviews")
    .select("*")
    .eq("user_step_id", userStepId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[workflowOps] getReviews failed:", error.message);
    return [];
  }
  return (data ?? []) as StepReview[];
}

/** Histórico de revisões de vários steps em uma única consulta. */
export async function getReviewsForSteps(userStepIds: string[]): Promise<StepReview[]> {
  const ids = Array.from(new Set(userStepIds.filter(Boolean)));
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("step_reviews")
    .select("*")
    .in("user_step_id", ids)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[workflowOps] getReviewsForSteps failed:", error.message);
    return [];
  }
  return (data ?? []) as StepReview[];
}

// ── Product steps (template) ─────────────────────────────────────────────────

/** Lista os steps-template de um produto pelo slug. */
export async function getProductStepsBySlug(productSlug: string): Promise<ProductStep[]> {
  const { data, error } = await supabase
    .from("product_steps")
    .select("*, products!inner(slug)")
    .eq("products.slug", productSlug)
    .order("order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductStep[];
}

export async function getProductIdBySlug(slug: string): Promise<string | null> {
  const attempts: Array<() => Promise<{ id: string } | null>> = [
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()
      if (error) throw error
      return (data as { id: string } | null) ?? null
    },
    async () => {
      const { data, error } = await supabase
        .from("active_products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()
      if (error) throw error
      return (data as { id: string } | null) ?? null
    },
    async () => {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()
      if (error) throw error
      return (data as { id: string } | null) ?? null
    },
  ]

  let lastError: unknown = null
  for (const attempt of attempts) {
    try {
      const row = await attempt()
      if (row?.id) return row.id
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw new Error(
      `Não foi possível resolver o produto "${slug}" (products/active_products). ${String(
        (lastError as { message?: string })?.message ?? lastError,
      )}`,
    )
  }

  return null
}
