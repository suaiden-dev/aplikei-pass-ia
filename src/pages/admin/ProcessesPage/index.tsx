import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RiFileListLine,
  RiUserLine,
  RiSearchLine,
  RiLoader4Line,
  RiTimeLine,
  RiPlayLargeFill,
  RiCheckboxCircleLine,
  RiArrowRightSLine,
  RiFilter3Line,
  RiFilterOffLine,
  RiCheckDoubleLine
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import type { UserService } from "../../../features/process/types";
import { getServiceBySlug } from "../../../data/services";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useT } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { RiCalendarLine } from "react-icons/ri";

interface ProcessWithUser extends UserService {
  user_accounts?: {
    full_name: string;
    email?: string;
  };
  service_name?: string;
}

function getCurrentStepIndex(process: ProcessWithUser): number {
  const raw =
    process.current_step ??
    (typeof (process.step_data as any)?.current_step === "number"
      ? (process.step_data as any).current_step
      : Number((process.step_data as any)?.current_step ?? 0));

  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
}

function isAuxiliarySlug(slug: string) {
  return (
    slug.startsWith("dependent-") ||
    slug.startsWith("analysis-") ||
    slug.startsWith("mentoring-") ||
    slug.startsWith("consultancy-") ||
    slug.startsWith("analise-") ||
    slug.startsWith("mentoria-") ||
    slug.startsWith("dependente-") ||
    slug.startsWith("slot-") ||
    slug.startsWith("apoio-") ||
    slug.startsWith("revisao-") ||
    slug.startsWith("proposta-")
  );
}

