import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { processService, type UserService } from '../../services/process.service';
import { getServiceBySlug } from '../../data/services';
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from '../../data/workflowTemplates';
import type { StepConfig } from '../../templates/ServiceDetailTemplate';
import { normalizeLegacyFinalShipSteps, normalizeLegacyStepId } from '../../utils/legacyWorkflow';
import type { DocFile } from '../../components/DocUploadCard';

export interface Dependent {
  id: string;
  name: string;
  relation: 'spouse' | 'child' | 'other' | '';
  birthDate: string;
  marriageDate: string;
  i94Date: string;
}

export interface COSOnboardingLabels {
  cos: Record<string, string>;
  onboarding: Record<string, string>;
}

interface WorkflowCycle {
  type?: string;
  steps?: StepConfig[];
  [key: string]: unknown;
}

interface PurchaseRecord {
  dependents?: number | string;
  slug?: string;
}

function getCycleTemplate(cycle: WorkflowCycle): StepConfig[] {
  const baseTemplate = cycle.steps || (cycle.type === 'motion' ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE);
  const template = baseTemplate as StepConfig[];
  return normalizeLegacyFinalShipSteps(template);
}

export interface UseCOSOnboardingControllerOptions {
  userId: string | undefined;
  labels: COSOnboardingLabels;
}

export interface UseCOSOnboardingControllerResult {
  isLoading: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  proc: UserService | null;
  slug: string;
  stepIdx: number;
  service: ReturnType<typeof getServiceBySlug>;
  currentVisa: string | null;
  setCurrentVisa: (v: string | null) => void;
  targetVisa: string | null;
  setTargetVisa: (v: string | null) => void;
  i94Date: string;
  setI94Date: (v: string) => void;
  dependents: Dependent[];
  setDependents: React.Dispatch<React.SetStateAction<Dependent[]>>;
  docs: Record<string, DocFile>;
  setDocs: React.Dispatch<React.SetStateAction<Record<string, DocFile>>>;
  hasFeedback: boolean;
  rejectedItems: string[];
  isFieldRejected: (key: string) => boolean;
  isReadOnly: boolean;
  canSubmitStep0: boolean;
  canSubmitStep1: boolean;
  baseSteps: StepConfig[];
  history: WorkflowCycle[];
  effectiveSteps: StepConfig[];
  dynamicStep: StepConfig | undefined;
  dynamicStepId: string;
  dynamicCycleIndex: number;
  activeCycle: WorkflowCycle | null;
  currentDynamicBaseId: string;
  activeCycleTemplate: StepConfig[];
  cycleStepIdx: number;
  motionWorkflowStatus: string;
  isMotionFirstStep: boolean;
  isMotionResultStep: boolean;
  loadProc: () => Promise<void>;
  handleUpdateStepData: (data: Record<string, unknown>) => Promise<void>;
  handleApproveStep: (nextStep: number) => Promise<void>;
  getDocSlots: () => { key: string; title: string; subtitle: string; category: string }[];
  addDependent: () => void;
  removeDependent: (id: string) => void;
  navigateToStep: (step: number) => void;
}

