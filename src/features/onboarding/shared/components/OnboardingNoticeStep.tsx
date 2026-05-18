import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface OnboardingNoticeStepProps {
  icon: ReactNode
  iconContainerClassName: string
  title: string
  emphasis: string
  description: string
  buttonLabel: string
  onBack: () => void
  buttonClassName?: string
}

export function OnboardingNoticeStep({
  icon,
  iconContainerClassName,
  title,
  emphasis,
  description,
  buttonLabel,
  onBack,
  buttonClassName = 'px-8 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all',
}: OnboardingNoticeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 text-center'
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ${iconContainerClassName}`}
      >
        {icon}
      </div>
      <h3 className='text-xl font-black text-slate-800 mb-2 uppercase tracking-tight'>
        {title}
      </h3>
      <p className='text-sm text-slate-500 font-medium mb-6 leading-relaxed'>
        <strong>{emphasis}</strong>
        <br />
        {description}
      </p>
      <button onClick={onBack} className={buttonClassName}>
        {buttonLabel}
      </button>
    </motion.div>
  )
}
