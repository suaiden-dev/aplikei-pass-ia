import { getServiceBySlug } from "@shared/data/services";
import type { UserService } from "../../process/types";

export function getAnalysisChatTitle(serviceSlug?: string): string {
  if (!serviceSlug) return "Especialista";

  const meta = getServiceBySlug(serviceSlug);
  const slug = serviceSlug.toLowerCase();
  const title = (meta?.title || "").toLowerCase();

  if (slug.includes("motion") || title.includes("motion")) return "Especialista Motion";
  if (slug.includes("rfe") || title.includes("rfe")) return "Especialista RFE";
  if (slug === "troca-status" || title.includes("(cos)")) return "Especialista COS";
  if (slug === "extensao-status" || title.includes("(eos)")) return "Especialista EOS";
  if (slug.includes("cos") || title.includes("cos")) return "Especialista COS";
  if (title.includes("especialista")) return meta?.title || "Especialista";

  return meta?.title || "Especialista";
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const meta = getServiceBySlug(serviceSlug);
  const title = (meta?.title || "").toLowerCase();
  const processType = (meta?.processType || "").toLowerCase();

  return (
    serviceSlug.toLowerCase().startsWith("analise-") ||
    title.includes("análise") ||
    title.includes("revisão") ||
    processType.includes("análise")
  );
}

const PROPOSAL_SLUGS = new Set([
  "proposta-rfe-motion",
  "apoio-rfe-motion-inicio",
  "analise-rfe-cos",
  "apoio-rfe-cos",
  "analise-especialista-cos",
  "analise-especialista-rfe",
]);

function isMotionOrCOSProcess(proc: UserService): boolean {
  const stepData = (proc.step_data || {}) as Record<string, unknown>;
  const history = Array.isArray(stepData.history)
    ? (stepData.history as Array<Record<string, unknown>>)
    : [];

  return (
    proc.service_slug.startsWith("troca-status") ||
    proc.service_slug.startsWith("extensao-status") ||
    proc.service_slug.includes("motion") ||
    history.some((cycle) => cycle?.type === "motion") ||
    Boolean(stepData.motion_payment_completed_at)
  );
}

function hasProposalPaid(stepData: Record<string, unknown>): boolean {
  const purchases = Array.isArray(stepData.purchases)
    ? (stepData.purchases as Array<Record<string, unknown>>)
    : [];
  if (purchases.some((p) => PROPOSAL_SLUGS.has(p?.slug as string))) return true;

  return Boolean(
    stepData.motion_payment_completed_at ||
    stepData.motion_proposal_paid ||
    stepData.rfe_proposal_paid ||
    stepData.motion_initial_paid ||
    stepData.rfe_initial_paid ||
    stepData.motion_analysis_paid ||
    stepData.motion_chat_started_at,
  );
}

export function isCustomerChatEligible(proc: UserService): boolean {
  const slug = (proc.service_slug || "").toLowerCase();
  if (
    slug.startsWith("mentoring-") ||
    slug.startsWith("mentoria-") ||
    slug === "consultoria-especialista" ||
    slug === "consultancy-negative-b1b2"
  ) {
    return true;
  }
  if (isAnalysisServiceSlug(proc.service_slug)) return true;
  if (isMotionOrCOSProcess(proc)) {
    return hasProposalPaid((proc.step_data || {}) as Record<string, unknown>);
  }
  return false;
}