export function useCOSOnboardingController({
  userId,
  labels,
}: UseCOSOnboardingControllerOptions): UseCOSOnboardingControllerResult {
  const navigate = useNavigate();
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const slug = urlSlug || (location.pathname.includes('extensao-status') ? 'extensao-status' : 'troca-status');
  const stepIdx = Number(searchParams.get('step') ?? '0');
  const service = getServiceBySlug(slug);

  const [proc, setProc] = useState<UserService | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentVisa, setCurrentVisa] = useState<string | null>(null);
  const [targetVisa, setTargetVisa] = useState<string | null>(null);
  const [i94Date, setI94Date] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [docs, setDocs] = useState<Record<string, DocFile>>({
    i94: { file: null, label: 'COS I94' },
    passportVisa: { file: null, label: 'COS PASSPORT VISA PRINCIPAL' },
    proofBrazil: { file: null, label: 'COS PROOF OF RESIDENCE' },
    bankStatement: { file: null, label: 'COS BANK STATEMENT' },
  });

  const hasFeedback = !!proc?.step_data?.admin_feedback;
  const rejectedItems = useMemo(
    () => (proc?.step_data?.rejected_items as string[]) || [],
    [proc?.step_data?.rejected_items]
  );

  const isFieldRejected = useCallback(
    (key: string) => hasFeedback && rejectedItems.includes(key),
    [hasFeedback, rejectedItems]
  );

  const isReadOnly = proc ? stepIdx < (proc.current_step ?? 0) && !hasFeedback : false;

  const canSubmitStep0 = !!currentVisa && !!targetVisa && !!i94Date;
  const canSubmitStep1 = Object.values(docs).every(d => d.file !== null || d.path);

  const baseSteps = useMemo(() => service?.steps || [], [service]);
  const history = useMemo(
    () => (proc?.step_data?.history as WorkflowCycle[]) || [],
    [proc?.step_data?.history]
  );

  const effectiveSteps = useMemo(() => {
    const steps = [...baseSteps];
    history.forEach((cycle, cIdx) => {
      const template = getCycleTemplate(cycle);
      template.forEach((s: StepConfig) => {
        steps.push({ ...s, id: `${s.id}_cycle_${cIdx}` });
      });
    });
    return steps;
  }, [baseSteps, history]);

  const dynamicStep = stepIdx >= baseSteps.length ? effectiveSteps[stepIdx] : undefined;
  const dynamicStepId = dynamicStep?.id || '';
  const dynamicCycleMatch = dynamicStepId.match(/_cycle_(\d+)$/);
  const dynamicCycleIndex = dynamicCycleMatch ? Number(dynamicCycleMatch[1]) : -1;
  const activeCycle = dynamicCycleIndex >= 0 ? history[dynamicCycleIndex] : null;
  const currentDynamicBaseId = normalizeLegacyStepId(dynamicStepId.replace(/_cycle_\d+$/, '')) || '';
  const activeCycleTemplate = activeCycle ? getCycleTemplate(activeCycle) : [];
  const cycleStepIdx = activeCycleTemplate.findIndex(step => step.id === currentDynamicBaseId);
  const motionWorkflowStatus = String(proc?.step_data?.workflow_status ?? '');
  const isMotionFirstStep = activeCycle?.type === 'motion' && cycleStepIdx === 0;
  const isMotionResultStep = activeCycle?.type === 'motion' && currentDynamicBaseId === 'cos_motion_end';

  const loadProc = useCallback(async () => {
    if (!userId || !slug) return;

    const parentId = searchParams.get('id') || searchParams.get('parentId') || searchParams.get('processId');
    let data = null;

    if (parentId) {
      data = await processService.getServiceById(parentId);
      if (data && data.user_id !== userId) {
        data = null;
      }
    } else {
      data = await processService.getUserServiceBySlug(userId, slug);
    }

    if (!data) return;

    setProc(data);

    try {
      if (data.step_data?.purchases) {
        const purchases = data.step_data.purchases as PurchaseRecord[];
        let totalPaidViaPurchases = 0;

        purchases.forEach(p => {
          const count = parseInt(String(p.dependents ?? 0), 10);
          const isAdditional =
            p.slug?.includes('dependente-adicional') ||
            p.slug?.includes('slot-dependente') ||
            p.slug === 'dependente-estudante' ||
            p.slug === 'dependente-b1-b2';

          if (isAdditional) {
            totalPaidViaPurchases += Math.max(1, count);
          } else {
            totalPaidViaPurchases = Math.max(totalPaidViaPurchases, count);
          }
        });

        const currentInDB = parseInt(String(data.step_data?.paid_dependents ?? 0), 10);
        if (totalPaidViaPurchases > currentInDB) {
          await processService.updateStepData(data.id, { paid_dependents: totalPaidViaPurchases });
          if (data.step_data) data.step_data.paid_dependents = totalPaidViaPurchases;
          setProc({ ...data });
        }
      }
    } catch (err) {
      console.warn('[AutoRepair] Erro ao sincronizar slots:', err);
    }

    if (data.step_data) {
      if (data.step_data.targetVisa) setTargetVisa(data.step_data.targetVisa as string);
      if (data.step_data.currentVisa) setCurrentVisa(data.step_data.currentVisa as string);
      if (data.step_data.i94Date) setI94Date(data.step_data.i94Date as string);
      if (data.step_data.dependents) setDependents(data.step_data.dependents as Dependent[]);

      if (data.step_data.docs) {
        const savedDocs = data.step_data.docs as Record<string, string>;
        setDocs(prev => {
          const next = { ...prev };
          Object.keys(savedDocs).forEach(key => {
            next[key] = {
              file: null,
              label: key.toUpperCase().replace(/_/g, ' '),
              path: savedDocs[key],
            };
          });
          return next;
        });
      }
    }
  }, [userId, slug, searchParams]);

  useEffect(() => {
    const loadTimerId = window.setTimeout(() => {
      void loadProc();
    }, 0);

    return () => {
      window.clearTimeout(loadTimerId);
    };
  }, [loadProc]);

  useEffect(() => {
    if (!proc || !activeCycle || activeCycle.type !== 'motion') return;

    if (cycleStepIdx === 1 && motionWorkflowStatus !== 'awaiting_user_input') {
      navigate(
        `/dashboard/processes/${slug}/onboarding?id=${proc.id}&step=${baseSteps.length}`,
        { replace: true }
      );
    }
  }, [proc, activeCycle, cycleStepIdx, motionWorkflowStatus, navigate, slug, baseSteps.length]);

  const handleUpdateStepData = useCallback(
    async (data: Record<string, unknown>) => {
      if (!proc) return;
      await processService.updateStepData(proc.id, data);
      await loadProc();
    },
    [proc, loadProc]
  );

  const handleApproveStep = useCallback(
    async (nextStep: number) => {
      if (!proc) return;
      await processService.approveStep(proc.id, nextStep);
      await loadProc();
    },
    [proc, loadProc]
  );

  const getDocSlots = useCallback(() => {
    const isExtension = slug === 'extensao-status';
    const cosTotal = 22000 + dependents.length * 5000;
    const bankSubtitle = isExtension
      ? 'Extensão 1.000U$/mes = U$ 6.000'
      : `COS U$ 22,000 + U$ 5.000 por dependente = U$ ${cosTotal.toLocaleString('en-US')}`;

    const slots = [
      { key: 'i94', title: 'Form I-94 (Principal)', subtitle: 'U.S. Entry Record', category: 'Personal Documents' },
      { key: 'passportVisa', title: 'Passport and Visa (Principal)', subtitle: 'Bio page + Visa stamp', category: 'Personal Documents' },
      { key: 'proofBrazil', title: 'Proof of Residence', subtitle: 'Utility bill or bank doc', category: 'Personal Documents' },
      { key: 'bankStatement', title: 'Bank Statement', subtitle: bankSubtitle, category: 'Financial Documents' },
    ];

    dependents.forEach(dep => {
      slots.push({ key: `i94_dep_${dep.id}`, title: `I-94 (${dep.name || 'Dependent'})`, subtitle: 'U.S. Entry Record', category: `Docs: ${dep.name || 'Dependent'}` });
      slots.push({ key: `passportVisa_dep_${dep.id}`, title: `Passport/Visa (${dep.name || 'Dependent'})`, subtitle: 'Bio page + Visa stamp', category: `Docs: ${dep.name || 'Dependent'}` });
      if (dep.relation === 'child') {
        slots.push({ key: `birthCertificate_dep_${dep.id}`, title: `Birth Certificate (${dep.name || 'Dependent'})`, subtitle: 'Birth proof', category: `Docs: ${dep.name || 'Dependent'}` });
      }
      if (dep.relation === 'spouse') {
        slots.push({ key: `marriageCertificate`, title: `Marriage Certificate`, subtitle: 'Marriage proof', category: `Docs: ${dep.name || 'Dependent'}` });
      }
    });

    return slots;
  }, [slug, dependents]);

  const addDependent = useCallback(() => {
    setDependents(d => [
      ...d,
      {
        id: crypto.randomUUID(),
        name: '',
        relation: '',
        birthDate: '',
        marriageDate: '',
        i94Date: '',
      },
    ]);
  }, []);

  const removeDependent = useCallback((id: string) => {
    setDependents(d => d.filter(dep => dep.id !== id));
  }, []);

  const navigateToStep = useCallback(
    (step: number) => {
      if (!proc) return;
      navigate(`/dashboard/processes/${slug}/onboarding?id=${proc.id}&step=${step}`);
    },
    [proc, slug, navigate]
  );

  return {
    isLoading: !proc && !labels,
    isSubmitting,
    setIsSubmitting,
    proc,
    slug,
    stepIdx,
    service,
    currentVisa,
    setCurrentVisa,
    targetVisa,
    setTargetVisa,
    i94Date,
    setI94Date,
    dependents,
    setDependents,
    docs,
    setDocs,
    hasFeedback,
    rejectedItems,
    isFieldRejected,
    isReadOnly,
    canSubmitStep0,
    canSubmitStep1,
    baseSteps,
    history,
    effectiveSteps,
    dynamicStep,
    dynamicStepId,
    dynamicCycleIndex,
    activeCycle,
    currentDynamicBaseId,
    activeCycleTemplate,
    cycleStepIdx,
    motionWorkflowStatus,
    isMotionFirstStep,
    isMotionResultStep,
    loadProc,
    handleUpdateStepData,
    handleApproveStep,
    getDocSlots,
    addDependent,
    removeDependent,
    navigateToStep,
  };
}
