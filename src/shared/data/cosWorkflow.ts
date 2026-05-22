import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "./workflowTemplates";

export const COS_BASE_STEP_COUNT = 12;
export const COS_RFE_START_STEP = 13;
export const COS_RFE_INSTRUCTION_STEP = 14;
export const COS_RFE_PROPOSAL_STEP = 15;
export const COS_RFE_ACCEPT_PROPOSAL_STEP = 16;
export const COS_RFE_FINAL_SHIP_STEP = 17;
export const COS_RFE_END_STEP = 18;
export const COS_MOTION_ACQUISITION_STEP = 19;
export const COS_MOTION_INSTRUCTION_STEP = 20;
export const COS_MOTION_PROPOSAL_STEP = 21;
export const COS_MOTION_ACCEPT_PROPOSAL_STEP = 22;
export const COS_MOTION_END_STEP = 23;

export type CosRecoveryType = "motion" | "rfe";

export interface CosWorkflowCycleLike {
  type?: string;
  steps?: Array<{ id?: string }>;
}

export function isCosServiceSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return slug === "troca-status" || slug === "extensao-status";
}

export function isCosInitialAnalysisStep(stepId?: string | null): boolean {
  if (!stepId) return false;
  const baseStepId = stepId.replace(/_cycle_\d+$/, "").replace(/_final_ship$/, "_end");
  return baseStepId === "cos_analysis_form_docs" || baseStepId === "cos_admin_analysis";
}

export function getCosRecoveryTemplate(type: CosRecoveryType) {
  return type === "motion" ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE;
}

export function getCosOnboardingStepTargetFromStepId(
  idx: number,
  rawStepId?: string,
): number {
  const baseId = String(rawStepId ?? "")
    .replace(/_cycle_\d+$/, "")
    .replace(/_final_ship$/, "_end");

  const rfeIdx = RFE_STEPS_TEMPLATE.findIndex((s) => s.id === baseId);
  if (rfeIdx !== -1) return COS_RFE_START_STEP + rfeIdx;

  const motionIdx = MOTION_STEPS_TEMPLATE.findIndex((s) => s.id === baseId);
  if (motionIdx !== -1) return COS_MOTION_ACQUISITION_STEP + motionIdx;

  return Math.max(0, Math.min(COS_MOTION_END_STEP, idx));
}

export function getCosVisualStepIndexForProcessStep(
  currentStep: number,
  baseStepCount: number,
  history: CosWorkflowCycleLike[] = [],
  expandedStepCount = baseStepCount,
): number {
  if (currentStep <= baseStepCount - 1) return currentStep;

  const cycleStartIndexes: Array<{ type: string; start: number; length: number }> = [];
  let cursor = baseStepCount;

  history.forEach((cycle) => {
    const template = getCosRecoveryTemplate((cycle.type === "motion" ? "motion" : "rfe"));
    const steps = Array.isArray(cycle.steps) && cycle.steps.length > 0 ? cycle.steps : template;
    const length = steps.length;
    cycleStartIndexes.push({
      type: String(cycle.type || ""),
      start: cursor,
      length,
    });
    cursor += length;
  });

  if (currentStep >= COS_RFE_START_STEP && currentStep <= COS_RFE_END_STEP) {
    const rfeCycle = [...cycleStartIndexes].reverse().find((cycle) => cycle.type === "rfe");
    if (rfeCycle) {
      const offset = Math.min(currentStep - COS_RFE_START_STEP, Math.max(rfeCycle.length - 1, 0));
      return rfeCycle.start + offset;
    }
    return Math.min(baseStepCount - 1, Math.max(expandedStepCount - 1, 0));
  }

  if (currentStep >= COS_MOTION_ACQUISITION_STEP && currentStep <= COS_MOTION_END_STEP) {
    const motionCycle = [...cycleStartIndexes].reverse().find((cycle) => cycle.type === "motion");
    if (motionCycle) {
      const offset = Math.min(
        currentStep - COS_MOTION_ACQUISITION_STEP,
        Math.max(motionCycle.length - 1, 0),
      );
      return motionCycle.start + offset;
    }
    return Math.min(baseStepCount - 1, Math.max(expandedStepCount - 1, 0));
  }

  return Math.min(currentStep, Math.max(expandedStepCount - 1, 0));
}

export function getCosPostPaymentTargetStep(input: {
  slug: string;
  stage?: string | null;
  flow?: CosRecoveryType | null;
}): number | null {
  const slug = input.slug.toLowerCase();
  const stage = String(input.stage || "").toLowerCase();
  const flow = input.flow ?? null;

  if (stage === "proposal") {
    if (flow === "rfe") return COS_RFE_FINAL_SHIP_STEP;
    if (flow === "motion") return COS_MOTION_END_STEP;
  }

  const isRFEAnalysis = ["analysis-rfe-cos", "analysis-rfe-eos", "apoio-rfe-motion-inicio", "analise-rfe-cos", "analise-rfe-eos"].includes(slug);
  const isMotionProposal = ["consultancy-motion-cos", "consultancy-motion-eos", "proposta-rfe-motion"].includes(slug);

  if (flow === "rfe") return COS_RFE_INSTRUCTION_STEP;
  if (flow === "motion") return COS_MOTION_INSTRUCTION_STEP;

  if (stage === "proposal") {
    if (isRFEAnalysis) return COS_RFE_FINAL_SHIP_STEP;
    if (isMotionProposal) return COS_MOTION_END_STEP;
  }

  if (isRFEAnalysis) return COS_RFE_INSTRUCTION_STEP;
  if (isMotionProposal) return COS_MOTION_INSTRUCTION_STEP;

  return null;
}

export function getCosPaymentStageTarget(input: {
  fromStep?: number | null;
  slug: string;
  stage?: string | null;
  flow?: CosRecoveryType | null;
}): number | null {
  const explicitTarget = getCosPostPaymentTargetStep({
    slug: input.slug,
    stage: input.stage,
    flow: input.flow,
  });
  if (explicitTarget != null) return explicitTarget;

  const fromStep = Number(input.fromStep ?? 0);
  if (input.flow === "motion") {
    if (fromStep >= COS_MOTION_PROPOSAL_STEP) return COS_MOTION_END_STEP;
    return COS_MOTION_INSTRUCTION_STEP;
  }
  if (input.flow === "rfe") {
    if (fromStep >= COS_RFE_PROPOSAL_STEP) return COS_RFE_FINAL_SHIP_STEP;
    return COS_RFE_INSTRUCTION_STEP;
  }
  return null;
}
