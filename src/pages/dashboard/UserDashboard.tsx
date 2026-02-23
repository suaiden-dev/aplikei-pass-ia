import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, MessageSquare, Upload, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export default function UserDashboard() {
  const { lang, t } = useLanguage();
  const d = t.dashboard;
  const [progress, setProgress] = useState(0);
  const [docsUploaded, setDocsUploaded] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      console.log("Iniciando busca de progresso...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Usuário autenticado:", user?.id);

      if (!user) {
        console.warn("Nenhum usuário encontrado no fetchProgress");
        return;
      }

      console.log("Buscando serviço ativo para o usuário...");
      const { data: service, error: serviceError } = await supabase
        .from("user_services")
        .select("id, status, current_step")
        .eq("user_id", user.id)
        .in("status", ["active", "review_pending", "completed"])
        .maybeSingle();

      if (serviceError) {
        console.error("Erro ao buscar serviço:", serviceError);
      }

      console.log("Resultado da busca de serviço:", service);

      if (service) {
        // @ts-ignore
        if (service.status === 'review_pending' || service.status === 'completed') {
          setProgress(100);
        } else {
          // Onboarding has 5 steps (0-4), so current_step 5 means completed.
          // Safe fallback if current_step is undefined/null is 0
          // @ts-ignore
          const step = service.current_step || 0;
          const calculatedProgress = Math.min(Math.round((step / 5) * 100), 100);
          console.log("Progresso calculado:", calculatedProgress);
          setProgress(calculatedProgress);
        }

        // @ts-ignore
        setStatus(service.status);

        // Fetch uploaded docs count for checklist card
        const { count: docsCount } = await supabase
          .from("documents")
          .select("*", { count: 'exact', head: true })
          // @ts-ignore
          .eq("user_service_id", service.id);

        setDocsUploaded(docsCount || 0);

      } else {
        console.log("Nenhum serviço ativo encontrado para este usuário.");
      }
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const cards = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: d.cards.currentService[lang],
      desc: d.cards.currentServiceDesc[lang],
      status: status === 'review_pending' ? (lang === 'pt' ? 'Em revisão' : 'In review') : d.cards.inProgress[lang],
      to: "/dashboard/onboarding"
    },
    { icon: <CheckSquare className="h-5 w-5" />, title: d.cards.checklist[lang], desc: `${docsUploaded} de 4 documentos enviados`, progress: progress, to: "/dashboard/onboarding" },
    { icon: <MessageSquare className="h-5 w-5" />, title: d.cards.chatAI[lang], desc: d.cards.chatAIDesc[lang], to: "/dashboard/chat" },
    { icon: <Upload className="h-5 w-5" />, title: d.cards.uploads[lang], desc: d.cards.uploadsDesc[lang], to: "/dashboard/uploads" },
    { icon: <FileText className="h-5 w-5" />, title: d.cards.generatePDF[lang], desc: d.cards.generatePDFDesc[lang], to: "/dashboard/pacote", disabled: progress < 100 },
    { icon: <HelpCircle className="h-5 w-5" />, title: d.cards.help[lang], desc: d.cards.helpDesc[lang], to: "/dashboard/ajuda" },
  ];

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />

        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="mt-4 h-2 w-full" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card md:p-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-4 h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-4 h-1.5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">{d.title[lang]}</h1>
      <p className="mt-1 text-muted-foreground">{d.welcome[lang]}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{d.overallProgress[lang]}</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">{d.onboarding[lang]}</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">{progress}% {d.complete[lang]}</span>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={card.disabled ? "#" : card.to} className={`group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-card transition-all md:p-5 ${card.disabled ? "cursor-not-allowed opacity-50" : "hover:shadow-card-hover hover:border-accent/40"}`}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">{card.icon}</div>
                {card.status && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{card.status}</span>}
              </div>
              <h3 className="mt-3 font-display font-semibold text-foreground">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
              {card.progress !== undefined && <Progress value={card.progress} className="mt-3 h-1.5" />}
              {!card.disabled && <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-accent group-hover:underline">{d.access[lang]} <ArrowRight className="h-3 w-3" /></span>}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
