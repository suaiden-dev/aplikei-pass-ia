import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { processService } from '../../services/process.service';
import { notificationService } from '../../services/notification.service';
import type { UserService } from '../../models';
import type { DS160FormValues } from '../../schemas/ds160.schema';

export interface B1B2OnboardingLabels {
  stepLabel: string;
  ds160Form: string;
  saveDraft: string;
  finalizeAndSubmit: string;
  awaitingReview: string;
  errorNotFound: string;
  errorLoad: string;
  successSubmit: string;
  successDraft: string;
  errorSave: string;
  errorDraft: string;
  adjustmentsRequested: string;
  of: string;
  b1b2Title: string;
  b1b2ReapplicationTitle: string;
  guidedFilling: string;
  consularFee: string;
  slipGeneratingByTeam: string;
  slipGenerationDesc: string;
  backToDashboard: string;
  accountCreationNotice: string;
  accountCreationNoticeHeader: string;
  accountCreationDesc: string;
  requiredFieldsTitle: string;
  requiredFieldsDesc: string;
  adminFeedback?: string;
}

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: 'Brasil',
  securityExceptions: 'nao',
};

export interface UseB1B2OnboardingControllerOptions {
  userId: string | undefined;
  labels: B1B2OnboardingLabels;
}

export interface UseB1B2OnboardingControllerResult {
  isLoading: boolean;
  procId: string | null;
  procStatus: string | null;
  currentStep: number;
  adminFeedback: string | null;
  savedValues: Partial<DS160FormValues>;
  stepIdx: number;
  slug: string;
  loadService: (idParam?: string) => Promise<void>;
  handleSubmit: (values: Partial<DS160FormValues>) => Promise<void>;
  handleSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>;
}

export function useB1B2OnboardingController({
  userId,
  labels,
}: UseB1B2OnboardingControllerOptions): UseB1B2OnboardingControllerResult {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const slug = location.pathname.includes('reaplicacao')
    ? 'visto-b1-b2-reaplicacao'
    : 'visto-b1-b2';

  const stepIdx = Number(searchParams.get('step') || '0');

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
        let data: UserService | null = null;

        if (idParam) {
          data = await processService.getServiceById(idParam);
          if (data && (data.user_id !== userId || data.service_slug !== slug)) {
            data = null;
          }
        } else {
          data = await processService.getUserServiceBySlug(userId, slug);
        }

        if (!data) {
          toast.error(labels.errorNotFound);
          navigate('/dashboard');
          return;
        }

        setProcId(data.id);
        setProcStatus(data.status);
        setCurrentStep(data.current_step ?? 0);

        if (data.step_data) {
          if (data.step_data.admin_feedback) {
            setAdminFeedback(data.step_data.admin_feedback as string);
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
    [userId, slug, navigate, labels]
  );

  useEffect(() => {
    const idParam = searchParams.get('id');
    loadService(idParam ?? undefined);
  }, [userId]);

  const handleSubmit = useCallback(
    async (values: Partial<DS160FormValues>) => {
      if (!procId) return;

      try {
        const payload: Record<string, unknown> = { ...values };
        const birthYear =
          typeof values.birthDate === 'string' && values.birthDate
            ? values.birthDate.slice(0, 4)
            : '';

        if (typeof values.maternalGrandmotherName === 'string') {
          payload.ds160_security_answer = values.maternalGrandmotherName;
        }
        if (birthYear) {
          payload.ds160_birth_date = birthYear;
        }
        delete payload.admin_feedback;
        delete payload.rejected_items;

        await processService.updateStepData(procId, payload);

        const freshProc = await processService.getServiceById(procId);
        const currentDBStep = freshProc?.current_step ?? 0;

        if (currentDBStep === 0) {
          await processService.approveStep(procId, 1, false);
        }

        await processService.requestStepReview(procId);

        await notificationService.notifyAdmin({
          title: 'DS-160 Preenchida',
          body: `O cliente finalizou a DS-160 para ${slug}.`,
          serviceId: procId,
          userId,
          link: `/admin/processes/${procId}`,
        });

        toast.success(labels.successSubmit);
        navigate(`/dashboard/processes/${slug}`);
      } catch (err) {
        console.error(err);
        toast.error(labels.errorSave);
      }
    },
    [procId, userId, slug, navigate, labels]
  );

  const handleSaveDraft = useCallback(
    async (values: Partial<DS160FormValues>) => {
      if (!procId) return;

      try {
        const payload: Record<string, unknown> = { ...values };
        const birthYear =
          typeof values.birthDate === 'string' && values.birthDate
            ? values.birthDate.slice(0, 4)
            : '';

        if (typeof values.maternalGrandmotherName === 'string') {
          payload.ds160_security_answer = values.maternalGrandmotherName;
        }
        if (birthYear) {
          payload.ds160_birth_date = birthYear;
        }

        await processService.updateStepData(procId, payload);
        toast.success(labels.successDraft);
      } catch {
        toast.error(labels.errorDraft);
      }
    },
    [procId, labels]
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
