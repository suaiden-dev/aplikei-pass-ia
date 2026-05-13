import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import {
  servicesData,
  type ServiceMeta,
  getCanonicalSlug,
  getServiceBySlug,
  isSameService,
} from "../../../data/services";
import { useUserProcesses } from "./useUserProcesses";
import { calculateProcessProgress, isAnalysisSlug } from "../utils";
import type { UserService } from "../types";

export interface ActiveProcess {
  proc: UserService;
  displaySlug: string;
  service: ServiceMeta | undefined;
  progress: number;
  isApproved: boolean;
  isDenied: boolean;
  isFinalized: boolean;
}

export interface DashboardLabels {
  title: string;
  welcome: string;
  sections: {
    activeCases: string;
    activeCasesDesc: string;
    noActiveCases: string;
    noActiveCasesDesc: string;
    getCases: string;
    getCasesDesc: string;
  };
  products: Record<string, { label: string; category: string }>;
  badges: {
    approved: string;
    denied: string;
    finished: string;
    active: string;
    soldOut: string;
    available: string;
  };
  status: {
    uscisApproved: string;
    deniedEncerrado: string;
    awaitingRfe: string;
    inProgress: string;
  };
  serviceCard: {
    includedFeatures: string;
    accessProcess: string;
    unavailable: string;
    startNow: string;
    finishCurrentFirst: string;
  };
  progress: string;
}

const ACTIVE_STATUSES = ["active", "awaiting_review"];
const FINAL_STATUSES = ["completed", "rejected", "denied", "cancelled"];

function hasApprovedOutcome(proc: UserService): boolean {
  const sd = (proc.step_data ?? {}) as Record<string, unknown>;
  return (
    proc.status === "completed" ||
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

export function useDashboard(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: userServices = [], isLoading: isLoadingServices } = useUserProcesses(userId);

  const { data: activeServices = {}, isLoading: isPricesLoading } = useQuery({
    queryKey: ["service-prices"],
    queryFn: async () => {
      const { data: prices } = await supabase
        .from("services_prices")
        .select("service_id, is_active");
      const map: Record<string, boolean> = {};
      (prices as { service_id: string; is_active: boolean }[] | null)?.forEach((p) => {
        map[p.service_id] = p.is_active;
      });
      return map;
    },
  });

  const baseProducts = useMemo(() =>
    userServices
      .filter((s) => !isAnalysisSlug(s.service_slug))
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()),
    [userServices],
  );

  const displaySlugByProcessId = useMemo(() => {
    const groups = new Map<string, UserService[]>();
    for (const proc of baseProducts) {
      const canonical = getCanonicalSlug(proc.service_slug);
      if (!groups.has(canonical)) groups.set(canonical, []);
      groups.get(canonical)!.push(proc);
    }

    const map = new Map<string, string>();
    for (const [canonical, list] of groups) {
      const sortedAsc = [...list].sort(
        (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
      );
      sortedAsc.forEach((proc, index) => {
        if (index === 0 || proc.service_slug.includes("reaplicacao")) {
          map.set(proc.id, proc.service_slug);
          return;
        }
        const reappSlug = `${canonical}-reaplicacao`;
        map.set(proc.id, getServiceBySlug(reappSlug) ? reappSlug : proc.service_slug);
      });
    }
    return map;
  }, [baseProducts]);

  const others = useMemo(() => {
    return baseProducts.filter((s) => {
      const sd = (s.step_data ?? {}) as Record<string, unknown>;
      const isConsular = isSameService(s.service_slug, "visto-b1-b2") || isSameService(s.service_slug, "visto-f1");
      const isCOS = isSameService(s.service_slug, "troca-status") || isSameService(s.service_slug, "extensao-status");
      const hasFinalApproved = hasApprovedOutcome(s);
      const hasFinalDenied = hasDeniedOutcome(s);

      if (FINAL_STATUSES.includes(s.status ?? "")) return true;
      if (hasFinalApproved || hasFinalDenied) return true;
      if (isConsular && sd["interview_outcome"]) return true;
      if (isCOS && (s.current_step ?? 0) >= 19) return true;
      return false;
    });
  }, [baseProducts]);

  const trulyActiveProcesses = useMemo((): ActiveProcess[] =>
    baseProducts
      .filter((s) =>
        ACTIVE_STATUSES.includes(s.status ?? "") &&
        !hasApprovedOutcome(s) &&
        !hasDeniedOutcome(s) &&
        !others.find((o) => o.id === s.id) &&
        !isAnalysisSlug(s.service_slug),
      )
      .map((proc) => {
        const service = getServiceBySlug(proc.service_slug);
        const isApproved = hasApprovedOutcome(proc);
        const isDenied = hasDeniedOutcome(proc);

        const isFinalized = proc.status === "completed" || proc.status === "rejected" || isApproved || isDenied;

        return {
          proc,
          displaySlug: displaySlugByProcessId.get(proc.id) ?? proc.service_slug,
          service,
          progress: isFinalized ? 100 : calculateProcessProgress(proc, service?.steps.length ?? 12),
          isApproved,
          isDenied,
          isFinalized,
        };
      }),
    [baseProducts, displaySlugByProcessId, others],
  );

  const ownedSlugs = useMemo(
    () => new Set(trulyActiveProcesses.map((p) => p.proc.service_slug)),
    [trulyActiveProcesses],
  );

  const availableServices = useMemo(
    () =>
      servicesData.filter(
        (s) =>
          !isAnalysisSlug(s.slug) &&
          !s.slug.toLowerCase().includes("reaplicacao") &&
          !s.slug.toLowerCase().includes("rfe") &&
          !s.slug.toLowerCase().includes("motion") &&
          !ownedSlugs.has(s.slug),
      ),
    [ownedSlugs],
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["user-services", userId] });
  }, [queryClient, userId]);

  return {
    trulyActiveProcesses,
    baseProducts,
    ownedSlugs,
    availableServices,
    activeStatuses: ACTIVE_STATUSES,
    isLoading: isLoadingServices || isPricesLoading,
    isPricesLoading,
    isLoadingServices,
    activeServices,
    refetch,
  };
}
