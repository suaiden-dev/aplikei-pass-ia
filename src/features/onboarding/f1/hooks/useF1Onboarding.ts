import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@shared/lib/supabase";
import { updateStepData, approveStep, requestStepReview } from "../../../process/services/processOps";
import { getServiceSlugs, isSameService } from "@shared/data/services";
import { notifyAdmin } from "@features/notifications/services/notify";
import type { DS160FormValues } from "../../b1b2/schemas/ds160.schema";

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: "Brasil",
  securityExceptions: "nao",
};

async function fetchProcess(userId: string, slug: string, idParam?: string | null) {
  if (idParam) {
    const { data } = await supabase
      .from("user_services")
      .select("*")
      .eq("id", idParam)
      .single();
    if (!data || data.user_id !== userId || !isSameService(data.service_slug, slug)) return null;
    return data;
  }

  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .in("service_slug", getServiceSlugs(slug))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export function useF1Onboarding(userId: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isReapplication = location.pathname.includes("reaplicacao");
  const slug = isReapplication 
    ? (location.pathname.includes("visa-") ? "visa-f1-reaplicacao" : "visto-f1-reaplicacao")
    : (location.pathname.includes("visa-") ? "visa-f1" : "visto-f1");
  const stepIdx = Number(searchParams.get("step") || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(null);
  const [procStatus, setProcStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<DS160FormValues>>(INITIAL_VALUES);

  const loadService = useCallback(async (idParam?: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await fetchProcess(userId, slug, idParam);
      if (!data) {
        toast.error("Serviço não encontrado");
        navigate("/dashboard");
        return;
      }
      setProcId(data.id);
      setProcStatus(data.status);
      setCurrentStep(data.current_step ?? 0);

      if (data.step_data) {
        if ((data.step_data as Record<string, unknown>).admin_feedback) {
          setAdminFeedback((data.step_data as Record<string, unknown>).admin_feedback as string);
        }
        setSavedValues({ ...INITIAL_VALUES, ...(data.step_data as Partial<DS160FormValues>) });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar serviço");
    } finally {
      setIsLoading(false);
    }
  }, [userId, slug, navigate]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    loadService(idParam ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
    if (!procId) return;
    try {
      const payload: Record<string, unknown> = { ...values };
      delete payload["admin_feedback"];
      delete payload["rejected_items"];

      await updateStepData(procId, payload);

      const { data: freshProc } = await supabase
        .from("user_services")
        .select("current_step")
        .eq("id", procId)
        .single();

      const currentDBStep = freshProc?.current_step ?? 0;

      if (currentDBStep === 0) {
        await approveStep(procId, 1, false);
        await requestStepReview(procId);
        await notifyAdmin({
          serviceId: procId,
          userId,
          link: `/master/processes/${procId}`,
          category: "b1b2",
          action: "ds160_completed",
        });
        setProcStatus('awaiting_review');
        setCurrentStep(1);
        toast.success("DS-160 enviada com sucesso!");
        navigate(`/dashboard/processes/${slug}`);
      } else {
        await requestStepReview(procId);
        toast.success("Rascunho salvo!");
        navigate(`/dashboard/processes/${slug}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar");
    }
  };

  const handleSaveDraft = async (values: Partial<DS160FormValues>) => {
    if (!procId) return;
    try {
      await updateStepData(procId, values as Record<string, unknown>);
      toast.success("Rascunho salvo!");
    } catch {
      toast.error("Erro ao salvar rascunho");
    }
  };

  return {
    isLoading,
    procId,
    procStatus,
    currentStep,
    slug,
    stepIdx,
    adminFeedback,
    savedValues,
    isReapplication,
    handleSubmit,
    handleSaveDraft,
    navigate,
  };
}
