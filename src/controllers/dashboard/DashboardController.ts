import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { processService, type UserService } from '../../services/process.service';
import { servicesData, type ServiceMeta } from '../../data/services';

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

export interface UseDashboardControllerOptions {
  userId: string | undefined;
  labels: DashboardLabels;
}

export interface UseDashboardControllerResult {
  trulyActiveProcesses: ActiveProcess[];
  baseProducts: UserService[];
  ownedSlugs: Set<string>;
  availableServices: ServiceMeta[];
  activeStatuses: string[];
  isLoading: boolean;
  isPricesLoading: boolean;
  isLoadingServices: boolean;
  activeServices: Record<string, boolean>;
  refetch: () => void;
}

function calculatePhaseProgress(proc: UserService, totalSteps: number): number {
  const step = proc.current_step ?? 0;

  if (proc.status === 'completed') return 100;

  const isConsular = proc.service_slug.startsWith("visto-b1-b2") || proc.service_slug.startsWith("visto-f1");
  const maxProgress = isConsular ? 95 : 99;
  return Math.min(maxProgress, Math.round((step / (totalSteps || 1)) * 100));
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
    lower.startsWith("slot-")
  );
}

export function useDashboardController({
  userId,
}: UseDashboardControllerOptions): UseDashboardControllerResult {
  const queryClient = useQueryClient();

  const activeStatuses = useMemo(() => ["active", "awaiting_review"], []);

  const { data: userServices = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['user-services', userId],
    queryFn: async () => {
      if (!userId) return [];
      return processService.getUserServices(userId);
    },
    enabled: !!userId,
  });

  const { data: activeServices = {}, isLoading: isPricesLoading } = useQuery({
    queryKey: ['service-prices'],
    queryFn: async () => {
      const { data: prices } = await supabase.from("services_prices").select("service_id, is_active");
      const availabilityMap: Record<string, boolean> = {};
      (prices as { service_id: string; is_active: boolean }[] | null)?.forEach((p) => {
        availabilityMap[p.service_id] = p.is_active;
      });
      return availabilityMap;
    },
  });

  useEffect(() => {
    if (!userId) return;

    const channel1 = supabase
      .channel(`dashboard-realtime-legacy-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_services',
          filter: `user_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-services', userId] });
        }
      )
      .subscribe();

    const channel2 = supabase
      .channel(`dashboard-realtime-workflow-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'aplikei',
          table: 'user_product_instances',
          filter: `user_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['user-services', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [userId, queryClient]);

  const baseProducts = useMemo(() => {
    return userServices
      .filter(s => !isAnalysisSlug(s.service_slug))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [userServices]);

  const others = useMemo(() => {
    const newestActiveSlugs = new Set<string>();
    return baseProducts.filter((s) => {
      const stepData = (s.step_data || {}) as Record<string, unknown>;
      const isB1B2 = s.service_slug.startsWith("visto-b1-b2");
      const isF1 = s.service_slug.startsWith("visto-f1");
      const isCOS = s.service_slug === 'troca-status' || s.service_slug === 'extensao-status';

      if (['completed', 'rejected', 'denied', 'cancelled'].includes(s.status)) return true;
      if ((isB1B2 || isF1) && stepData.interview_outcome) return true;
      if (isCOS && (s.current_step ?? 0) >= 19) return true;

      if (activeStatuses.includes(s.status)) {
         if (newestActiveSlugs.has(s.service_slug)) return true;
         newestActiveSlugs.add(s.service_slug);
      }
      return false;
    });
  }, [baseProducts, activeStatuses]);

  const trulyActiveProcesses = useMemo(() => {
    return baseProducts
      .filter((s) =>
        activeStatuses.includes(s.status) &&
        !others.find(o => o.id === s.id) &&
        servicesData.some(sd => sd.slug === s.service_slug) &&
        !isAnalysisSlug(s.service_slug)
      )
      .map(proc => {
        const service = servicesData.find(s => s.slug === proc.service_slug);
        const totalSteps = service?.steps.length ?? 1;
        const stepData = (proc.step_data || {}) as Record<string, unknown>;

        const uscisResult = stepData.uscis_official_result as string | undefined;
        const rfeResult = stepData.uscis_rfe_result as string | undefined;
        const motionResult = stepData.motion_final_result as string | undefined;
        const interviewResult = stepData.interview_outcome as string | undefined;

        const isApproved =
          uscisResult === 'approved' ||
          rfeResult === 'approved' ||
          motionResult === 'approved' ||
          interviewResult === 'approved' ||
          proc.status === 'completed';

        const isDenied =
          proc.status === 'rejected' ||
          motionResult === 'denied' ||
          motionResult === 'rejected' ||
          interviewResult === 'denied' ||
          interviewResult === 'rejected';

        const isFinalized = proc.status === 'completed' || proc.status === 'rejected' || isApproved || isDenied;

        return {
          proc,
          service,
          progress: isFinalized ? 100 : calculatePhaseProgress(proc, totalSteps),
          isApproved,
          isDenied,
          isFinalized,
        };
      });
  }, [baseProducts, activeStatuses, others]);

  const ownedSlugs = useMemo(() => new Set(trulyActiveProcesses.map((p) => p.proc.service_slug)), [trulyActiveProcesses]);

  const availableServices = useMemo(() => {
    return servicesData.filter(s =>
      !isAnalysisSlug(s.slug) &&
      !s.slug.toLowerCase().includes("reaplicacao") &&
      !s.slug.toLowerCase().includes("rfe") &&
      !s.slug.toLowerCase().includes("motion") &&
      !ownedSlugs.has(s.slug)
    );
  }, [ownedSlugs]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['user-services', userId] });
  }, [queryClient, userId]);

  return {
    trulyActiveProcesses,
    baseProducts,
    ownedSlugs,
    availableServices,
    activeStatuses,
    isLoading: isLoadingServices || isPricesLoading,
    isPricesLoading,
    isLoadingServices,
    activeServices,
    refetch,
  };
}
