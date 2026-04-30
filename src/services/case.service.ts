import { getSupabaseClient } from "../lib/supabase/client";
import { getServiceBySlug } from "../data/services";
import { readMockUsers, readUserServices } from "../mocks/customer-portal";
import { caseOnboardingRecords, caseRecords } from "../mocks/master-dashboard";
import type {
  CaseDetail,
  CaseFilters,
  CaseOnboardingRecord,
  CaseOnboardingStep,
  CasePayloadValue,
  CaseRecord,
} from "../models/case.model";
import { isAnalysisServiceSlug, isProcessApproved, isProcessDenied, type UserService } from "../models/process.model";
import type { UserStep } from "./workflow.service";

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
): CaseRecord["status"] {
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
): CaseRecord["priority"] {
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
          priority: instanceStatusToPriority(row.status, totalSteps, completedSteps),
          status: instanceStatusToCaseStatus(row.status, totalSteps, completedSteps),
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

    const steps = (stepsData ?? []) as unknown as UserStep[];
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

      return {
        id: step.id,
        title: step.product_step?.title ?? `Etapa ${index + 1}`,
        owner: customerName,
        dueLabel: isCompleted ? "Concluído" : stepStatus === "in_progress" ? "Atual" : "Próxima etapa",
        status: stepStatus,
        // receivedData = data submitted by the customer (form fields, etc.)
        // The admin UI reads receivedData to show what the customer filled in.
        receivedData: step.data ? stringifyData(step.data) : {},
        // sentData = step metadata (status, order info for admin panels)
        sentData: {
          step_order: String(step.product_step?.order ?? index + 1),
          step_type: step.product_step?.type ?? "unknown",
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

// ─── Mock fallback ────────────────────────────────────────────────────────────

function buildCaseRecordFromMockService(service: UserService): CaseRecord {
  const serviceMeta = getServiceBySlug(service.service_slug);
  const mockUser = readMockUsers().find((u) => u.id === service.user_id);

  const status: CaseRecord["status"] = isProcessApproved(service)
    ? "approved"
    : isProcessDenied(service)
      ? "attention"
      : service.status === "awaiting_review"
        ? "in_review"
        : "docs_pending";

  const priority: CaseRecord["priority"] = isProcessDenied(service)
    ? "high"
    : service.status === "awaiting_review"
      ? "medium"
      : (service.current_step ?? 0) > 3
        ? "medium"
        : "low";

  const stepIndex = Math.max(0, service.current_step ?? 0);
  const currentStep =
    serviceMeta?.steps?.[stepIndex]?.title ??
    serviceMeta?.steps?.[0]?.title ??
    "Em andamento";

  return {
    id: service.id,
    customer: mockUser?.name ?? "Cliente",
    visaType: serviceMeta?.title ?? service.service_slug,
    owner: "Aplikei Ops",
    currentStep,
    priority,
    status,
    updatedAt: service.updated_at,
  };
}

function listMockCases() {
  const dynamic = readUserServices()
    .filter((s) => {
      const slug = s.service_slug.toLowerCase();
      return shouldIncludeAsCase(slug) && Boolean(getServiceBySlug(s.service_slug));
    })
    .map((service) => ({
      record: buildCaseRecordFromMockService(service),
      onboarding: null as CaseOnboardingRecord | null,
    }));

  const staticCases = caseRecords.map((record) => {
    const onboarding = caseOnboardingRecords.find((item) => item.caseId === record.id) ?? null;
    const currentStep = onboarding?.currentStage;
    return {
      record: currentStep ? { ...record, currentStep } : record,
      onboarding,
    };
  });

  const merged = new Map<string, CaseDetail>();
  staticCases.forEach((d) => merged.set(d.record.id, d));
  dynamic.forEach((d) => merged.set(d.record.id, d));
  return Array.from(merged.values());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const caseService = {
  async listCases(filters: CaseFilters = {}): Promise<CaseRecord[]> {
    // Try real Supabase data first
    const realCases = await fetchRealCases();

    if (realCases.length > 0) {
      return sortCases(realCases).filter((r) => matchesFilters(r, filters));
    }

    // Fallback to mocks if no real data
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
