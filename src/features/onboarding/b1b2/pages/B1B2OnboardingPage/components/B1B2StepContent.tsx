import { useState } from 'react'
import { RiLoader4Line, RiArrowLeftLine, RiArrowRightLine, RiCheckboxCircleFill } from 'react-icons/ri'
import { B1B2UserReviewSignStep } from '../steps/B1B2UserReviewSignStep'
import { B1B2CASVSchedulingStep } from '../steps/B1B2CASVSchedulingStep'
import { B1B2UserConfirmEmailStep } from '../steps/B1B2UserConfirmEmailStep'
import { B1B2MRVPaymentStep } from '../steps/B1B2MRVPaymentStep'
import { B1B2FinalPreparationStep } from '../steps/B1B2FinalPreparationStep'
import { DS160SingleFormStep } from '../steps/DS160SingleFormStep'
import { DS160FormShell } from "@features/onboarding/shared/components/DS160FormShell";
import { DS160_SECTION_FIELDS } from "@features/onboarding/shared/constants/ds160Sections";
import { OnboardingNoticeStep } from "@features/onboarding/shared/components/OnboardingNoticeStep";
import type { B1B2OnboardingLabels } from '@features/onboarding/b1b2/types'
import { ds160Validator, type DS160FormValues } from '@features/onboarding/b1b2/schemas/ds160.schema'

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
        emphasis="amber"
        description={labels.slipGenerationDesc}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 7) {
    return (
      <B1B2UserConfirmEmailStep
        procId={procId}
        email={savedValues.primaryEmail}
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

  if (stepIdx === 2) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-purple-500' />}
        iconContainerClassName='bg-purple-50'
        title={labels.creatingCredentialsTitle || 'Criando suas credenciais...'}
        emphasis="primary"
        description={labels.creatingCredentialsDesc || 'Nossa equipe está configurando seu acesso no sistema consular. Isso costuma ser rápido.'}
        buttonLabel={labels.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  const isCompleted = currentStep > stepIdx
  const isAwaiting = procStatus === 'awaiting_review'
  // Only lock the form if it's explicitly completed OR if it's awaiting review AND has advanced past step 0.
  // This prevents the form from locking if the status got desynced and stuck in awaiting_review while still on step 0.
  const isReadOnly = isCompleted || (isAwaiting && currentStep > 0)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const handleFormSubmit = async (values: Partial<DS160FormValues>) => {
    await onSubmit(values)
    setJustSubmitted(true)
  }

  return (
    <DS160FormShell
      initialValues={savedValues}
      validate={ds160Validator}
      onSubmit={handleFormSubmit}
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
        currentSection,
        totalSections,
        isFirstSection,
        isLastSection,
        isValid,
        onPrevious,
        onNext,
        onFinalize,
      }) => {

        return (
          <div className="flex flex-col border-t border-border bg-bg-subtle/50">
            <div className="px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!isFirstSection && (
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={formBusy}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RiArrowLeftLine className="text-lg" />
                    {labels.previous || 'Anterior'}
                  </button>
                )}

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => void onSaveDraft(values)}
                    disabled={formBusy}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all disabled:opacity-50"
                  >
                    {labels.saveDraft}
                  </button>
                )}
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!isLastSection ? (
                  <button
                    type="button"
                    onClick={() => void onNext()}
                    disabled={formBusy}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {labels.nextSection || 'Próxima seção'}
                    <RiArrowRightLine className="text-lg" />
                  </button>
                ) : (
                  isReadOnly && !justSubmitted ? (
                    <button
                      type='button'
                      onClick={onNavigateToProcess}
                      className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-card border border-border text-text font-black text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all flex items-center justify-center gap-2'
                    >
                      {labels.backToDashboard || 'Voltar ao Painel'}
                    </button>
                  ) : isValid ? (
                    <button
                      type='button'
                      onClick={onFinalize}
                      disabled={formBusy || justSubmitted}
                      className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
                    >
                      {formBusy || justSubmitted ? (
                        <>
                          {justSubmitted ? (
                            <RiCheckboxCircleFill className='text-lg text-emerald-300' />
                          ) : (
                            <RiLoader4Line className='animate-spin text-lg' />
                          )}
                          {justSubmitted ? (labels.sentSuccessfully || 'Enviado com sucesso!') : (labels.processing || 'Processando...')}
                        </>
                      ) : (
                        <>
                          {labels.finalizeAndSubmit}
                          <RiArrowRightLine className='text-lg' />
                        </>
                      )}
                    </button>
                  ) : null
                )}
              </div>
            </div>
          </div>
        )
      }}
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
