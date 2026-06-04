export const MOTION_NEGATIVE_STEP_IDS = [
  "cos_motion_acquisition",
  "cos_motion_instruction",
  "cos_motion_proposal",
  "cos_motion_accept_proposal",
  "cos_motion_end",
] as const;

export const RFE_NEGATIVE_STEP_IDS = [
  "cos_rfe_explanation",
  "cos_rfe_instruction",
  "cos_rfe_proposal",
  "cos_rfe_accept_proposal",
  "cos_rfe_final_ship",
  "cos_rfe_end",
] as const;

export function buildNegativeSteps(type: "motion" | "rfe") {
  const ids = type === "motion" ? MOTION_NEGATIVE_STEP_IDS : RFE_NEGATIVE_STEP_IDS;
  return ids.map((id) => ({ id, status: "pending" }));
}

export function buildNegativeRoot(type: "motion" | "rfe") {
  return {
    type,
    steps: buildNegativeSteps(type),
    payment: { initial: false, proposal: false, proposal_amount: 0 },
  };
}

export function buildNextNegativeState(
  currentNegativa: Record<string, unknown>,
  type: "motion" | "rfe",
  paymentPatch: Record<string, unknown>,
) {
  const currentNegative = (currentNegativa.negative as Record<string, unknown>) || buildNegativeRoot(type);
  const currentPayment = (currentNegative.payment as Record<string, unknown>) || {};

  return {
    ...currentNegativa,
    negative: {
      ...currentNegative,
      type,
      steps: Array.isArray(currentNegative.steps) && currentNegative.steps.length
        ? currentNegative.steps
        : buildNegativeSteps(type),
      payment: { initial: false, proposal: false, proposal_amount: 0, ...currentPayment, ...paymentPatch },
    },
  };
}
