import { Briefcase } from "lucide-react";
import { Badge } from "@/presentation/components/atoms/badge";
import { ActiveServiceCard } from "./ActiveServiceCard";
import { useT } from "@/i18n/LanguageContext";

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

  if (services.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-lg text-foreground">
          {t.activeProcesses}
        </h2>
        <Badge variant="secondary" className="ml-2">
          {services.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <ActiveServiceCard 
            key={s.id}
            service={s}
            currentServiceId={currentServiceId}
            checkingSelfieId={checkingSelfieId}
            lang={lang}
            t={t}
            onServiceClick={onServiceClick}
          />
        ))}
      </div>
    </section>
  );
};
