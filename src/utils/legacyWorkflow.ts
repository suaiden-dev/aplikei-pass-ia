import type { StepConfig } from "../templates/ServiceDetailTemplate";

function isLegacyFinalShipStep(stepId: string) {
  return stepId.endsWith("_final_ship");
}

export function normalizeLegacyFinalShipStep(step: StepConfig): StepConfig {
  const isMotionStep = step.id.includes("motion");
  const isRFEStep = step.id.includes("rfe");
  const shouldNormalizeMotion = isMotionStep && (isLegacyFinalShipStep(step.id) || step.id.endsWith("_end"));
  const shouldNormalizeRFE = isRFEStep && (isLegacyFinalShipStep(step.id) || step.id.endsWith("_end"));

  if (shouldNormalizeMotion) {
    return {
      ...step,
      id: step.id.replace("_final_ship", "_end"),
      title: "Motion — Resultado",
      description: "Acompanhe o resultado final do seu Motion.",
      type: "admin_action",
    };
  }

  if (shouldNormalizeRFE) {
    return {
      ...step,
      id: step.id.replace("_final_ship", "_end"),
      title: "RFE — Resultado",
      description: "Acompanhe o resultado da sua resposta à RFE.",
      type: "admin_action",
    };
  }

  return step;
}

export function normalizeLegacyFinalShipSteps(steps: StepConfig[]): StepConfig[] {
  const seen = new Set<string>();

  return steps
    .map(normalizeLegacyFinalShipStep)
    .filter((step) => {
      if (seen.has(step.id)) return false;
      seen.add(step.id);
      return true;
    });
}

export function normalizeLegacyStepId(stepId?: string | null) {
  return stepId?.replace(/_cycle_\d+$/, "")?.replace(/_final_ship$/, "_end");
}
