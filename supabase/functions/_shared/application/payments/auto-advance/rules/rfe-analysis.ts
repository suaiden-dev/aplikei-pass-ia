import { type AutoAdvanceContext, type AutoAdvanceResult } from "../context.ts";
import { buildNextNegativeState } from "../../../../domain/payments/negativa.ts";
import { isMotionFlow } from "../detect-flow.ts";

// Triggered by: analise-motion, analysis-rfe-cos, analysis-rfe-eos
// Effect: moves process to waitingProposal; advances step based on flow type
export function applyRfeAnalysisRule(ctx: AutoAdvanceContext): AutoAdvanceResult {
  const { current_step, step_data, negativa } = ctx;
  const motion = isMotionFlow(step_data, current_step);

  const history = Array.isArray(step_data.history) ? [...step_data.history] : [];
  const activeCycleIndex = typeof step_data.active_cycle_index === "number"
    ? step_data.active_cycle_index
    : history.length - 1;
  if (history[activeCycleIndex]) {
    history[activeCycleIndex] = { ...history[activeCycleIndex], status: "waitingProposal" };
  }

  let next_step: number | null;
  if (motion) next_step = Math.max(current_step ?? 0, 20);
  else if (current_step === 13) next_step = 14;
  else next_step = (current_step ?? 0) + 1;

  return {
    next_step,
    extra_metadata: {
      history,
      workflow_status: "waitingProposal",
      recover: "waitingProposal",
      motion_analysis_paid: true,
    },
    next_negativa: buildNextNegativeState(negativa, motion ? "motion" : "rfe", { initial: true }),
  };
}
