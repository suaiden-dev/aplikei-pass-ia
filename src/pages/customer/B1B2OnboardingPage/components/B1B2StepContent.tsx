import { useState } from 'react'
import { RiCheckLine, RiLoader4Line, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri'
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
        onBack={onNavigateToProcess}
        buttonClassName='px-8 py-3 rounded-xl border border-border text-text font-bold text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all font-mono'
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

  const isCompleted = currentStep > stepIdx
  const isAwaiting = procStatus === 'awaiting_review'
  // Only lock the form if it's explicitly completed OR if it's awaiting review AND has advanced past step 0.
  // This prevents the form from locking if the status got desynced and stuck in awaiting_review while still on step 0.
  const isReadOnly = isCompleted || (isAwaiting && currentStep > 0)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const handleFormSubmit = async (values: Partial<DS160FormValues>) => {
    setJustSubmitted(true)
    await onSubmit(values)
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
      renderHeader={() => (
        <>
          {isAwaiting && stepIdx === 0 && (
            <div className='mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3 shadow-sm'>
              <RiLoader4Line className='text-amber-500 text-xl animate-spin shrink-0 mt-0.5' />
              <div>
                <p className='text-xs font-black text-amber-900 uppercase tracking-tight mb-1'>
                  Formulário em Análise Técnica
                </p>
                <p className='text-[11px] text-amber-700 font-medium leading-relaxed'>
                  Este formulário já foi enviado e está sendo revisado. Você
                  pode visualizar os dados, mas as alterações estão
                  temporariamente desativadas.
                </p>
              </div>
            </div>
          )}
        </>
      )}
      renderFooter={({
        values,
        isSubmitting: formBusy,
        currentSection,
        totalSections,
        isFirstSection,
        isLastSection,
        onPrevious,
        onNext,
      }) => {

        return (
          <div className="flex flex-col border-t border-border bg-bg-subtle/50">
            {isReadOnly && (
              <div className="px-6 py-4 border-b border-border/50 bg-bg-subtle/30 flex items-center justify-center gap-3">
                {isCompleted ? (
                  <>
                    <RiCheckLine className="text-emerald-500 text-lg" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Etapa Aprovada — Somente Visualização
                    </span>
                  </>
                ) : (
                  <>
                    <RiLoader4Line className="text-primary animate-spin text-lg" />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                      {labels.awaitingReview} — Somente Visualização
                    </span>
                  </>
                )}
              </div>
            )}

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
                    Anterior
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
                    Próxima seção
                    <RiArrowRightLine className="text-lg" />
                  </button>
                ) : (
                  isReadOnly && !justSubmitted ? (
                    <button
                      type='button'
                      onClick={onNavigateToProcess}
                      className='w-full sm:w-auto px-8 py-3.5 rounded-xl bg-card border border-border text-text font-black text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all flex items-center justify-center gap-2'
                    >
                      Voltar ao Painel
                    </button>
                  ) : (
                    <button
                      type='submit'
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
                          {justSubmitted ? 'Enviado com sucesso!' : 'Processando...'}
                        </>
                      ) : (
                        <>
                          {labels.finalizeAndSubmit}
                          <RiArrowRightLine className='text-lg' />
                        </>
                      )}
                    </button>
                  )
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
