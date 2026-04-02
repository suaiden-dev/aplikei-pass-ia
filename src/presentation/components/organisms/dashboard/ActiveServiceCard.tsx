import { FileText, Loader2, ArrowRight, Zap, Activity } from "lucide-react";
import { Badge } from "@/presentation/components/atoms/badge";
import { Progress } from "@/presentation/components/atoms/progress";
import { getStatusDisplay } from "@/domain/user/UserProcessStatus";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActiveServiceCardProps {
  service: any;
  currentServiceId: string | null;
  checkingSelfieId: string | null;
  lang: string;
  t: any;
  onServiceClick: (service: any) => void;
}

export const ActiveServiceCard = ({ 
  service, 
  currentServiceId, 
  checkingSelfieId, 
  lang, 
  t, 
  onServiceClick 
}: ActiveServiceCardProps) => {
  const isSelected = currentServiceId === service.id;
  const isChecking = checkingSelfieId === service.id;
  const d = t?.dashboard || {};
  const status = d.status || {};

  const statusInfo = getStatusDisplay(
    service.status, 
    lang, 
    status, 
    service.serviceSlug
  );

  const displaySlug = service.serviceSlug?.replace("-", " ") || "Process";

  return (
    <motion.button
      key={service.id}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onServiceClick(service)}
      disabled={isChecking}
      className={cn(
        "relative w-full text-left p-5 rounded-[2rem] border-2 transition-all duration-300 group overflow-hidden shadow-md",
        isSelected
          ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
          : "border-slate-200 bg-white hover:border-primary/30 shadow-sm hover:shadow-xl",
        isChecking && "opacity-70 cursor-wait"
      )}
    >
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div
          className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300",
            isSelected ? "bg-primary text-white scale-105" : "bg-muted text-muted-foreground"
          )}
        >
          {isChecking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          {isSelected && service.status !== "rejected" && (
            <Badge className="bg-primary/10 text-primary border-primary/20 h-6 px-3 rounded-full font-black text-[9px] uppercase tracking-widest">
              {lang === "pt" ? "ATIVO" : "ACTIVE"}
            </Badge>
          )}
          {service.status === "rejected" && (
            <Badge variant="destructive" className="border-none font-black text-[9px] uppercase tracking-wider px-3 rounded-full">
              {status.rejectedLabel || "REJECTED"}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h3 className="font-display text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {displaySlug}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="font-black text-[9px] text-primary/60 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-2.5 w-2.5" /> {statusInfo.stepText}
              </span>
              <span className="text-foreground font-black uppercase text-xs tracking-tighter line-clamp-1">
                {statusInfo.label}
              </span>
            </div>
            <div className="flex flex-col items-end">
               <span className="font-black text-base text-primary leading-none">
                 {service.calculatedProgress}%
               </span>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={service.calculatedProgress} className="h-1.5 rounded-full bg-primary/10" />
            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <span className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                 <Zap className="h-2.5 w-2.5 fill-primary" /> {lang === 'pt' ? 'Continuar' : 'Continue'}
               </span>
               <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
