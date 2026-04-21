import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiChat3Line, RiLoader4Line } from "react-icons/ri";
import { useT } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { processService, type UserService } from "../../../services/process.service";
import { SupportChat } from "../../../components/SupportChat";

export default function AIChatPage() {
  const t = useT("dashboard");
  const { user } = useAuth();
  const [activeProcess, setActiveProcess] = useState<UserService | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const services = await processService.getUserServices(user.id);
        const active = services.find(s => s.status === "active" || s.status === "awaiting_review");
        setActiveProcess(active || services[0] || null);
      } catch (err) {
        console.error("Error loading services for chat:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);
  
  return (
    <div className="p-12 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="font-display font-black text-[32px] text-slate-900 leading-tight tracking-tight mb-8 text-left uppercase">{t.chat.title}</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <RiLoader4Line className="text-4xl text-primary animate-spin" />
          </div>
        ) : activeProcess && user ? (
          <div className="max-w-4xl mx-auto">
             <SupportChat 
               processId={activeProcess.id} 
               userId={user.id} 
               role="customer" 
               userName="Consultor Aplikei" 
             />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <RiChat3Line className="text-4xl text-slate-200" />
            </div>
            <p className="text-lg font-bold text-slate-400">{t.chat.initialMessage.split('\n')[0]}</p>
            <p className="text-sm font-medium text-slate-300 mt-1 mb-8">{t.chat.subtitle}</p>
            <div className="w-full max-w-md px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-400 text-sm">
              {t.chat.previewResponse.split('!')[1]?.trim() || "Olá! Como posso ajudar?"}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
