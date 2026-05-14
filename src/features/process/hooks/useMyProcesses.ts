import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserProcesses } from "./useUserProcesses";
import type { UserService } from "../types";

const ACTIVE_STATUSES = ["active", "awaiting_review"];
const FINAL_STATUSES = ["completed", "rejected", "denied", "cancelled"];

function hasApprovedOutcome(proc: UserService): boolean {
  const sd = (proc.step_data ?? {}) as Record<string, unknown>;
  return (
    sd["uscis_official_result"] === "approved" ||
    sd["uscis_rfe_result"] === "approved" ||
    sd["motion_final_result"] === "approved" ||
    sd["interview_outcome"] === "approved"
  );
}

function hasDeniedOutcome(proc: UserService): boolean {
  const sd = (proc.step_data ?? {}) as Record<string, unknown>;
  return (
    proc.status === "rejected" ||
    proc.status === "denied" ||
    sd["motion_final_result"] === "denied" ||
    sd["motion_final_result"] === "rejected" ||
    sd["interview_outcome"] === "denied" ||
    sd["interview_outcome"] === "rejected" ||
    sd["uscis_official_result"] === "denied" ||
    sd["uscis_official_result"] === "rejected" ||
    sd["uscis_rfe_result"] === "denied" ||
    sd["uscis_rfe_result"] === "rejected"
  );
}

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
    return baseProducts.filter((s) => {
      const sd = (s.step_data ?? {}) as Record<string, unknown>;
      const isConsular = s.service_slug.startsWith("visto-b1-b2") || s.service_slug.startsWith("visto-f1");
      const isCOS = s.service_slug === "troca-status" || s.service_slug === "extensao-status";
      const hasFinalApproved = hasApprovedOutcome(s);
      const hasFinalDenied = hasDeniedOutcome(s);

      if (FINAL_STATUSES.includes(s.status ?? "")) return true;
      if (hasFinalApproved || hasFinalDenied) return true;
      if (isConsular && sd["interview_outcome"]) return true;
      if (isCOS && (s.current_step ?? 0) >= 19) return true;
      return false;
    });
  }, [baseProducts]);

  const activeProcesses = useMemo(
    () =>
      baseProducts.filter(
        (s) =>
          ACTIVE_STATUSES.includes(s.status ?? "") &&
          !hasApprovedOutcome(s) &&
          !hasDeniedOutcome(s) &&
          !others.find((o) => o.id === s.id),
      ),
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
