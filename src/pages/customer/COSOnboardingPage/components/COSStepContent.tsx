import I539FormStep from '../I539FormStep'
import CoverLetterStep from '../CoverLetterStep'
import FinalFormsStep from '../FinalFormsStep'
import FinalPackageStep from '../FinalPackageStep'
import I20UploadStep from '../I20UploadStep'
import SevisFeeStep from '../SevisFeeStep'
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
import { useT } from '../../../../i18n'
import type { Dependent } from '../useCOSOnboardingPage'
import type { DocFile } from '../../../../components/DocUploadCard'
import type { UserService } from '../../../../services/process.service'
import type { UserAccount } from '../../../../models/user.model'
import type {
  USCISOutcome,
  MotionOutcome,
  RFEOutcome,
} from '../../../../models/process.model'

type OnboardingTranslations = ReturnType<typeof useT>

interface COSStepContentProps {
  t: OnboardingTranslations
  stepIdx: number
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
  if (stepIdx === 0) {
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

  if (stepIdx === 1) {
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

  if (stepIdx === 3 && proc && user) {
    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.i539.labels.header}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {t.cos.i539.labels.fillInstruction}
          </p>
        </div>
        <I539FormStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (stepIdx === 5 && proc && user) {
    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            Cover Letter Questionnaire
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            Please answer the questions below to help us generate your
            presentation letter for USCIS.
          </p>
        </div>
        <CoverLetterStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (stepIdx === 7 && proc && user) {
    return (
      <div className='px-8 py-6'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.i20Upload.title}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {t.cos.i20Upload.desc}
          </p>
        </div>
        <I20UploadStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (stepIdx === 8 && proc && user) {
    return (
      <div className='px-8 py-6 pb-24'>
        <div className='mb-6 border-b border-slate-100 pb-6'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.sevisFee.title}
          </h2>
          <p className='text-sm text-slate-400 font-medium mt-1'>
            {t.cos.sevisFee.desc}
          </p>
        </div>
        <SevisFeeStep proc={proc} user={user} onComplete={onComplete} />
      </div>
    )
  }

  if (stepIdx === 10 && proc && user) {
    return <FinalFormsStep proc={proc} user={user} onComplete={onComplete} />
  }

  if (stepIdx === 12 && proc && !isMotionContext && !isRFEContext) {
    return (
      <FinalPackageStep
        proc={proc}
        onComplete={onComplete}
        onJumpToStep={onJumpToStep}
        onUSCISResult={onUSCISResult}
      />
    )
  }

  if (stepIdx >= 13 && stepIdx <= 18 && isRFEContext) {
    if (stepIdx === 13 && proc) {
      return <RFEExplanationStep proc={proc} />
    }
    if (stepIdx === 14 && proc) {
      return <RFEInstructionStep proc={proc} onComplete={onComplete} />
    }
    if (stepIdx === 16 && proc) {
      return <RFEAcceptProposalStep proc={proc} />
    }
    if (stepIdx === 18 && proc) {
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

  if (stepIdx >= 19 && stepIdx <= 24 && isMotionContext) {
    if (stepIdx === 19 && proc) {
      return <MotionExplanationStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (stepIdx === 20 && proc) {
      return <MotionInstructionStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (stepIdx === 22 && proc) {
      return <MotionAcceptProposalStep proc={proc} user={user} onComplete={onComplete} />
    }
    if (stepIdx === 24 && proc) {
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
