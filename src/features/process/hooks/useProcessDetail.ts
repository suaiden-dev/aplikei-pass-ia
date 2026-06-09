import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { notifyAdmin, notifyClient } from "@features/notifications/services/notify";
import { getServiceBySlug } from "@shared/data/services";
import type { UserService } from "../types";

async function fetchProcess(
  userId: string,
  slug: string,
  idParam: string | null,
): Promise<UserService | null> {
  if (idParam) {
    const { data, error } = await supabase
      .from("user_services")
      .select("*")
      .eq("id", idParam)
      .single();
    if (error) return null;
    const row = data as UserService;
    if (row.user_id !== userId || row.service_slug !== slug) return null;
    return row;
  }

  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .eq("service_slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return (data as UserService) ?? null;
}

export function useProcessDetail(userId: string | undefined) {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const idParam = searchParams.get("slug") || searchParams.get("id");

  const [isUpdating, setIsUpdating] = useState(false);

  const service = slug ? getServiceBySlug(slug) : null;

  const { data: proc, isLoading, refetch } = useQuery({
    queryKey: ["process-detail", slug, idParam],
    enabled: !!userId && !!slug,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: () => fetchProcess(userId!, slug, idParam),
  });

  const { data: hasConsultation = false } = useQuery({
    queryKey: ["mentoria-negativa", userId],
    enabled: !!userId && (slug.startsWith("visto-b1-b2") || slug.startsWith("visto-f1")),
    queryFn: async () => {
      const { data } = await supabase
        .from("user_services")
        .select("id, status")
        .eq("user_id", userId!)
        .eq("service_slug", "mentoria-negativa-consular")
        .maybeSingle();
      return !!data && data.status !== "cancelled";
    },
  });

  useEffect(() => {
    if (!userId || !proc) return;
    const channel = supabase
      .channel(`process-detail-${proc.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_services", filter: `id=eq.${proc.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["process-detail", slug, idParam] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, proc, slug, idParam, queryClient]);

  const handleCompleteStep = useCallback(async () => {
    if (!proc) return;
    setIsUpdating(true);
    try {
      await supabase
        .from("user_services")
        .update({ status: "awaiting_review" })
        .eq("id", proc.id);

      const serviceMeta = getServiceBySlug(proc.service_slug);
      const currentTitle = serviceMeta?.steps[proc.current_step ?? 0]?.title ?? "";

      await notifyAdmin({
        serviceId: proc.id,
        userId: proc.user_id ?? undefined,
        link: `/master/processes/${proc.id}`,
        category: "process",
        action: currentTitle ? "review_required" : "step_submitted",
        metadata: {
          ...(currentTitle ? { step_name: currentTitle } : {}),
          service_name: serviceMeta?.title ?? proc.service_slug,
        },
      });

      await notifyClient({
        userId: proc.user_id ?? undefined,
        serviceId: proc.id,
        link: `/dashboard/processes/${proc.service_slug}`,
        category: "process",
        action: "under_review",
      });

      await refetch();
    } finally {
      setIsUpdating(false);
    }
  }, [proc, refetch]);

  const stepData = (proc?.step_data ?? {}) as Record<string, unknown>;
  const isCOS = slug === "troca-status" || slug === "extensao-status";
  const prefix = slug === "extensao-status" ? "eos_" : "cos_";
  const targetVisa = stepData["targetVisa"] as string | undefined;
  const showF1Steps = isCOS ? targetVisa === "F1" : true;
  const stepsToSkip = [`${prefix}i20_upload`, `${prefix}sevis_fee`];
  const history = (stepData["history"] as Array<{ type?: string; steps?: unknown[] }>) || [];

  return {
    proc,
    service,
    isLoading,
    isUpdating,
    setIsUpdating,
    hasConsultation,
    currentStepIndexInFull: proc?.current_step ?? 0,
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
