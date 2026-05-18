export type CasePriority = "high" | "medium" | "low";

export type CaseStatus = "in_review" | "docs_pending" | "approved" | "attention";

export type CaseStepStatus = "done" | "in_progress" | "pending";

export type CaseLogLevel = "info" | "warning" | "success";

export type CaseActorType = "customer" | "admin" | "master" | "operator" | "system";

export type CasePayloadValue = string | number | boolean | null;

export interface CaseRecord {
  id: string;
  customer: string;
  visaType: string;
  owner: string;
  currentStep?: string;
  priority: CasePriority;
  status: CaseStatus;
  updatedAt: string;
}

export interface CaseOnboardingStep {
  id: string;
  title: string;
  owner: string;
  dueLabel: string;
  status: CaseStepStatus;
  sentData: Record<string, CasePayloadValue>;
  receivedData: Record<string, CasePayloadValue>;
}

export interface CaseOnboardingTimelineItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CaseOnboardingLogItem {
  id: string;
  level: CaseLogLevel;
  action: string;
  actorType: CaseActorType;
  actorName: string;
  details?: string;
  createdAt: string;
}

export interface CaseOnboardingRecord {
  caseId: string;
  intakeOwner: string;
  checklistCompletion: number;
  currentStage: string;
  notes: string[];
  steps: CaseOnboardingStep[];
  timeline: CaseOnboardingTimelineItem[];
  logs: CaseOnboardingLogItem[];
}

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  query?: string;
}

export interface CaseDetail {
  record: CaseRecord;
  onboarding: CaseOnboardingRecord | null;
}
