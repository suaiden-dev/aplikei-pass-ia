import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { servicesData, type ServiceMeta } from "../../../data/services";
import { useUserProcesses } from "./useUserProcesses";
import { calculateProcessProgress, isAnalysisSlug } from "../utils";
import type { UserService } from "../types";

export interface ActiveProcess {
  proc: UserService;
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

  const others = useMemo(() => {
    const newestActiveSlugs = new Set<string>();
    return baseProducts.filter((s) => {
      const sd = (s.step_data ?? {}) as Record<string, unknown>;
      const isConsular = s.service_slug.startsWith("visto-b1-b2") || s.service_slug.startsWith("visto-f1") || s.service_slug === "visa-b1b2" || s.service_slug === "visa-f1";
      const isCOS = s.service_slug === "troca-status" || s.service_slug === "extensao-status" || s.service_slug === "visa-cos" || s.service_slug === "visa-eos";

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

  const trulyActiveProcesses = useMemo((): ActiveProcess[] =>
    baseProducts
      .filter((s) =>
        ACTIVE_STATUSES.includes(s.status ?? "") &&
        !others.find((o) => o.id === s.id) &&
        !isAnalysisSlug(s.service_slug),
      )
      .map((proc) => {
        const service = servicesData.find((s) => s.slug === proc.service_slug);
        const sd = (proc.step_data ?? {}) as Record<string, unknown>;

        const isApproved =
          sd["uscis_official_result"] === "approved" ||
          sd["uscis_rfe_result"] === "approved" ||
          sd["motion_final_result"] === "approved" ||
          sd["interview_outcome"] === "approved" ||
          proc.status === "completed";

        const isDenied =
          proc.status === "rejected" ||
          sd["motion_final_result"] === "denied" ||
          sd["motion_final_result"] === "rejected" ||
          sd["interview_outcome"] === "denied" ||
          sd["interview_outcome"] === "rejected";

        const isFinalized = proc.status === "completed" || proc.status === "rejected" || isApproved || isDenied;

        return {
          proc,
          service,
          progress: isFinalized ? 100 : calculateProcessProgress(proc, service?.steps.length ?? 12),
          isApproved,
          isDenied,
          isFinalized,
        };
      }),
    [baseProducts, others],
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
