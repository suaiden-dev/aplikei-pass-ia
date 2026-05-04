import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProcesses } from "./useUserProcesses";
import type { UserService } from "../types";

const ACTIVE_STATUSES = ["active", "awaiting_review"];
const FINAL_STATUSES = ["completed", "rejected", "denied", "cancelled"];

function isAnalysisSlug(slug: string): boolean {
  const lower = slug.toLowerCase();
  return (
    lower.startsWith("analise-") ||
    lower.startsWith("apoio-") ||
    lower.startsWith("revisao-") ||
    lower.startsWith("mentoria-") ||
    lower.startsWith("consultoria-") ||
    lower.startsWith("dependente-") ||
    lower.startsWith("slot-") ||
    lower.includes("rfe") ||
    lower.includes("motion")
  );
}

export function useMyProcesses(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: userServices = [], isLoading } = useUserProcesses(userId);

  const baseProducts = useMemo(
    () =>
      userServices
        .filter((s) => !isAnalysisSlug(s.service_slug))
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()),
    [userServices],
  );

  const others = useMemo(() => {
    const newestActiveSlugs = new Set<string>();
    return baseProducts.filter((s) => {
      const sd = (s.step_data ?? {}) as Record<string, unknown>;
      const isConsular = s.service_slug.startsWith("visto-b1-b2") || s.service_slug.startsWith("visto-f1");
      const isCOS = s.service_slug === "troca-status" || s.service_slug === "extensao-status";

      if (FINAL_STATUSES.includes(s.status ?? "")) return true;
      if (isConsular && sd["interview_outcome"]) return true;
      if (isCOS && (s.current_step ?? 0) >= 19) return true;

      if (ACTIVE_STATUSES.includes(s.status ?? "")) {
        if (newestActiveSlugs.has(s.service_slug)) return true;
        newestActiveSlugs.add(s.service_slug);
      }
      return false;
    });
  }, [baseProducts]);

  const activeProcesses = useMemo(
    () => baseProducts.filter((s) => ACTIVE_STATUSES.includes(s.status ?? "") && !others.find((o) => o.id === s.id)),
    [baseProducts, others],
  );

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["user-services", userId] });

  return {
    activeProcesses,
    historyProcesses: others as UserService[],
    userServices,
    isLoading,
    refetch,
  };
}
