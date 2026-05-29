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
    lower.startsWith("consultancy-") ||
    lower.startsWith("dependente-") ||
    lower.startsWith("slot-") ||
    lower.includes("rfe") ||
    lower.includes("motion")
  );
}

export function useMyProcesses(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: userServices = [], isLoading } = useUserProcesses(userId);

  const grouped = useMemo(() => {
    const byId = new Map(userServices.map((s) => [s.id, s]));
    const childrenByParentId: Record<string, UserService[]> = {};
    const parentCandidates: UserService[] = [];

    for (const service of userServices) {
      const sd = (service.step_data ?? {}) as Record<string, unknown>;
      const parentId = String(sd.parent_process_id ?? "").trim();

      if (parentId && byId.has(parentId)) {
        if (!childrenByParentId[parentId]) childrenByParentId[parentId] = [];
        childrenByParentId[parentId].push(service);
        continue;
      }

      // Keep main products as parents, but also preserve orphan/legacy rows as top-level
      if (!isAnalysisSlug(service.service_slug) || !parentId) {
        parentCandidates.push(service);
      }
    }

    Object.keys(childrenByParentId).forEach((parentId) => {
      const sorted = childrenByParentId[parentId].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
      );

      // Deduplicate duplicated recovery rows (same slug/flow under same parent), keeping the most recent.
      const seen = new Set<string>();
      childrenByParentId[parentId] = sorted.filter((child) => {
        const sd = (child.step_data ?? {}) as Record<string, unknown>;
        const flowRaw = String(sd.workflow_type || "").toLowerCase();
        const flow =
          flowRaw === "motion" || flowRaw === "rfe"
            ? flowRaw
            : (child.service_slug.toLowerCase().includes("motion") ? "motion" : "rfe");
        const key = `${child.service_slug.toLowerCase()}::${flow}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

    parentCandidates.sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );

    return { parentCandidates, childrenByParentId };
  }, [userServices]);

  const others = useMemo(() => {
    return grouped.parentCandidates.filter((s) => {
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
  }, [grouped.parentCandidates]);

  const activeProcesses = useMemo(
    () =>
      grouped.parentCandidates.filter(
        (s) =>
          ACTIVE_STATUSES.includes(s.status ?? "") &&
          !hasApprovedOutcome(s) &&
          !hasDeniedOutcome(s) &&
          !others.find((o) => o.id === s.id),
      ),
    [grouped.parentCandidates, others],
  );

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["user-services", userId] });

  return {
    activeProcesses,
    historyProcesses: others as UserService[],
    childrenByParentId: grouped.childrenByParentId,
    userServices,
    isLoading,
    refetch,
  };
}
