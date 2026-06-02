import { getSupabaseClient } from "@shared/lib/supabase/client";
import { getServiceBySlug } from "@shared/data/services";
import type {
  CaseDetail,
  CaseFilters,
  CaseOnboardingRecord,
  CaseOnboardingStep,
  CasePayloadValue,
  CaseRecord,
} from "@shared/types/case.model";
import { isAnalysisServiceSlug, isProcessApproved, isProcessDenied, type UserService } from "@shared/types/process.model";
import type { UserStep } from "@features/workflow/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesFilters(record: CaseRecord, filters: CaseFilters) {
  if (filters.status && record.status !== filters.status) return false;
  if (filters.priority && record.priority !== filters.priority) return false;
  if (filters.query) {
    const haystack = `${record.id} ${record.customer} ${record.visaType} ${record.owner}`.toLowerCase();
    if (!haystack.includes(filters.query.trim().toLowerCase())) return false;
  }
  return true;
}

function sortCases(records: CaseRecord[]) {
  return [...records].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function shouldIncludeAsCase(slug: string) {
  const s = slug.toLowerCase();
  return (
    !isAnalysisServiceSlug(s) &&
    !s.startsWith("apoio-") &&
    !s.startsWith("revisao-") &&
    !s.startsWith("dependente-") &&
    !s.startsWith("slot-") &&
    !s.includes("rfe") &&
    !s.includes("motion")
  );
}

function instanceStatusToCaseStatus(
  instanceStatus: string,
  stepsCount: number,
  completedSteps: number,
  hasRevisionRequested: boolean,
): CaseRecord["status"] {
  if (hasRevisionRequested) return "docs_pending";
  if (instanceStatus === "approved") return "approved";
  if (instanceStatus === "rejected" || instanceStatus === "canceled") return "attention";
  if (instanceStatus === "in_review") return "in_review";
  if (completedSteps > 0 && completedSteps < stepsCount) return "in_review";
  return "docs_pending";
}

function instanceStatusToPriority(
  instanceStatus: string,
  stepsCount: number,
  completedSteps: number,
  hasRevisionRequested: boolean,
): CaseRecord["priority"] {
  if (hasRevisionRequested) return "high";
  if (instanceStatus === "rejected" || instanceStatus === "canceled") return "high";
  if (instanceStatus === "in_review") return "medium";
  return completedSteps / Math.max(1, stepsCount) > 0.5 ? "medium" : "low";
}

// ─── Real Supabase data ───────────────────────────────────────────────────────

type InstanceRow = {
  id: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  product: { slug: string; name: string } | null;
  steps: {
    status: string;
    product_step?: { title?: string | null; order?: number | null } | null;
  }[];
};

function sortStepsByProductOrder<T extends { product_step?: { order?: number | null } | null }>(steps: T[]): T[] {
  return [...steps].sort(
    (a, b) => (a.product_step?.order ?? Number.MAX_SAFE_INTEGER) - (b.product_step?.order ?? Number.MAX_SAFE_INTEGER),
  );
}

function resolveCurrentStepTitle(
  steps: InstanceRow["steps"],
  fallback?: string,
): string {
  if (!steps.length) return fallback ?? "Em andamento";

  const ordered = [...steps].sort(
    (a, b) => (a.product_step?.order ?? 9999) - (b.product_step?.order ?? 9999),
  );

  const active =
    ordered.find((s) => s.status === "in_progress" || s.status === "in_review") ??
    ordered.find((s) => s.status === "pending") ??
    ordered[ordered.length - 1];

  return active?.product_step?.title ?? fallback ?? "Em andamento";
}

async function fetchUserNames(userIds: string[]): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  if (!supabase || userIds.length === 0) return {};
  try {
    const { data } = await supabase
      .from("user_accounts")
      .select("id, full_name, email")
      .in("id", userIds);
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      const r = row as { id: string; full_name?: string | null; email?: string | null };
      map[r.id] = r.full_name || r.email || "Cliente";
    }
    return map;
  } catch {
    return {};
  }
}

