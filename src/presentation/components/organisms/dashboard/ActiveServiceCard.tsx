import { FileText, Loader2 } from "lucide-react";
import { Badge } from "@/presentation/components/atoms/badge";
import { Progress } from "@/presentation/components/atoms/progress";
import { getStatusDisplay } from "@/domain/user/UserProcessStatus";

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
  const d = t.dashboard;

  const statusInfo = getStatusDisplay(
    service.status, 
    lang, 
    d.status, 
    service.serviceSlug
  );

  return (
    <button
      key={service.id}
      onClick={() => onServiceClick(service)}
      disabled={isChecking}
      className={`relative text-left p-5 rounded-md border-2 transition-all duration-300 group ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-primary/40"
      } ${isChecking ? "opacity-70 cursor-wait" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-2 rounded-md ${isSelected ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
        >
          {isChecking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileText className="w-5 h-5" />
          )}
        </div>
        {isSelected && service.status !== "rejected" && (
          <Badge className="bg-primary text-white border-none">
            {lang === "pt" ? "Ativo" : "Active"}
          </Badge>
        )}
        {service.status === "rejected" && (
          <Badge variant="destructive" className="border-none font-black text-[10px] uppercase tracking-wider">
            {d.status.rejectedLabel[lang]}
          </Badge>
        )}
      </div>

      <h3 className="font-bold text-foreground mb-1 uppercase tracking-tight">
        {service.serviceSlug?.replace("-", " ")}
      </h3>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[10px] text-accent uppercase tracking-wider">
            {statusInfo.stepText}
          </span>
          <span className="text-foreground font-medium">
            {statusInfo.label}
          </span>
        </div>
        <span className="font-bold text-primary">
          {service.calculatedProgress}%
        </span>
      </div>

      <Progress value={service.calculatedProgress} className="h-1.5" />

      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
          <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-border">
            {d.selectProcess[lang]}
          </span>
        </div>
      )}
    </button>
  );
};
