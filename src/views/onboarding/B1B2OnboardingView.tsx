import { Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import {
  RiArrowRightLine,
  RiLoader4Line,
  RiAlertLine,
  RiCheckLine,
} from 'react-icons/ri';
import { AdminFeedbackBanner } from '../components/AdminFeedbackBanner';
import { ds160Validator } from '../../schemas/ds160.schema';
import type { DS160FormValues } from '../../schemas/ds160.schema';
import { DS160SingleFormStep } from '../../pages/customer/B1B2OnboardingPage/steps/DS160SingleFormStep';

interface B1B2OnboardingViewProps {
  initialValues: Partial<DS160FormValues>;
  procStatus: string | null;
  currentStep: number;
  stepIdx: number;
  adminFeedback: string | null;
  isSubmitting: boolean;
  labels: {
    stepLabel: string;
    ds160Form: string;
    saveDraft: string;
    finalizeAndSubmit: string;
    awaitingReview: string;
    of: string;
    b1b2Title: string;
    b1b2ReapplicationTitle: string;
    guidedFilling: string;
    adjustmentsRequested: string;
    requiredFieldsTitle: string;
    requiredFieldsDesc: string;
  };
  onSubmit: (values: Partial<DS160FormValues>) => Promise<void>;
  onSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>;
}

export function B1B2OnboardingView({
  initialValues,
  procStatus,
  currentStep,
  stepIdx,
  adminFeedback,
  isSubmitting,
  labels,
  onSubmit,
  onSaveDraft,
}: B1B2OnboardingViewProps) {

  return (
    <Formik<Partial<DS160FormValues>>
      initialValues={initialValues}
      validate={ds160Validator}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnBlur
      validateOnChange={false}
    >
      {({ errors, values, submitCount }) => {
        const hasVisibleErrors = submitCount > 0 && Object.keys(errors).length > 0;

        return (
          <Form noValidate>
            {adminFeedback && stepIdx !== 3 && (
              <AdminFeedbackBanner
                feedback={adminFeedback}
                label={labels.adjustmentsRequested}
              />
            )}

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
                    onClick={() => onSaveDraft(values)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
                  >
                    {labels.saveDraft}
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
  );
}
