import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiAlertLine,
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import { useT } from "../../../i18n";

import { DS160SingleFormStep } from "../B1B2OnboardingPage/steps/DS160SingleFormStep";
import { B1B2UserReviewSignStep } from "../B1B2OnboardingPage/steps/B1B2UserReviewSignStep";
import { B1B2CASVSchedulingStep } from "../B1B2OnboardingPage/steps/B1B2CASVSchedulingStep";
import { B1B2UserConfirmEmailStep } from "../B1B2OnboardingPage/steps/B1B2UserConfirmEmailStep";
import { B1B2MRVPaymentStep } from "../B1B2OnboardingPage/steps/B1B2MRVPaymentStep";

import { F1I20UploadStep } from "./steps/F1I20UploadStep";
import { F1FinalPreparationStep } from "./steps/F1FinalPreparationStep";

import { ds160Validator, type DS160FormValues } from "../../../schemas/ds160.schema";
import { processService } from "../../../services/process.service";
import { notificationService } from "../../../services/notification.service";
import type { UserService } from "../../../models";

const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: "Brasil",
  securityExceptions: "nao",
};

function useF1OnboardingController(userId: string | undefined) {
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

  const load = async () => {
    if (!userId) return;
    try {
      const idParam = searchParams.get("id");
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
        toast.error("Serviço não encontrado");
        navigate("/dashboard");
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
      toast.error("Erro ao carregar serviço");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
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
          title: "🎓 Início de Fluxo F1",
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
      await processService.updateStepData(procId, values as Record<string, unknown>);
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

export default function F1OnboardingPage() {
  const t = useT("visas");
  const { user } = useAuth();

  const {
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
  } = useF1OnboardingController(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  const title = isReapplication
    ? t.onboardingPage.f1.reapplicationTitle
    : t.onboardingPage.f1.title;

  return (
    <div className="min-h-screen bg-bg pb-24">

      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/processes/${slug}`)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg-subtle transition-colors text-text-muted hover:text-text"
            >
              <RiArrowLeftLine className="text-xl" />
            </button>
            <div>
              <h1 className="text-sm font-black text-text uppercase tracking-tight">
                {stepIdx === 0 ? t.onboardingPage.f1.ds160Step : t.onboardingPage.f1.supportDocsStep}
              </h1>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {title} — {t.onboardingPage.stepLabel} {stepIdx + 1}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black text-primary tracking-widest uppercase">
              {t.onboardingPage.f1.vipFlow}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">

        {adminFeedback && stepIdx !== 4 && stepIdx !== 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
              <RiErrorWarningLine className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">
                {t.onboardingPage.adjustmentsRequested}
              </h3>
              <p className="text-sm text-red-700 font-medium leading-relaxed">"{adminFeedback}"</p>
            </div>
          </motion.div>
        )}

        {stepIdx >= 11 ? (
           <F1FinalPreparationStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 10 ? (
           <B1B2MRVPaymentStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 9 ? (
          <div className="bg-card rounded-[32px] border border-border shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <RiLoader4Line className="text-3xl animate-spin" />
             </div>
             <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">{t.onboardingPage.consularFee}</h3>
             <p className="text-sm text-text-muted font-medium mb-6 leading-relaxed">
                <strong>{t.onboardingPage.slipGeneratingByTeam}</strong>
                <br />
                {t.onboardingPage.f1.mrvF1Desc}
             </p>
             <button onClick={() => navigate(`/dashboard/processes/${slug}`)} className="px-8 py-3 rounded-xl border border-border text-text-muted font-bold text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all font-mono">{t.onboardingPage.backToDashboard}</button>
          </div>
        ) : stepIdx === 8 ? (
           <B1B2UserConfirmEmailStep
              procId={procId!}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 7 ? (
          <div className="bg-card rounded-[32px] border border-border shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <RiLoader4Line className="text-3xl animate-spin" />
             </div>
             <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">{t.onboardingPage.reviewSign.accountCreation}</h3>
             <p className="text-sm text-text-muted font-medium mb-6 leading-relaxed">
                <strong>{t.onboardingPage.f1.creationNoticeF1}</strong>
                <br />
                {t.onboardingPage.f1.creationLongDesc}
             </p>
             <button onClick={() => navigate(`/dashboard/processes/${slug}`)} className="px-8 py-3 rounded-xl border border-border text-text-muted font-bold text-[10px] uppercase tracking-widest">{t.onboardingPage.backToDashboard}</button>
          </div>
        ) : stepIdx === 6 ? (
           <B1B2CASVSchedulingStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 4 ? (
           <B1B2UserReviewSignStep
              procId={procId!}
              userId={user!.id}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 1 ? (
           <F1I20UploadStep
              procId={procId!}
              userId={user!.id}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : (
        <Formik<Partial<DS160FormValues>>
          initialValues={savedValues}
          validate={ds160Validator}
          onSubmit={handleSubmit}
          enableReinitialize
          validateOnBlur
          validateOnChange={false}
        >
          {({ isSubmitting, errors, values, submitCount }) => {
            const hasVisibleErrors = submitCount > 0 && Object.keys(errors).length > 0;
            return (
              <Form noValidate>
                {hasVisibleErrors && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-red-400 text-white flex items-center justify-center shrink-0"><RiAlertLine className="text-lg" /></div>
                    <div>
                      <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">{t.onboardingPage.requiredFieldsMissing}</h3>
                      <p className="text-sm text-red-600 font-medium">{t.onboardingPage.fieldsToCorrect.replace("{count}", Object.keys(errors).length.toString())}</p>
                    </div>
                  </motion.div>
                )}
                <div className="bg-card rounded-3xl border border-border shadow-xl shadow-none overflow-hidden">
                  <div className="p-6 sm:p-10 space-y-0">
                    <DS160SingleFormStep />
                  </div>
                  <div className="px-6 sm:px-10 py-6 bg-bg-subtle/70 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button type="button" onClick={() => handleSaveDraft(values)} disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text-muted font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50">{t.onboardingPage.saveDraft}</button>
                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                      {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : <>{t.onboardingPage.f1.finalAndSendDocs} <RiArrowRightLine className="text-lg" /></>}
                    </button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
        )}
      </div>
    </div>
  );
}
