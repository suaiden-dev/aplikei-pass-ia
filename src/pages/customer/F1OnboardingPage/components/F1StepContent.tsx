import { RiLoader4Line } from 'react-icons/ri'
import {
  DS160SingleFormStep,
} from '../../B1B2OnboardingPage/steps/DS160SingleFormStep'
import { B1B2UserReviewSignStep } from '../../B1B2OnboardingPage/steps/B1B2UserReviewSignStep'
import { B1B2CASVSchedulingStep } from '../../B1B2OnboardingPage/steps/B1B2CASVSchedulingStep'
import { B1B2UserConfirmEmailStep } from '../../B1B2OnboardingPage/steps/B1B2UserConfirmEmailStep'
import { B1B2MRVPaymentStep } from '../../B1B2OnboardingPage/steps/B1B2MRVPaymentStep'
import { F1I20UploadStep } from '../steps/F1I20UploadStep'
import { F1FinalPreparationStep } from '../steps/F1FinalPreparationStep'
import { DS160FormShell } from '../../shared/DS160FormShell'
import { OnboardingNoticeStep } from '../../shared/OnboardingNoticeStep'
import { DS160_SECTION_FIELDS } from '../../shared/ds160Sections'
import {
  type F1OnboardingLabels,
  type UseF1OnboardingControllerResult,
} from '../../../../controllers/F1/F1OnboardingController'
import { ds160Validator, type DS160FormValues } from '../../../../schemas/ds160.schema'

export type F1ViewLabels = F1OnboardingLabels & {
  onboardingPage: F1OnboardingLabels['onboardingPage'] & {
    guidedFilling: string
    consularFee: string
    slipGeneratingByTeam: string
    backToDashboard: string
    requiredFieldsMissing: string
    fieldsToCorrect: string
    saveDraft: string
    reviewSign: {
      accountCreation: string
    }
    f1: F1OnboardingLabels['onboardingPage']['f1'] & {
      mrvF1Desc: string
      creationNoticeF1: string
      creationLongDesc: string
      finalAndSendDocs: string
    }
  }
}

interface F1StepContentProps {
  labels: F1ViewLabels
  procId: string | null
  userId: string
  savedValues: Partial<DS160FormValues>
  controller: Pick<
    UseF1OnboardingControllerResult,
    'stepIdx' | 'handleSubmit' | 'handleSaveDraft'
  >
  onNavigateToProcess: () => void
}

export function F1StepContent({
  labels,
  procId,
  userId,
  savedValues,
  controller,
  onNavigateToProcess,
}: F1StepContentProps) {
  if (!procId) return null

  const { stepIdx, handleSubmit, handleSaveDraft } = controller

  if (stepIdx >= 11) {
    return (
      <F1FinalPreparationStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 10) {
    return (
      <B1B2MRVPaymentStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 9) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-amber-500' />}
        iconContainerClassName='bg-amber-50'
        title={labels.onboardingPage.consularFee}
        emphasis={labels.onboardingPage.slipGeneratingByTeam}
        description={labels.onboardingPage.f1.mrvF1Desc}
        buttonLabel={labels.onboardingPage.backToDashboard}
        onBack={onNavigateToProcess}
        buttonClassName='px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-mono'
      />
    )
  }

  if (stepIdx === 8) {
    return (
      <B1B2UserConfirmEmailStep
        procId={procId}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 7) {
    return (
      <OnboardingNoticeStep
        icon={<RiLoader4Line className='text-3xl animate-spin text-blue-500' />}
        iconContainerClassName='bg-blue-50'
        title={labels.onboardingPage.reviewSign.accountCreation}
        emphasis={labels.onboardingPage.f1.creationNoticeF1}
        description={labels.onboardingPage.f1.creationLongDesc}
        buttonLabel={labels.onboardingPage.backToDashboard}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 6) {
    return (
      <B1B2CASVSchedulingStep
        procId={procId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 4) {
    return (
      <B1B2UserReviewSignStep
        procId={procId}
        userId={userId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  if (stepIdx === 1) {
    return (
      <F1I20UploadStep
        procId={procId}
        userId={userId}
        stepData={savedValues}
        onComplete={onNavigateToProcess}
        onBack={onNavigateToProcess}
      />
    )
  }

  return (
    <DS160FormShell
      initialValues={savedValues}
      validate={ds160Validator}
      onSubmit={(values) => handleSubmit(values)}
      onSaveDraft={handleSaveDraft}
      requiredTitle={labels.onboardingPage.requiredFieldsMissing}
      requiredDescription={labels.onboardingPage.fieldsToCorrect}
      saveLabel={labels.onboardingPage.saveDraft}
      submitLabel={labels.onboardingPage.f1.finalAndSendDocs}
      sectionFields={DS160_SECTION_FIELDS}
    >
      {(currentSection) => <DS160SingleFormStep currentSection={currentSection} />}
    </DS160FormShell>
  )
}
