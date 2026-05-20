import I539FormStep from '../I539FormStep'
import CoverLetterStep from '../CoverLetterStep'
import FinalFormsStep from '../FinalFormsStep'
import FinalPackageStep from '../FinalPackageStep'
import SevisFeeStep from '../SevisFeeStep'
import { F1I20UploadStep } from "@features/onboarding/f1/pages/F1OnboardingPage/steps/F1I20UploadStep"
import {
  MotionAcceptProposalStep,
  MotionEndStep,
  MotionExplanationStep,
  MotionInstructionStep,
} from '../MotionWorkflow'
import {
  RFEAcceptProposalStep,
  RFEEndStep,
  RFEExplanationStep,
  RFEInstructionStep,
} from '../RFEWorkflow'
import { COSApplicationStep } from './COSApplicationStep'
import { COSDocumentsStep } from './COSDocumentsStep'
import COSProcessingFallbackStep from './COSProcessingFallbackStep'
import { useT } from "@app/app/i18n";
import type { Dependent } from '../useCOSOnboardingPage'
import type { DocFile } from '@shared/components/molecules/DocUploadCard'
import type { UserService } from "@features/process/types";
import type { UserAccount } from '@shared/types/user.model'
import type {
  USCISOutcome,
  MotionOutcome,
  RFEOutcome,
} from '@shared/types/process.model'

type OnboardingTranslations = ReturnType<typeof useT>

interface COSStepContentProps {
  t: OnboardingTranslations
  stepIdx: number
  currentStepId?: string
  proc: UserService | null
  user: UserAccount | null | undefined
  serviceTitle?: string
  serviceDescription?: string
  isReadOnly: boolean
  isMotionContext: boolean
  isRFEContext: boolean
  currentVisa: string | null
  targetVisa: string | null
  i94Date: string
  dependents: Dependent[]
  docs: Record<string, DocFile>
  isFieldRejected: (key: string) => boolean
  setCurrentVisa: (value: string | null) => void
  setTargetVisa: (value: string | null) => void
  setI94Date: (value: string) => void
  addDependent: () => void
  updateDependent: (id: string, field: keyof Dependent, value: string) => void
  removeDependent: (id: string) => void
  getDocSlots: () => {
    key: string
    title: string
    subtitle: string
    category: string
  }[]
  onDocChange: (key: string, file: File) => void
  onComplete: () => Promise<void>
  onBuyDependentSlot: () => void
  onRefreshSlots: () => void
  onJumpToStep: (targetStep: number) => void
  onUSCISResult?: (result: USCISOutcome, opts: { jumpToStep: (n: number) => void }) => Promise<void>
  onMotionResult?: (result: MotionOutcome) => Promise<void>
  onRFEResult?: (result: RFEOutcome, opts: { jumpToStep: (n: number) => void }) => Promise<void>
}

