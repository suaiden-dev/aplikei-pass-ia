import { motion } from 'framer-motion';
import { RiErrorWarningLine } from 'react-icons/ri';

interface AdminFeedbackBannerProps {
  feedback: string;
  label: string;
}

export function AdminFeedbackBanner({ feedback, label }: AdminFeedbackBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4"
    >
      <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
        <RiErrorWarningLine className="text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">
          {label}
        </h3>
        <p className="text-sm text-red-700 font-medium leading-relaxed">"{feedback}"</p>
      </div>
    </motion.div>
  );
}
