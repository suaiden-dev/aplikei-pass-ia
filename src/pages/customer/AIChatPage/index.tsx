import { motion } from "framer-motion";
import { RiChat3Line } from "react-icons/ri";

export default function AIChatPage() {
  return (
    <div className="p-12 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="font-display font-black text-[32px] text-slate-900 leading-tight tracking-tight mb-8">AI Chat</h1>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <RiChat3Line className="text-4xl text-slate-200" />
          </div>
          <p className="text-lg font-bold text-slate-400">Welcome to your AI Chat Assistant!</p>
          <p className="text-sm font-medium text-slate-300 mt-1 mb-8">Ask me anything about your processes.</p>
          <div className="w-full max-w-md px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-400 text-sm">
            AI Assistant is being prepared...
          </div>
        </div>
      </motion.div>
    </div>
  );
}
