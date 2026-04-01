import { Briefcase, Activity } from "lucide-react";
import { Badge } from "@/presentation/components/atoms/badge";
import { ActiveServiceCard } from "./ActiveServiceCard";
import { useT } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

interface ActiveProcessesSectionProps {
  services: any[];
  currentServiceId: string | null;
  checkingSelfieId: string | null;
  lang: string;
  onServiceClick: (service: any) => void;
}

export const ActiveProcessesSection = ({
  services,
  currentServiceId,
  checkingSelfieId,
  lang,
  onServiceClick,
}: ActiveProcessesSectionProps) => {
  const t = useT("dashboard");
  const d = t?.dashboard;

  if (services.length === 0 || !d) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
             </div>
             <h2 className="font-display text-2xl font-black uppercase tracking-tight text-foreground">
               {d.activeProcesses}
             </h2>
             <Badge variant="secondary" className="ml-2 h-6 px-3 rounded-full bg-primary/5 text-primary border-primary/10 font-black">
               {services.length}
             </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-1 pl-1">
             {lang === "pt" ? "Acompanhe o progresso e as próximas ações dos seus guias." : "Track the progress and next steps of your guides."}
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-500/5 text-green-600 border border-green-500/10 text-[10px] font-black uppercase tracking-widest">
           <Activity className="h-3 w-3 animate-pulse" /> Real-time Updates Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ActiveServiceCard 
              service={s}
              currentServiceId={currentServiceId}
              checkingSelfieId={checkingSelfieId}
              lang={lang}
              t={t}
              onServiceClick={onServiceClick}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
