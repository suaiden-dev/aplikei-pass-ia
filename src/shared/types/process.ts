export type ProcessStatus =
  | 'pending'
  | 'active'
  | 'awaiting_review'
  | 'completed'
  | 'rejected'
  | 'denied'
  | 'cancelled';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export interface StepData {
  [key: string]: unknown;
}

import type { UserService as FeatureUserService } from '@features/process/types';

export type UserService = FeatureUserService;

export interface ServiceMeta {
  title?: string;
  steps?: { title: string; description?: string }[];
  processType?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
}

export type USCISOutcome = 'approved' | 'denied' | 'rfe';
export type MotionOutcome = 'approved' | 'rejected';
export type RFEOutcome = 'approved' | 'rfe' | 'denied';

export interface ProcessResults {
  uscis_official_result?: USCISOutcome;
  uscis_rfe_result?: RFEOutcome;
  motion_final_result?: MotionOutcome;
  interview_outcome?: string;
  admin_feedback?: string;
  rejected_at?: string;
  rejected_items?: string[];
}

export function isProcessApproved(proc: UserService): boolean {
  const stepData = (proc.step_data || {}) as StepData;
  const uscisResult = stepData.uscis_official_result as string | undefined;
  const rfeResult = stepData.uscis_rfe_result as string | undefined;
  const motionResult = stepData.motion_final_result as string | undefined;
  const interviewResult = stepData.interview_outcome as string | undefined;

  const hasApprovedOutcome = (
    uscisResult === 'approved' ||
    rfeResult === 'approved' ||
    motionResult === 'approved' ||
    interviewResult === 'approved'
  );

  return proc.status === 'completed' && hasApprovedOutcome;
}

export function isProcessDenied(proc: UserService): boolean {
  const stepData = (proc.step_data || {}) as StepData;
  const motionResult = stepData.motion_final_result as string | undefined;
  const interviewResult = stepData.interview_outcome as string | undefined;

  return (
    proc.status === 'rejected' ||
    proc.status === 'denied' ||
    motionResult === 'denied' ||
    motionResult === 'rejected' ||
    interviewResult === 'denied' ||
    interviewResult === 'rejected'
  );
}

export function isAnalysisServiceSlug(serviceSlug?: string): boolean {
  if (!serviceSlug) return false;
  const slug = serviceSlug.toLowerCase();
  return (
    slug.startsWith('analise-') ||
    slug.startsWith('mentoria-') ||
    slug.startsWith('consultoria-')
  );
}
