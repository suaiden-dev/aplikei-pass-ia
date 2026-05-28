import type { UserService } from "./types";

export function calculateProcessProgress(
  proc: Pick<UserService, "current_step" | "status" | "service_slug">,
  totalSteps: number,
): number {
  const step = proc.current_step ?? 0;
  const safeTotalSteps = Math.max(totalSteps, 1);
  const isConsular =
    proc.service_slug.startsWith("visto-b1-b2") ||
    proc.service_slug.startsWith("visto-f1") ||
    proc.service_slug.startsWith("visa-b1b2") ||
    proc.service_slug.startsWith("visa-f1");

  if (proc.status === "completed") return 100;
  if (!isConsular && step >= safeTotalSteps - 1) return 100;

  const maxProgress = isConsular ? 95 : 99;
  return Math.min(maxProgress, Math.round((step / safeTotalSteps) * 100));
}

export function isAnalysisSlug(slug: string): boolean {
  const lower = slug.toLowerCase();
  return (
    lower.startsWith("analise-") ||
    lower.startsWith("apoio-") ||
    lower.startsWith("revisao-") ||
    lower.startsWith("mentoria-") ||
    lower.startsWith("consultoria-") ||
    lower.startsWith("consultancy-") ||
    lower.startsWith("dependente-") ||
    lower.startsWith("slot-")
  );
}
