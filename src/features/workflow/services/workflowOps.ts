import { supabase } from "@shared/lib/supabase";
import type { 
  UserProductInstance, 
  UserStep, 
  InstanceStatus, 
  ProductStep,
  FileRef,
  StepReview
} from "../types";

// ── Instances ───────────────────────────────────────────────────────────────

/** Retorna a instância ativa do usuário para um produto (cria se não existir). */
export async function getOrCreateInstance(
  userId:    string,
  productId: string,
  orderId?:  string,
): Promise<UserProductInstance> {
  // Look for the most recent non-canceled/rejected instance
  const { data: existing, error: existingError } = await supabase
    .schema("aplikei")
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
    .schema("aplikei")
    .rpc("start_product_instance", {
      p_user_id:    userId,
      p_product_id: productId,
      p_order_id:   orderId ?? null,
    });

  if (error) throw new Error(`Erro ao criar instância: ${error.message}`);

  if (instanceId) {
    const { data: created, error: fetchErr } = await supabase
      .schema("aplikei")
      .from("user_product_instances")
      .select("*")
      .eq("id", instanceId)
      .maybeSingle();

    if (!fetchErr && created) return created as UserProductInstance;
  }

  // Fallback: fetch the most recent instance
  const { data: fallback, error: fallbackErr } = await supabase
    .schema("aplikei")
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
    .schema("aplikei")
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
    .schema("aplikei")
    .from("user_steps")
    .select("*, product_step:product_steps(*)")
    .eq("user_product_id", instanceId)
    .order("product_step(order)", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as UserStep[];
}

/** Carrega um step específico pelo product_step_id. */
export async function getStep(instanceId: string, productStepId: string): Promise<UserStep | null> {
  const { data, error } = await supabase
    .schema("aplikei")
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
    .schema("aplikei")
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
    .schema("aplikei")
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
    .schema("aplikei")
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
    .schema("aplikei")
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
  const isFinal = outcome.result === 'approved' ||
                  outcome.result === 'denied'   ||
                  outcome.result === 'rejected'

  const newStatus: InstanceStatus = isFinal ? 'approved' : 'in_progress'

  try {
    const { error } = await supabase
      .schema("aplikei")
      .from('user_product_instances')
      .update({
        status: newStatus,
        completed_at: isFinal ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', instanceId)

    if (error) throw new Error(error.message)
  } catch (error) {
    throw error
  }
}

// ── Admin: reviews ────────────────────────────────────────────────────────────

/** Admin aprova um step. */
export async function approveStep(
  userStepId: string,
  adminId:    string,
  comment?:   string,
): Promise<void> {
  await supabase.schema("aplikei").from("user_steps").update({
    status:      "approved",
    reviewed_at: new Date().toISOString(),
  }).eq("id", userStepId);

  await supabase.schema("aplikei").from("step_reviews").insert({
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
  await supabase.schema("aplikei").from("user_steps").update({
    status:      "revision_requested",
    reviewed_at: new Date().toISOString(),
  }).eq("id", userStepId);

  await supabase.schema("aplikei").from("step_reviews").insert({
    user_step_id: userStepId,
    admin_id:     adminId,
    action:       "revision_requested",
    comment,
  });
}

/** Histórico de revisões de um step. */
export async function getReviews(userStepId: string): Promise<StepReview[]> {
  const { data, error } = await supabase
    .schema("aplikei")
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

// ── Product steps (template) ─────────────────────────────────────────────────

/** Lista os steps-template de um produto pelo slug. */
export async function getProductStepsBySlug(productSlug: string): Promise<ProductStep[]> {
  const { data, error } = await supabase
    .schema("aplikei")
    .from("product_steps")
    .select("*, products!inner(slug)")
    .eq("products.slug", productSlug)
    .order("order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductStep[];
}

export async function getProductIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .schema("aplikei")
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}
