import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@shared/lib/supabase";
import { updateStepData, approveStep, requestStepReview } from "../../../process/services/processOps";
import { getServiceSlugs, isSameService } from "@shared/data/services";
import { notifyAdmin } from "@features/notifications/services/notify";
import type { DS160FormValues } from "../schemas/ds160.schema";
import type { B1B2OnboardingLabels } from "../types";

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: "Brasil",
  securityExceptions: "nao",
};

async function fetchProcess(
  userId: string,
  slug: string,
  idParam?: string,
) {
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

export function useB1B2Onboarding({
  userId,
  labels,
}: {
  userId: string | undefined;
  labels: B1B2OnboardingLabels;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const slug = location.pathname.includes("reaplicacao")
    ? (location.pathname.includes("visa-") ? "visa-b1b2-reaplicacao" : "visto-b1-b2-reaplicacao")
    : (location.pathname.includes("visa-") ? "visa-b1b2" : "visto-b1-b2");

  const stepIdx = Number(searchParams.get("step") || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(null);
  const [procStatus, setProcStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<DS160FormValues>>(INITIAL_VALUES);

  const loadService = useCallback(
    async (idParam?: string) => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await fetchProcess(userId, slug, idParam);

        if (!data) {
          toast.error(labels.errorNotFound);
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
        toast.error(labels.errorLoad);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, slug, navigate, labels],
  );

  useEffect(() => {
    const idParam = searchParams.get("id");
    loadService(idParam ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSubmit = useCallback(
    async (values: Partial<DS160FormValues>) => {
      if (!procId) return;
      try {
        const payload: Record<string, unknown> = { ...values };
        delete payload["admin_feedback"];
        delete payload["rejected_items"];

        await updateStepData(procId, values as Record<string, unknown>);

        const { data: freshProc } = await supabase
          .from("user_services")
          .select("current_step, step_data")
          .eq("id", procId)
          .single();

        if ((freshProc?.current_step ?? 0) === 0) {
          // If it's step 0 and they clicked submit, the form is fully validated by Formik/Zod.
          await approveStep(procId, 1, false);
          await requestStepReview(procId);
          await notifyAdmin({
            title: "DS-160 completed",
            body: `Client completed the DS-160 for ${slug}.`,
            serviceId: procId,
            userId,
            link: `/admin/processes/${procId}`,
          });
          setProcStatus('awaiting_review');
          setCurrentStep(1);
          toast.success(labels.successSubmit);
          setTimeout(() => {
            navigate(`/dashboard/processes/${slug}`);
          }, 1500);
        } else {
          // For other steps that might use this handleSubmit (if any)
          await requestStepReview(procId);
          toast.success(labels.successSubmit);
          setTimeout(() => {
            navigate(`/dashboard/processes/${slug}`);
          }, 1500);
        }

        await requestStepReview(procId);

        await notifyAdmin({
          title: "DS-160 completed",
          body: `Client completed the DS-160 for ${slug}.`,
          serviceId: procId,
          userId,
          link: `/master/processes/${procId}`,
        });

        toast.success(labels.successSubmit);
        navigate(`/dashboard/processes/${slug}`);
      } catch (err) {
        console.error(err);
        toast.error(labels.errorSave);
      }
    },
    [procId, userId, slug, navigate, labels],
  );

  const handleSaveDraft = useCallback(
    async (values: Partial<DS160FormValues>) => {
      if (!procId) return;
      try {
        await updateStepData(procId, values as Record<string, unknown>);
        toast.success(labels.successDraft);
      } catch {
        toast.error(labels.errorDraft);
      }
    },
    [procId, labels],
  );

  return {
    isLoading,
    procId,
    procStatus,
    currentStep,
    adminFeedback,
    savedValues,
    stepIdx,
    slug,
    loadService,
    handleSubmit,
    handleSaveDraft,
  };
}
