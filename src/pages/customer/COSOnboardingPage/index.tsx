import { motion } from 'framer-motion'
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { useCOSOnboardingPage } from './useCOSOnboardingPage'
import COSStepContent from './components/COSStepContent'

export default function COSOnboardingPage() {
  const {
    t,
    user,
    stepIdx,
    proc,
    isLoading,
    isSubmitting,
    currentVisa,
    setCurrentVisa,
    targetVisa,
    setTargetVisa,
    i94Date,
    setI94Date,
    dependents,
    docs,
    isFieldRejected,
    isReadOnly,
    canSubmit,
    isMotionContext,
    isRFEContext,
    isMotionResultStep,
    addDependent,
    updateDependent,
    removeDependent,
    handleDocChange,
    handleConcluir,
    getDocSlots,
    goToProcess,
    jumpToOnboardingStep,
    handleUSCISResult,
    handleMotionResult,
    handleRFEResult,
    steps,
  } = useCOSOnboardingPage()

  if (isLoading || !t || !t.cos) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-4 text-center p-12 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in zoom-in-95'>
          <div className='w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner'>
            <RiLoader4Line className='text-3xl animate-spin' />
          </div>
          <div>
            <p className='text-xs font-black text-slate-800 uppercase tracking-widest'>
              Sincronizando Traduções
            </p>
            <p className='text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter'>
              Preparando interface personalizada...
            </p>
          </div>
        </div>
      </div>
    )
  }
  const currentStep = steps[stepIdx]
  const currentStepTitle = currentStep?.product_step?.title ?? t.cos.title
  const currentStepDescription = currentStep?.product_step?.description ?? undefined
  const totalSteps = steps.length

  return (
    <div className='min-h-screen bg-[#f8fafc] flex flex-col'>
      {isSubmitting && (
        <div className='fixed inset-0 z-[120] bg-white/70 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-5 flex items-center gap-3'>
            <RiLoader4Line className='text-2xl text-primary animate-spin' />
            <p className='text-sm font-black text-slate-700 uppercase tracking-wider'>
              Enviando etapa...
            </p>
          </div>
        </div>
      )}

      <div className='bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-black text-slate-900 tracking-tight'>
            {t.cos.title}
          </h1>
          <p className='text-xs text-slate-400 font-medium mt-0.5'>
            {t.cos.subtitle}{' '}
            <span className='text-primary font-black uppercase tracking-widest ml-1'>
              {t.cos.badge}
            </span>
          </p>
        </div>
      </div>

      <div className='flex-1 px-4 sm:px-8 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <RiCheckDoubleLine className='text-xl' />
              </div>
              <div>
                <p className='text-xs font-black text-primary uppercase tracking-widest'>
                  {t.cos.btns.completeStep}
                </p>
                <h2 className='text-lg font-black text-slate-900 tracking-tight'>
                  {currentStepTitle}
                </h2>
              </div>
            </div>

            <div className='hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500'>
              <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
              Step {stepIdx + 1} / {totalSteps}
            </div>
          </div>

          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className='bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden'
          >
            <COSStepContent
              t={t}
              stepIdx={stepIdx}
              proc={proc}
              user={user}
              serviceTitle={currentStepTitle}
              serviceDescription={currentStepDescription}
              isReadOnly={isReadOnly}
              isMotionContext={isMotionContext}
              isRFEContext={isRFEContext}
              currentVisa={currentVisa}
              targetVisa={targetVisa}
              i94Date={i94Date}
              dependents={dependents}
              docs={docs}
              isFieldRejected={isFieldRejected}
              setCurrentVisa={setCurrentVisa}
              setTargetVisa={setTargetVisa}
              setI94Date={setI94Date}
              addDependent={addDependent}
              updateDependent={updateDependent}
              removeDependent={removeDependent}
              getDocSlots={getDocSlots}
              onDocChange={handleDocChange}
              onComplete={handleConcluir}
              onBuyDependentSlot={() =>
                window.location.assign(
                  `/checkout/slot-dependente-cos?id=${proc?.id}&upgrade=true`,
                )
              }
              onRefreshSlots={() => window.location.reload()}
              onJumpToStep={jumpToOnboardingStep}
              onUSCISResult={handleUSCISResult}
              onMotionResult={handleMotionResult}
              onRFEResult={handleRFEResult}
            />
          </motion.div>

          {!isMotionResultStep && (
            <div className='flex items-center justify-between mt-6'>
              <button
                onClick={goToProcess}
                className='flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all'
              >
                <RiArrowLeftSLine className='text-lg' />
                {t.cos.btns.back || 'Back'}
              </button>

              {!isReadOnly &&
                ![3, 5, 7, 8, 10, 12, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24].includes(
                  stepIdx,
                ) && (
                  <button
                    onClick={() => void handleConcluir()}
                    disabled={!canSubmit || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
                      !canSubmit || isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className='animate-spin text-lg' />
                    ) : (
                      <>
                        <RiCheckDoubleLine className='text-lg' />
                        {t.cos.btns.completeStep || 'Complete Step'}
                      </>
                    )}
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
