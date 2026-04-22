import { useState, useEffect, useMemo, useCallback } from "react";
import { processService, type UserService } from "../../services/process.service";

export interface MyProcessesControllerResult {
  activeProcesses: UserService[];
  historyProcesses: UserService[];
  userServices: UserService[];
  isLoading: boolean;
  refetch: () => void;
}

export function useMyProcessesController(
  userId: string | undefined
): MyProcessesControllerResult {
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await processService.getUserServices(userId);
      setUserServices(data);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const activeStatuses = useMemo(() => ["active", "awaiting_review"], []);

  const baseProducts = useMemo(() => {
    return userServices
      .filter(s =>
        !s.service_slug.toLowerCase().startsWith("analise-") &&
        !s.service_slug.toLowerCase().startsWith("apoio-") &&
        !s.service_slug.toLowerCase().startsWith("revisao-") &&
        !s.service_slug.toLowerCase().startsWith("mentoria-") &&
        !s.service_slug.toLowerCase().startsWith("consultoria-") &&
        !s.service_slug.toLowerCase().startsWith("dependente-") &&
        !s.service_slug.toLowerCase().startsWith("slot-") &&
        !s.service_slug.toLowerCase().includes("rfe") &&
        !s.service_slug.toLowerCase().includes("motion")
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [userServices]);

  const others = useMemo(() => {
    const newestActiveSlugs = new Set<string>();
    return baseProducts.filter((s) => {
      const stepData = (s.step_data || {}) as Record<string, unknown>;
      const isConsular = s.service_slug.startsWith("visto-b1-b2") || s.service_slug.startsWith("visto-f1");
      const isCOS = s.service_slug === 'troca-status' || s.service_slug === 'extensao-status';

      if (['completed', 'rejected', 'denied', 'cancelled'].includes(s.status)) return true;

      if (isConsular && stepData.interview_outcome) return true;
      if (isCOS && (s.current_step ?? 0) >= 19) return true;

      if (activeStatuses.includes(s.status)) {
         if (newestActiveSlugs.has(s.service_slug)) return true;
         newestActiveSlugs.add(s.service_slug);
      }
      return false;
    });
  }, [baseProducts, activeStatuses]);

  const activeProcesses = useMemo(() => {
    return baseProducts.filter((s) =>
      activeStatuses.includes(s.status) && !others.find(o => o.id === s.id)
    );
  }, [baseProducts, activeStatuses, others]);

  return {
    activeProcesses,
    historyProcesses: others,
    userServices,
    isLoading,
    refetch: fetchServices,
  };
}
