import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiArrowRightLine, RiLoader4Line, RiAlertLine, RiCheckLine } from 'react-icons/ri';
import { Formik, Form } from 'formik';
import { useAuth } from '../../../hooks/useAuth';
import { useT } from '../../../i18n';
import {
  useB1B2OnboardingController,
  type B1B2OnboardingLabels,
} from '../../../controllers/B1B2/B1B2OnboardingController';
import { AdminFeedbackBanner } from '../../../views/components/AdminFeedbackBanner';
import { DS160SingleFormStep } from './steps/DS160SingleFormStep';
import { B1B2UserReviewSignStep } from './steps/B1B2UserReviewSignStep';
import { B1B2CASVSchedulingStep } from './steps/B1B2CASVSchedulingStep';
import { B1B2UserConfirmEmailStep } from './steps/B1B2UserConfirmEmailStep';
import { B1B2MRVPaymentStep } from './steps/B1B2MRVPaymentStep';
import { B1B2FinalPreparationStep } from './steps/B1B2FinalPreparationStep';
import { ds160Validator, type DS160FormValues } from '../../../schemas/ds160.schema';

function buildLabels(t: Record<string, any>): B1B2OnboardingLabels {
  return {
    stepLabel: t.onboardingPage.stepLabel,
    ds160Form: t.onboardingPage.ds160Form,
    saveDraft: t.onboardingPage.saveDraft,
    finalizeAndSubmit: t.onboardingPage.finalizeAndSubmit,
    awaitingReview: t.onboardingPage.awaitingReview,
    errorNotFound: t.onboardingPage.errorNotFound,
    errorLoad: t.onboardingPage.errorLoad,
    successSubmit: t.onboardingPage.successSubmit,
    successDraft: t.onboardingPage.successDraft,
    errorSave: t.onboardingPage.errorSave,
    errorDraft: t.onboardingPage.errorDraft,
    adjustmentsRequested: t.onboardingPage.adjustmentsRequested,
    of: t.onboardingPage.of,
    b1b2Title: t.onboardingPage.b1b2Title,
    b1b2ReapplicationTitle: t.onboardingPage.b1b2ReapplicationTitle,
    guidedFilling: t.onboardingPage.guidedFilling,
    consularFee: t.onboardingPage.consularFee,
    slipGeneratingByTeam: t.onboardingPage.slipGeneratingByTeam,
    slipGenerationDesc: t.onboardingPage.slipGenerationDesc,
    backToDashboard: t.onboardingPage.backToDashboard,
    accountCreationNotice: t.onboardingPage.accountCreationNotice,
    accountCreationNoticeHeader: t.onboardingPage.accountCreationNoticeHeader,
    accountCreationDesc: t.onboardingPage.accountCreationDesc,
    requiredFieldsTitle: t.onboardingPage.requiredFieldsTitle,
    requiredFieldsDesc: t.onboardingPage.requiredFieldsDesc,
  };
}

