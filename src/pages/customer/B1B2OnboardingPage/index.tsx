import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri'
import { useAuth } from '../../../hooks/useAuth'
import { useT } from '../../../i18n'
import {
  useB1B2OnboardingController,
  type B1B2OnboardingLabels,
} from '../../../controllers/B1B2/B1B2OnboardingController'
import { AdminFeedbackBanner } from '../../../views/components/AdminFeedbackBanner'
import type { DS160FormValues } from '../../../schemas/ds160.schema'
import { B1B2StepContent } from './components/B1B2StepContent'

function buildLabels(t: {
  onboardingPage: B1B2OnboardingLabels
}): B1B2OnboardingLabels {
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
  }
}

export default function B1B2OnboardingPage() {
  const t = useT('visas') as { onboardingPage: B1B2OnboardingLabels }
  const { user } = useAuth()
  const navigate = useNavigate()
  const labels = buildLabels(t)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  })

  const handleSubmit = async (values: Partial<DS160FormValues>) => {
    setIsSubmitting(true)
    await controllerSubmit(values)
    setIsSubmitting(false)
  }

  const handleSaveDraft = async (values: Partial<DS160FormValues>) => {
    await controllerSaveDraft(values)
  }

  const handleNavigateToProcess = () => {
    navigate(`/dashboard/processes/${slug}`)
  }

  const formatStepLabel = (idx: number) => {
    const total = 11
    if (idx === 10) return `${total} ${labels.of} ${total}`
    if (idx === 9) return `10 ${labels.of} ${total}`
    if (idx === 8) return `9 ${labels.of} ${total}`
    if (idx === 7) return `8 ${labels.of} ${total}`
    if (idx === 6) return `7 ${labels.of} ${total}`
    if (idx === 5) return `6 ${labels.of} ${total}`
    if (idx === 3) return `4 ${labels.of} ${total}`
    return `1 ${labels.of} ${total}`
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <RiLoader4Line className='text-4xl text-primary animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 pb-24'>
      <div className='bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm'>
        <div className='max-w-4xl mx-auto px-6 h-18 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={handleNavigateToProcess}
              className='w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700'
            >
              <RiArrowLeftLine className='text-xl' />
            </button>
            <div>
              <h1 className='text-sm font-black text-slate-800 uppercase tracking-tight'>
                {labels.ds160Form}
              </h1>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                {slug === 'visto-b1-b2-reaplicacao'
                  ? `${labels.b1b2ReapplicationTitle} — ${labels.guidedFilling}`
                  : `${labels.b1b2Title} — ${labels.guidedFilling}`}
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
        {adminFeedback && stepIdx !== 3 && (
          <AdminFeedbackBanner
            feedback={adminFeedback}
            label={labels.adjustmentsRequested}
          />
        )}

        <B1B2StepContent
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