export default function AdminProcessesPage() {
  const navigate = useNavigate();
  const t = useT("admin");
  const vt = useT("visas");
  const { user } = useAuth();
  const processRoutePrefix =
    user?.role === "master" ? "/master" :
      user?.role === "manager" ? "/manager" :
        "/admin";
  const [processes, setProcesses] = useState<ProcessWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Resolve office from user_accounts.office_id — works for admin_lawyers and managers.
      // Masters with no office see all processes.
      let officeId: string | null = null;
      if (user?.id) {
        const { data: accountRow } = await supabase
          .from("user_accounts")
          .select("office_id")
          .eq("id", user.id)
          .maybeSingle();
        officeId = accountRow?.office_id ?? null;
      }

      const query = supabase
        .from("user_services")
        .select("*")
        .order("created_at", { ascending: false });

      if (officeId) {
        query.eq("office_id", officeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      const base = (data || []) as ProcessWithUser[];
      const userIds = [...new Set(base.map((p) => p.user_id).filter(Boolean))];
      const slugs = [...new Set(base.map((p) => p.service_slug).filter(Boolean))];

      const [usersResult, servicesResult] = await Promise.all([
        userIds.length > 0
          ? supabase.from("profiles").select("id, full_name, email").in("id", userIds)
          : Promise.resolve({ data: [], error: null }),
        slugs.length > 0
          ? supabase.from("services").select("slug, name").in("slug", slugs)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (usersResult.error) throw usersResult.error;

      const usersById = Object.fromEntries(
        ((usersResult.data as Array<{ id: string; full_name?: string | null; email?: string | null }>) || [])
          .map((u) => [u.id, { full_name: u.full_name || t.shared.client, email: u.email || undefined }]),
      );

      const serviceNameBySlug = Object.fromEntries(
        ((servicesResult.data as Array<{ slug: string; name: string }>) || [])
          .map((s) => [s.slug, s.name]),
      );

      setProcesses(base.map((p) => ({
        ...p,
        user_accounts: usersById[p.user_id],
        service_name: serviceNameBySlug[p.service_slug],
      })));
    } catch (err: unknown) {
      console.error("Error loading processes:", err);
      toast.error(t.cases.messages.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [t, user]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const filteredForStats = processes.filter(p => !isAuxiliarySlug(p.service_slug));
    return {
      total: filteredForStats.length,
      awaiting: filteredForStats.filter(p => p.status === "awaiting_review").length,
      active: filteredForStats.filter(p => p.status === "active").length,
      completed: filteredForStats.filter(p => p.status === "completed").length,
    };
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    let result = processes;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.user_accounts?.full_name?.toLowerCase().includes(s) || 
        (p.user_accounts?.email && p.user_accounts.email.toLowerCase().includes(s))
      );
    }

    if (selectedService !== "all") {
      result = result.filter(p => p.service_slug === selectedService);
    }

    if (showOnlyPending) {
      result = result.filter(p => p.status === "awaiting_review");
    }

    return result.filter(p => !isAuxiliarySlug(p.service_slug));
  }, [processes, searchTerm, selectedService, showOnlyPending]);

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-text tracking-tight">{t.cases.title}</h1>
          <p className="text-sm text-text-muted mt-1 uppercase font-bold tracking-wider">
            {t.cases.subtitle}
          </p>
        </div>
        <button 
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-text-muted text-xs font-black uppercase tracking-widest hover:bg-bg-subtle transition-all shadow-sm"
        >
          <RiLoader4Line className={isLoading ? "animate-spin" : ""} />
          {t.cases.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t.cases.stats.total} value={stats.total} icon={<RiFileListLine />} color="bg-bg-subtle text-text-muted" />
        <StatCard label={t.cases.stats.awaiting} value={stats.awaiting} icon={<RiTimeLine />} color="bg-warning/10 text-warning" highlight={stats.awaiting > 0} />
        <StatCard label={t.cases.stats.active} value={stats.active} icon={<RiPlayLargeFill />} color="bg-primary/10 text-primary" />
        <StatCard label={t.cases.stats.completed} value={stats.completed} icon={<RiCheckboxCircleLine />} color="bg-success/10 text-success" />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="flex-1 relative group w-full">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder={t.cases.filters.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-card border border-border rounded-2xl text-sm font-medium text-text outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <RiFilter3Line className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-14 pl-11 pr-10 bg-card border border-border rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/30 transition-all shadow-sm appearance-none lg:min-w-[200px]"
            >
              <option value="all">{t.cases.filters.allProducts}</option>
              {[...new Map(processes.filter(p => !isAuxiliarySlug(p.service_slug)).map(p => [p.service_slug, p])).values()]
                .map(p => (
                  <option key={p.service_slug} value={p.service_slug}>
                    {p.service_name || getServiceBySlug(p.service_slug)?.title || p.service_slug}
                  </option>
                ))}
            </select>
          </div>

          <button 
            onClick={() => setShowOnlyPending(!showOnlyPending)}
            className={`h-14 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm border whitespace-nowrap ${showOnlyPending ? 'bg-warning/10 border-warning/20 text-warning shadow-warning/10' : 'bg-card border-border text-text-muted hover:bg-bg-subtle'}`}
          >
            {showOnlyPending ? <RiFilterOffLine className="text-base" /> : <RiTimeLine className="text-base" />}
            {showOnlyPending ? t.cases.filters.viewAll : t.cases.filters.pendingActions}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] border border-border shadow-xl shadow-black/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <RiLoader4Line className="text-4xl text-primary animate-spin" />
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-20 h-20 rounded-3xl bg-bg-subtle flex items-center justify-center mb-6">
              <RiFileListLine className="text-3xl text-border" />
            </div>
            <p className="text-text-muted font-bold tracking-tight text-lg">{t.cases.table.noResults}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-subtle/50">
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">{t.cases.table.client}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">{t.cases.table.service}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">{t.cases.table.payment}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border text-right">{t.cases.table.flowActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((p, idx) => {
                  const service = getServiceBySlug(p.service_slug);
                  const totalSteps = service?.steps.length || 12;
                  const currentStep = getCurrentStepIndex(p);
                  
                  // Derived status/progress
                  const isCOS = p.service_slug === 'troca-status' || p.service_slug === 'extensao-status';
                  let progressPerc = 100;
                  
                  if (p.status !== 'completed') {
                    if (!isCOS) {
                      progressPerc = Math.min(99, Math.round((currentStep / totalSteps) * 100));
                    } else {
                      if (currentStep <= 12) progressPerc = Math.min(60, Math.round((currentStep / 12) * 60));
                      else if (currentStep <= 18) progressPerc = 60 + Math.min(25, Math.round(((currentStep - 13) / 5) * 25));
                      else progressPerc = 85 + Math.min(14, Math.round(((currentStep - 19) / 5) * 14));
                    }
                  }

                  const uscisResult = (p.step_data as any)?.uscis_official_result as string;
                  const rfeResult = (p.step_data as any)?.rfe_final_result as string;
                  const motionResult = (p.step_data as any)?.motion_final_result as string;
                  
                  // Approved if any of the phases were approved and no subsequent phase was denied
                  // Denied if the latest phase reached was denied and didn't move forward
                  const isApproved = motionResult === 'approved' || (rfeResult === 'approved' && !motionResult) || (uscisResult === 'approved' && !rfeResult && !motionResult);
                  const isDenied = p.status === 'rejected' || motionResult === 'denied' || motionResult === 'rejected' || (rfeResult === 'denied' && !motionResult) || (uscisResult === 'denied' && !rfeResult && !motionResult) || ((p.step_data as any)?.interview_outcome === 'rejected');
                  
                  const isFinalized = p.status === 'completed' || p.status === 'rejected' || isApproved || (isDenied && (currentStep >= totalSteps || p.status === 'rejected'));

                  return (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group border-b border-border hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        // Avoid navigation if clicking buttons
                        if ((e.target as HTMLElement).closest('button')) return;
                        navigate(`${processRoutePrefix}/processes/${p.id}`);
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-bg-subtle flex items-center justify-center text-text-muted overflow-hidden shadow-inner">
                            <RiUserLine className="text-xl" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text leading-tight tracking-tight uppercase">{p.user_accounts?.full_name || t.cases.table.noName}</p>
                            <p className="text-[11px] text-text-muted font-bold mt-0.5 tracking-tight">{p.user_accounts?.email || t.cases.table.noEmail}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                          {vt.processDetail.services[p.service_slug]?.label || service?.title || p.service_name || p.service_slug}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                         <div>
                            <p className="text-xs font-black text-text uppercase tracking-tighter">{t.shared.cardPayment}</p>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5 tracking-tight italic">{service?.price || "---"}</p>
                         </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-6 w-full">
                          <div className="text-right flex flex-col items-end min-w-[160px]">
                            <div className="flex items-center gap-2 mb-2">
                               <StatusIndicator status={p.status || 'pending'} isApproved={isApproved} isDenied={isDenied} isFinalized={isFinalized} />
                               <p className={`text-[10px] font-black uppercase tracking-tight ${isDenied ? 'text-danger' : isApproved ? 'text-success' : 'text-text'}`}>
                                 {isApproved ? t.cases.statusLabel.uscisApproved : 
                                  isDenied ? t.cases.statusLabel.uscisDenied :
                                  isFinalized ? t.cases.statusLabel.completed :
                                  (service?.steps[currentStep] ? (vt.processSteps[service.steps[currentStep].id]?.title || service.steps[currentStep].title) : (p.status === "awaiting_review" ? t.cases.statusLabel.awaitingReview : p.status))}
                                 <span className="ml-2 text-text-muted">{currentStep}/{totalSteps}</span>
                               </p>
                            </div>
                            <div className="h-1.5 w-full max-w-[160px] bg-bg-subtle rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progressPerc}%` }}
                                 className={`h-full rounded-full ${
                                    isApproved ? "bg-success" :
                                    isDenied ? "bg-danger" :
                                    isFinalized ? "bg-success" :
                                    p.status === "awaiting_review" ? "bg-warning shadow-[0_0_8px_rgba(251,191,36,0.5)]" : 
                                    "bg-primary"
                                 }`}
                               />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => navigate(`${processRoutePrefix}/processes/${p.id}`)}
                               className="p-2.5 rounded-xl border border-border text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                             >
                               <RiArrowRightSLine className="text-xl" />
                             </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

 function StatCard({ label, value, icon, color, highlight }: { label: string, value: number, icon: React.ReactNode, color: string, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-[24px] bg-card border ${highlight ? 'border-warning/30' : 'border-border'} shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg shadow-sm font-black`}>
          {icon}
        </div>
        <div className="text-2xl font-black text-text tracking-tight">{value}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">{label}</p>
        <div className="w-full h-1.5 bg-bg-subtle rounded-full mt-3 overflow-hidden shadow-inner">
           <div className={`h-full rounded-full ${color.split(' ')[1]} opacity-30`} style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status, isApproved, isDenied, isFinalized }: { status: string, isApproved?: boolean, isDenied?: boolean, isFinalized?: boolean }) {
  const color = isApproved ? "bg-success" : isDenied ? "bg-danger" : isFinalized ? "bg-success" : status === 'awaiting_review' ? "bg-warning" : status === 'completed' ? "bg-success" : "bg-info";
  
  return (
    <div className="flex items-center gap-1.5">
       <span className={`w-2 h-2 rounded-full ${color} ${
         status === 'awaiting_review' ? 'animate-pulse ring-4 ring-warning/20 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''
       }`} />
    </div>
  );
}
