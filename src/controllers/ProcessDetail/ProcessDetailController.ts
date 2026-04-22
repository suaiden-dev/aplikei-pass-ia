import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { processService, type UserService } from "../../services/process.service";
import { getServiceBySlug } from "../../data/services";

export interface ProcessDetailLabels {
  processDetail: {
    successRequestReview: string;
    errorRequestReview: string;
    processNotFound: string;
    back: string;
  };
}

export interface UseProcessDetailControllerOptions {
  userId: string | undefined;
  labels: ProcessDetailLabels;
}

export interface UseProcessDetailControllerResult {
  proc: UserService | null | undefined;
  service: ReturnType<typeof getServiceBySlug> | null;
  isLoading: boolean;
  isUpdating: boolean;
  setIsUpdating: (v: boolean) => void;
  hasConsultation: boolean;
  currentStepIndexInFull: number;
  stepData: Record<string, unknown>;
  history: any[];
  handleCompleteStep: () => Promise<void>;
  refetch: () => void;
  slug: string;
  isCOS: boolean;
  prefix: string;
  targetVisa: string | undefined;
  showF1Steps: boolean;
  stepsToSkip: string[];
}

export function useProcessDetailController({
  userId,
}: UseProcessDetailControllerOptions): UseProcessDetailControllerResult {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState(false);

  const service = slug ? getServiceBySlug(slug) : null;

  const { data: proc, isLoading, refetch } = useQuery({
    queryKey: ['process-detail', slug, searchParams.get("id")],
    queryFn: async () => {
      if (!userId || !slug) return null;
      const idParam = searchParams.get("id");
      const data = idParam
        ? await processService.getServiceById(idParam)
        : await processService.getUserServiceBySlug(userId, slug);

      if (data && (data.user_id !== userId || (idParam && data.service_slug !== slug))) {
        return null;
      }
      return data;
    },
    enabled: !!userId && !!slug,
  });

  const { data: hasConsultation = false } = useQuery({
    queryKey: ['mentoria-negativa', userId],
    queryFn: async () => {
      if (!userId) return false;
      const consult = await processService.getUserServiceBySlug(userId, "mentoria-negativa-consular");
      return !!consult && consult.status !== "cancelled";
    },
    enabled: !!userId && (slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1")),
  });

  useEffect(() => {
    if (!userId || !proc) return;

    const channel = supabase
      .channel(`process-realtime-${proc.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_services',
          filter: `id=eq.${proc.id}`
        },
        () => {
          console.log("[ProcessDetail] Realtime update detected, refetching...");
          queryClient.invalidateQueries({ queryKey: ['process-detail', slug, searchParams.get("id")] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, proc, slug, searchParams, queryClient]);

  const handleCompleteStep = useCallback(async () => {
    if (!proc) return;
    setIsUpdating(true);
    try {
      await processService.requestStepReview(proc.id);
      await refetch();
    } finally {
      setIsUpdating(false);
    }
  }, [proc, refetch]);

  const currentStepIndexInFull = proc?.current_step ?? 0;
  const isCOS = slug === "troca-status" || slug === "extensao-status";
  const prefix = slug === "extensao-status" ? "eos_" : "cos_";
  const stepData = (proc?.step_data || {}) as Record<string, unknown>;
  const targetVisa = stepData.targetVisa as string | undefined;
  const showF1Steps = isCOS ? (targetVisa === "F1") : true;
  const stepsToSkip = [`${prefix}i20_upload`, `${prefix}sevis_fee`, `${prefix}analysis_i20_sevis`];
  const history = (stepData.history as any[]) || [];

  return {
    proc,
    service,
    isLoading,
    isUpdating,
    setIsUpdating,
    hasConsultation,
    currentStepIndexInFull,
    stepData,
    history,
    handleCompleteStep,
    refetch,
    slug,
    isCOS,
    prefix,
    targetVisa,
    showF1Steps,
    stepsToSkip,
  };
}
