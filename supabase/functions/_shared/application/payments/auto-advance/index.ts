import { resolveSlugBehavior } from "../../../domain/catalog/slugs.ts";
import { type AutoAdvanceContext, type AutoAdvanceResult } from "./context.ts";
import { applyRfeAnalysisRule } from "./rules/rfe-analysis.ts";
import { applyRfeInitialRule } from "./rules/rfe-initial.ts";
import { applyMotionProposalRule } from "./rules/motion-proposal.ts";

// Dispatches to the correct auto-advance rule based on SLUG_BEHAVIOR.autoAdvance.
// Returns null when the slug has no auto-advance rule.
export function applyAutoAdvance(ctx: AutoAdvanceContext): AutoAdvanceResult | null {
  const rule = resolveSlugBehavior(ctx.service_slug).autoAdvance;

  switch (rule) {
    case "rfe-analysis": return applyRfeAnalysisRule(ctx);
    case "rfe-initial": return applyRfeInitialRule(ctx);
    case "motion-proposal": return applyMotionProposalRule(ctx);
    default: return null;
  }
}
