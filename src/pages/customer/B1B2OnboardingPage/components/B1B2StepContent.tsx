import { RiCheckLine, RiLoader4Line } from 'react-icons/ri'
import { DS160SingleFormStep } from '../steps/DS160SingleFormStep'
import { B1B2UserReviewSignStep } from '../steps/B1B2UserReviewSignStep'
import { B1B2CASVSchedulingStep } from '../steps/B1B2CASVSchedulingStep'
import { B1B2UserConfirmEmailStep } from '../steps/B1B2UserConfirmEmailStep'
import { B1B2MRVPaymentStep } from '../steps/B1B2MRVPaymentStep'
import { B1B2FinalPreparationStep } from '../steps/B1B2FinalPreparationStep'
import { DS160FormShell } from '../../shared/DS160FormShell'
import { DS160_SECTION_FIELDS } from '../../shared/ds160Sections'
import { OnboardingNoticeStep } from '../../shared/OnboardingNoticeStep'
import type { B1B2OnboardingLabels } from '../../../../controllers/B1B2/B1B2OnboardingController'
import { ds160Validator, type DS160FormValues } from '../../../../schemas/ds160.schema'

interface B1B2StepContentProps {
  stepIdx: number
  procId: string | null
  userId: string
  savedValues: Partial<DS160FormValues>
  labels: B1B2OnboardingLabels
  procStatus: string | null | undefined
  currentStep: number
  isSubmitting: boolean
  onSubmit: (values: Partial<DS160FormValues>) => Promise<void>
  onSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>
  onNavigateToProcess: () => void
}

export function B1B2StepContent({
  stepIdx,
  procId,
  userId,
  savedValues,
  labels,
  procStatus,
  currentStep,
  isSubmitting,
  onSubmit,
  onSaveDraft,
  onNavigateToProcess,
}: B1B2StepContentProps) {
  if (!procId) return null

  if (stepIdx >= 10) {
    return (
      <B1B2FinalPreparationStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 9) {
    return (
      <B1B2MRVPaymentStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 8) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-amber-500' />}
        iconContainerClassName='bg-amber-50'
        title={labels.consularFee}
        emphasis={labels.slipGeneratingByTeam}
        description={labels.slipGenerationDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
        buttonClassName='px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-mono'
      />
    )
  }

  if (stepIdx === 7) {
    return (
      <B1B2UserConfirmEmailStep
        procId={procId}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 6) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-blue-500' />}
        iconContainerClassName='bg-blue-50'
        title={labels.accountCreationNotice}
        emphasis={labels.accountCreationNoticeHeader}
        description={labels.accountCreationDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 5) {
    return (
      <B1B2CASVSchedulingStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 3) {
    return (
      <B1B2UserReviewSignStep
        procId={procId}
        userId={userId}
        stepData={savedValues}
        procStatus={procStatus}
        currentStep={currentStep}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  return (
    <DS160FormShell
      initialValues={savedValues}
      validate={ds160Validator}
      onSubmit={(values) => onSubmit(values)}
      onSaveDraft={onSaveDraft}
      requiredTitle={labels.requiredFieldsTitle}
      requiredDescription={labels.requiredFieldsDesc}
      saveLabel={labels.saveDraft}
      submitLabel={labels.finalizeAndSubmit}
      sectionFields={DS160_SECTION_FIELDS}
      isBusy={isSubmitting}
      renderFooter={({
        values,
        isSubmitting: formBusy,
        isFirstSection,
        isLastSection,
        onPrevious,
        onNext,
      }) =>
        procStatus === 'awaiting_review' || currentStep > stepIdx ? (
          <div className='px-6 sm:px-10 py-10 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center text-center'>
            {currentStep > stepIdx ? (
              <div className='space-y-3'>
                <div className='w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm'>
                  <RiCheckLine className='text-2xl' />
                </div>
                <p className='text-sm font-black text-emerald-900 uppercase tracking-widest'>
                  Etapa Aprovada
                </p>
                <p className='text-xs text-slate-400 font-bold uppercase tracking-widest'>
                  Todas as informações desta fase já foram validadas.
                </p>
              </div>
            ) : (
              <div className='flex items-center gap-3 text-slate-500 font-bold uppercase tracking-widest text-xs'>
                <RiLoader4Line className='text-xl animate-spin text-primary' />
                {labels.awaitingReview}
              </div>
            )}
          </div>
        ) : (
          <div className='px-6 sm:px-10 py-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
              {!isFirstSection && (
                <button
                  type='button'
                  onClick={onPrevious}
                  disabled={formBusy}
                  className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50'
                >
                  Anterior
                </button>
              )}

              <button
                type='button'
                onClick={() => void onSaveDraft(values)}
                disabled={formBusy}
                className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50'
              >
                {labels.saveDraft}
              </button>
            </div>

            {isLastSection ? (
              <button
                type='submit'
                disabled={formBusy}
                className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
              >
                {formBusy ? (
                  <RiLoader4Line className='animate-spin text-lg' />
                ) : (
                  <>
                    {labels.finalizeAndSubmit}
                    <span className='text-lg'>&rarr;</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type='button'
                onClick={() => void onNext()}
                disabled={formBusy}
                className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
              >
                Próxima seção
                <span className='text-lg'>&rarr;</span>
              </button>
            )}
          </div>
        )
      }
    >
      {(currentSection) => <DS160SingleFormStep currentSection={currentSection} />}
    </DS160FormShell>
  )
}
