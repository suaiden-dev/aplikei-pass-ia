import { type AutoAdvanceContext, type AutoAdvanceResult } from "../context.ts";
import { buildNextNegativeState } from "../../../../domain/payments/negativa.ts";
import { isMotionFlow } from "../detect-flow.ts";

// Triggered by: apoio-rfe-motion-inicio
// Effect: marks initial payment as paid; advances step if needed; updates active RFE cycle
export function applyRfeInitialRule(ctx: AutoAdvanceContext): AutoAdvanceResult {
  const { current_step, step_data, negativa, now } = ctx;
  const motion = isMotionFlow(step_data, current_step);

  let next_step = current_step;
  if (motion) next_step = Math.max(current_step ?? 0, 20);
  else if (current_step === 13) next_step = 14;

  const rfeCycles = Array.isArray(step_data.rfe_cycles) ? [...step_data.rfe_cycles] : [];
  const activeRfeIdx = (Number(step_data.active_rfe_cycle) || 1) - 1;
  if (rfeCycles[activeRfeIdx]) {
    rfeCycles[activeRfeIdx] = { ...rfeCycles[activeRfeIdx], status: "paid", paid_at: now };
  }

  return {
    next_step,
    extra_metadata: {
      motion_initial_paid: true,
      rfe_initial_paid: true,
      rfe_cycles: rfeCycles,
    },
    next_negativa: buildNextNegativeState(negativa, motion ? "motion" : "rfe", { initial: true }),
  };
}
