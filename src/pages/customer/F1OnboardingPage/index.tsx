
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiAlertLine,
} from "react-icons/ri";
import { useAuth } from "../../../hooks/useAuth";
import { useT } from "../../../i18n";


import { F1StepContent } from "./components/F1StepContent";

import { useF1Onboarding } from "../../../features/onboarding/f1/hooks/useF1Onboarding";

export default function F1OnboardingPage() {
  const t = useT('visas') as any
  const { user } = useAuth()

  const {
    isLoading,
    procId,
    slug,
    stepIdx,
    adminFeedback,
    savedValues,
    handleSubmit,
    handleSaveDraft,
    navigate,
  } = useF1Onboarding(user?.id);

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
        <div className='max-w-4xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => navigate(`/dashboard/processes/${slug}`)}
              className='w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700'
            >
              <RiArrowLeftLine className='text-xl' />
            </button>
            <div>
              <h1 className='text-sm font-black text-slate-800 uppercase tracking-tight'>
                {stepIdx === 1
                  ? t.onboardingPage.f1.supportDocsStep
                  : t.onboardingPage.f1.ds160Step}
              </h1>
              <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                {slug === 'visto-f1-reaplicacao'
                  ? `${t.onboardingPage.f1.reapplicationTitle} — ${t.onboardingPage.guidedFilling}`
                  : `${t.onboardingPage.f1.title} — ${t.onboardingPage.guidedFilling}`}
              </p>
            </div>
          </div>

          <div className='hidden sm:flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-2 rounded-full'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
            <span className='text-[11px] font-black text-primary tracking-widest uppercase'>
              {t.onboardingPage.stepLabel} {stepIdx + 1}{' '}
              {t.onboardingPage.of} 13
            </span>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 mt-8'>
        {adminFeedback && (
          <div className='mb-8 bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4 items-start shadow-sm'>
            <div className='w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0'>
              <RiAlertLine className='text-xl' />
            </div>
            <div>
              <h4 className='text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1'>
                {t.onboardingPage.adjustmentsRequested}
              </h4>
              <p className='text-xs text-amber-800 font-bold leading-relaxed'>
                {adminFeedback}
              </p>
            </div>
          </div>
        )}

        <F1StepContent
          labels={t}
          procId={procId}
          userId={user!.id}
          savedValues={savedValues}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onNavigateToProcess={() => navigate(`/dashboard/processes/${slug}`)}
          stepIdx={stepIdx}
        />
      </div>
    </div>
  )
}
