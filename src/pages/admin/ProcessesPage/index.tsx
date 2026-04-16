import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  RiFileListLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiSearchLine,
  RiLoader4Line,
  RiTimeLine,
  RiPlayLargeFill,
  RiCheckboxCircleLine,
  RiArrowRightSLine,
  RiFilter3Line,
  RiFilterOffLine
} from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { processService, type UserService } from "../../../services/process.service";
import { getServiceBySlug, servicesData } from "../../../data/services";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useT } from "../../../i18n";

interface ProcessWithUser extends UserService {
  user_accounts: {
    full_name: string;
    email?: string;
  };
}

export default function AdminProcessesPage() {
  const navigate = useNavigate();
  const t = useT("admin");
  const vt = useT("visas");
  const [processes, setProcesses] = useState<ProcessWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_services")
        .select(`
          *,
          user_accounts!user_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProcesses(data as ProcessWithUser[]);
    } catch (err: unknown) {
      console.error("Error loading processes:", err);
      toast.error(t.cases.messages.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const filteredForStats = processes.filter(p => 
      servicesData.some(s => s.slug === p.service_slug) && 
      !p.service_slug.startsWith("analise-") &&
      !p.service_slug.startsWith("mentoria-") &&
      !p.service_slug.startsWith("dependente-adicional-")
    );
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

    return result.filter(p => 
      servicesData.some(s => s.slug === p.service_slug) &&
      !p.service_slug.startsWith("analise-") &&
      !p.service_slug.startsWith("mentoria-") &&
      !p.service_slug.startsWith("dependente-adicional-")
    );
  }, [processes, searchTerm, selectedService, showOnlyPending]);

  const handleApprove = async (p: ProcessWithUser) => {
    const service = getServiceBySlug(p.service_slug);
    if (!service) return;

    setBusy(p.id);
    try {
      const totalSteps = service.steps.length;
      const nextStep = (p.current_step ?? 0) + 1;
      const isFinal = nextStep >= totalSteps;
      const result = isFinal ? 'approved' : undefined;
      
      await processService.approveStep(p.id, nextStep, isFinal, result);
      
      toast.success(isFinal ? t.cases.messages.approveFinalSuccess : t.cases.messages.approveSuccess.replace("{name}", p.user_accounts?.full_name || "Cliente"));
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(t.cases.messages.errorAction + msg);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (p: ProcessWithUser) => {
    const service = getServiceBySlug(p.service_slug);
    const totalSteps = service?.steps.length || 1;
    const isFinal = (p.current_step ?? 0) >= totalSteps;

    setBusy(p.id);
    try {
      if (isFinal) {
        await processService.rejectStep(p.id, true, 'denied');
        toast.success(t.cases.messages.rejectFinalSuccess);
      } else {
        await processService.rejectStep(p.id);
        toast.success(t.cases.messages.rejectSuccess);
      }
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(t.cases.messages.errorAction + msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-slate-800 tracking-tight">{t.cases.title}</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-wider">
            {t.cases.subtitle}
          </p>
        </div>
        <button 
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <RiLoader4Line className={isLoading ? "animate-spin" : ""} />
          {t.cases.refresh}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t.cases.stats.total} value={stats.total} icon={<RiFileListLine />} color="bg-slate-100 text-slate-600" />
        <StatCard label={t.cases.stats.awaiting} value={stats.awaiting} icon={<RiTimeLine />} color="bg-amber-100 text-amber-600" highlight={stats.awaiting > 0} />
        <StatCard label={t.cases.stats.active} value={stats.active} icon={<RiPlayLargeFill />} color="bg-blue-100 text-blue-600" />
        <StatCard label={t.cases.stats.completed} value={stats.completed} icon={<RiCheckboxCircleLine />} color="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <div className="flex-1 relative group w-full">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder={t.cases.filters.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm shadow-slate-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <RiFilter3Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-14 pl-11 pr-10 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/30 transition-all shadow-sm appearance-none lg:min-w-[200px]"
            >
              <option value="all">{t.cases.filters.allProducts}</option>
              {servicesData
                .filter(s => !s.slug.startsWith("analise-"))
                .map(s => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
            </select>
          </div>

          <button 
            onClick={() => setShowOnlyPending(!showOnlyPending)}
            className={`h-14 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm border whitespace-nowrap ${showOnlyPending ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-amber-200/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            {showOnlyPending ? <RiFilterOffLine className="text-base" /> : <RiTimeLine className="text-base" />}
            {showOnlyPending ? t.cases.filters.viewAll : t.cases.filters.pendingActions}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <RiLoader4Line className="text-4xl text-primary animate-spin" />
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
              <RiFileListLine className="text-3xl text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight text-lg">{t.cases.table.noResults}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">{t.cases.table.client}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">{t.cases.table.service}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">{t.cases.table.payment}</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">{t.cases.table.flowActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((p, idx) => {
                  const service = getServiceBySlug(p.service_slug);
                  const totalSteps = service?.steps.length || 1;
                  const currentStep = p.current_step ?? 0;
                  
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

                  const uscisResult = p.step_data?.uscis_official_result as string;
                  const rfeResult = p.step_data?.rfe_final_result as string;
                  const motionResult = p.step_data?.motion_final_result as string;
                  
                  // Approved if any of the phases were approved and no subsequent phase was denied
                  // Denied if the latest phase reached was denied and didn't move forward
                  const isApproved = motionResult === 'approved' || (rfeResult === 'approved' && !motionResult) || (uscisResult === 'approved' && !rfeResult && !motionResult);
                  const isDenied = p.status === 'rejected' || motionResult === 'denied' || motionResult === 'rejected' || (rfeResult === 'denied' && !motionResult) || (uscisResult === 'denied' && !rfeResult && !motionResult) || (p.step_data?.interview_outcome === 'rejected');
                  
                  const isFinalized = p.status === 'completed' || p.status === 'rejected' || isApproved || (isDenied && (currentStep >= totalSteps || p.status === 'rejected'));

                  return (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        // Avoid navigation if clicking buttons
                        if ((e.target as HTMLElement).closest('button')) return;
                        navigate(`/admin/processes/${p.id}`);
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
                            <RiUserLine className="text-xl" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-tight tracking-tight uppercase">{p.user_accounts?.full_name || t.cases.table.noName}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-0.5 tracking-tight">{p.user_accounts?.email || t.cases.table.noEmail}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                          {vt.processDetail.services[p.service_slug]?.label || service?.title || p.service_slug}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                         <div>
                            <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">Stripe Card</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tight italic">{service?.price || "---"}</p>
                         </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-6 w-full">
                          <div className="text-right flex flex-col items-end min-w-[160px]">
                            <div className="flex items-center gap-2 mb-2">
                               <StatusIndicator status={p.status} isApproved={isApproved} isDenied={isDenied} isFinalized={isFinalized} />
                               <p className={`text-[10px] font-black uppercase tracking-tight ${isDenied ? 'text-red-500' : isApproved ? 'text-emerald-500' : 'text-slate-900'}`}>
                                 {isApproved ? t.cases.statusLabel.uscisApproved : 
                                  isDenied ? t.cases.statusLabel.uscisDenied :
                                  isFinalized ? t.cases.statusLabel.completed :
                                  (service?.steps[currentStep] ? (vt.processSteps[service.steps[currentStep].id]?.title || service.steps[currentStep].title) : (p.status === "awaiting_review" ? t.cases.statusLabel.awaitingReview : p.status))}
                                 <span className="ml-2 text-slate-300">{currentStep}/{totalSteps}</span>
                               </p>
                            </div>
                            <div className="h-1.5 w-full max-w-[160px] bg-slate-100 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progressPerc}%` }}
                                 className={`h-full rounded-full ${
                                    isApproved ? "bg-emerald-500" :
                                    isDenied ? "bg-red-500" :
                                    isFinalized ? "bg-emerald-500" :
                                    p.status === "awaiting_review" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : 
                                    "bg-primary"
                                 }`}
                               />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {(p.status === "awaiting_review" && !isApproved && !isDenied) ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReject(p); }}
                                  disabled={!!busy}
                                  className="p-2.5 rounded-xl border-2 border-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center disabled:opacity-30 shadow-sm"
                                  title={currentStep >= totalSteps ? t.cases.actions.rejectUscis : t.cases.actions.reject}
                                >
                                  <RiCloseLine className="text-lg" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleApprove(p); }}
                                  disabled={!!busy}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {busy === p.id ? (
                                    <RiLoader4Line className="animate-spin text-base" />
                                  ) : (
                                    <>
                                      <RiCheckLine className="text-base" />
                                      {currentStep >= totalSteps ? t.cases.actions.approveUscis : t.cases.actions.approve}
                                    </>
                                  )}
                                </button>
                              </>
                            ) : (
                              <button className="p-2.5 rounded-xl border border-slate-100 text-slate-300 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <RiArrowRightSLine className="text-xl" />
                              </button>
                            )}
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
    <div className={`p-6 rounded-[24px] bg-white border ${highlight ? 'border-amber-200' : 'border-slate-100'} shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg shadow-sm font-black`}>
          {icon}
        </div>
        <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        <div className="w-full h-1.5 bg-slate-50 rounded-full mt-3 overflow-hidden shadow-inner">
           <div className={`h-full rounded-full ${color.split(' ')[1]} opacity-30`} style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status, isApproved, isDenied, isFinalized }: { status: string, isApproved?: boolean, isDenied?: boolean, isFinalized?: boolean }) {
  const color = isApproved ? "bg-emerald-500" : isDenied ? "bg-red-500" : isFinalized ? "bg-emerald-500" : status === 'awaiting_review' ? "bg-amber-400" : status === 'completed' ? "bg-emerald-500" : "bg-blue-400";
  
  return (
    <div className="flex items-center gap-1.5">
       <span className={`w-2 h-2 rounded-full ${color} ${
         status === 'awaiting_review' ? 'animate-pulse ring-4 ring-amber-400/20 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''
       }`} />
    </div>
  );
}