export function COSStepContent({
  t,
  stepIdx,
  currentStepId,
  proc,
  user,
  serviceTitle,
  serviceDescription,
  isReadOnly,
  isMotionContext,
  isRFEContext,
  currentVisa,
  targetVisa,
  i94Date,
  dependents,
  docs,
  isFieldRejected,
  setCurrentVisa,
  setTargetVisa,
  setI94Date,
  addDependent,
  updateDependent,
  removeDependent,
  getDocSlots,
  onDocChange,
  onComplete,
  onBuyDependentSlot,
  onRefreshSlots,
  onJumpToStep,
  onUSCISResult,
  onMotionResult,
  onRFEResult,
}: COSStepContentProps) {
  const f1Labels = useT('visas')

  if (currentStepId === 'cos_application_form') {
    return (
      <COSApplicationStep
        t={t}
        procStepData={proc?.step_data as Record<string, unknown> | undefined}
        currentVisa={currentVisa}
        targetVisa={targetVisa}
        i94Date={i94Date}
        dependents={dependents}
        isReadOnly={isReadOnly}
        isFieldRejected={isFieldRejected}
        setCurrentVisa={setCurrentVisa}
        setTargetVisa={setTargetVisa}
        setI94Date={setI94Date}
        addDependent={addDependent}
        updateDependent={updateDependent}
        removeDependent={removeDependent}
        onBuyDependentSlot={onBuyDependentSlot}
        onRefreshSlots={onRefreshSlots}
      />
    )
  }

  if (currentStepId === 'cos_documents') {
    return (
      <COSDocumentsStep
        t={t}
        docs={docs}
        isReadOnly={isReadOnly}
        isFieldRejected={isFieldRejected}
        getDocSlots={getDocSlots}
        onDocChange={onDocChange}
      />
    )
  }

  if (currentStepId === 'cos_i20_upload' && proc && user) {
    if (targetVisa !== 'F1') {
      return (
        <COSProcessingFallbackStep
          title={serviceTitle}
          description={serviceDescription}
        />
      )
    }

    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {serviceTitle}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {serviceDescription}
          </p>
        </div>
        <F1I20UploadStep
          procId={proc.id}
          userId={user.id}
          stepData={proc.step_data as Record<string, unknown>}
          labels={f1Labels}
          onComplete={onComplete}
          onBack={() => onJumpToStep(2)}
        />
      </div>
    )
  }

  if (currentStepId === 'cos_sevis_fee' && proc && user) {
    if (targetVisa !== 'F1') {
      return (
        <COSProcessingFallbackStep
          title={serviceTitle}
          description={serviceDescription}
        />
      )
    }

    return (
      <div className='px-8 py-6'>
        <SevisFeeStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (currentStepId === 'cos_presentation_letter' && proc && user) {
    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {serviceTitle}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {serviceDescription}
          </p>
        </div>
        <CoverLetterStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (currentStepId === 'cos_official_forms' && proc && user) {
    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {serviceTitle}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {serviceDescription}
          </p>
        </div>
        <I539FormStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (currentStepId === 'cos_final_forms' && proc && user) {
    return <FinalFormsStep proc={proc} user={user} onComplete={onComplete} />
  }

  if (currentStepId === 'cos_final_package' && proc && !isMotionContext && !isRFEContext) {
    return (
      <FinalPackageStep
        proc={proc}
        onComplete={onComplete}
        onJumpToStep={onJumpToStep}
        onUSCISResult={onUSCISResult}
      />
    )
  }

  if (isRFEContext) {
    if (currentStepId === 'cos_rfe_explanation' && proc) {
      return <RFEExplanationStep proc={proc} />
    }
    if (currentStepId === 'cos_rfe_instruction' && proc) {
      return <RFEInstructionStep proc={proc} onComplete={onComplete} />
    }
    if (currentStepId === 'cos_rfe_accept_proposal' && proc) {
      return <RFEAcceptProposalStep proc={proc} />
    }
    if (currentStepId === 'cos_rfe_end' && proc) {
      return (
        <RFEEndStep
          proc={proc}
          onComplete={onComplete}
          onJumpToMotion={() => onJumpToStep(19)}
          onJumpToNewRFE={() => onJumpToStep(13)}
          onRFEResult={(res) => onRFEResult!(res, { jumpToStep: onJumpToStep })}
        />
      )
    }
  }

  if (isMotionContext) {
    if (currentStepId === 'cos_motion_acquisition' && proc) {
      return <MotionExplanationStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (currentStepId === 'cos_motion_instruction' && proc) {
      return <MotionInstructionStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (currentStepId === 'cos_motion_accept_proposal' && proc) {
      return <MotionAcceptProposalStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (currentStepId === 'cos_motion_end' && proc) {
      return (
        <MotionEndStep
          proc={proc}
          user={user}
          onComplete={onComplete}
          onMotionResult={onMotionResult}
        />
      )
    }
  }

  return (
    <COSProcessingFallbackStep
      title={serviceTitle}
      description={serviceDescription}
    />
  )
}

export default COSStepContent
