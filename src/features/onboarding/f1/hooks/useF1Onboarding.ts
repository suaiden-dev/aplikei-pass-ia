import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../../../shared/lib/supabase";
import { updateStepData, approveStep } from "../../../process/lib/processOps";
import { notifyAdmin } from "../../../notifications/lib/notify";
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
    if (!data || data.user_id !== userId || data.service_slug !== slug) return null;
    return data;
  }

  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .eq("service_slug", slug)
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
  const slug = isReapplication ? "visto-f1-reaplicacao" : "visto-f1";
  const stepIdx = Number(searchParams.get("step") || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<DS160FormValues>>(INITIAL_VALUES);

  useEffect(() => {
    if (!userId) return;

    const idParam = searchParams.get("id");

    fetchProcess(userId, slug, idParam)
      .then((data) => {
        if (!data) {
          toast.error("Serviço não encontrado");
          navigate("/dashboard");
          return;
        }
        setProcId(data.id);
        if (data.step_data) {
          if ((data.step_data as Record<string, unknown>).admin_feedback) {
            setAdminFeedback((data.step_data as Record<string, unknown>).admin_feedback as string);
          }
          setSavedValues({ ...INITIAL_VALUES, ...(data.step_data as Partial<DS160FormValues>) });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao carregar serviço");
      })
      .finally(() => setIsLoading(false));
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
        await notifyAdmin({
          title: "Início de Fluxo F1",
          body: `O cliente concluiu o formulário inicial de Estudante (${slug}).`,
          serviceId: procId,
          userId,
          link: `/admin/processes/${procId}`,
        });
        toast.success("Documentos salvos com sucesso!");
        const idParam = searchParams.get("id");
        navigate(`/dashboard/processes/${slug}/onboarding?step=1${idParam ? `&id=${idParam}` : ""}`);
      } else {
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
