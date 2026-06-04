export type SlugStrategy = "chat-only" | "recovery-child" | "slot-addition" | "standalone";

export type AutoAdvanceRule = "rfe-analysis" | "rfe-initial" | "motion-proposal";

export type SlugBehavior = {
  strategy: SlugStrategy;
  recoveryWorkflow?: "motion" | "rfe";
  autoAdvance?: AutoAdvanceRule;
  forceStandalone?: boolean;
  isAuxiliary?: boolean;
};

// Single source of truth for per-slug behavior.
// To add a new service: add one entry here.
export const SLUG_BEHAVIOR: Readonly<Record<string, SlugBehavior>> = {
  // --- Main visa services (standalone, not auxiliary) ---
  "visto-b1-b2":     { strategy: "standalone" },
  "visa-b1b2":       { strategy: "standalone" },
  "visto-f1":        { strategy: "standalone" },
  "visa-f1":         { strategy: "standalone" },
  "visa-f1f2":       { strategy: "standalone" },
  "troca-status":    { strategy: "standalone" },
  "visa-cos":        { strategy: "standalone" },
  "extensao-status": { strategy: "standalone" },
  "visa-eos":        { strategy: "standalone" },

  // --- Standalone with forceStandalone (creates own process + mirrors to parent) ---
  "consultoria-especialista":    { strategy: "standalone", forceStandalone: true, isAuxiliary: true },
  "consultancy-negative-b1b2":  { strategy: "standalone", forceStandalone: true, isAuxiliary: true },
  "consultancy-negative-f1":    { strategy: "standalone", forceStandalone: true, isAuxiliary: true },
  "consultoria-f1-negativa":    { strategy: "standalone", forceStandalone: true, isAuxiliary: true },
  "mentoria-negativa-consular":  { strategy: "standalone", forceStandalone: true, isAuxiliary: true },

  // --- Chat-only (attach purchase to parent + open support chat, no new process) ---
  "mentoria-individual": { strategy: "chat-only", isAuxiliary: true },
  "mentoria-bronze":     { strategy: "chat-only", isAuxiliary: true },
  "mentoria-gold":       { strategy: "chat-only", isAuxiliary: true },

  // --- Slot additions (increment dependents on parent process) ---
  "dependente-adicional":  { strategy: "slot-addition", isAuxiliary: true },
  "slot-dependente":       { strategy: "slot-addition", isAuxiliary: true },
  "slot-dependente-cos":   { strategy: "slot-addition", isAuxiliary: true },
  "slot-vip":              { strategy: "slot-addition", isAuxiliary: true },
  "dependente-estudante":  { strategy: "slot-addition", isAuxiliary: true },
  "dependente-f1":         { strategy: "slot-addition", isAuxiliary: true },
  "dependente-b1-b2":      { strategy: "slot-addition", isAuxiliary: true },
  "dependent-f1":          { strategy: "slot-addition", isAuxiliary: true },
  "dependent-cos":         { strategy: "slot-addition", isAuxiliary: true },
  "dependent-eos":         { strategy: "slot-addition", isAuxiliary: true },

  // --- Recovery children: RFE workflow ---
  "analysis-rfe-cos":        { strategy: "recovery-child", recoveryWorkflow: "rfe", autoAdvance: "rfe-analysis", isAuxiliary: true },
  "analysis-rfe-eos":        { strategy: "recovery-child", recoveryWorkflow: "rfe", autoAdvance: "rfe-analysis", isAuxiliary: true },
  "analise-rfe-cos":         { strategy: "recovery-child", recoveryWorkflow: "rfe", autoAdvance: "rfe-analysis", isAuxiliary: true },
  "apoio-rfe-cos":           { strategy: "recovery-child", recoveryWorkflow: "rfe", isAuxiliary: true },
  "suporte-rfe-cos":         { strategy: "recovery-child", recoveryWorkflow: "rfe", isAuxiliary: true },
  "suporte-rfe-eos":         { strategy: "recovery-child", recoveryWorkflow: "rfe", isAuxiliary: true },
  "apoio-rfe-motion-inicio": { strategy: "recovery-child", recoveryWorkflow: "rfe", autoAdvance: "rfe-initial", isAuxiliary: true },

  // --- Recovery children: Motion workflow ---
  "analise-motion":          { strategy: "recovery-child", recoveryWorkflow: "motion", autoAdvance: "rfe-analysis", isAuxiliary: true },
  "analise-especialista-cos":{ strategy: "recovery-child", recoveryWorkflow: "motion", isAuxiliary: true },
  "proposta-rfe-motion":     { strategy: "recovery-child", recoveryWorkflow: "motion", autoAdvance: "motion-proposal", isAuxiliary: true },
  "consultancy-motion-cos":  { strategy: "recovery-child", recoveryWorkflow: "motion", autoAdvance: "motion-proposal", isAuxiliary: true },
  "consultancy-motion-eos":  { strategy: "recovery-child", recoveryWorkflow: "motion", autoAdvance: "motion-proposal", isAuxiliary: true },
  "recovery-cos":            { strategy: "recovery-child", recoveryWorkflow: "motion", isAuxiliary: true },
  "recovery-eos":            { strategy: "recovery-child", recoveryWorkflow: "motion", isAuxiliary: true },
};

// Pattern-based fallback for slugs not in the table.
// Mirrors the original predicate logic so new slugs work without table updates.
function inferSlugBehavior(slug: string): SlugBehavior {
  if (slug.startsWith("mentoring-") || slug.startsWith("mentoria-")) {
    return { strategy: "chat-only", isAuxiliary: true };
  }
  if (
    slug.includes("dependente-adicional") ||
    slug.includes("slot-dependente") ||
    slug.includes("slot-vip") ||
    slug.includes("dependente-estudante") ||
    slug.includes("dependente-f1") ||
    slug.includes("dependente-b1-b2")
  ) {
    return { strategy: "slot-addition", isAuxiliary: true };
  }
  const isAuxiliary =
    slug.includes("dependente") ||
    slug.includes("slot-") ||
    slug.startsWith("analise-") ||
    slug.startsWith("apoio-") ||
    slug.startsWith("revisao-") ||
    slug.startsWith("consultoria-") ||
    slug.includes("rfe-motion") ||
    slug.includes("-support");

  return { strategy: "standalone", isAuxiliary };
}

export function resolveSlugBehavior(slug: string): SlugBehavior {
  return SLUG_BEHAVIOR[slug] ?? inferSlugBehavior(slug);
}

// ---------------------------------------------------------------------------
// Compatibility helpers — delegate to the table instead of inline predicates.
// These replace the 5 scattered predicate functions.
// ---------------------------------------------------------------------------

export function isAdditionalDependentPurchase(slug: string): boolean {
  return resolveSlugBehavior(slug).strategy === "slot-addition";
}

export function isAuxiliaryService(slug: string): boolean {
  return resolveSlugBehavior(slug).isAuxiliary === true;
}

export function isRecoveryChild(slug: string): boolean {
  return resolveSlugBehavior(slug).strategy === "recovery-child";
}

export function shouldForceStandalone(slug: string): boolean {
  return resolveSlugBehavior(slug).forceStandalone === true;
}

export function shouldUseChatOnly(slug: string): boolean {
  return resolveSlugBehavior(slug).strategy === "chat-only";
}
