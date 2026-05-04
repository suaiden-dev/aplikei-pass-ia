import type {
  UserServiceRow,
  UserServiceInsert as UserServiceInsertDb,
  UserServiceUpdate as UserServiceUpdateDb,
} from "../../shared/db/types";

// ── DB-derived types (fonte única: gerado pelo Supabase) ──────────────────────
export type UserService = UserServiceRow;
export type UserServiceInsert = UserServiceInsertDb;
export type UserServiceUpdate = UserServiceUpdateDb;


// ── Domain types ──────────────────────────────────────────────────────────────

export type ProcessStatus =
  | "pending"
  | "active"
  | "awaiting_review"
  | "completed"
  | "rejected"
  | "denied"
  | "cancelled";

export type StepStatus = "pending" | "in_progress" | "completed" | "rejected";

export interface StepData {
  [key: string]: unknown;
}

// ── Workflow types ─────────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
}

export interface WorkflowCycle {
  type: "motion" | "rfe";
  id: string;
  started_at: string;
  current_step: number;
  status: "not_started" | "in_progress" | "completed" | "denied";
  steps: WorkflowStep[];
}

export interface MotionWorkflowData {
  recover?: "not_started" | "in_progress" | "completed";
  workflow_status?: "not_started" | "in_progress" | "completed" | "denied";
  history?: WorkflowCycle[];
  active_cycle_index?: number;
}

export interface RFEWorkflowData {
  recover?: "not_started" | "rfeInit" | "in_progress" | "completed";
  workflow_status?: "not_started" | "rfeInit" | "in_progress" | "completed" | "denied";
  history?: WorkflowCycle[];
  active_cycle_index?: number;
  uscis_rfe_result?: string;
}

export interface WorkflowTemplateStep {
  title: string;
  description?: string;
}

export const MOTION_STEPS_TEMPLATE: WorkflowTemplateStep[] = [
  { title: "Aquisição do Motion", description: "Compra do Motion junto ao USCIS" },
  { title: "Preparação da Resposta", description: "Preparação dos documentos para resposta RFE" },
  { title: "Revisão Jurídica", description: "Revisão final da resposta" },
  { title: "Envio ao USCIS", description: "Submissão da resposta" },
];

export const RFE_STEPS_TEMPLATE: WorkflowTemplateStep[] = [
  { title: "Análise do RFE", description: "Análise do motivo do RFE" },
  { title: "Coleta de Documentos", description: "Coleta dos documentos solicitados" },
  { title: "Preparação da Resposta", description: "Preparação da resposta formal" },
  { title: "Revisão", description: "Revisão final" },
  { title: "Envio", description: "Envio ao USCIS" },
];

// ── Utility functions ─────────────────────────────────────────────────────────

export function isProcessApproved(proc: UserService): boolean {
  const stepData = (proc.step_data ?? {}) as StepData;
  return (
    stepData["uscis_official_result"] === "approved" ||
    stepData["uscis_rfe_result"] === "approved" ||
    stepData["motion_final_result"] === "approved" ||
    stepData["interview_outcome"] === "approved" ||
    proc.status === "completed"
  );
}

export function isProcessDenied(proc: UserService): boolean {
  const stepData = (proc.step_data ?? {}) as StepData;
  const motionResult = stepData["motion_final_result"] as string | undefined;
  const interviewResult = stepData["interview_outcome"] as string | undefined;
  return (
    proc.status === "rejected" ||
    proc.status === "denied" ||
    motionResult === "denied" ||
    motionResult === "rejected" ||
    interviewResult === "denied" ||
    interviewResult === "rejected"
  );
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const slug = serviceSlug.toLowerCase();
  return (
    slug.startsWith("analise-") ||
    slug.startsWith("mentoria-") ||
    slug.startsWith("consultoria-")
  );
}
