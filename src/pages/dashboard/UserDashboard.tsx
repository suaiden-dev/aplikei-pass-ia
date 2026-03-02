import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Upload,
  FileText,
  HelpCircle,
  ArrowRight,
  Briefcase,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const isAfterCheckout = !!searchParams.get("session_id");
  const { lang, t } = useLanguage();
  const d = t.dashboard;

  const [services, setServices] = useState<any[]>([]);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [docsUploaded, setDocsUploaded] = useState(0);

  // 1. Fetch all services and their individual progress
  useEffect(() => {
    const fetchServices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: servicesData, error } = await supabase
        .from("user_services")
        .select("id, status, current_step, service_slug, created_at")
        .eq("user_id", user.id)
        .in("status", ["active", "review_pending", "completed"])
        .order('created_at', { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }



      if (servicesData && servicesData.length > 0) {
        // Group by slug to keep only the most recent entry for each unique guide
        const uniqueServicesMap = new Map();

        servicesData.forEach(s => {
          if (!uniqueServicesMap.has(s.service_slug)) {
            let p = 0;
            if (s.status === 'review_pending' || s.status === 'completed') p = 100;
            else p = Math.min(Math.round(((s.current_step || 0) / 5) * 100), 100);

            uniqueServicesMap.set(s.service_slug, { ...s, calculatedProgress: p });
          }
        });

        const servicesWithProgress = Array.from(uniqueServicesMap.values());
        console.log("DEBUG: Serviços únicos processados:", servicesWithProgress);

        setServices(servicesWithProgress);


        // Pick the service from URL or the last one saved or the most recent
        const savedServiceId = localStorage.getItem('last_selected_service');
        const urlServiceId = searchParams.get('service_id');

        if (urlServiceId) {
          setCurrentServiceId(urlServiceId);
        } else if (savedServiceId && servicesWithProgress.find(s => s.id === savedServiceId)) {
          setCurrentServiceId(savedServiceId);
        } else {
          setCurrentServiceId(servicesWithProgress[0].id);
        }
      }
      setLoading(false);
    };
    fetchServices();
  }, [searchParams]);

  const currentService = services.find(s => s.id === currentServiceId) || services[0];

  // 2. Sync UI with current selection
  useEffect(() => {
    if (!currentService) return;

    localStorage.setItem('last_selected_service', currentService.id);
    setProgress(currentService.calculatedProgress);

    const fetchDocs = async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: 'exact', head: true })
        .eq("user_service_id", currentService.id);
      setDocsUploaded(count || 0);
    };
    fetchDocs();
  }, [currentServiceId, currentService]);

  const cards = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: d.cards.currentService[lang],
      desc: d.cards.currentServiceDesc[lang],
      status: currentService?.status === 'review_pending' ? (lang === 'pt' ? 'Em revisão' : 'In review') : d.cards.inProgress[lang],
      to: `/dashboard/onboarding?service_id=${currentServiceId}`
    },
    { icon: <CheckSquare className="h-5 w-5" />, title: d.cards.checklist[lang], desc: `${docsUploaded} de 4 documentos enviados`, progress: progress, to: `/dashboard/onboarding?service_id=${currentServiceId}` },
    { icon: <MessageSquare className="h-5 w-5" />, title: d.cards.chatAI[lang], desc: d.cards.chatAIDesc[lang], to: `/dashboard/chat?service_id=${currentServiceId}` },
    { icon: <Upload className="h-5 w-5" />, title: d.cards.uploads[lang], desc: d.cards.uploadsDesc[lang], to: `/dashboard/uploads?service_id=${currentServiceId}` },
    { icon: <FileText className="h-5 w-5" />, title: d.cards.generatePDF[lang], desc: d.cards.generatePDFDesc[lang], to: `/dashboard/pacote?service_id=${currentServiceId}`, disabled: progress < 100 },
    { icon: <HelpCircle className="h-5 w-5" />, title: d.cards.help[lang], desc: d.cards.helpDesc[lang], to: "/dashboard/ajuda" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">{d.welcome[lang]}</p>
        </div>
      </header>

      {/* Success Banner (if any) */}
      <AnimatePresence>
        {isAfterCheckout && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl border-2 border-green-500/20 bg-green-500/5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {lang === 'pt' ? 'Pagamento confirmado! Seu novo guia já está disponível abaixo.' : 'Payment confirmed! Your new guide is available below.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MULTI-SERVICE SELECTOR SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-foreground">
            {lang === 'pt' ? 'Seus Processos Ativos' : 'Your Active Processes'}
          </h2>
          <Badge variant="secondary" className="ml-2">{services.length}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentServiceId(s.id)}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${currentServiceId === s.id
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/40'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${currentServiceId === s.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                {currentServiceId === s.id && (
                  <Badge className="bg-primary text-white border-none">Ativo</Badge>
                )}
              </div>

              <h3 className="font-bold text-foreground mb-1">
                {s.service_slug?.toUpperCase().replace('-', ' ')}
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{s.status === 'active' ? (lang === 'pt' ? 'Em preenchimento' : 'Filling out') : s.status}</span>
                <span className="font-bold text-primary">{s.calculatedProgress}%</span>
              </div>

              <Progress value={s.calculatedProgress} className="h-1.5" />

              {currentServiceId !== s.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-border">
                    {lang === 'pt' ? 'Selecionar Processo' : 'Select Process'}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* ACTIVE SERVICE ACTIONS GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">
              {lang === 'pt' ? 'Gerenciar:' : 'Manage:'} <span className="text-primary font-black uppercase ml-1 italic">{currentService?.service_slug?.replace('-', ' ')}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (i * 0.05) }}
            >
              <Link
                to={card.disabled ? "#" : card.to}
                className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 ${card.disabled
                  ? "cursor-not-allowed opacity-50 grayscale"
                  : "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {card.icon}
                  </div>
                  {card.status && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                      {card.status}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {card.desc}
                </p>

                {card.progress !== undefined && (
                  <div className="mt-auto pt-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground mb-1">
                      <span>Progresso</span>
                      <span>{card.progress}%</span>
                    </div>
                    <Progress value={card.progress} className="h-1" />
                  </div>
                )}

                {!card.disabled && (
                  <div className="mt-auto pt-4 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    {lang === 'pt' ? 'ACESSAR AGORA' : 'ACCESS NOW'} <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
