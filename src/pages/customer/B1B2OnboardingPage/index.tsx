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
  RiCheckLine,
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { processService } from "../../../services/process.service";
import { notificationService } from "../../../services/notification.service";
import { toast } from "sonner";
import { useT } from "../../../i18n";

import { DS160SingleFormStep } from "./steps/DS160SingleFormStep";
import { B1B2UserReviewSignStep } from "./steps/B1B2UserReviewSignStep";
import { B1B2CASVSchedulingStep } from "./steps/B1B2CASVSchedulingStep";
import { B1B2UserConfirmEmailStep } from "./steps/B1B2UserConfirmEmailStep";
import { B1B2MRVPaymentStep } from "./steps/B1B2MRVPaymentStep";
import { B1B2FinalPreparationStep } from "./steps/B1B2FinalPreparationStep";
import { ds160Validator, type DS160FormValues } from "../../../schemas/ds160.schema";

// ─── Default values ────────────────────────────────────────────────────────────
const INITIAL_VALUES: Partial<DS160FormValues> = {
  homeCountry: "Brasil",
  securityExceptions: "nao",
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function B1B2OnboardingPage() {
  const t = useT("visas");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const slug = location.pathname.includes("reaplicacao") ? "visto-b1-b2-reaplicacao" : "visto-b1-b2";
  const stepIdx = Number(searchParams.get("step") || "0");

  const [isLoading, setIsLoading] = useState(true);
  const [procId, setProcId] = useState<string | null>(null);
  const [procStatus, setProcStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<DS160FormValues>>(INITIAL_VALUES);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const idParam = searchParams.get("id");
        let data = null;

        if (idParam) {
          data = await processService.getServiceById(idParam);
          // Opcional: validar se o service pertence ao user e ao slug correto
          if (data && (data.user_id !== user.id || data.service_slug !== slug)) {
             data = null;
          }
        } else {
          data = await processService.getUserServiceBySlug(user.id, slug);
        }

        if (!data) {
          toast.error(t.onboardingPage.errorNotFound);
          navigate("/dashboard");
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
        toast.error(t.onboardingPage.errorLoad);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user, navigate, slug, searchParams]);

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
    if (!procId) return;
    try {
      // Create payload to save, removing admin_feedback if it exists so we clear the error state
      const payload: Record<string, unknown> = { ...values };
      delete payload.admin_feedback;
      delete payload.rejected_items;

      await processService.updateStepData(procId, payload);
      
      // Fetch fresh data to check current step
      const freshProc = await processService.getServiceById(procId);
      const currentDBStep = freshProc?.current_step ?? 0;

      if (currentDBStep === 0) {
        // Advance to step 1 (Admin Analysis)
        await processService.approveStep(procId, 1, false);
      }
      
      // Request review for the current step (which is now 1)
      await processService.requestStepReview(procId);

      // Notify Admin
      await notificationService.notifyAdmin({
        title: "📝 DS-160 Preenchida",
        body: `O cliente ${user?.fullName || user?.email} finalizou o preenchimento da DS-160 para ${slug}.`,
        serviceId: procId,
        userId: user?.id
      });
      
      toast.success(t.onboardingPage.successSubmit);
      navigate(`/dashboard/processes/${slug}`);
    } catch (err) {
      console.error(err);
      toast.error(t.onboardingPage.errorSave);
    }
  };

  const handleSaveDraft = async (values: Partial<DS160FormValues>) => {
    if (!procId) return;
    try {
      await processService.updateStepData(procId, values as Record<string, unknown>);
      toast.success(t.onboardingPage.successDraft);
    } catch {
      toast.error(t.onboardingPage.errorDraft);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 pb-24">
      
      {/* ── Sticky Header ── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/processes/${slug}`)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
            >
              <RiArrowLeftLine className="text-xl" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {t.onboardingPage.ds160Form}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {slug === "visto-b1-b2-reaplicacao" 
                  ? `${t.onboardingPage.b1b2ReapplicationTitle} — ${t.onboardingPage.guidedFilling}` 
                  : `${t.onboardingPage.b1b2Title} — ${t.onboardingPage.guidedFilling}`}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black text-primary tracking-widest uppercase">
              {t.onboardingPage.stepLabel} {stepIdx === 10 ? `11 ${t.onboardingPage.of} 11` : stepIdx === 9 ? `10 ${t.onboardingPage.of} 11` : stepIdx === 8 ? `9 ${t.onboardingPage.of} 11` : stepIdx === 7 ? `8 ${t.onboardingPage.of} 11` : stepIdx === 6 ? `7 ${t.onboardingPage.of} 11` : stepIdx === 5 ? `6 ${t.onboardingPage.of} 11` : stepIdx === 3 ? `4 ${t.onboardingPage.of} 11` : `1 ${t.onboardingPage.of} 11`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Admin Feedback Banner ── */}
        {adminFeedback && stepIdx !== 3 && (
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

        {stepIdx >= 10 ? (
           <B1B2FinalPreparationStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 9 ? (
           <B1B2MRVPaymentStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 8 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <RiLoader4Line className="text-3xl animate-spin" />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t.onboardingPage.consularFee}</h3>
             <p className="text-sm text-slate-500 font-medium mb-6">
                <strong>{t.onboardingPage.slipGeneratingByTeam}</strong>
                <br />
                {t.onboardingPage.slipGenerationDesc}
             </p>
             <button
               onClick={() => navigate(`/dashboard/processes/${slug}`)}
               className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
             >
                {t.onboardingPage.backToDashboard}
             </button>
          </div>
        ) : stepIdx === 7 ? (
           <B1B2UserConfirmEmailStep
              procId={procId!}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 6 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <RiLoader4Line className="text-3xl animate-spin" />
             </div>
             <h3 className="text-xl font-black text-slate-800 mb-2 uppercase">{t.onboardingPage.accountCreationNotice}</h3>
             <p className="text-sm text-slate-500 font-medium mb-6">
                <strong>{t.onboardingPage.accountCreationNoticeHeader}</strong>
                <br />
                {t.onboardingPage.accountCreationDesc}
             </p>
             <button
               onClick={() => navigate(`/dashboard/processes/${slug}`)}
               className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
             >
                {t.onboardingPage.backToDashboard}
             </button>
          </div>
        ) : stepIdx === 5 ? (
           <B1B2CASVSchedulingStep
              procId={procId!}
              stepData={savedValues}
              onComplete={() => navigate(`/dashboard/processes/${slug}`)}
              onBack={() => navigate(`/dashboard/processes/${slug}`)}
           />
        ) : stepIdx === 3 ? (
           <B1B2UserReviewSignStep 
              procId={procId!} 
              userId={user!.id} 
              stepData={savedValues} 
              onComplete={() => navigate(`/dashboard/processes/${slug}`)} 
              onBack={() => navigate(`/dashboard/processes/${slug}`)} 
           />
        ) : (
        /* ── Formik Form ── */
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
                
                {/* ── Error summary (only shown after first submit attempt) ── */}
                {hasVisibleErrors && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-400 text-white flex items-center justify-center shrink-0">
                      <RiAlertLine className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">
                        {t.onboardingPage.requiredFieldsTitle}
                      </h3>
                      <p className="text-sm text-red-600 font-medium">
                        {t.onboardingPage.requiredFieldsDesc.replace("{count}", Object.keys(errors).length.toString())}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                  <div className="p-6 sm:p-10 space-y-0">
                    <DS160SingleFormStep />
                  </div>

                  {procStatus === "awaiting_review" || currentStep > stepIdx ? (
                    <div className="px-6 sm:px-10 py-10 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                        {currentStep > stepIdx ? (
                          <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                              <RiCheckLine className="text-2xl" />
                            </div>
                            <p className="text-sm font-black text-emerald-900 uppercase tracking-widest">Etapa Aprovada</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Todas as informações desta fase já foram validadas.</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
                            <RiLoader4Line className="text-xl animate-spin text-primary" />
                            {t.onboardingPage.awaitingReview || "Aguardando Aprovação"}
                          </div>
                        )}
                    </div>
                  ) : (
                    /* ── Footer Actions ── */
                    <div className="px-6 sm:px-10 py-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handleSaveDraft(values)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                      >
                        {t.onboardingPage.saveDraft}
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <RiLoader4Line className="animate-spin text-lg" />
                        ) : (
                          <>
                            {t.onboardingPage.finalizeAndSubmit}
                            <RiArrowRightLine className="text-lg" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
