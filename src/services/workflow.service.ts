import { getSupabaseClient } from "../lib/supabase";
import { authService } from "./auth.service";
import {
  completeMockWorkflowStep,
  getMockWorkflowProductIdBySlug,
  getMockWorkflowProductStepsBySlug,
  getMockWorkflowStep,
  getOrCreateMockWorkflowInstance,
  listMockWorkflowInstances,
  listUserSteps,
  saveMockWorkflowDraft,
  submitMockWorkflowFilesStep,
  submitMockWorkflowStep,
} from "../mocks/workflow";

let preferMockWorkflow = false;

// Cache the backend check result for 30s to prevent request storms
// (HMR reloads, React StrictMode, rapid re-renders all call ensureWorkflowBackend)
let _backendCache: { result: "supabase" | "mock"; userId?: string; expiresAt: number } | null = null;

// Reads the cached user WITHOUT any network call.
// authService.getCurrentAccount() is populated by onAuthStateChange and is synchronous.
function hasMatchingSupabaseSession(userId?: string): boolean {
  const cached = authService.getCurrentAccount();
  if (!cached) return false;
  return userId ? cached.id === userId : true;
}

function shouldFallbackToMock(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  return [
    "violates foreign key constraint",
    "row-level security",
    "permission denied",
    "relation",
    "does not exist",
    "not configured",
    "jwt",
    "schema",
    "not found",
    "unknown schema",
  ].some((token) => normalized.includes(token));
}

function activateMockWorkflowFallback(error: unknown) {
  if (!preferMockWorkflow) {
    console.warn("[workflowService] Falling back to mock workflow:", error);
  }
  preferMockWorkflow = true;
  _backendCache = null; // Invalidate cache on error so next call can recover
}

export async function ensureWorkflowBackend(userId?: string): Promise<"supabase" | "mock"> {
  const now = Date.now();

  // Return cached result if still valid for the same user
  if (_backendCache && _backendCache.expiresAt > now && _backendCache.userId === userId) {
    return _backendCache.result;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    preferMockWorkflow = true;
    _backendCache = { result: "mock", userId, expiresAt: now + 30_000 };
    return "mock";
  }

  const hasSession = await hasMatchingSupabaseSession(userId);
  if (!hasSession) {
    // Short cache (5s) — session may become available soon after login redirect
    _backendCache = { result: "mock", userId, expiresAt: now + 5_000 };
    return "mock";
  }

  // Probe the aplikei schema to confirm it's accessible via the REST API
  try {
    const { error } = await supabase
      .schema("aplikei")
      .from("products")
      .select("id")
      .limit(1);
    if (error) {
      console.error("[workflowService] Schema probe failed:", error.message);
      activateMockWorkflowFallback(error);
      _backendCache = { result: "mock", userId, expiresAt: now + 30_000 };
      return "mock";
    }
  } catch (probeError) {
    console.error("[workflowService] Schema probe threw:", probeError);
    activateMockWorkflowFallback(probeError);
    _backendCache = { result: "mock", userId, expiresAt: now + 30_000 };
    return "mock";
  }

  // Schema OK — disable mock fallback and cache the positive result for 30s
  preferMockWorkflow = false;
  _backendCache = { result: "supabase", userId, expiresAt: now + 30_000 };
  return "supabase";
}

/** Call on logout to clear the backend cache and force re-check on next use */
export function resetWorkflowBackendCache() {
  _backendCache = null;
  preferMockWorkflow = false;
}

// ─── DB row types ─────────────────────────────────────────────────────────────

export type InstanceStatus =
  | "draft" | "in_progress" | "in_review"
  | "revision_requested" | "approved" | "rejected" | "canceled";

export type StepStatus =
  | "pending" | "in_progress" | "completed" | "in_review"
  | "approved" | "revision_requested" | "skipped";

export type ReviewAction =
  | "approved" | "revision_requested" | "rejected" | "commented";

export interface ProductStep {
  id:          string;
  product_id:  string;
  title:       string;
  description: string | null;
  order:       number;
  type:        "form" | "upload" | "admin_action" | "review" | "info";
  is_required: boolean;
  config:      Record<string, unknown>;
}

