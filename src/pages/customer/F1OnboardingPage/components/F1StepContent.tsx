import { RiLoader4Line } from 'react-icons/ri'
import { DS160SingleFormStep } from '../../B1B2OnboardingPage/steps/DS160SingleFormStep'
import { B1B2UserReviewSignStep } from '../../B1B2OnboardingPage/steps/B1B2UserReviewSignStep'
import { B1B2CASVSchedulingStep } from '../../B1B2OnboardingPage/steps/B1B2CASVSchedulingStep'
import { B1B2UserConfirmEmailStep } from '../../B1B2OnboardingPage/steps/B1B2UserConfirmEmailStep'
import { B1B2MRVPaymentStep } from '../../B1B2OnboardingPage/steps/B1B2MRVPaymentStep'
import { F1I20UploadStep } from '../steps/F1I20UploadStep'
import { F1FinalPreparationStep } from '../steps/F1FinalPreparationStep'
import { DS160FormShell } from '../../shared/DS160FormShell'
import { DS160_SECTION_FIELDS } from '../../shared/ds160Sections'
import { OnboardingNoticeStep } from '../../shared/OnboardingNoticeStep'
import { ds160Validator, type DS160FormValues } from '../../../../schemas/ds160.schema'
import { type F1OnboardingLabels } from '../types'

interface F1StepContentProps {
  stepIdx: number
  procId: string | null
  userId: string
  savedValues: Partial<DS160FormValues>
  labels: F1OnboardingLabels
  procStatus?: string | null
  currentStep?: number
  isSubmitting?: boolean
  onSubmit: (values: Partial<DS160FormValues>) => Promise<void>
  onSaveDraft: (values: Partial<DS160FormValues>) => Promise<void>
  onNavigateToProcess: () => void
}

export function F1StepContent({
  stepIdx,
  procId,
  userId,
  savedValues,
  labels,
  procStatus,
  currentStep = 0,
  isSubmitting = false,
  onSubmit,
  onSaveDraft,
  onNavigateToProcess,
}: F1StepContentProps) {
  if (!procId) return null

  // Final scheduling/preparation screen (F1-specific)
  if (stepIdx >= 11) {
    return (
      <F1FinalPreparationStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
      />
    )
  }

  // 10: f1_user_mrv_payment
  if (stepIdx === 10) {
    return (
      <B1B2MRVPaymentStep
        procId={procId}
        stepData={savedValues}
        nextStepIdx={11}
        onComplete={onNavigateToProcess}
      />
    )
  }

  // 9: f1_admin_mrv_setup (Admin action)
  if (stepIdx === 9) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-amber-500' />}
        iconContainerClassName='bg-amber-50'
        title={labels.consularFee}
        emphasis={labels.slipGeneratingByTeam}
        description={labels.onboardingPage.f1.mrvF1Desc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 8: f1_user_confirm_email
  if (stepIdx === 8) {
    return (
      <B1B2UserConfirmEmailStep
        procId={procId}
        nextStepIdx={9}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 7: f1_admin_account_creation (Admin action)
  if (stepIdx === 7) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-blue-500' />}
        iconContainerClassName='bg-blue-50'
        title={labels.onboardingPage.f1.creationNoticeF1}
        emphasis={labels.onboardingPage.f1.creationNoticeF1}
        description={labels.onboardingPage.f1.creationLongDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 6: f1_casv_scheduling
  if (stepIdx === 6) {
    return (
      <B1B2CASVSchedulingStep
        procId={procId}
        stepData={savedValues}
        nextStepIdx={7}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 5: f1_admin_final_analysis (Admin action)
  if (stepIdx === 5) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-primary' />}
        iconContainerClassName='bg-primary/5'
        title={labels.awaitingReview}
        emphasis={labels.awaitingReview}
        description={labels.onboardingPage.processingStatus.processingDataDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 3/4: f1_user_review_sign (compatibility with both workflow versions)
  if (stepIdx === 3 || stepIdx === 4) {
    return (
      <B1B2UserReviewSignStep
        procId={procId}
        userId={userId}
        stepData={savedValues}
        procStatus={procStatus}
        currentStep={currentStep}
        nextStepIdx={stepIdx + 1}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 2: f1_admin_analysis (Admin action)
  if (stepIdx === 2) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-primary' />}
        iconContainerClassName='bg-primary/5'
        title={labels.onboardingPage.processingStatus.reviewingDocs}
        emphasis={labels.onboardingPage.processingStatus.reviewingDocs}
        description={labels.onboardingPage.processingStatus.documentsReceivedDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  // 1: f1_i20_upload
  if (stepIdx === 1) {
    return (
      <F1I20UploadStep
        procId={procId}
        userId={userId}
        stepData={savedValues}
        labels={labels}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  const isReadOnly = procStatus === 'awaiting_review' || currentStep > stepIdx

  // 0: f1_form
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
      readOnly={isReadOnly}
      renderFooter={({
        values,
        isSubmitting: formBusy,
        onPrevious,
        onNext,
        onFinalize,
        isFirstSection,
        isLastSection,
      }) => (
        <div className='flex flex-col border-t border-border bg-bg-subtle/70'>
          <div className='px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
              {!isFirstSection && (
                <button
                  type='button'
                  onClick={onPrevious}
                  disabled={formBusy}
                  className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50'
                >
                  Anterior
                </button>
              )}

              {!isReadOnly && (
                <button
                  type='button'
                  onClick={() => void onSaveDraft(values)}
                  disabled={formBusy}
                  className='w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50'
                >
                  {labels.saveDraft}
                </button>
              )}
            </div>

            <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
              {!isLastSection ? (
                <button
                  type="button"
                  onClick={() => void onNext()}
                  disabled={formBusy}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Próxima seção
                  <span className="text-lg">&rarr;</span>
                </button>
              ) : isReadOnly ? (
                <button
                  type="button"
                  onClick={onNavigateToProcess}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3"
                >
                  Voltar ao Painel
                  <span className="text-lg">&rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onFinalize}
                  disabled={formBusy}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {formBusy ? (
                    <RiLoader4Line className="animate-spin text-lg" />
                  ) : (
                    <>
                      {labels.finalizeAndSubmit}
                      <span className="text-lg">&rarr;</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    >
      {(currentSection) => (
        <DS160SingleFormStep
          currentSection={currentSection}
          readOnly={isReadOnly}
        />
      )}
    </DS160FormShell>
  )
}
