import type { StepData } from "@shared/types/process.model";

export type CosStepData = StepData & {
  admin_feedback?: string;
  rejected_items?: string[];
  motion_final_result?: string;
  uscis_official_result?: string;
  uscis_rfe_result?: string;
  motion_reason?: string;
  motion_proposal_sent_at?: string;
  motion_payment_completed_at?: string;
  workflow_status?: string;
  parent_process_id?: string;
  parent_service_slug?: string;
  paid_dependents?: number;
  purchases?: Array<{
    slug?: string;
    service_slug?: string;
  }>;
  docs?: Record<string, string>;
  dependents?: Array<{
    id: string;
    name: string;
    birthDate?: string;
    i94Date?: string;
    [key: string]: unknown;
  }>;
  i539?: Record<string, unknown> & {
    hasMiddleName?: boolean;
    totalPeople?: string;
    numberOfCoApplicants?: string | number;
    newStatusDropdown?: string;
  };
  targetVisa?: string;
  currentVisa?: string;
  uscis_boleto_path?: string;
  coverLetter?: unknown;
  finalForms?: unknown;
};

export function getCosStepData(stepData: unknown): CosStepData {
  return (stepData && typeof stepData === "object" ? stepData : {}) as CosStepData;
}
