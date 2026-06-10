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
import { getServiceBySlug } from "@shared/data/services";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useT } from "@app/app/i18n";
import { useAuth } from "@shared/hooks/useAuth";
import { RiCalendarLine, RiHistoryLine, RiCloseLine } from "react-icons/ri";
import { AnimatePresence } from "framer-motion";
import {
  listAdminProcesses,
  listProcessLogs,
  type AdminProcessWithUser,
  type ProcessLog,
} from "@features/admin/services/adminProcessesService";

function ProcessLogPanel({ serviceId, clientName }: { serviceId: string; clientName: string }) {
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT("admin");

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setLogs(await listProcessLogs(serviceId));
      setLoading(false);
    }
    fetchLogs();
  }, [serviceId]);

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleString(t.shared.locale || "pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const getStatusLabel = (s?: string) => {
    const map: Record<string, string> = {
      active: t.processDetail.logs.status.active,
      awaiting_review: t.processDetail.logs.status.awaitingReview,
      completed: t.processDetail.logs.status.completed,
      rejected: t.processDetail.logs.status.rejected,
    };
    return s ? (map[s] || s) : "—";
  };

  const getActorLabel = (log: ProcessLog) => {
    if (log.actor_name) return log.actor_name;
    if (log.actor_role === "admin") return t.processDetail.logs.actor.admin;
    return clientName || t.processDetail.logs.actor.client;
  };

  const getActorColor = (log: ProcessLog) => {
    if (log.actor_role === "admin") return "bg-primary/10 text-primary border border-primary/20";
    return "bg-info/10 text-info border border-info/20";
  };

  const getActionDescription = (log: ProcessLog) => {
    if (log.message) return log.message;
    if (log.action) return log.action;

    const stepChanged = log.previous_step !== log.new_step;
    const statusChanged = log.previous_status !== log.new_status;

    if (log.actor_role === "admin") {
      if (stepChanged && (log.new_step ?? 0) > (log.previous_step ?? 0)) return t.processDetail.logs.actions.approved;
      if (statusChanged && log.new_status === "active" && log.previous_status === "awaiting_review") return t.processDetail.logs.actions.returned;
      if (statusChanged && log.new_status === "awaiting_review") return t.processDetail.logs.actions.inReview;
      if (statusChanged && log.new_status === "completed") return t.processDetail.logs.actions.completed;
    } else {
      if (stepChanged) return t.processDetail.logs.actions.formSubmitted;
      if (statusChanged && log.new_status === "awaiting_review") return t.processDetail.logs.actions.sentForReview;
    }
    return t.processDetail.logs.actions.internalChange;
  };

  return (
    <div className="bg-card rounded-[32px] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-text flex items-center justify-center">
          <RiTimeLine className="text-bg text-sm" />
        </div>
        <h3 className="font-black text-text text-sm uppercase tracking-tight">{t.processDetail.logs.title}</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RiLoader4Line className="animate-spin text-2xl text-text-muted" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6 font-medium">{t.processDetail.logs.noLogs}</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="mt-1 w-6 h-6 rounded-full bg-bg-subtle flex items-center justify-center shrink-0">
                <RiUserLine className="text-text-muted text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1 text-left">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${getActorColor(log)}`}>
                    {getActorLabel(log)}
                  </span>
                  <span className="text-[9px] text-text-muted font-bold">{formatDate(log.created_at)}</span>
                </div>
                <p className="text-[11px] text-text font-bold text-left">{getActionDescription(log)}</p>
                <div className="text-[10px] text-text-muted font-medium space-y-0.5 mt-0.5 text-left">
                  {log.previous_step !== log.new_step && (
                    <p>{t.processDetail.logs.labels.step} <span className="text-text font-black">{(log.previous_step ?? 0) + 1}</span> → <span className="text-primary font-black">{(log.new_step ?? 0) + 1}</span></p>
                  )}
                  {log.previous_status !== log.new_status && (
                    <p>{t.processDetail.logs.labels.status}: <span className="text-text-muted font-black">{getStatusLabel(log.previous_status)}</span> → <span className="text-text font-black">{getStatusLabel(log.new_status)}</span></p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCurrentStepIndex(process: AdminProcessWithUser): number {
  const raw =
    process.current_step ??
    (typeof (process.step_data as any)?.current_step === "number"
      ? (process.step_data as any).current_step
      : Number((process.step_data as any)?.current_step ?? 0));

  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
}

function isAuxiliarySlug(slug: string) {
  if (slug.includes("-rfe-") || slug.includes("-motion-")) {
    return false;
  }
  const normalized = String(slug || "").toLowerCase();
  return (
    normalized.startsWith("dependent-") ||
    normalized.startsWith("analysis-") ||
    normalized.startsWith("mentoring-") ||
    normalized.startsWith("consultancy-") ||
    normalized.startsWith("consultoria-") ||
    normalized.startsWith("analise-") ||
    normalized.startsWith("mentoria-") ||
    normalized.startsWith("dependente-") ||
    normalized.startsWith("slot-") ||
    normalized.startsWith("apoio-") ||
    normalized.startsWith("revisao-") ||
    normalized.startsWith("proposta-")
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
  const [processes, setProcesses] = useState<AdminProcessWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setProcesses(await listAdminProcesses({
        userId: user?.id,
        userRole: user?.role,
        officeId: user?.officeId,
        defaultClientName: t.shared.client,
      }));
    } catch {
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
      awaiting: filteredForStats.filter(p => {
        const service = getServiceBySlug(p.service_slug);
        const currentStepIdx = getCurrentStepIndex(p);
        const currentStep = service?.steps[currentStepIdx];
        return p.status === "awaiting_review" || currentStep?.type === "admin_action";
      }).length,
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
      result = result.filter(p => {
        const service = getServiceBySlug(p.service_slug);
        const currentStepIdx = getCurrentStepIndex(p);
        const currentStep = service?.steps[currentStepIdx];
        return p.status === "awaiting_review" || currentStep?.type === "admin_action";
      });
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
                    {vt.processDetail.services[p.service_slug]?.label || getServiceBySlug(p.service_slug)?.title || p.service_name || p.service_slug}
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

      <div className="bg-card rounded-4xl border border-border shadow-xl shadow-black/5 overflow-hidden">
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

                  // Approved only after process finalization.
                  const approvedByOutcome =
                    motionResult === 'approved' ||
                    (rfeResult === 'approved' && !motionResult) ||
                    (uscisResult === 'approved' && !rfeResult && !motionResult);
                  const isApproved = p.status === 'completed' && approvedByOutcome;
                  // Denied if the latest phase reached was denied and didn't move forward
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
                                className={`h-full rounded-full ${isApproved ? "bg-success" :
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
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-left">{label}</p>
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
      <span className={`w-2 h-2 rounded-full ${color} ${status === 'awaiting_review' ? 'animate-pulse ring-4 ring-warning/20 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''
        }`} />
    </div>
  );
}