async function fetchRealCases(): Promise<CaseRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .schema("aplikei")
      .from("user_product_instances")
      .select(`
        id,
        status,
        user_id,
        created_at,
        updated_at,
        product:products(slug, name),
        steps:user_steps(status, product_step:product_steps(title, "order"))
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const rows = data as unknown as InstanceRow[];
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const userNames = await fetchUserNames(userIds);

    return rows
      .filter((row) => row.product && shouldIncludeAsCase(row.product.slug))
      .map((row) => {
        const slug = row.product!.slug;
        const serviceMeta = getServiceBySlug(slug);
        const totalSteps = row.steps.length;
        const hasRevisionRequested = row.steps.some((s) => s.status === "revision_requested");
        const completedSteps = row.steps.filter(
          (s) => s.status === "approved" || s.status === "completed" || s.status === "skipped",
        ).length;
        const currentStep = resolveCurrentStepTitle(
          row.steps,
          serviceMeta?.title ?? row.product!.name,
        );

        return {
          id: row.id,
          customer: userNames[row.user_id] ?? "Cliente",
          visaType: serviceMeta?.title ?? row.product!.name,
          owner: "Aplikei Ops",
          currentStep,
          hasPendingRevision: hasRevisionRequested,
          priority: instanceStatusToPriority(row.status, totalSteps, completedSteps, hasRevisionRequested),
          status: instanceStatusToCaseStatus(row.status, totalSteps, completedSteps, hasRevisionRequested),
          updatedAt: row.updated_at,
        } satisfies CaseRecord;
      });
  } catch {
    return [];
  }
}

async function fetchRealCaseOnboarding(caseId: string): Promise<CaseOnboardingRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: inst, error: instErr } = await supabase
      .schema("aplikei")
      .from("user_product_instances")
      .select("id, status, created_at, updated_at, user_id, product:products(slug, name)")
      .eq("id", caseId)
      .maybeSingle();

    if (instErr || !inst) return null;

    const row = inst as unknown as Omit<InstanceRow, "steps">;
    const slug = row.product?.slug ?? "";
    const serviceMeta = getServiceBySlug(slug);
    const userNames = await fetchUserNames([row.user_id]);
    const customerName = userNames[row.user_id] ?? "Cliente";

    // Query steps directly — bypasses the preferMockWorkflow flag in workflowService
    // since admin always needs real data regardless of the customer-facing workflow state.
    const { data: stepsData, error: stepsErr } = await supabase
      .schema("aplikei")
      .from("user_steps")
      .select("*, product_step:product_steps(*)")
      .eq("user_product_id", caseId)
      .order("product_step(order)", { ascending: true });

    if (stepsErr) {
      console.warn("[caseService] Failed to load steps from Supabase:", stepsErr.message);
      return null;
    }

    const steps = sortStepsByProductOrder((stepsData ?? []) as unknown as UserStep[]);
    const totalSteps = steps.length;
    const completedSteps = steps.filter(
      (s) => s.status === "approved" || s.status === "completed" || s.status === "skipped",
    ).length;

    const firstActiveIdx = steps.findIndex(
      (s) => s.status === "in_progress" || s.status === "in_review",
    );

    const caseSteps: CaseOnboardingStep[] = steps.map((step, index) => {
      const isCompleted = step.status === "approved" || step.status === "completed" || step.status === "skipped";

      const stepStatus: CaseOnboardingStep["status"] = isCompleted
        ? "done"
        : index === firstActiveIdx
          ? "in_progress"
          : "pending";

      const stringifyData = (data: Record<string, unknown>): Record<string, CasePayloadValue> => {
        const result: Record<string, CasePayloadValue> = {};
        for (const [k, v] of Object.entries(data)) {
          if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null) {
            result[k] = v as CasePayloadValue;
          } else {
            result[k] = JSON.stringify(v);
          }
        }
        return result;
      };

      const logicalStepId =
        serviceMeta?.steps?.[index]?.id ??
        step.product_step?.id ??
        step.id;

      return {
        id: logicalStepId,
        title: step.product_step?.title ?? `Etapa ${index + 1}`,
        owner: customerName,
        dueLabel: isCompleted ? "Concluído" : stepStatus === "in_progress" ? "Atual" : "Próxima etapa",
        status: stepStatus,
        // receivedData = data submitted by the customer (form fields, etc.)
        // The admin UI reads receivedData to show what the customer filled in.
        receivedData: step.data ? stringifyData(step.data) : {},
        // sentData = step metadata (status, order info for admin panels)
        sentData: {
          current_step: index,
          step_order: String(step.product_step?.order ?? index + 1),
          step_type: step.product_step?.type ?? "unknown",
          step_db_id: step.id,
        },
      };
    });

    const currentStepObj = steps[firstActiveIdx];
    const currentStageTitle = currentStepObj?.product_step?.title
      ?? serviceMeta?.title
      ?? "Processo em andamento";

    return {
      caseId,
      intakeOwner: "Aplikei Ops",
      checklistCompletion: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      currentStage: currentStageTitle,
      notes: [
        `Cliente: ${customerName}`,
        `Produto: ${serviceMeta?.title ?? slug}`,
        `Status: ${row.status}`,
      ],
      steps: caseSteps,
      timeline: [
        {
          id: `${caseId}-created`,
          title: "Case criado",
          description: `Processo ${serviceMeta?.title ?? slug} iniciado.`,
          createdAt: row.created_at,
        },
        {
          id: `${caseId}-updated`,
          title: "Última atualização",
          description: `Progresso atualizado.`,
          createdAt: row.updated_at,
        },
      ],
      logs: [
        {
          id: `${caseId}-log-created`,
          level: "info",
          action: "Case carregado do banco de dados",
          actorType: "system",
          actorName: "Cases service",
          details: `Instância ${caseId} (${slug})`,
          createdAt: row.updated_at,
        },
      ],
    };
  } catch (err) {
    console.warn("[caseService] fetchRealCaseOnboarding failed:", err);
    return null;
  }
}

// ─── Mock fallback (Hardcoded for stability) ───────────────────────────────────

function listMockCases() {
  const HARDCODED_CASES: CaseRecord[] = [
    { id: "CASE-901", customer: "Ana Silva",      visaType: "B1/B2",       owner: "Sarah",  currentStep: "Validação documental", priority: "high",   status: "in_review",   updatedAt: "2026-04-27T15:20:00.000Z" },
    { id: "CASE-902", customer: "Carlos Costa",   visaType: "F-1",         owner: "Bruno",  currentStep: "Recebimento do I-20",  priority: "medium", status: "docs_pending", updatedAt: "2026-04-27T13:10:00.000Z" },
    { id: "CASE-903", customer: "Mariana Lima",   visaType: "Troca Status",owner: "Bianca", currentStep: "Validação de status",  priority: "high",   status: "attention",   updatedAt: "2026-04-26T17:40:00.000Z" },
    { id: "CASE-904", customer: "John Miller",    visaType: "B1/B2",       owner: "Bruno",  currentStep: "Em andamento",         priority: "low",    status: "docs_pending", updatedAt: "2026-04-25T14:55:00.000Z" },
    { id: "CASE-905", customer: "Gustavo Alves",  visaType: "B1/B2",       owner: "Sarah",  currentStep: "Revisão consular",     priority: "medium", status: "in_review",   updatedAt: "2026-04-26T11:15:00.000Z" },
  ];

  return HARDCODED_CASES.map((record) => ({
    record,
    onboarding: null as CaseOnboardingRecord | null,
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const caseService = {
  async listCases(filters: CaseFilters = {}): Promise<CaseRecord[]> {
    const realCases = await fetchRealCases();

    if (realCases.length > 0) {
      return sortCases(realCases).filter((r) => matchesFilters(r, filters));
    }

    const mockCases = listMockCases().map((d) => d.record);
    return sortCases(mockCases).filter((r) => matchesFilters(r, filters));
  },

  async getCaseById(caseId: string): Promise<CaseRecord | null> {
    const realCases = await fetchRealCases();
    const real = realCases.find((r) => r.id === caseId);
    if (real) return real;

    return listMockCases().find((d) => d.record.id === caseId)?.record ?? null;
  },

  async getCaseOnboardingById(caseId: string): Promise<CaseOnboardingRecord | null> {
    const real = await fetchRealCaseOnboarding(caseId);
    if (real) return real;

    return listMockCases().find((d) => d.record.id === caseId)?.onboarding ?? null;
  },

  async getCaseDetail(caseId: string): Promise<CaseDetail | null> {
    const realCases = await fetchRealCases();
    const realRecord = realCases.find((r) => r.id === caseId);

    if (realRecord) {
      const onboarding = await fetchRealCaseOnboarding(caseId);
      return { record: realRecord, onboarding };
    }

    return listMockCases().find((d) => d.record.id === caseId) ?? null;
  },
};
