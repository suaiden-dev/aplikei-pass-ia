import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import { AdminFeedbackBanner } from '@shared/components/organisms/AdminFeedbackBanner';
import { F1StepContent } from "./components/F1StepContent";
import { useF1Onboarding } from "@features/onboarding/f1/hooks/useF1Onboarding";
import { type F1OnboardingLabels } from './types';
import { type DS160FormValues } from '@features/onboarding/b1b2/schemas/ds160.schema';

function buildLabels(t: any): F1OnboardingLabels {
  return {
    stepLabel: t.onboardingPage.stepLabel || "Step",
    ds160Form: t.onboardingPage.ds160Form || "DS-160 Form",
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
    f1Title: t.onboardingPage.f1?.title || "F1 Student",
    f1ReapplicationTitle: t.onboardingPage.f1?.reapplicationTitle || "F1 Reapplication",
    guidedFilling: t.onboardingPage.guidedFilling || "Guided Filling",
    consularFee: t.onboardingPage.consularFee,
    slipGeneratingByTeam: t.onboardingPage.slipGeneratingByTeam,
    slipGenerationDesc: t.onboardingPage.slipGenerationDesc,
    backToDashboard: t.onboardingPage.backToDashboard,
    accountCreationNotice: t.onboardingPage.accountCreationNotice,
    accountCreationNoticeHeader: t.onboardingPage.accountCreationNoticeHeader,
    accountCreationDesc: t.onboardingPage.accountCreationDesc,
    requiredFieldsTitle: t.onboardingPage.requiredFieldsTitle,
    requiredFieldsDesc: t.onboardingPage.requiredFieldsDesc,
    creatingCredentialsTitle: t.onboardingPage.feeProcessing?.creatingCredentialsTitle,
    creatingCredentialsDesc: t.onboardingPage.feeProcessing?.creatingCredentialsDesc,
    onboardingPage: t.onboardingPage
  }
}

export default function F1OnboardingPage() {
  const t = useT('visas') as any
  const { user } = useAuth()
  const navigate = useNavigate()
  const labels = buildLabels(t)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    isLoading,
    procId,
    procStatus,
    currentStep,
    slug,
    stepIdx,
    adminFeedback,
    savedValues,
    handleSubmit: controllerSubmit,
    handleSaveDraft: controllerSaveDraft,
  } = useF1Onboarding(user?.id);

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
    setIsSubmitting(true)
    await controllerSubmit(values)
    setIsSubmitting(false)
  }

  const handleSaveDraft = async (values: Partial<DS160FormValues>) => {
    await controllerSaveDraft(values)
  }

  const handleNavigateToProcess = () => {
    navigate(`/dashboard/processes/${slug}${procId ? `?id=${procId}` : ""}`)
  }

  const formatStepLabel = (idx: number) => {
    const total = 13
    return `${idx + 1} ${labels.of} ${total}`
  }

  const isFinalSchedulingStep = stepIdx >= 11
  const headerTitle = isFinalSchedulingStep
    ? (t.processSteps?.f1_final_scheduling?.title || t.processSteps?.b1b2_final_scheduling?.title || "Final Scheduling and Preparation")
    : stepIdx === 1
      ? labels.onboardingPage.f1.supportDocsStep
      : labels.ds160Form

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <RiLoader4Line className='text-4xl text-primary animate-spin' />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-sm">
        <div className='max-w-4xl mx-auto px-6 h-[72px] py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={handleNavigateToProcess}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg-subtle transition-colors text-text-muted hover:text-text"
            >
              <RiArrowLeftLine className='text-xl' />
            </button>
            <div>
              <h1 className="text-sm font-black text-text uppercase tracking-tight">
                {headerTitle}
              </h1>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {slug === 'visto-f1-reaplicacao' || slug === 'visa-f1-reaplicacao'
                  ? `${labels.f1ReapplicationTitle} — ${labels.guidedFilling}`
                  : `${labels.f1Title} — ${labels.guidedFilling}`}
              </p>
            </div>
          </div>

          <div className='hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
            <span className='text-[11px] font-black text-primary tracking-widest uppercase'>
              {labels.stepLabel} {formatStepLabel(stepIdx)}
            </span>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 mt-8'>
        {adminFeedback && (
          <AdminFeedbackBanner
            feedback={adminFeedback}
            label={labels.adjustmentsRequested}
          />
        )}

        <F1StepContent
          stepIdx={stepIdx}
          procId={procId}
          userId={user!.id}
          savedValues={savedValues}
          labels={labels}
          procStatus={procStatus}
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onNavigateToProcess={handleNavigateToProcess}
        />
      </div>
    </div>
  )
}
