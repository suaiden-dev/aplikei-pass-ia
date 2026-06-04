import { type AutoAdvanceContext, type AutoAdvanceResult } from "../context.ts";
import { buildNextNegativeState } from "../../../../domain/payments/negativa.ts";
import { isMotionFlow } from "../detect-flow.ts";

// Triggered by: proposta-rfe-motion, consultancy-motion-cos, consultancy-motion-eos
// Effect: advances step by 1; marks proposal as paid in correct workflow branch
export function applyMotionProposalRule(ctx: AutoAdvanceContext): AutoAdvanceResult {
  const { current_step, step_data, negativa, paid_amount, now } = ctx;
  const motion = isMotionFlow(step_data, current_step);
  const next_step = (current_step ?? 0) + 1;
  const currentNegativePayment =
    ((negativa.negative as Record<string, unknown>)?.payment as Record<string, unknown>) || {};

  if (motion) {
    return {
      next_step,
      extra_metadata: {
        motion_proposal_paid: true,
        motion_payment_completed_at: now,
        motion_amount_paid: paid_amount ?? null,
        workflow_status: "in_progress",
      },
      next_negativa: buildNextNegativeState(negativa, "motion", {
        proposal: true,
        proposal_amount: paid_amount ?? currentNegativePayment.proposal_amount ?? 0,
      }),
    };
  }

  const rfeCycles = Array.isArray(step_data.rfe_cycles) ? [...step_data.rfe_cycles] : [];
  const activeRfeIdx = (Number(step_data.active_rfe_cycle) || 1) - 1;
  if (rfeCycles[activeRfeIdx]) {
    rfeCycles[activeRfeIdx] = { ...rfeCycles[activeRfeIdx], status: "paid", paid_at: now };
  }

  return {
    next_step,
    extra_metadata: {
      rfe_proposal_paid: true,
      rfe_payment_completed_at: now,
      rfe_cycles: rfeCycles,
      workflow_status: "in_progress",
    },
    next_negativa: buildNextNegativeState(negativa, "rfe", {
      proposal: true,
      proposal_amount: paid_amount ?? currentNegativePayment.proposal_amount ?? 0,
    }),
  };
}