export default function B1B2OnboardingPage() {
  const t = useT('visas');
  const { user } = useAuth();
  const navigate = useNavigate();
  const labels = buildLabels(t);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isLoading,
    procId,
    procStatus,
    currentStep,
    adminFeedback,
    savedValues,
    stepIdx,
    slug,
    handleSubmit: controllerSubmit,
    handleSaveDraft: controllerSaveDraft,
  } = useB1B2OnboardingController({
    userId: user?.id,
    labels,
  });

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
    setIsSubmitting(true);
    await controllerSubmit(values);
    setIsSubmitting(false);
  };

  const handleSaveDraft = async (values: Partial<DS160FormValues>) => {
    await controllerSaveDraft(values);
  };

  const handleNavigateToProcess = () => {
    navigate(`/dashboard/processes/${slug}`);
  };

  const formatStepLabel = (idx: number) => {
    const total = 11;
    if (idx === 10) return `${total} ${labels.of} ${total}`;
    if (idx === 9) return `10 ${labels.of} ${total}`;
    if (idx === 8) return `9 ${labels.of} ${total}`;
    if (idx === 7) return `8 ${labels.of} ${total}`;
    if (idx === 6) return `7 ${labels.of} ${total}`;
    if (idx === 5) return `6 ${labels.of} ${total}`;
    if (idx === 3) return `4 ${labels.of} ${total}`;
    return `1 ${labels.of} ${total}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 pb-24">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleNavigateToProcess}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
            >
              <RiArrowLeftLine className="text-xl" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {labels.ds160Form}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {slug === 'visto-b1-b2-reaplicacao'
                  ? `${labels.b1b2ReapplicationTitle} — ${labels.guidedFilling}`
                  : `${labels.b1b2Title} — ${labels.guidedFilling}`}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black text-primary tracking-widest uppercase">
              {labels.stepLabel} {formatStepLabel(stepIdx)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {adminFeedback && stepIdx !== 3 && (
          <AdminFeedbackBanner
            feedback={adminFeedback}
            label={labels.adjustmentsRequested}
          />
        )}

        {stepIdx >= 10 ? (
          <B1B2FinalPreparationStep
            procId={procId!}
            stepData={savedValues}
            onComplete={handleNavigateToProcess}
          />
        ) : stepIdx === 9 ? (
          <B1B2MRVPaymentStep
            procId={procId!}
            stepData={savedValues}
            onComplete={handleNavigateToProcess}
          />
        ) : stepIdx === 8 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <RiLoader4Line className="text-3xl animate-spin" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
              {labels.consularFee}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              <strong>{labels.slipGeneratingByTeam}</strong>
              <br />
              {labels.slipGenerationDesc}
            </p>
            <button
              onClick={handleNavigateToProcess}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
            >
              {labels.backToDashboard}
            </button>
          </div>
        ) : stepIdx === 7 ? (
          <B1B2UserConfirmEmailStep
            procId={procId!}
            onComplete={handleNavigateToProcess}
            onBack={handleNavigateToProcess}
          />
        ) : stepIdx === 6 ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <RiLoader4Line className="text-3xl animate-spin" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase">
              {labels.accountCreationNotice}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              <strong>{labels.accountCreationNoticeHeader}</strong>
              <br />
              {labels.accountCreationDesc}
            </p>
            <button
              onClick={handleNavigateToProcess}
              className="px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {labels.backToDashboard}
            </button>
          </div>
        ) : stepIdx === 5 ? (
          <B1B2CASVSchedulingStep
            procId={procId!}
            stepData={savedValues}
            onComplete={handleNavigateToProcess}
            onBack={handleNavigateToProcess}
          />
        ) : stepIdx === 3 ? (
          <B1B2UserReviewSignStep
            procId={procId!}
            userId={user!.id}
            stepData={savedValues}
            onComplete={handleNavigateToProcess}
            onBack={handleNavigateToProcess}
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
            {({ errors, values, submitCount, isSubmitting: formSubmitting }) => {
              const hasVisibleErrors = submitCount > 0 && Object.keys(errors).length > 0;

              return (
                <Form noValidate>
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
                          {labels.requiredFieldsTitle}
                        </h3>
                        <p className="text-sm text-red-600 font-medium">
                          {labels.requiredFieldsDesc.replace('{count}', Object.keys(errors).length.toString())}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="p-6 sm:p-10 space-y-0">
                      <DS160SingleFormStep />
                    </div>

                    {procStatus === 'awaiting_review' || currentStep > stepIdx ? (
                      <div className="px-6 sm:px-10 py-10 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center text-center">
                        {currentStep > stepIdx ? (
                          <div className="space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                              <RiCheckLine className="text-2xl" />
                            </div>
                            <p className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                              Etapa Aprovada
                            </p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                              Todas as informações desta fase já foram validadas.
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-xs">
                            <RiLoader4Line className="text-xl animate-spin text-primary" />
                            {labels.awaitingReview}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 sm:px-10 py-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(values)}
                          disabled={formSubmitting || isSubmitting}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                          {labels.saveDraft}
                        </button>

                        <button
                          type="submit"
                          disabled={formSubmitting || isSubmitting}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {formSubmitting || isSubmitting ? (
                            <RiLoader4Line className="animate-spin text-lg" />
                          ) : (
                            <>
                              {labels.finalizeAndSubmit}
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
