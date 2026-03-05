import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, FileText, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const TOTAL_STEPS = 9;

const getStatusDisplay = (status: string, lang: string) => {
  if (!status) return { stepText: "", label: "" };

  // Legacy support
  if (status === "active") status = "ds160InProgress";
  if (status === "review_pending") status = "ds160Processing";
  if (status === "review_assign") status = "ds160AwaitingReviewAndSignature";
  if (status === "completed") status = "approved";

  let step = 0;
  let labelPt = "";
  let labelEn = "";

  switch (status) {
    case "ds160InProgress":
      step = 1;
      labelPt = "Preenchendo DS-160";
      labelEn = "Filling out DS-160";
      break;
    case "ds160Processing":
      step = 2;
      labelPt = "Processando DS-160";
      labelEn = "Processing DS-160";
      break;
    case "ds160upload_documents":
      step = 3;
      labelPt = "3. Anexar Documentos";
      labelEn = "3. Upload Documents";
      break;
    case "ds160AwaitingReviewAndSignature":
      step = 4;
      labelPt = "4. Revisão e Assinatura";
      labelEn = "4. Review and Signature";
      break;
    case "uploadsUnderReview":
      step = 4;
      labelPt = "4. Revisão de Documentos";
      labelEn = "4. Documents Review";
      break;
    case "casvSchedulingPending":
      step = 5;
      labelPt = "5. Agendamento Pendente";
      labelEn = "5. Scheduling Pending";
      break;
    case "casvFeeProcessing":
      step = 6;
      labelPt = "6. Taxa em Processamento";
      labelEn = "6. Fee in Processing";
      break;
    case "casvPaymentPending":
      step = 7;
      labelPt = "7. Pagamento CASV Pendente";
      labelEn = "7. CASV Payment Pending";
      break;
    case "awaitingInterview":
      step = 8;
      labelPt = "8. Aguardando Entrevista";
      labelEn = "8. Awaiting Interview";
      break;
    case "approved":
      step = 9;
      labelPt = "9. Aprovado";
      labelEn = "9. Approved";
      break;
    case "rejected":
      return {
        stepText: lang === "pt" ? "Processo Rejeitado" : "Process Rejected",
        label: lang === "pt" ? "Rejeitado" : "Rejected",
        step: 0,
        totalSteps: TOTAL_STEPS,
      };
    default:
      return { stepText: "", label: status };
  }

  const stepText =
    lang === "pt"
      ? `Etapa ${step} de ${TOTAL_STEPS}`
      : `Step ${step} of ${TOTAL_STEPS}`;
  const label = lang === "pt" ? labelPt : labelEn;

  return { stepText, label, step, totalSteps: TOTAL_STEPS };
};

export default function UserProcesses() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [services, setServices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: servicesData, error } = await supabase
        .from("user_services")
        .select("id, status, current_step, service_slug, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      if (servicesData) {
        const processedServices = servicesData.map((s) => {
          const statusInfo = getStatusDisplay(s.status, lang as string);
          let p = 0;

          if (s.status === "approved" || s.status === "completed") {
            p = 100;
          } else if (statusInfo.step > 0) {
            if (statusInfo.step === 1) {
              p = Math.min(Math.round(((s.current_step || 0) / 13) * 10), 10);
            } else {
              p = Math.round(((statusInfo.step - 1) / TOTAL_STEPS) * 100);
            }
          }

          return {
            ...s,
            calculatedProgress: p,
            statusLabel: statusInfo.label,
            stepText: statusInfo.stepText,
          };
        });

        setServices(processedServices);
      }
      setLoading(false);
    };
    fetchServices();
  }, [lang]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
          {lang === "pt" ? "Meus Processos" : "My Processes"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {lang === "pt"
            ? "Acompanhe o status de todos os seus guias e aplicações."
            : "Track the status of all your guides and applications."}
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-border">
              <p className="text-muted-foreground">
                {lang === "pt"
                  ? "Você ainda não possui processos ativos."
                  : "You don't have any active processes yet."}
              </p>
            </div>
          ) : (
            services.map((s) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() =>
                  navigate(`/dashboard/onboarding?service_id=${s.id}`)
                }
                className="relative text-left p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {s.statusLabel}
                  </Badge>
                </div>

                <h3 className="font-bold text-xl text-foreground mb-1 uppercase tracking-tight">
                  {s.service_slug?.replace("-", " ")}
                </h3>

                <p className="text-xs text-accent font-bold uppercase tracking-widest mb-4">
                  {s.stepText}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {lang === "pt" ? "Progresso" : "Progress"}
                    </span>
                    <span className="text-sm font-black text-primary">
                      {s.calculatedProgress}%
                    </span>
                  </div>
                  <Progress value={s.calculatedProgress} className="h-2" />
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  {lang === "pt" ? "ACESSAR DETALHES" : "ACCESS DETAILS"}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