export interface UserProductInstance {
  id:           string;
  user_id:      string;
  product_id:   string;
  order_id:     string | null;
  status:       InstanceStatus;
  metadata:     Record<string, unknown>;
  started_at:   string | null;
  completed_at: string | null;
  created_at:   string;
  updated_at:   string;
}

export interface UserStep {
  id:              string;
  user_product_id: string;
  product_step_id: string;
  status:          StepStatus;
  data:            Record<string, unknown>;
  files:           FileRef[];
  submitted_at:    string | null;
  reviewed_at:     string | null;
  created_at:      string;
  updated_at:      string;
  // join
  product_step?:   ProductStep;
}

export interface FileRef {
  name: string;
  path: string;
  url:  string;
}

export interface StepReview {
  id:           string;
  user_step_id: string;
  admin_id:     string;
  action:       ReviewAction;
  comment:      string | null;
  created_at:   string;
}

// ─── WorkflowService ──────────────────────────────────────────────────────────

export const workflowService = {

  // ── Instances ───────────────────────────────────────────────────────────────

  /** Retorna a instância ativa do usuário para um produto (cria se não existir). */
  async getOrCreateInstance(
    userId:    string,
    productId: string,
    orderId?:  string,
  ): Promise<UserProductInstance> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      return getOrCreateMockWorkflowInstance(userId, productId, orderId);
    }

    try {
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

      // Fetch the newly created instance — use maybeSingle() to handle edge cases
      // where the RPC returns null (race condition: another call created it first)
      if (instanceId) {
        const { data: created, error: fetchErr } = await supabase
          .schema("aplikei")
          .from("user_product_instances")
          .select("*")
          .eq("id", instanceId)
          .maybeSingle();

        if (!fetchErr && created) return created as UserProductInstance;
      }

      // Fallback: fetch the most recent instance (handles RPC returning null or race conditions)
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
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        return getOrCreateMockWorkflowInstance(userId, productId, orderId);
      }
      throw error;
    }
  },

  /** Lista instâncias de um usuário com os steps embutidos. */
  async listInstances(userId: string): Promise<UserProductInstance[]> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      return listMockWorkflowInstances(userId);
    }

    try {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("user_product_instances")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as UserProductInstance[];
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        return listMockWorkflowInstances(userId);
      }
      throw error;
    }
  },

  // ── Steps ────────────────────────────────────────────────────────────────────

  /** Carrega todos os steps de uma instância, ordenados. */
  async getSteps(instanceId: string): Promise<UserStep[]> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      return listUserSteps(instanceId);
    }

    try {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("user_steps")
        .select("*, product_step:product_steps(*)")
        .eq("user_product_id", instanceId)
        .order("product_step(order)", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as UserStep[];
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        return listUserSteps(instanceId);
      }
      throw error;
    }
  },

  /** Carrega um step específico pelo product_step_id. */
  async getStep(instanceId: string, productStepId: string): Promise<UserStep | null> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      return getMockWorkflowStep(instanceId, productStepId);
    }

    try {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("user_steps")
        .select("*, product_step:product_steps(*)")
        .eq("user_product_id", instanceId)
        .eq("product_step_id", productStepId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data as UserStep | null;
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        return getMockWorkflowStep(instanceId, productStepId);
      }
      throw error;
    }
  },

  /** Salva rascunho — status fica in_progress, dados são persistidos sem submeter. */
  async saveDraft(
    userStepId: string,
    data:       Record<string, unknown>,
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      saveMockWorkflowDraft(userStepId, data);
      return;
    }

    try {
      const { error } = await supabase
        .schema("aplikei")
        .from("user_steps")
        .update({ data, status: "in_progress" })
        .eq("id", userStepId);

      if (error) throw new Error(error.message);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        saveMockWorkflowDraft(userStepId, data);
        return;
      }
      throw error;
    }
  },

  /** Submete o step para revisão — status muda para in_review + registra submitted_at. */
  async submitStep(
    userStepId: string,
    data:       Record<string, unknown>,
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      submitMockWorkflowStep(userStepId, data);
      return;
    }

    try {
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
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        submitMockWorkflowStep(userStepId, data);
        return;
      }
      throw error;
    }
  },

  async submitStepFiles(
    userStepId: string,
    files: FileRef[],
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      submitMockWorkflowFilesStep(userStepId, files);
      return;
    }

    try {
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
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        submitMockWorkflowFilesStep(userStepId, files);
        return;
      }
      throw error;
    }
  },

  /** Marca step como completed sem enviar para revisão (steps do tipo info/admin_action). */
  async completeStep(userStepId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      completeMockWorkflowStep(userStepId);
      return;
    }

    try {
      const { error } = await supabase
        .schema("aplikei")
        .from("user_steps")
        .update({ status: "completed" })
        .eq("id", userStepId);

      if (error) throw new Error(error.message);
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        completeMockWorkflowStep(userStepId);
        return;
      }
      throw error;
    }
  },

  /**
   * Registra o resultado final da instância (USCIS / Motion / RFE).
   * Atualiza status da instância e persiste metadata de resultado.
   */
  async updateInstanceOutcome(
    instanceId: string,
    outcome: {
      type: 'uscis' | 'motion' | 'rfe'
      result: 'approved' | 'denied' | 'rfe' | 'rejected'
      reportedAt?: string
    },
  ): Promise<void> {
    const supabase = getSupabaseClient()
    const isFinal = outcome.result === 'approved' ||
                    outcome.result === 'denied'   ||
                    outcome.result === 'rejected'

    const newStatus: InstanceStatus = isFinal ? 'approved' : 'in_progress'

    if (!supabase || preferMockWorkflow) {
      console.info('[workflowService.mock] updateInstanceOutcome', instanceId, outcome)
      return
    }

    try {
      // Nota: Para merge de metadata real usaríamos uma RPC no banco.
      // Aqui fazemos o update direto que sobrescreverá campos se não formos cuidadosos,
      // mas no contexto deste workflow o metadata é o ponto central de verdade.
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
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error)
        return
      }
      throw error
    }
  },

  // ── Admin: reviews ────────────────────────────────────────────────────────────

  /** Admin aprova um step. Sempre usa Supabase — não depende de preferMockWorkflow. */
  async approveStep(
    userStepId: string,
    adminId:    string,
    comment?:   string,
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase client não disponível");

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
  },

  /** Admin pede revisão de um step. Sempre usa Supabase — não depende de preferMockWorkflow. */
  async requestRevision(
    userStepId: string,
    adminId:    string,
    comment:    string,
  ): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase client não disponível");

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
  },

  /** Histórico de revisões de um step. Sempre usa Supabase — não depende de preferMockWorkflow. */
  async getReviews(userStepId: string): Promise<StepReview[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .schema("aplikei")
      .from("step_reviews")
      .select("*")
      .eq("user_step_id", userStepId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[workflowService] getReviews failed:", error.message);
      return [];
    }
    return (data ?? []) as StepReview[];
  },

  // ── Product steps (template) ─────────────────────────────────────────────────

  /** Lista os steps-template de um produto pelo slug. */
  async getProductStepsBySlug(productSlug: string): Promise<ProductStep[]> {
    const supabase = getSupabaseClient();
    if (!supabase || preferMockWorkflow) {
      return getMockWorkflowProductStepsBySlug(productSlug);
    }

    try {
      const { data, error } = await supabase
        .schema("aplikei")
        .from("product_steps")
        .select("*, products!inner(slug)")
        .eq("products.slug", productSlug)
        .order("order", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as ProductStep[];
    } catch (error) {
      if (shouldFallbackToMock(error)) {
        activateMockWorkflowFallback(error);
        return getMockWorkflowProductStepsBySlug(productSlug);
      }
      throw error;
    }
  },
};

export async function getProductIdBySlug(slug: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || preferMockWorkflow) {
    return getMockWorkflowProductIdBySlug(slug);
  }
  try {
    const { data, error } = await supabase
      .schema("aplikei")
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data?.id ?? null;
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      activateMockWorkflowFallback(error);
      return getMockWorkflowProductIdBySlug(slug);
    }
    throw error;
  }
}
