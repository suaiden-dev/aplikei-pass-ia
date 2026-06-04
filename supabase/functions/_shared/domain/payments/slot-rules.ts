import { isAdditionalDependentPurchase } from "../catalog/slugs.ts";

export const FINAL_ORDER_STATUSES = ["paid", "complete", "completed", "succeeded"] as const;

export const LINKABLE_PARENT_STATUSES = [
  "active",
  "awaiting_review",
  "awaiting_payment",
  "paid",
  "approved",
  "completed",
  "rejected",
];

export function parseCount(value: unknown, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function calculateIncrementedSlots(
  currentCount: number,
  dependentsMetadata: number,
  serviceSlug: string,
  mainServiceSlug: string,
): number {
  if (isAdditionalDependentPurchase(serviceSlug)) {
    return currentCount + parseCount(dependentsMetadata, 1);
  }
  if (dependentsMetadata > currentCount && serviceSlug === mainServiceSlug) {
    return dependentsMetadata;
  }
  return currentCount;
}
