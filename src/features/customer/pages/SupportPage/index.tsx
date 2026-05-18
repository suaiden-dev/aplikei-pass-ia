import { motion } from "framer-motion";
import { RiQuestionLine } from "react-icons/ri";

export default function SupportPage() {
  return (
    <div className="p-12 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="font-display font-black text-[32px] text-slate-900 leading-tight tracking-tight mb-8">Support</h1>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <RiQuestionLine className="text-4xl text-slate-200" />
          </div>
          <p className="text-lg font-bold text-slate-400">Need help?</p>
          <p className="text-sm font-medium text-slate-300 mt-1 mb-6">Our support team is available 24/7.</p>
          <button className="px-8 py-3 rounded-xl bg-primary text-white font-black uppercase text-[12px] tracking-widest hover:bg-primary-hover transition-colors">
            Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  );
}
