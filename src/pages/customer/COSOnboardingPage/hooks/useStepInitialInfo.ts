import { useState, useEffect, useCallback, useRef } from "react";
import { workflowService } from "../../../../services/workflow.service";
import type { UserStep } from "../../../../services/workflow.service";
import {
  EMPTY_INITIAL_INFO,
  isInitialInfoComplete,
  type StepInitialInfoData,
  type StepDependent,
  type DependentRelation,
} from "../../../../models/step-initial-info.model";

interface UseStepInitialInfoOptions {
  instanceId: string | null;     // user_product_instances.id
  productStepId: string | null;  // product_steps.id para o step "initial_info"
}

interface UseStepInitialInfoReturn {
  // dados do formulário
  data: StepInitialInfoData;
  // estado
  userStep: UserStep | null;
  paidDependentSlots: number;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  isReadOnly: boolean;   // true quando status = in_review | approved
  isComplete: boolean;   // todos os campos obrigatórios preenchidos
  saveError: string | null;
  /** Recarrega os slots pagos da instância (chamar após retorno do checkout). */
  refreshSlots: () => Promise<void>;
  // setters
  setCurrentVisa: (v: StepInitialInfoData["currentVisa"]) => void;
  setTargetVisa:  (v: StepInitialInfoData["targetVisa"])  => void;
  setI94Date:     (v: string) => void;
  addDependent:   () => void;
  updateDependent: (id: string, field: keyof StepDependent, value: string) => void;
  removeDependent: (id: string) => void;
  // ações
  saveDraft:  () => Promise<void>;
  submitStep: () => Promise<void>;
  // revisão
  isFieldRevised: (key: string) => boolean;
}

const READ_ONLY_STATUSES = new Set(["in_review", "approved"]);

export function useStepInitialInfo({
  instanceId,
  productStepId,
}: UseStepInitialInfoOptions): UseStepInitialInfoReturn {
  const [userStep, setUserStep]           = useState<UserStep | null>(null);
  const [paidDependentSlots, setPaidSlots] = useState(0);
  const [data, setData]                   = useState<StepInitialInfoData>(EMPTY_INITIAL_INFO);
  const [isLoading, setIsLoading]         = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [saveError, setSaveError]         = useState<string | null>(null);

  // Debounce timer para auto-save de rascunho
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Carrega step + slots ao montar ───────────────────────────────────────────
  const refreshSlots = useCallback(async () => {
    if (!instanceId) return;
    const supabase = (await import("../../../../lib/supabase")).getSupabaseClient();
    if (!supabase) return;
    const { data: inst } = await supabase
      .schema("aplikei")
      .from("user_product_instances")
      .select("metadata")
      .eq("id", instanceId)
      .maybeSingle();
    if (inst?.metadata) {
      const paid = (inst.metadata as Record<string, unknown>).paid_dependents;
      setPaidSlots(typeof paid === "number" ? paid : parseInt(String(paid ?? "0"), 10));
    }
  }, [instanceId]);

  useEffect(() => {
    if (!instanceId || !productStepId) return;

    let isMounted = true;

    const loadInitialInfo = async () => {
      setIsLoading(true);
      try {
        const [step] = await Promise.all([
          workflowService.getStep(instanceId, productStepId),
          refreshSlots(),
        ]);

        if (!isMounted || !step) return;
        setUserStep(step);
        if (step.data && Object.keys(step.data).length > 0) {
          setData(step.data as unknown as StepInitialInfoData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadInitialInfo();

    return () => {
      isMounted = false;
    };
  }, [instanceId, productStepId, refreshSlots]);

  // ── Auto-save de rascunho (debounce 1.5s) ────────────────────────────────────
  const scheduleAutoSave = useCallback(
    (nextData: StepInitialInfoData) => {
      if (!userStep || READ_ONLY_STATUSES.has(userStep.status)) return;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        workflowService
          .saveDraft(userStep.id, nextData as unknown as Record<string, unknown>)
          .catch(console.error);
      }, 1500);
    },
    [userStep],
  );

  // ── Setters ───────────────────────────────────────────────────────────────────
  function update(updater: (prev: StepInitialInfoData) => StepInitialInfoData) {
    setData((prev) => {
      const next = updater(prev);
      scheduleAutoSave(next);
      return next;
    });
  }

  const setCurrentVisa: UseStepInitialInfoReturn["setCurrentVisa"] = (v) =>
    update((prev) => ({ ...prev, currentVisa: v }));

  const setTargetVisa: UseStepInitialInfoReturn["setTargetVisa"] = (v) =>
    update((prev) => ({ ...prev, targetVisa: v }));

  const setI94Date = (v: string) =>
    update((prev) => ({ ...prev, i94Date: v }));

  const addDependent = () =>
    update((prev) => ({
      ...prev,
      dependents: [
        ...prev.dependents,
        { id: crypto.randomUUID(), name: "", relation: "" as DependentRelation, birthDate: "", i94Date: "", marriageDate: "" },
      ],
    }));

  const updateDependent = (id: string, field: keyof StepDependent, value: string) =>
    update((prev) => ({
      ...prev,
      dependents: prev.dependents.map((d) =>
        d.id === id ? { ...d, [field]: value } : d,
      ),
    }));

  const removeDependent = (id: string) =>
    update((prev) => ({
      ...prev,
      dependents: prev.dependents.filter((d) => d.id !== id),
    }));

  // ── Save draft (manual) ───────────────────────────────────────────────────────
  const saveDraft = useCallback(async () => {
    if (!userStep) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await workflowService.saveDraft(
        userStep.id,
        data as unknown as Record<string, unknown>,
      );
      setUserStep((prev) => prev ? { ...prev, status: "in_progress" } : prev);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  }, [userStep, data]);

  // ── Submit step ───────────────────────────────────────────────────────────────
  const submitStep = useCallback(async () => {
    if (!userStep) return;
    setSaveError(null);
    setIsSubmitting(true);
    try {
      await workflowService.submitStep(
        userStep.id,
        data as unknown as Record<string, unknown>,
      );
      setUserStep((prev) => prev ? { ...prev, status: "in_review", submitted_at: new Date().toISOString() } : prev);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setIsSubmitting(false);
    }
  }, [userStep, data]);

  // ── Verifica campo marcado para revisão ───────────────────────────────────────
  // O admin pode registrar no step_reviews.comment campos específicos como "revisao:currentVisa"
  const isFieldRevised = useCallback(() => userStep?.status === "revision_requested", [userStep]);

  return {
    data,
    userStep,
    paidDependentSlots,
    isLoading,
    isSaving,
    isSubmitting,
    isReadOnly: userStep ? READ_ONLY_STATUSES.has(userStep.status) : false,
    isComplete: isInitialInfoComplete(data),
    saveError,
    setCurrentVisa,
    setTargetVisa,
    setI94Date,
    addDependent,
    updateDependent,
    removeDependent,
    saveDraft,
    submitStep,
    isFieldRevised,
    refreshSlots,
  };
}
