import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { processService } from '../../services/process.service';
import { notificationService } from '../../services/notification.service';
import type { UserService } from '../../models';
import type { DS160FormValues } from '../../schemas/ds160.schema';

export interface F1OnboardingLabels {
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
  title: string;
  reapplicationTitle: string;
  guidedFilling: string;
  ds160Step: string;
  supportDocsStep: string;
  vipFlow: string;
  f1: {
    title: string;
    reapplicationTitle: string;
    ds160Step: string;
    supportDocsStep: string;
    saveSuccessDocs: string;
  };
  onboardingPage: {
    stepLabel: string;
    errorNotFound: string;
    errorLoad: string;
    successSubmit: string;
    successDraft: string;
    errorSave: string;
    errorDraft: string;
    adjustmentsRequested: string;
    of: string;
    f1: {
      title: string;
      reapplicationTitle: string;
      ds160Step: string;
      supportDocsStep: string;
      vipFlow: string;
      saveSuccessDocs: string;
    };
  };
}

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: 'Brasil',
  securityExceptions: 'nao',
};

export interface UseF1OnboardingControllerOptions {
  userId: string | undefined;
  labels: F1OnboardingLabels;
}

export interface UseF1OnboardingControllerResult {
  isLoading: boolean;
  procId: string | null;
  adminFeedback: string | null;
  savedValues: Partial<DS160FormValues>;
  stepIdx: number;
  slug: string;
  isReapplication: boolean;
  loadService: (idParam?: string) => Promise<void>;
  handleSubmit: (values: Partial<DS160FormValues>) => Promise<void>;
  handleSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>;
}

export function useF1OnboardingController({
  userId,
  labels,
}: UseF1OnboardingControllerOptions): UseF1OnboardingControllerResult {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isReapplication = location.pathname.includes('reaplicacao');
  const slug = isReapplication ? 'visto-f1-reaplicacao' : 'visto-f1';
  const stepIdx = Number(searchParams.get('step') || '0');

  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(null);
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
          toast.error(labels.onboardingPage?.errorNotFound || labels.errorNotFound);
          navigate('/dashboard');
          return;
        }

        setProcId(data.id);

        if (data.step_data) {
          if (data.step_data.admin_feedback) {
            setAdminFeedback(data.step_data.admin_feedback as string);
          }
          setSavedValues({ ...INITIAL_VALUES, ...(data.step_data as Partial<DS160FormValues>) });
        }
      } catch (err) {
        console.error(err);
        toast.error(labels.onboardingPage?.errorLoad || labels.errorLoad);
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
        delete payload.admin_feedback;
        delete payload.rejected_items;

        await processService.updateStepData(procId, payload);

        const freshProc = await processService.getServiceById(procId);
        const currentDBStep = freshProc?.current_step ?? 0;

        if (currentDBStep === 0) {
          await processService.approveStep(procId, 1, false);

          await notificationService.notifyAdmin({
            title: 'Início de Fluxo F1',
            body: `O cliente concluiu o formulário inicial de Estudante (${slug}).`,
            serviceId: procId,
            userId,
            link: `/admin/processes/${procId}`,
          });

          toast.success(labels.f1?.saveSuccessDocs || labels.onboardingPage?.f1?.saveSuccessDocs || 'Success');
          const idParam = searchParams.get('id');
          navigate(`/dashboard/processes/${slug}/onboarding?step=1${idParam ? `&id=${idParam}` : ''}`);
        } else {
          toast.success(labels.onboardingPage?.successDraft || labels.successDraft);
          navigate(`/dashboard/processes/${slug}`);
        }
      } catch (err) {
        console.error(err);
        toast.error(labels.onboardingPage?.errorSave || labels.errorSave);
      }
    },
    [procId, userId, slug, navigate, labels, searchParams]
  );

  const handleSaveDraft = useCallback(
    async (values: Partial<DS160FormValues>) => {
      if (!procId) return;

      try {
        await processService.updateStepData(procId, values as Record<string, unknown>);
        toast.success(labels.onboardingPage?.successDraft || labels.successDraft);
      } catch {
        toast.error(labels.onboardingPage?.errorDraft || labels.errorDraft);
      }
    },
    [procId, labels]
  );

  return {
    isLoading,
    procId,
    adminFeedback,
    savedValues,
    stepIdx,
    slug,
    isReapplication,
    loadService,
    handleSubmit,
    handleSaveDraft,
  };
}
