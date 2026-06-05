import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiInformationLine,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiFileUploadLine,
  RiArrowDownSLine,
  RiDownload2Line,
  RiErrorWarningLine,
  RiBankCardLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiHistoryLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiBarcodeLine,
  RiCalendarEventLine,
  RiUser3Line,
  RiTimeLine,
  RiPulseLine,
  RiGitBranchLine,
  RiFileCopyLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { getServiceBySlug } from "@shared/data/services";
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "@shared/data/workflowTemplates";
import { normalizeLegacyFinalShipSteps, normalizeLegacyStepId } from "@shared/utils/legacyWorkflow";
import { supabase } from "@shared/lib/supabase";
import * as processService from "@features/process/services/processOps";
import type { UserService } from "@features/process/types";
import * as notificationService from "@features/notifications/services/notify";
import { packageService } from "@features/onboarding/cos/lib/package";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { useAuth } from "@shared/hooks/useAuth";
import type { StepConfig } from "@shared/components/templates/ServiceDetailTemplate";

interface ProcessLog {
  id: string;
  user_service_id: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  action_type?: string;
  action?: string;
  message?: string;
  previous_step?: number;
  new_step?: number;
  previous_status?: string;
  new_status?: string;
  created_at: string;
}

interface ProcessWithUser extends UserService {
  user_accounts: {
    full_name: string;
    email: string;
    mobilePhone?: string;
  };
}

interface ProcessLog {
  id: string;
  user_service_id: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  action_type?: string;
  action?: string;
  message?: string;
  previous_step?: number;
  new_step?: number;
  previous_status?: string;
  new_status?: string;
  created_at: string;
}

interface RFEHistoryItem {
  proposal_text: string;
  proposal_amount: number;
  result: "approved" | "rfe" | "denied";
  rfe_letter?: string;
  sent_at: string;
}

function buildEffectiveSteps(baseSteps: StepConfig[], history: Array<{ type?: string; steps?: unknown[] }>) {
  const effectiveSteps = [...baseSteps];

  history.forEach((cycle, cIdx) => {
    const baseTemplate = cycle.steps || (cycle.type === "motion" ? MOTION_STEPS_TEMPLATE : RFE_STEPS_TEMPLATE);
    const template = normalizeLegacyFinalShipSteps(baseTemplate as StepConfig[]);

    template.forEach((step: StepConfig) => {
      effectiveSteps.push({
        ...step,
        id: `${step.id}_cycle_${cIdx}`,
      });
    });
  });

  return effectiveSteps;
}

function ProcessLogPanel({ serviceId, clientName }: { serviceId: string; clientName: string }) {
  const [logs, setLogs] = React.useState<ProcessLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const t = useT("admin");

  React.useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data } = await supabase
        .from("process_logs")
        .select("*")
        .eq("user_service_id", serviceId)
        .order("created_at", { ascending: false })
        .limit(30);
      setLogs((data || []) as ProcessLog[]);
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
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-6">
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
                <RiUser3Line className="text-text-muted text-xs" />
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

function PurchasesPanel({ stepData }: { stepData: Record<string, unknown> }) {
  const purchases = (stepData?.purchases || []) as Array<{
    id?: string;
    slug?: string;
    created_at?: string;
    date?: string;
    amount_usd?: number;
    amount?: number;
    method?: string;
    dependents?: number;
  }>;
  const paidDependents = parseInt(String(stepData?.paid_dependents ?? 0), 10);

  const t = useT("admin");
  const formatDate = (dt: string) =>
    new Date(dt).toLocaleString(t.shared.locale || "pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-success flex items-center justify-center">
            <RiMoneyDollarCircleLine className="text-primary text-sm" />
          </div>
          <h3 className="font-black text-text text-sm uppercase tracking-tight">{t.processDetail.purchases.title}</h3>
        </div>
        <div className="px-2.5 py-1 bg-success/10 text-success rounded-lg text-[10px] font-black uppercase tracking-widest border border-success/20">
          {paidDependents} {t.processDetail.purchases.slotsPaid}
        </div>
      </div>

      {purchases.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6 font-medium italic">{t.processDetail.purchases.noPurchases}</p>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {purchases.map((p, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-bg-subtle border border-border hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{p.method}</span>
                <span className="text-[10px] text-text-muted font-bold">{formatDate(p.date || p.created_at || '')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-text leading-none mb-1">{p.slug}</p>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">
                    ID: <span className="text-text">{p.id ? (p.id.length > 20 ? p.id.substring(0, 15) + '...' : p.id) : 'N/A'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-text leading-none mb-1">${(p.amount ?? p.amount_usd ?? 0).toFixed(2)}</p>
                  {(p.dependents ?? 0) > 0 && (
                    <p className="text-[9px] text-success font-black uppercase">+{p.dependents} {t.processDetail.purchases.dependents}</p>
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

function ProcessFlowPanel({
  effectiveSteps,
  currentStepIdx,
  vt,
  t
}: {
  effectiveSteps: StepConfig[];
  currentStepIdx: number;
  vt: any;
  t: any;
}) {
  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <RiPulseLine className="text-sm" />
          </div>
          <h3 className="font-black text-text text-sm uppercase tracking-tight">{t.cases.table.flowActions}</h3>
        </div>
        <div className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/20">
          {currentStepIdx + 1} / {effectiveSteps.length}
        </div>
      </div>

      <div className="space-y-0 relative">
        {effectiveSteps.map((step, i) => {
          const isCompleted = i < currentStepIdx;
          const isActive = i === currentStepIdx;
          const title = vt.processSteps[step.id]?.title || step.title;

          return (
            <div key={step.id} className="flex gap-4 min-h-[60px] relative group">
              {/* Vertical Line */}
              {i < effectiveSteps.length - 1 && (
                <div className={`absolute left-[17px] top-[30px] w-[2px] h-[calc(100%-20px)] z-0 ${i < currentStepIdx ? 'bg-success/30' : 'bg-border/40'}`} />
              )}

              <div className="relative z-10 shrink-0">
                <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-[11px] font-black transition-all duration-300 ${isCompleted
                  ? 'bg-success border-success text-white shadow-md shadow-success/10'
                  : isActive
                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20'
                    : 'bg-bg-subtle border-border text-text-muted'
                  }`}>
                  {isCompleted ? <RiCheckLine className="text-lg" /> : i + 1}
                </div>
              </div>

              <div className="pt-2 pb-6">
                <p className={`text-[10px] font-black uppercase tracking-tight leading-tight transition-all ${isActive ? 'text-primary' : i < currentStepIdx ? 'text-text' : 'text-text-muted opacity-40'
                  }`}>
                  {title}
                </p>
                {isActive && step.description && (
                  <p className="text-[9px] text-text-muted font-medium mt-1 leading-normal opacity-80">
                    {vt.processSteps[step.id]?.description || step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



function CollapsibleStep({
  title,
  icon: Icon,
  isActive,
  isPast,
  children,
  badge
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isPast: boolean;
  children: React.ReactNode;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(isActive);
  const t = useT("admin");

  return (
    <div className={`bg-card rounded-[32px] border transition-all mb-8 overflow-hidden ${isActive ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-border shadow-sm opacity-80'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-bg-subtle transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : isPast ? 'bg-success/10 text-success' : 'bg-bg-subtle text-text-muted'}`}>
            {isPast ? <RiCheckLine className="text-xl" /> : <Icon className="text-xl" />}
          </div>
          <div className="text-left">
            <h3 className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-text' : 'text-text-muted'}`}>{title}</h3>
            {isPast && <p className="text-[10px] text-success font-black uppercase mt-0.5 tracking-tighter">{t.processDetail.steps.completed}</p>}
            {isActive && <p className="text-[10px] text-primary font-black uppercase mt-0.5 tracking-tighter">{t.processDetail.steps.awaitingAction}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {badge && <span className="px-3 py-1 bg-warning/10 rounded-lg border border-warning/20 text-[9px] font-black text-warning uppercase tracking-widest">{badge}</span>}
          <RiArrowDownSLine className={`text-xl text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MRVSetupPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [boletoPath, setBoletoPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useT("admin");

  useEffect(() => {
    const d = (proc.step_data as Record<string, unknown> | null) ?? {};
    setLogin(((d.mrv_login as string) || (d.consular_login as string) || (d.consular_email as string) || ""));
    setPassword(((d.mrv_password as string) || (d.consular_password as string) || ""));
    setBoletoPath((d.mrv_boleto_path as string) || "");
  }, [proc]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/mrv/boleto_${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("aplikei-profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setBoletoPath(filePath);
      toast.success(t.processDetail.mrv.messages.uploadSuccess);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAndApprove = async () => {
    const d = (proc.step_data as Record<string, unknown> | null) ?? {};
    const resolvedLogin = login || (d.consular_login as string) || (d.consular_email as string) || "";
    const resolvedPassword = password || (d.consular_password as string) || "";

    if (!resolvedLogin || !resolvedPassword || !boletoPath) {
      toast.error(t.processDetail.mrv.messages.fillFields);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        mrv_login: resolvedLogin,
        mrv_password: resolvedPassword,
        mrv_boleto_path: boletoPath,
        mrv_generated_at: new Date().toISOString()
      };
      await processService.updateStepData(proc.id, payload);
      await onApprove();
      onRefresh();
      toast.success(t.processDetail.mrv.messages.finishSuccess);
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{t.processDetail.mrv.loginLabel}</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            disabled={!isActive}
            className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder={t.processDetail.mrv.loginPlaceholder}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">{t.processDetail.mrv.passwordLabel}</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isActive}
            className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder={t.processDetail.mrv.passwordPlaceholder}
          />
        </div>
      </div>

      <div className="p-6 bg-bg-subtle border border-border rounded-2xl">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">{t.processDetail.mrv.voucherLabel}</p>
        <div className="flex flex-col items-center justify-center py-6 text-left">
          {boletoPath ? (
            <div className="flex items-center gap-4 w-full text-left">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <RiBarcodeLine className="text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-text uppercase">{t.processDetail.mrv.voucherSent}</p>
                <p className="text-[10px] text-text-muted truncate">{boletoPath.split('/').pop()}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={supabase.storage.from("aplikei-profiles").getPublicUrl(boletoPath).data.publicUrl}
                  target="_blank" rel="noreferrer"
                  className="px-4 py-2 bg-card border border-border rounded-lg text-[10px] font-black text-text uppercase"
                >{t.shared.view}</a>
                {isActive && (
                  <button onClick={() => setBoletoPath("")} className="px-4 py-2 bg-danger/10 text-danger rounded-lg text-[10px] font-black uppercase">{t.shared.remove}</button>
                )}
              </div>
            </div>
          ) : (
            <>
              <RiBarcodeLine className="text-4xl text-border mb-4" />
              <label className="px-8 py-3 bg-card border border-border rounded-xl text-[10px] font-black text-text uppercase tracking-widest cursor-pointer hover:bg-bg-subtle transition-all shadow-sm flex items-center gap-2">
                <RiFileUploadLine />
                {uploading ? <RiLoader4Line className="animate-spin text-lg" /> : t.processDetail.mrv.selectVoucher}
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={!isActive} />
              </label>
            </>
          )}
        </div>
      </div>

      {isActive && (
        <button
          onClick={handleSaveAndApprove}
          disabled={loading || uploading}
          className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.mrv.finishGeneration}</>}
        </button>
      )}
    </div>
  );
}

function FinalSchedulingPanel({ proc, onRefresh, isActive }: { proc: ProcessWithUser; onRefresh: () => void; isActive: boolean }) {
  const [sameLocation, setSameLocation] = useState(true);
  const [casvDate, setCasvDate] = useState("");
  const [casvTime, setCasvTime] = useState("");
  const [casvLocation, setCasvLocation] = useState("");
  const [consuladoDate, setConsuladoDate] = useState("");
  const [consuladoTime, setConsuladoTime] = useState("");
  const [consuladoLocation, setConsuladoLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT("admin");
  const vt = useT("visas");

  const hasSchedulingData = !!(proc.step_data as any)?.final_casv_date;
  const isPast = hasSchedulingData;
  const canEdit = isActive || isPast;

  useEffect(() => {
    const d = (proc.step_data as Record<string, unknown> | null) ?? {};
    setSameLocation(d.final_same_location === undefined ? true : !!d.final_same_location);
    setCasvDate((d.final_casv_date as string) || "");
    setCasvTime((d.final_casv_time as string) || "");
    setCasvLocation((d.final_casv_location as string) || "");
    setConsuladoDate((d.final_consulado_date as string) || "");
    setConsuladoTime((d.final_consulado_time as string) || "");
    setConsuladoLocation((d.final_consulado_location as string) || "");
  }, [proc]);

  const handleSave = async () => {
    if (!casvDate || !casvTime || !casvLocation) {
      toast.error(t.processDetail.scheduling.messages.fillCasv);
      return;
    }
    if (!sameLocation && (!consuladoDate || !consuladoTime || !consuladoLocation)) {
      toast.error(t.processDetail.scheduling.messages.fillConsulate);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        final_same_location: sameLocation,
        final_casv_date: casvDate,
        final_casv_time: casvTime,
        final_casv_location: casvLocation,
        final_consulado_date: sameLocation ? casvDate : consuladoDate,
        final_consulado_time: sameLocation ? casvTime : consuladoTime,
        final_consulado_location: sameLocation ? casvLocation : consuladoLocation,
        final_scheduling_notified_at: new Date().toISOString()
      };
      await processService.updateStepData(proc.id, payload);
      // Do not auto-approve here. Approval must happen from customer flow.

      onRefresh();
      toast.success(isPast ? t.processDetail.scheduling.messages.updateSuccess : t.processDetail.scheduling.messages.notifiedSuccess);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const upsellPlan = (proc.step_data as any)?.upsell_plan as string;

  return (
    <div className="space-y-8">
      {upsellPlan && (
        <div className="p-6 rounded-[28px] bg-amber-50 border border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <RiShieldCheckLine className="text-2xl" />
            </div>
            <div className="text-left">
              <h4 className="text-[10px] font-black text-text uppercase tracking-widest">{t.processDetail.scheduling.upsellTitle}</h4>
              <p className="text-xs text-amber-600 font-bold uppercase">{upsellPlan}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-card rounded-xl border border-warning/20 text-[10px] font-black text-warning uppercase">
            {t.processDetail.scheduling.upsellAction}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-2 bg-bg-subtle rounded-2xl border border-border">
        <button
          disabled={!canEdit}
          onClick={() => setSameLocation(true)}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sameLocation ? 'bg-card shadow-sm text-primary' : 'text-text-muted'}`}
        >
          {t.processDetail.scheduling.sameLocation}
        </button>
        <button
          disabled={!canEdit}
          onClick={() => setSameLocation(false)}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!sameLocation ? 'bg-card shadow-sm text-primary' : 'text-text-muted'}`}
        >
          {t.processDetail.scheduling.differentLocations}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
            <RiCalendarEventLine className="text-lg text-primary" /> {t.processDetail.scheduling.casvData}
          </h4>
          <div className="space-y-4">
            <input
              type="date"
              value={casvDate}
              onChange={e => setCasvDate(e.target.value)}
              disabled={!canEdit}
              className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
            />
            <input
              type="time"
              value={casvTime}
              onChange={e => setCasvTime(e.target.value)}
              disabled={!canEdit}
              className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
            />
            <input
              type="text"
              placeholder={t.processDetail.scheduling.casvLocationPlaceholder}
              value={casvLocation}
              onChange={e => setCasvLocation(e.target.value)}
              disabled={!canEdit}
              className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
            />
          </div>
        </div>

        {!sameLocation && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
              <RiCalendarEventLine className="text-lg text-primary" /> {t.processDetail.scheduling.consulateData}
            </h4>
            <div className="space-y-4">
              <input
                type="date"
                value={consuladoDate}
                onChange={e => setConsuladoDate(e.target.value)}
                disabled={!canEdit}
                className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
              />
              <input
                type="time"
                value={consuladoTime}
                onChange={e => setConsuladoTime(e.target.value)}
                disabled={!canEdit}
                className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
              />
              <input
                type="text"
                placeholder={t.processDetail.scheduling.consulateLocationPlaceholder}
                value={consuladoLocation}
                onChange={e => setConsuladoLocation(e.target.value)}
                disabled={!canEdit}
                className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-col gap-4">
        {canEdit && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {isPast ? t.processDetail.scheduling.updateScheduling : t.processDetail.scheduling.informClient}</>}
          </button>
        )}
      </div>
    </div>
  );
}


function MotionProposalPanel({ proc, onRefresh, isActive }: { proc: ProcessWithUser; onRefresh: () => void; isActive: boolean }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const t = useT("admin");
  const { user: panelUser } = useAuth();
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const purchases = (data.purchases || []) as Array<{ slug?: string }>;
  const hasPaidProposal =
    Boolean(data.motion_proposal_paid) ||
    Boolean(data.motion_payment_completed_at) ||
    purchases.some((p) =>
      [
        "consultancy-motion-cos",
        "consultancy-motion-eos",
        "proposta-rfe-motion",
      ].includes(String(p.slug || "").toLowerCase()),
    );

  const clientReason = data.motion_reason as string;
  const docs = (data.docs as Record<string, string>) || {};
  const denialLetterPath = docs.motion_denial_letter;
  const denialLetterUrl = denialLetterPath ? supabase.storage.from('aplikei-profiles').getPublicUrl(denialLetterPath).data.publicUrl : null;

  useEffect(() => {
    if (data.motion_proposal_text) setText(data.motion_proposal_text as string);
    const savedAmount = data.motion_amount ?? data.motion_proposal_amount;
    if (savedAmount !== undefined && savedAmount !== null && savedAmount !== "") setAmount(Number(savedAmount));
  }, [data.motion_proposal_text, data.motion_amount, data.motion_proposal_amount, setText, setAmount]);

  const handleSendProposal = async () => {
    if (!text || amount <= 0) {
      toast.error(t.processDetail.mrv.messages.fillFields.replace('login, senha e envie o boleto', 'proposta e o valor'));
      return;
    }
    setLoading(true);
    try {
      const proposalHistory = Array.isArray(data.motion_proposal_history)
        ? (data.motion_proposal_history as Array<Record<string, unknown>>)
        : [];
      const sentAt = new Date().toISOString();
      await processService.updateStepData(proc.id, {
        motion_proposal_text: text,
        motion_amount: Number(amount),
        motion_proposal_amount: Number(amount),
        motion_proposal_sent_at: sentAt,
        motion_proposal_history: [
          ...proposalHistory,
          {
            sent_at: sentAt,
            proposal_text: text,
            proposal_amount: Number(amount),
          },
        ],
        workflow_status: "awaiting_payment",
      });

      const currentStepIdx = proc.current_step ?? 0;
      const nextStep = currentStepIdx + 1;

      await processService.approveStep(proc.id, nextStep, false, undefined, undefined, { actorRole: panelUser?.role ?? undefined });

      toast.success(t.analysisPanel.messages.proposalSent);
      onRefresh();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(t.cases.messages.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 mb-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <RiShieldCheckLine className="text-lg" />
          {t.processDetail.motion.panelTitle}
        </h3>
        <div className="flex gap-2">
          {hasPaidProposal && (
            <div className="px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <RiCheckDoubleLine /> Pago
            </div>
          )}
          <div className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest">
            {t.shared.administrativeAction}
          </div>
        </div>
      </div>

      <div className="bg-bg-subtle rounded-3xl p-6 mb-8 border border-border">
        <div className="flex items-center gap-3 mb-4 text-left">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <RiInformationLine className="text-lg" />
          </div>
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.processDetail.motion.clientInstructions}</h4>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{t.processDetail.motion.clientReason}</p>
            <p className="text-sm font-bold text-text italic">
              {clientReason || t.processDetail.motion.noReason}
            </p>
          </div>

          {denialLetterUrl && (
            <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <RiFileTextLine className="text-xl text-primary" />
                <span className="text-[10px] font-black text-text uppercase tracking-widest">{t.processDetail.motion.denialLetter}</span>
              </div>
              <a
                href={denialLetterUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-text text-bg rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-text/90 transition-all flex items-center gap-2"
              >
                <RiExternalLinkLine className="text-sm" /> {t.shared.view}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 text-left">
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.motion.strategyLabel}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.processDetail.motion.strategyPlaceholder}
            className="w-full h-32 rounded-2xl border border-border bg-bg-subtle p-4 text-sm font-medium text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.motion.amountLabel}</label>
          <div className="relative">
            <RiMoneyDollarCircleLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-bg-subtle border border-border rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
        {isActive && (
          <button
            onClick={handleSendProposal}
            disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.motion.sendProposal}</>}
          </button>
        )}
      </div>
    </div>
  );
}

function RFEProposalPanel({ proc, onRefresh, isActive }: { proc: ProcessWithUser; onRefresh: () => void; isActive: boolean }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const t = useT("admin");
  const { user: panelUser } = useAuth();
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const purchases = (data.purchases || []) as Array<{ slug?: string }>;
  const hasPaidProposal = purchases.some(p => p.slug === "proposta-rfe-motion" || p.slug === "apoio-rfe-motion-inicio" || p.slug === "analise-rfe-cos" || p.slug === "apoio-rfe-cos");

  const clientDescription = data.rfe_description as string;
  const docs = (data.docs as Record<string, string>) || {};
  const rfeLetterPath = docs.rfe_letter;
  const rfeLetterUrl = rfeLetterPath ? supabase.storage.from('aplikei-profiles').getPublicUrl(rfeLetterPath).data.publicUrl : null;

  const savedText = data.rfe_proposal_text as string;
  const savedAmount = Number(data.rfe_proposal_amount) || 0;

  useEffect(() => {
    if (savedText && !text) setText(savedText);
    if (savedAmount && amount === 0) setAmount(savedAmount);
  }, [savedText, savedAmount, text, amount, setText, setAmount]);

  const handleSendProposal = async () => {
    if (!text.trim() || !amount) {
      toast.error(t.processDetail.mrv.messages.fillFields.replace('login, senha e envie o boleto', 'texto e o valor da proposta'));
      return;
    }

    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        rfe_proposal_text: text,
        rfe_proposal_amount: Number(amount),
        rfe_proposal_sent_at: new Date().toISOString(),
        admin_feedback: null,
        rejected_items: [],
      };

      await processService.updateStepData(proc.id, updateData);

      const currentStepIdx = proc.current_step ?? 0;
      const nextStep = currentStepIdx + 1;

      await processService.approveStep(proc.id, nextStep, false, undefined, undefined, { actorRole: panelUser?.role ?? undefined });

      toast.success(t.analysisPanel.messages.proposalSent);
      onRefresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(t.cases.messages.errorAction + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 mb-8 text-left">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <RiShieldCheckLine className="text-lg" />
          {t.processDetail.rfe.panelTitle}
        </h3>
        <div className="flex gap-2">
          {hasPaidProposal && (
            <div className="px-3 py-1 bg-success/10 rounded-lg border border-success/20 text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1">
              <RiCheckDoubleLine /> {t.shared.paid}
            </div>
          )}
          <div className="px-3 py-1 bg-warning/10 rounded-lg border border-warning/20 text-[9px] font-black text-warning uppercase tracking-widest">
            {t.shared.administrativeAction}
          </div>
        </div>
      </div>

      <div className="bg-bg-subtle rounded-3xl p-6 mb-8 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <RiInformationLine className="text-lg" />
          </div>
          <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.processDetail.rfe.infoTitle}</h4>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-4 rounded-2xl border border-border">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{t.processDetail.rfe.clientDescription}</p>
            <p className="text-sm font-bold text-text italic">
              {clientDescription || t.processDetail.motion.noReason}
            </p>
          </div>

          {rfeLetterUrl && (
            <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <RiFileTextLine className="text-xl text-primary" />
                <span className="text-[10px] font-black text-text uppercase tracking-widest">{t.processDetail.rfe.officialLetter}</span>
              </div>
              <a
                href={rfeLetterUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-text text-bg rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-text/90 transition-all flex items-center gap-2"
              >
                <RiExternalLinkLine className="text-sm" /> {t.shared.view}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.rfe.strategyLabel}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.processDetail.rfe.strategyPlaceholder}
            className="w-full h-32 rounded-2xl border border-border bg-bg-subtle p-4 text-sm font-medium text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.rfe.amountLabel}</label>
          <div className="relative">
            <RiMoneyDollarCircleLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-bg-subtle border border-border rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
        {isActive && (
          <button
            onClick={handleSendProposal}
            disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.rfe.sendProposal}</>}
          </button>
        )}

        {/* RFE History Section */}
        {(() => {
          const history = (data.rfe_history as RFEHistoryItem[]) || [];
          if (history.length === 0) return null;

          return (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center gap-2 mb-4 px-1">
                <RiHistoryLine className="text-text-muted" />
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">{t.processDetail.rfe.historyTitle} ({history.length})</h3>
              </div>
              <div className="space-y-3">
                {[...history].reverse().map((hist, idx) => (
                  <div key={idx} className="bg-bg-subtle rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">{t.processDetail.rfe.cycle} #{history.length - idx}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${hist.result === 'approved' ? 'bg-success/10 text-success' :
                        hist.result === 'rfe' ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                        {hist.result === 'approved' ? t.processDetail.rfe.resultApproved : hist.result === 'rfe' ? t.processDetail.rfe.resultNewRfe : t.processDetail.rfe.resultRejected}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted italic mb-3 leading-relaxed line-clamp-2">"{hist.proposal_text}"</p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-text-muted uppercase">{t.processDetail.rfe.amount}</span>
                        <span className="text-[10px] font-black text-text">${Number(hist.proposal_amount).toFixed(2)}</span>
                      </div>

                      {hist.rfe_letter && (
                        <a
                          href={supabase.storage.from('aplikei-profiles').getPublicUrl(hist.rfe_letter).data.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          {t.shared.confirm.replace("Confirm", "View").replace("Confirmar", "Ver")} <RiArrowRightLine />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function RFEFinalShipPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const t = useT("admin");
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const docs = (data.docs as Record<string, string>) || {};
  const rfeFinalPath = docs.rfe_final_package;

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      toast.loading(t.processDetail.rfe.finalPackageLoading, { id: "ship" });
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/rfe/rfe_final_${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("aplikei-profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const currentDocs = (data.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, {
        docs: { ...currentDocs, rfe_final_package: filePath }
      });

      toast.success(t.processDetail.mrv.messages.uploadSuccess, { id: "ship" });
      onRefresh();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(t.cases.messages.errorAction + err.message, { id: "ship" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 mb-8 text-left">
      <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
        <RiFileUploadLine className="text-lg" />
        {t.processDetail.rfe.finalPackageTitle}
      </h3>

      <div className="space-y-6">
        <div className="p-6 bg-bg-subtle border border-border rounded-2xl text-center">
          {rfeFinalPath ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <RiCheckDoubleLine className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black text-text uppercase">{t.processDetail.rfe.finalPackageReady}</p>
                  <p className="text-[10px] text-text-muted font-bold truncate max-w-[200px]">{rfeFinalPath}</p>
                </div>
              </div>
              <a
                href={supabase.storage.from('aplikei-profiles').getPublicUrl(rfeFinalPath).data.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                {t.shared.confirm.replace("Confirm", "View").replace("Confirmar", "Ver")}
              </a>
            </div>
          ) : (
            <div className="py-4">
              <RiFileTextLine className="text-4xl text-border mx-auto mb-3" />
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6">{t.shared.table.empty}</p>
              <label className="bg-card border border-border px-6 py-3 rounded-xl text-[10px] font-black text-text uppercase tracking-widest cursor-pointer hover:bg-bg-subtle transition-all shadow-sm inline-flex items-center gap-2">
                <RiFileUploadLine className="text-lg" />
                {t.processDetail.rfe.selectFinalPdf}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        {isActive && (
          <button
            onClick={() => onApprove()}
            disabled={loading || !rfeFinalPath}
            className="w-full h-14 bg-success text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-success/90 shadow-xl shadow-success/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.rfe.provideToClient}</>}
          </button>
        )}
      </div>
    </div>
  );
}

function B1B2CredentialsPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [appId, setAppId] = useState("");
  const [motherName, setMotherName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT("admin");

  useEffect(() => {
    const d = (proc.step_data as Record<string, unknown> | null) ?? {};
    setAppId((d.ds160_application_id as string) || "");
    setMotherName((d.ds160_security_answer as string) || (d.motherName as string) || "");
    setBirthDate((d.ds160_birth_date as string) || (d.birthDate as string) || "");
  }, [proc]);

  const handleSaveAndApprove = async () => {
    if (!appId || !motherName || !birthDate) {
      toast.error(t.processDetail.mrv.messages.fillFields.replace('login, senha e envie o boleto', 'todos os campos'));
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(proc.id, {
        ds160_application_id: appId,
        ds160_security_answer: motherName,
        ds160_birth_date: birthDate
      });
      await onApprove();
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 mb-8 text-left">
      <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
        <RiShieldCheckLine className="text-lg" />
        {t.processDetail.credentials.title}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.credentials.appId}</label>
          <input type="text" value={appId} onChange={e => setAppId(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-2xl p-4 text-sm font-black text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase" placeholder="Ex: AA00XXXXXX" />
        </div>
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.credentials.motherName}</label>
          <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-2xl p-4 text-sm font-black text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase" placeholder="Ex: SILVA" />
        </div>
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2 px-1">{t.processDetail.credentials.birthYear}</label>
          <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-2xl p-4 text-sm font-black text-text outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Ex: 1990" />
        </div>
        {isActive && (
          <button onClick={handleSaveAndApprove} disabled={loading} className="w-full h-14 bg-success text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-success/90 shadow-xl shadow-success/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.credentials.sendBtn}</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useT("admin");
  const vt = useT("visas");
  const { user } = useAuth();
  const processRoutePrefix =
    user?.role === "master" ? "/master" :
      user?.role === "manager" ? "/manager" :
        "/admin";
  const [proc, setProc] = useState<ProcessWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [officeLogoUrl, setOfficeLogoUrl] = useState<string | null>(null);
  const [officeName, setOfficeName] = useState<string | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterHtml, setCoverLetterHtml] = useState("");
  const [accountCreationPassword, setAccountCreationPassword] = useState("");
  const [copiedAccountEmail, setCopiedAccountEmail] = useState(false);
  const [recoveryChildren, setRecoveryChildren] = useState<UserService[]>([]);
  const dedupedRecoveryChildren = useMemo(() => {
    const seen = new Set<string>();
    return recoveryChildren.filter((child) => {
      const sd = (child.step_data || {}) as Record<string, unknown>;
      const flowRaw = String(sd.workflow_type || "").toLowerCase();
      const flow =
        flowRaw === "motion" || flowRaw === "rfe"
          ? flowRaw
          : (child.service_slug.toLowerCase().includes("motion") ? "motion" : "rfe");
      const key = `${child.service_slug.toLowerCase()}::${flow}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recoveryChildren]);
  const parentIdFromQuery = searchParams.get("parentId");
  const isRecoveryChildView = Boolean(parentIdFromQuery);

  const [sellerId, setSellerId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string | null>(null);

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      const processRow = data as ProcessWithUser;
      let account: { full_name: string; email: string; mobilePhone?: string } = { full_name: "Cliente", email: "" };
      if (processRow.user_id) {
        const { data: userDataPrimary, error: userErrorPrimary } = await supabase
          .from("user_accounts")
          .select("full_name, email, phone_number")
          .eq("id", processRow.user_id)
          .maybeSingle();

        if (userErrorPrimary) throw userErrorPrimary;
        if (userDataPrimary) {
          account = { 
            full_name: userDataPrimary.full_name || "Cliente", 
            email: userDataPrimary.email || "",
            mobilePhone: userDataPrimary.phone_number || ""
          };
        }
      }

      // Always fetch the current admin's own company profile logo
      if (user?.id) {
        const { data: ownOfficeData } = await supabase
          .from("offices")
          .select("name, logo_url, landing_page_config")
          .eq("owner_id", user.id)
          .maybeSingle();
        if (ownOfficeData) {
          setOfficeName(ownOfficeData.name ?? null);
          setOfficeLogoUrl(ownOfficeData.logo_url ?? (ownOfficeData.landing_page_config as any)?.logoUrl ?? null);
        } else {
          setOfficeName(null);
          setOfficeLogoUrl(null);
        }
      }

      // 1. Direct step_data / metadata checks
      let resolvedSellerId: string | null = 
        (processRow.step_data as any)?.seller_id || 
        (processRow.service_metadata as any)?.seller_id || 
        (processRow.data as any)?.seller_id || 
        null;
      let resolvedSellerName: string | null = null;

      try {
        // Collect order IDs from this process
        const orderIds = new Set<string>();
        const sd = (processRow.step_data as any) || {};
        if (sd.purchase_ref?.order_id) orderIds.add(sd.purchase_ref.order_id);
        if (Array.isArray(sd.purchases)) {
          sd.purchases.forEach((p: any) => {
            if (p.order_id) orderIds.add(p.order_id);
          });
        }

        // Parent process checks
        const parentId = sd.parent_process_id;
        if (parentId) {
          const { data: parentProc } = await supabase
            .from("user_services")
            .select("step_data, service_metadata, data")
            .eq("id", parentId)
            .maybeSingle();
          if (parentProc) {
            if (!resolvedSellerId) {
              resolvedSellerId = 
                (parentProc.step_data as any)?.seller_id || 
                (parentProc.service_metadata as any)?.seller_id || 
                (parentProc.data as any)?.seller_id || 
                null;
            }
            const psd = (parentProc.step_data as any) || {};
            if (psd.purchase_ref?.order_id) orderIds.add(psd.purchase_ref.order_id);
            if (Array.isArray(psd.purchases)) {
              psd.purchases.forEach((p: any) => {
                if (p.order_id) orderIds.add(p.order_id);
              });
            }
          }
        }

        // Try getting seller_id from collected order IDs
        if (!resolvedSellerId && orderIds.size > 0) {
          const { data: ordersByPid } = await supabase
            .from("orders")
            .select("seller_id")
            .in("id", Array.from(orderIds))
            .not("seller_id", "is", null)
            .limit(1)
            .maybeSingle();
          if (ordersByPid?.seller_id) {
            resolvedSellerId = ordersByPid.seller_id;
          }
        }

        // Try getting seller_id from payment_metadata matching current or parent process IDs
        if (!resolvedSellerId) {
          const idsToCheck = [processRow.id];
          if (parentId) idsToCheck.push(parentId);

          for (const targetId of idsToCheck) {
            const { data: ordersByMeta } = await supabase
              .from("orders")
              .select("seller_id")
              .or(`payment_metadata->>proc_id.eq.${targetId},payment_metadata->>parent_process_id.eq.${targetId}`)
              .not("seller_id", "is", null)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (ordersByMeta?.seller_id) {
              resolvedSellerId = ordersByMeta.seller_id;
              break;
            }
          }
        }

        // Try getting seller_id from any of the client's orders
        if (!resolvedSellerId) {
          const clientUserId = processRow.user_id || sd.user_id || null;
          const clientEmail = account.email || sd.email || sd.client_email || null;
          const filters: string[] = [];
          if (clientUserId) filters.push(`user_id.eq.${clientUserId}`);
          if (clientEmail) filters.push(`client_email.eq.${clientEmail}`);

          if (filters.length > 0) {
            const { data: orderData } = await supabase
              .from("orders")
              .select("seller_id")
              .or(filters.join(","))
              .not("seller_id", "is", null)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (orderData?.seller_id) {
              resolvedSellerId = orderData.seller_id;
            }
          }
        }

        // Resolve seller name
        if (resolvedSellerId) {
          // 1. Try fetching from user_accounts
          const { data: sellerAccount } = await supabase
            .from("user_accounts")
            .select("full_name, email")
            .eq("id", resolvedSellerId)
            .maybeSingle();

          if (sellerAccount?.full_name) {
            resolvedSellerName = sellerAccount.full_name;
          } else if (sellerAccount?.email) {
            resolvedSellerName = sellerAccount.email.split("@")[0];
          } else {
            // 2. Try fetching from profiles table as fallback
            const { data: sellerProfile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", resolvedSellerId)
              .maybeSingle();

            if (sellerProfile?.full_name) {
              resolvedSellerName = sellerProfile.full_name;
            } else if (sellerProfile?.email) {
              resolvedSellerName = sellerProfile.email.split("@")[0];
            }
          }
        }
      } catch (sellerErr) {
        console.error("Error fetching seller details:", sellerErr);
      }

      console.log("Resolved seller ID:", resolvedSellerId);
      console.log("Resolved seller name:", resolvedSellerName);
      setSellerId(resolvedSellerId);
      setSellerName(resolvedSellerName);

      setProc({ ...processRow, user_accounts: account });
      const parentProcessId = parentIdFromQuery || processRow.id;
      const { data: childRows } = await supabase
        .from("user_services")
        .select("*")
        .contains("step_data", { parent_process_id: parentProcessId })
        .order("created_at", { ascending: false });
      setRecoveryChildren((childRows || []) as UserService[]);
      const stepData = (data?.step_data as Record<string, unknown> | null) ?? null;
      if (stepData?.generatedCoverLetterHTML) {
        const rawHtml = stepData.generatedCoverLetterHTML as string;
        setCoverLetterHtml(rawHtml.replace(/(?:background-color|background|color)\s*:\s*[^;}"']+;?/gi, ''));
      }
    } catch (err: unknown) {
      console.error("Error loading process:", err);
      toast.error(t.cases.messages.loadError);
      navigate(`${processRoutePrefix}/processes`);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, processRoutePrefix, t, parentIdFromQuery, user?.id]);

  useEffect(() => {
    fetchProcessData();
  }, [fetchProcessData]);

  useEffect(() => {
    const stepData = (proc?.step_data as Record<string, unknown> | null) ?? {};
    const savedPassword =
      (stepData.consular_password as string) ||
      (stepData.mrv_password as string) ||
      "";
    setAccountCreationPassword(savedPassword);
  }, [proc]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <RiLoader4Line className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  if (!proc) {
    return (
      <div className="p-12 text-center bg-bg min-h-screen">
        <p className="text-text-muted">{t.cases.messages.loadError}</p>
        <button onClick={() => navigate(`${processRoutePrefix}/processes`)} className="mt-4 text-primary font-bold">{t.shared.back}</button>
      </div>
    );
  }

  const service = getServiceBySlug(proc.service_slug);

  if (!service) {
    return (
      <div className="p-12 text-center bg-bg min-h-screen">
        <RiErrorWarningLine className="text-4xl text-danger mx-auto mb-4" />
        <h2 className="text-xl font-black text-text uppercase mb-2">Service not configured</h2>
        <p className="text-text-muted mb-6">Service "{proc.service_slug}" has no workflow definition in the system.</p>
        <button onClick={() => navigate(`${processRoutePrefix}/processes`)} className="bg-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
          Back to list
        </button>
      </div>
    );
  }
  const isCOS = proc.service_slug.includes("troca-status") || proc.service_slug.includes("extensao-status");
  const history = ((proc.step_data as any)?.history as Array<{ type?: string; steps?: unknown[] }>) || [];
  
  const effectiveSteps = service ? buildEffectiveSteps(service.steps, history) : [];
  const rawCurrentStep =
    proc.current_step ??
    (typeof (proc.step_data as any)?.current_step === "number"
      ? (proc.step_data as any).current_step
      : Number((proc.step_data as any)?.current_step ?? 0));
  const normalizedCurrentStep = Number.isFinite(rawCurrentStep) ? Math.max(0, Math.floor(rawCurrentStep)) : 0;
  const currentStepIdx = Math.min(normalizedCurrentStep, Math.max(0, effectiveSteps.length - 1));
  const currentStep = effectiveSteps[currentStepIdx];
  const currentStepBaseId = normalizeLegacyStepId(currentStep?.id);
  const workflowStatus = String((proc.step_data as any)?.workflow_status ?? "").toLowerCase();

  const handleApproveStep = async (extraData?: Record<string, unknown>) => {
    if (!service || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let nextStep = currentStepIdx + 1;

      // --- SKIP LOGIC: Se o visto de destino NÃO for F1, pula I-20 e SEVIS ---
      if (isCOS) {
        const targetVisa = (proc.step_data as any)?.targetVisa as string;
        if (targetVisa !== "F1") {
          const stepsToSkipIds = ["cos_i20_upload", "cos_sevis_fee", "eos_i20_upload", "eos_sevis_fee"];
          while (nextStep < service.steps.length && stepsToSkipIds.includes(service.steps[nextStep].id)) {
            nextStep++;
          }
        }
      }

      const isConsular = proc.service_slug.includes("b1b2") || proc.service_slug.includes("b1-b2") || proc.service_slug.includes("f1");
      const isF1FinalScheduling = false; // Do not complete F1 at scheduling step, let it advance to final preparation

      // When MRV setup is approved by manager/admin, move customer directly
      // to process-closure step (final_preparation), skipping intermediate admin scheduling.
      if (
        currentStepBaseId === "f1_admin_mrv_setup" ||
        currentStepBaseId === "b1b2_admin_mrv_setup" ||
        currentStepBaseId === "f1_user_mrv_payment" ||
        currentStepBaseId === "b1b2_user_mrv_payment"
      ) {
        const finalPreparationIdx = effectiveSteps.findIndex((s) => {
          const id = normalizeLegacyStepId(s.id);
          return id === "f1_final_preparation" || id === "b1b2_final_preparation";
        });
        if (finalPreparationIdx !== -1) {
          nextStep = finalPreparationIdx;
        } else if (effectiveSteps.length > 11) {
          // Fallback for legacy consular flows where closure is at index 11.
          nextStep = 11;
        }
      }

      const additionalData = { ...extraData };
      if (currentStepBaseId === 'cos_analysis_presentation_letter' || currentStepBaseId === 'eos_admin_cover_analysis') {
        additionalData.generatedCoverLetterHTML = coverLetterHtml;
      }
      const isFinal = (nextStep >= effectiveSteps.length && !isConsular);
      const targetStep = nextStep;

      await processService.approveStep(proc.id, targetStep, isFinal, isFinal ? 'approved' : undefined, additionalData, { actorRole: user?.role ?? undefined });

      // se a próxima etapa para o B1/B2 ou F1 for credenciais ou criação de conta,
      // certifique-se de que o card aparecerá na fila do administrador na página de listagem
      const nextStepId = effectiveSteps[targetStep]?.id;
      const nextStepBaseId = normalizeLegacyStepId(nextStepId);
      const isAdminTask =
        !!nextStepBaseId &&
        (nextStepBaseId.includes("_admin_credentials") ||
          nextStepBaseId.includes("_admin_account_creation") ||
          nextStepBaseId.includes("_admin_analysis"));

      if (isAdminTask) {
        await processService.updateProcessStatus(proc.id, "awaiting_review");
      }

      toast.success(isFinal ? t.cases.messages.approveFinalSuccess : t.cases.messages.approveSuccess.replace("{name}", proc.user_accounts?.full_name || "Cliente"));
      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      toast.error(t.cases.messages.errorAction + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectStep = async () => {
    if (!rejectionReason || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const isB1B2 = proc.service_slug.includes("b1b2") || proc.service_slug.includes("b1-b2");
      const isF1 = proc.service_slug.includes("f1");
      const isFinal = currentStepIdx >= effectiveSteps.length - 1;

      if (isFinal) {
        await processService.rejectStep(proc.id, true, 'denied', { actorRole: user?.role ?? undefined });
        toast.success(t.cases.messages.rejectFinalSuccess);
      } else if ((isB1B2 && currentStepBaseId === "b1b2_admin_final_analysis") || (isF1 && currentStepBaseId === "f1_admin_final_analysis")) {
        // Volta para a etapa de assinatura (idx 3 no B1/B2, idx 4 no F1)
        const backIdx = isF1 ? 4 : 3;
        await processService.updateStepData(proc.id, {
          admin_feedback: rejectionReason,
          rejected_items: selectedItems,
          rejected_at: new Date().toISOString()
        });
        const { error } = await supabase
          .from("user_services")
          .update({ current_step: backIdx, status: "active" })
          .eq("id", proc.id);
        if (error) throw new Error(error.message);

        await notificationService.notifyClient({
          userId: proc.user_id!,
          serviceId: proc.id,
          link: `/dashboard/processes/${proc.service_slug}`,
          category: "process",
          action: rejectionReason ? "step_rejected" : "step_rejected_no_feedback",
          metadata: { step_name: currentStep?.title ?? "", feedback: rejectionReason },
        });
        toast.success(t.shared.administrativeAction); // Or better: t.cases.messages.rejectSuccess
      } else if (isF1 && currentStepBaseId === "f1_admin_analysis") {
        // Volta para o upload do I-20 (idx 1)
        await processService.updateStepData(proc.id, {
          admin_feedback: rejectionReason,
          rejected_items: selectedItems,
          rejected_at: new Date().toISOString()
        });
        const { error } = await supabase
          .from("user_services")
          .update({ current_step: 1, status: "active" })
          .eq("id", proc.id);
        if (error) throw new Error(error.message);

        await notificationService.notifyClient({
          userId: proc.user_id!,
          serviceId: proc.id,
          link: `/dashboard/processes/${proc.service_slug}`,
          category: "process",
          action: rejectionReason ? "step_rejected" : "step_rejected_no_feedback",
          metadata: { step_name: currentStep?.title ?? "", feedback: rejectionReason },
        });
        toast.success("I-20/DS160 correction requested.");
      } else {
        await processService.updateStepData(proc.id, {
          admin_feedback: rejectionReason,
          rejected_items: selectedItems,
          rejected_at: new Date().toISOString()
        });

        await processService.rejectStep(proc.id, false, undefined, { actorRole: user?.role ?? undefined });
        toast.success(t.cases.messages.rejectSuccess);
      }

      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      toast.error(t.cases.messages.errorAction + msg);
    } finally {
      setIsSubmitting(false);
      setShowRejectionModal(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setIsGeneratingCoverLetter(true);
    try {
      const payload = {
        coverLetter: (proc.step_data as any)?.coverLetter,
        user: proc.user_accounts
      };
      const res = await fetch(import.meta.env.VITE_N8N_BOT_COVERLATTER as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("n8n call failed");
      const result = await res.json();
      const html = result.html || result.content || result.response || result.data || JSON.stringify(result);
      setCoverLetterHtml(html);
      toast.success(t.processDetail.messages.aiCoverLetterSuccess);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(t.processDetail.messages.generateError + msg);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const renderCardActions = (
    approveLabel: string,
    approveTone: "success" | "primary" = "success",
    requestLabel = t.analysisPanel.actions.requestMoreInfo,
  ) => (
    <div className="flex items-center gap-4 pt-4 border-t border-border">
      <button
        onClick={() => setShowRejectionModal(true)}
        className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"
      >
        <RiCloseLine className="text-xl" /> {requestLabel}
      </button>
      <button
        onClick={() => handleApproveStep()}
        disabled={isSubmitting}
        className={`flex-1 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${
          approveTone === "primary"
            ? "bg-primary shadow-primary/20"
            : "bg-success shadow-success/20"
        }`}
      >
        {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {approveLabel}</>}
      </button>
    </div>
  );

  const renderFormData = () => {
    const data = proc.step_data || {};
    const entries = Object.entries(data).filter(([key]) =>
      !['docs', 'admin_feedback', 'rejected_at', 'review', 'i539', 'i539PdfUrl', 'coverLetter', 'generatedCoverLetterHTML', 'finalForms', 'g1145PdfUrl', 'g1450PdfUrl', 'finalFormsGeneratedAt', 'finalPackagePdfUrl', 'rfe_history'].includes(key)
    );

    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const analysisStepId = proc.service_slug === "extensao-status" ? "eos_admin_analysis" : `${prefix}analysis_form_docs`;
    const analysisIdx = effectiveSteps.findIndex(s =>
      normalizeLegacyStepId(s.id) === "b1b2_admin_analysis" ||
      normalizeLegacyStepId(s.id) === analysisStepId
    );
    const isActive = analysisIdx !== -1 && currentStepIdx === analysisIdx;
    const isPast = analysisIdx !== -1 && currentStepIdx > analysisIdx;

    if (entries.length === 0) {
      return (
        <CollapsibleStep
          title={proc.service_slug.includes("b1b2") || proc.service_slug.includes("b1-b2") || proc.service_slug.includes("f1") ? "DS-160" : "Form Data (Review)"}
          icon={RiFileTextLine}
          isActive={isActive}
          isPast={isPast}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted">
            <RiFileTextLine className="text-4xl mb-3 text-text-muted/60" />
            <p className="text-sm font-medium">Nenhum dado de formulário preenchido até o momento.</p>
          </div>
        </CollapsibleStep>
      );
    }

    return (
      <CollapsibleStep
        title={proc.service_slug.includes("b1b2") || proc.service_slug.includes("b1-b2") || proc.service_slug.includes("f1") ? "DS-160" : "Form Data (Review)"}
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {entries.map(([key, value]) => {
            const isArray = Array.isArray(value);
            const isSelected = selectedItems.includes(key);

            return (
              <div key={key} className={`${isArray ? 'col-span-full' : 'border-b border-border pb-4'}`}>
                <div className="flex justify-between items-center mb-3 px-1">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</p>
                  {isActive && (
                    <button
                      onClick={() => toggleItem(key)}
                      className={`p-1.5 rounded-lg transition-all ${isSelected ? 'bg-danger text-white shadow-lg shadow-danger/20' : 'text-text-muted hover:bg-bg-subtle'}`}
                      title="Mark for correction"
                    >
                      <RiErrorWarningLine className="text-sm" />
                    </button>
                  )}
                </div>

                {isArray ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(value as unknown[]).map((item, idx) => (
                      <div key={idx} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black">
                              {idx + 1}
                            </div>
                            <span className="text-[10px] font-black text-text uppercase tracking-tight">{t.shared.registration}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {typeof item === 'object' && item !== null ? (
                            Object.entries(item as Record<string, unknown>).filter(([k]) => k !== 'id').map(([k, v]) => (
                              <div key={k} className="flex justify-between items-start gap-4 text-[11px]">
                                <span className="text-text-muted font-bold uppercase shrink-0">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                <span className="text-text font-black text-right">{String(v)}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-text font-black">{String(item)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-text px-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {isActive && (
          <div className="mt-6">
            {renderCardActions(t.cases.actions.approve)}
          </div>
        )}
      </CollapsibleStep>
    );
  };

  const renderOfficialForms = () => {
    const pdfUrl = (proc.step_data as any)?.i539PdfUrl as string | undefined;
    if (!pdfUrl) return null;

    const isSelected = selectedItems.includes('i539PdfUrl');
    const stepId =
      proc.service_slug === "extensao-status"
        ? "eos_admin_final_review"
        : "cos_analysis_official_forms";
    const officialFormsIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === stepId);
    const isActive = officialFormsIdx !== -1 && currentStepIdx === officialFormsIdx;
    const isPast = officialFormsIdx !== -1 && currentStepIdx > officialFormsIdx;

    return (
      <CollapsibleStep
        title={t.processDetail.officialForms.title}
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <RiFileTextLine className="text-3xl" />
            </div>
            <h4 className="font-black text-text text-lg mb-1">{t.processDetail.officialForms.i539Form}</h4>
            <p className="text-xs text-text-muted font-medium mb-6">{t.processDetail.officialForms.digitalDocDesc}</p>
            <div className="flex gap-3 w-full">
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                <RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}
              </a>
              {isActive && (
                <button onClick={() => toggleItem('i539PdfUrl')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                  <RiErrorWarningLine className="text-sm" /> Select
                </button>
              )}
            </div>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-4 pt-4 border-t border-border mt-4">
            <button
              onClick={() => setShowRejectionModal(true)}
              className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"
            >
              <RiCloseLine className="text-xl" /> {t.cases.actions.reject}
            </button>
            <button
              onClick={() => handleApproveStep()}
              disabled={isSubmitting}
              className="flex-1 bg-success text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-success/20"
            >
              {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.cases.actions.approve}</>}
            </button>
          </div>
        )}
      </CollapsibleStep>
    );
  };

  const renderCoverLetterAdmin = () => {
    if (!(proc.step_data as any)?.coverLetter) return null;
    const stepId =
      proc.service_slug === "extensao-status"
        ? "eos_admin_cover_analysis"
        : "cos_analysis_presentation_letter";
    const coverLetterIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === stepId);
    const isActive = coverLetterIdx !== -1 && currentStepIdx === coverLetterIdx;
    const isPast = coverLetterIdx !== -1 && currentStepIdx > coverLetterIdx;

    return (
      <CollapsibleStep title={t.processDetail.coverLetter.title || "Analysis: Cover Letter"} icon={RiFileTextLine} isActive={isActive} isPast={isPast}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-text text-lg">{t.processDetail.coverLetter.finalLetter}</h4>
            {isActive && (
              <button onClick={() => handleGenerateCoverLetter()} disabled={isGeneratingCoverLetter} className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
                {isGeneratingCoverLetter ? <RiLoader4Line className="animate-spin text-lg" /> : <RiFileTextLine className="text-lg" />}
                {t.processDetail.coverLetter.generateBtn}
              </button>
            )}
          </div>
          <div
            contentEditable={isActive}
            suppressContentEditableWarning={true}
            onBlur={(e) => isActive && setCoverLetterHtml(e.currentTarget.innerHTML)}
            className={`w-full min-h-[500px] bg-card border border-border rounded-2xl p-8 overflow-y-auto shadow-sm prose prose-sm dark:prose-invert max-w-none text-text [&_*]:text-inherit [&_*]:bg-transparent ${isActive ? 'outline-none focus:ring-4 focus:ring-primary/20' : 'opacity-80'}`}
            dangerouslySetInnerHTML={{ __html: coverLetterHtml.replace(/(?:background-color|background|color)\s*:\s*[^;}"']+;?/gi, '') }}
          />
          {isActive && (
            <div className="mt-4">
              {renderCardActions(t.cases.actions.approve)}
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderFinalFormsAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const isEOS = proc.service_slug === "extensao-status";
    const g1145PdfUrl = (proc.step_data as any)?.g1145PdfUrl as string;
    const g1450PdfUrl = (proc.step_data as any)?.g1450PdfUrl as string;
    if (!g1145PdfUrl && !g1450PdfUrl) return null;
    const finalFormsStepId = isEOS ? "eos_admin_final_review" : "cos_analysis_final_forms";
    const isActive = currentStepBaseId === finalFormsStepId;
    const finalFormsIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === finalFormsStepId);
    const isPast = finalFormsIdx !== -1 && currentStepIdx > finalFormsIdx;

    return (
      <CollapsibleStep title={`${t.processDetail.finalForms?.g1145} / ${t.processDetail.finalForms?.g1450}`} icon={RiBankCardLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-6">
          {g1145PdfUrl && (
            <div className={`flex items-center justify-between p-6 border rounded-2xl transition-all ${selectedItems.includes('g1145PdfUrl') ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
              <div className="flex items-center gap-4">
                <RiFileTextLine className="text-2xl text-info" />
                <h4 className="text-sm font-black text-text">G-1145</h4>
              </div>
              <div className="flex items-center gap-3">
                <a href={g1145PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-info text-white font-black text-[10px] uppercase rounded-xl">{t.processDetail.officialForms.viewPdf}</a>
                {isActive && (
                  <button onClick={() => toggleItem('g1145PdfUrl')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedItems.includes('g1145PdfUrl') ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                    Select
                  </button>
                )}
              </div>
            </div>
          )}
          {g1450PdfUrl && (
            <div className={`flex items-center justify-between p-6 border rounded-2xl transition-all ${selectedItems.includes('g1450PdfUrl') ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
              <div className="flex items-center gap-4">
                <RiBankCardLine className="text-2xl text-primary" />
                <h4 className="text-sm font-black text-text">G-1450</h4>
              </div>
              <div className="flex items-center gap-3">
                <a href={g1450PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-primary text-white font-black text-[10px] uppercase rounded-xl">{t.processDetail.officialForms.viewPdf}</a>
                {isActive && (
                  <button onClick={() => toggleItem('g1450PdfUrl')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedItems.includes('g1450PdfUrl') ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                    Select
                  </button>
                )}
              </div>
            </div>
          )}
          {isActive && (
            renderCardActions(t.cases.actions.approve)
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderCOSDocumentsAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const stepId = proc.service_slug === "extensao-status" ? "eos_admin_analysis" : `${prefix}analysis_form_docs`;
    const docsIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === stepId);
    const isActive = docsIdx !== -1 && currentStepIdx === docsIdx;
    const isPast = docsIdx !== -1 && currentStepIdx > docsIdx;

    const docs = ((proc.step_data as any)?.docs || {}) as Record<string, string>;
    if (Object.keys(docs).length === 0) return null;

    return (
      <CollapsibleStep title={t.analysisPanel.clientDocuments} icon={RiFileUploadLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(docs).map(([key, path]) => {
              if (key === 'i20_document' || key === 'sevis_receipt') return null;
              const url = supabase.storage.from("aplikei-profiles").getPublicUrl(path).data.publicUrl;
              const isSelected = selectedItems.includes(`docs.${key}`);

              return (
                <div key={key} className={`p-4 rounded-2xl border flex flex-col transition-all ${isSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                  <h4 className="text-[10px] font-black text-text uppercase tracking-tight truncate mb-3">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <div className="flex gap-2 mt-auto">
                    <a href={url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                      {t.processDetail.officialForms.viewPdf}
                    </a>
                    {isActive && (
                      <button onClick={() => toggleItem(`docs.${key}`)} className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${isSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                        <RiErrorWarningLine className="text-sm" /> Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isActive && (
            renderCardActions(t.cases.actions.approve)
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderCOSAnalysisI20SevisAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const stepId = `${prefix}analysis_i20_sevis`;
    const i20Idx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === stepId);
    const isActive = i20Idx !== -1 && currentStepIdx === i20Idx;
    const isPast = i20Idx !== -1 && currentStepIdx > i20Idx;

    const docs = ((proc.step_data as any)?.docs || {}) as Record<string, string>;
    const i20Url = docs.i20_document ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.i20_document).data.publicUrl : null;
    const sevisUrl = docs.sevis_receipt ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.sevis_receipt).data.publicUrl : null;

    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={t.processDetail.i20Sevis.title} icon={RiShieldCheckLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {i20Url && (
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${selectedItems.includes('docs.i20_document') ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-sm mb-1 uppercase">I-20 Form</h4>
                <div className="flex gap-2 w-full mt-4">
                  <a href={i20Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.i20_document')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${selectedItems.includes('docs.i20_document') ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      Select
                    </button>
                  )}
                </div>
              </div>
            )}
            {sevisUrl && (
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${selectedItems.includes('docs.sevis_receipt') ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiMoneyDollarCircleLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-sm mb-1 uppercase">Recibo SEVIS</h4>
                <div className="flex gap-2 w-full mt-4">
                  <a href={sevisUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.sevis_receipt')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${selectedItems.includes('docs.sevis_receipt') ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      Select
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            renderCardActions(t.processDetail.i20Sevis.approveBtn, "success", t.processDetail.i20Sevis.requestCorrection)
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1DocumentsAdmin = () => {
    if (!proc.service_slug.includes("f1")) return null;
    const analysisIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === "f1_admin_analysis");
    const isActive = analysisIdx !== -1 && currentStepIdx === analysisIdx;
    const isPast = analysisIdx !== -1 && currentStepIdx > analysisIdx;

    const docs = ((proc.step_data as any)?.docs || {}) as Record<string, string>;
    const rejectedItems = (((proc.step_data as any)?.rejected_items as string[]) || []);
    const hasAdminFeedback = Boolean((proc.step_data as any)?.admin_feedback);
    const hasCorrectionsInSection = hasAdminFeedback && rejectedItems.some((item) =>
      ["docs.i20_document", "docs.sevis_receipt"].includes(item),
    );
    const i20Url = docs.i20_document ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.i20_document).data.publicUrl : null;

    if (!isActive && !isPast && !i20Url) return null;

    const isI20Selected = selectedItems.includes('docs.i20_document');

    return (
      <CollapsibleStep
        title={t.processDetail.f1Documents.title}
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
        badge={hasCorrectionsInSection ? (t.cases.statusLabel.corrections || "Correções Necessárias") : (isActive ? t.cases.statusLabel.awaitingReview : undefined)}
      >
        <div className="flex flex-col gap-6">
          <div className="max-w-md">
            {i20Url && (
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isI20Selected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-sm mb-1 uppercase">I-20 Form</h4>
                <div className="flex gap-2 w-full mt-4">
                  <a href={i20Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.i20_document')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${isI20Selected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      Select
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            renderCardActions(t.processDetail.f1Documents.approveBtn, "primary", t.processDetail.i20Sevis.requestCorrection)
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1FinalDocsAdmin = () => {
    if (!proc.service_slug.includes("f1")) return null;
    const finalAnalysisIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === "f1_admin_final_analysis");
    const isActive = finalAnalysisIdx !== -1 && currentStepIdx === finalAnalysisIdx;
    const isPast = finalAnalysisIdx !== -1 && currentStepIdx > finalAnalysisIdx;

    const docs = ((proc.step_data as any)?.docs || {}) as Record<string, string>;
    const rejectedItems = (((proc.step_data as any)?.rejected_items as string[]) || []);
    const hasAdminFeedback = Boolean((proc.step_data as any)?.admin_feedback);
    const hasCorrectionsInSection = hasAdminFeedback && rejectedItems.some((item) =>
      ["docs.ds160_assinada", "docs.ds160_comprovante"].includes(item),
    );
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep
        title={t.processDetail.f1FinalDocs.title}
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
        badge={hasCorrectionsInSection ? (t.cases.statusLabel.corrections || "Correções Necessárias") : (isActive ? t.cases.statusLabel.awaitingReview : undefined)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {ds160Url && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDsSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.ds160Signed}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={ds160Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}</a>
                  {isActive && <button onClick={() => toggleItem('docs.ds160_assinada')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isDsSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}><RiErrorWarningLine className="text-sm" /> Select</button>}
                </div>
              </div>
            )}
            {comprovanteUrl && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isComprovanteSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.finalProof}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}</a>
                  {isActive && <button onClick={() => toggleItem('docs.ds160_comprovante')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isComprovanteSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}><RiErrorWarningLine className="text-sm" /> Select</button>}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            renderCardActions(t.processDetail.f1FinalDocs.approveBtn, "primary", t.processDetail.i20Sevis.requestCorrection)
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CredentialsAdmin = () => {
    if (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2") && !proc.service_slug.includes("f1")) return null;
    const isActive = currentStepBaseId === "b1b2_admin_credentials" || currentStepBaseId === "f1_admin_credentials";
    const isPast = currentStepIdx > (proc.service_slug.includes("f1") ? 3 : 2);

    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={t.processDetail.credentials.title} icon={RiShieldCheckLine} isActive={isActive} isPast={isPast} badge={t.overview.stats.administrativeAction}>
        <B1B2CredentialsPanel proc={proc} onApprove={() => handleApproveStep()} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };

  const renderB1B2FinalDocsAdmin = () => {
    if (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2")) return null;
    const isActive = currentStepBaseId === "b1b2_admin_final_analysis";
    const isPast = currentStepIdx > 4;

    const docs = ((proc.step_data as any)?.docs || {}) as Record<string, string>;
    const rejectedItems = (((proc.step_data as any)?.rejected_items as string[]) || []);
    const hasAdminFeedback = Boolean((proc.step_data as any)?.admin_feedback);
    const hasCorrectionsInSection = hasAdminFeedback && rejectedItems.some((item) =>
      ["docs.ds160_assinada", "docs.ds160_comprovante"].includes(item),
    );
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("aplikei-profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep
        title={t.processDetail.b1b2FinalDocs.title}
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
        badge={hasCorrectionsInSection ? (t.cases.statusLabel.corrections || "Correções Necessárias") : (isActive ? t.cases.statusLabel.awaitingReview : undefined)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {ds160Url && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDsSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.ds160Signed}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={ds160Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    <RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.ds160_assinada')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isDsSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      <RiErrorWarningLine className="text-sm" /> Select
                    </button>
                  )}
                </div>
              </div>
            )}

            {comprovanteUrl && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isComprovanteSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.finalProof}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    <RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.ds160_comprovante')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isComprovanteSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      <RiErrorWarningLine className="text-sm" /> Select
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {isActive && renderCardActions(t.processDetail.b1b2FinalDocs.approveBtn, "success", t.processDetail.i20Sevis.requestCorrection)}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CASVAdmin = () => {
    if (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2") && !proc.service_slug.includes("f1")) return null;
    const isActive = currentStepBaseId === "b1b2_casv_scheduling" || currentStepBaseId === "f1_casv_scheduling";
    const isPast = currentStepIdx > (proc.service_slug.includes("f1") ? 6 : 5);
    if (!isActive && !isPast) return null;

    const casvDate = (proc.step_data as any)?.casv_preferred_date as string;
    const consulado = (proc.step_data as any)?.interviewLocation as string;

    const consuladoLabels: Record<string, { flag: string; cidade: string; estado: string }> = {
      Brasilia: { flag: "🏛️", cidade: "Brasília", estado: "DF" },
      "Rio de Janeiro": { flag: "🌆", cidade: "Rio de Janeiro", estado: "RJ" },
      "São Paulo": { flag: "🏙️", cidade: "São Paulo", estado: "SP" },
      Recife: { flag: "🌴", cidade: "Recife", estado: "PE" },
      "Porto Alegre": { flag: "🌉", cidade: "Porto Alegre", estado: "RS" },
    };
    const consuladoInfo = consulado ? consuladoLabels[consulado] : null;

    return (
      <CollapsibleStep
        title={t.processDetail.casv.title}
        icon={RiCalendarLine}
        isActive={isActive}
        isPast={isPast}
        badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}
      >
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">{t.processDetail.casv.selectedConsulate}</p>
            {consuladoInfo ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl">{consuladoInfo.flag}</span>
                <div>
                  <h4 className="font-black text-text text-base">{consuladoInfo.cidade}</h4>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{consuladoInfo.estado}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted font-medium">{t.processDetail.casv.noConsulate}</p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-info/10 border border-info/20">
            <p className="text-[10px] font-black text-info uppercase tracking-widest mb-1">{t.processDetail.casv.preferredDate}</p>
            {casvDate ? (
              <p className="text-lg font-black text-text">
                {new Date(casvDate + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            ) : (
              <p className="text-sm text-text-muted italic">{t.processDetail.casv.noDate}</p>
            )}
          </div>

          {isActive && proc.status === "awaiting_review" && casvDate && renderCardActions(t.processDetail.casv.confirmBtn, "success", t.processDetail.casv.requestAdjustment)}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2AccountCreationAdmin = () => {
    if (!proc || (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2") && !proc.service_slug.includes("f1"))) return null;
    const isActive = currentStepBaseId === "b1b2_admin_account_creation" || currentStepBaseId === "f1_admin_account_creation";
    const isPast = currentStepIdx > (proc.service_slug.includes("f1") ? 7 : 6);
    if (!isActive && !isPast) return null;

    const emailRaw = ((proc.step_data as any)?.primaryEmail || proc.user_accounts?.email || "") as string;
    const name = ((proc.step_data as any)?.fullName || proc.user_accounts?.full_name || t.processDetail.accountCreation.notInformed) as string;
    const phoneRaw = (
      (proc.step_data as any)?.primaryPhone ||
      (proc.step_data as any)?.cellPhone ||
      (proc.step_data as any)?.phone ||
      ""
    ) as string;
    const email = emailRaw || t.processDetail.accountCreation.notInformed;
    const phone = phoneRaw || t.processDetail.accountCreation.notInformed;

    const handleConfirmAccountCreation = async () => {
      if (!emailRaw || !phoneRaw) {
        toast.error("DS-160 email and phone are required to continue.");
        return;
      }
      if (!accountCreationPassword.trim()) {
        toast.error("Consulate account password is required.");
        return;
      }

      await handleApproveStep({
        consular_login: emailRaw.trim(),
        consular_email: emailRaw.trim(),
        consular_phone: phoneRaw.trim(),
        consular_password: accountCreationPassword.trim(),
      });
    };

    return (
      <CollapsibleStep title={t.processDetail.accountCreation.title} icon={RiUser3Line} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.processDetail.accountCreation.fullName}</p>
              <p className="text-sm font-bold text-text">{name || t.processDetail.accountCreation.notInformed}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.processDetail.accountCreation.email}</p>
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-sm font-bold text-text truncate flex-1" title={email}>{email || t.processDetail.accountCreation.notInformed}</p>
                {emailRaw && (
                  <button
                    type="button"
                    title="Copiar e-mail"
                    onClick={() => {
                      void navigator.clipboard.writeText(emailRaw).then(() => {
                        setCopiedAccountEmail(true);
                        setTimeout(() => setCopiedAccountEmail(false), 2000);
                      });
                    }}
                    className="shrink-0 p-1 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copiedAccountEmail
                      ? <RiCheckboxCircleLine className="w-3.5 h-3.5 text-emerald-500" />
                      : <RiFileCopyLine className="w-3.5 h-3.5" />
                    }
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.processDetail.accountCreation.phone}</p>
              <p className="text-sm font-bold text-text">{phone || t.processDetail.accountCreation.notInformed}</p>
            </div>
          </div>

          {isActive && (
            <div className="pt-4 border-t border-border text-left">
              <p className="text-xs text-text-muted font-medium mb-4 italic">
                {t.processDetail.accountCreation.instruction}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Consulate Account Password</label>
                  <input
                    type="text"
                    value={accountCreationPassword}
                    onChange={(e) => setAccountCreationPassword(e.target.value)}
                    disabled={!isActive}
                    className="w-full px-5 py-4 rounded-2xl bg-bg-subtle border border-border text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="Enter account password"
                  />
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button
                    onClick={() => setShowRejectionModal(true)}
                    className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"
                  >
                    <RiCloseLine className="text-xl" /> {t.analysisPanel.actions.requestMoreInfo}
                  </button>
                  <button
                    onClick={() => void handleConfirmAccountCreation()}
                    disabled={isSubmitting}
                    className="flex-1 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg bg-primary shadow-primary/20"
                  >
                    {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.accountCreation.confirmBtn}</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2MRVSetupAdmin = () => {
    if (!proc || (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2") && !proc.service_slug.includes("f1"))) return null;
    const isActive = currentStepBaseId === "b1b2_admin_mrv_setup" || currentStepBaseId === "f1_admin_mrv_setup";
    const isPast = currentStepIdx > (proc.service_slug.includes("f1") ? 9 : 8);
    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={t.processDetail.mrv.title} icon={RiMoneyDollarCircleLine} isActive={isActive} isPast={isPast} badge={t.shared.administrativeAction}>
        <MRVSetupPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };
  const renderB1B2FinalSchedulingAdmin = () => {
    if (!proc || (!proc.service_slug.includes("b1b2") && !proc.service_slug.includes("b1-b2") && !proc.service_slug.includes("f1"))) return null;
    const finalSchedulingStepIdx = proc.service_slug.includes("f1") ? 11 : 10;
    const hasSchedulingData = !!(proc.step_data as any)?.final_casv_date;
    const isActiveByStep = currentStepBaseId === "b1b2_final_scheduling" || currentStepBaseId === "f1_final_scheduling";
    const isActiveByPosition = currentStepIdx >= finalSchedulingStepIdx && !hasSchedulingData;
    const isActive = isActiveByStep || isActiveByPosition;
    const isPast = hasSchedulingData;
    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={t.processDetail.scheduling.title} icon={RiCalendarEventLine} isActive={isActive} isPast={isPast} badge={t.shared.administrativeAction}>
        <FinalSchedulingPanel proc={proc} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };

  const renderFinalPackageAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const finalPackageUrl = (proc.step_data as any)?.finalPackagePdfUrl as string;
    const stepId = `${prefix}final_package`;
    const packageIdx = effectiveSteps.findIndex(s => normalizeLegacyStepId(s.id) === stepId);
    const isActive = packageIdx !== -1 && currentStepIdx === packageIdx;
    const isPast = packageIdx !== -1 && currentStepIdx > packageIdx;
    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={`${proc.service_slug === 'extensao-status' ? 'EOS' : 'COS'} Final Package`} icon={RiCheckDoubleLine} isActive={isActive} isPast={isPast}>
        {!finalPackageUrl ? (
          <div className="text-center py-10 bg-bg-subtle border-2 border-dashed border-border rounded-[28px]">
            <RiFileTextLine className="text-4xl text-text-muted/30 mx-auto mb-4" />
            <button
              onClick={async () => {
                try {
                  toast.loading(t.processDetail.messages.finalPackageGenerating, { id: "merge" });
                  await packageService.mergeAndUploadPackage(proc.id, proc.user_id!);
                  toast.success(t.processDetail.messages.finalPackageGenerated, { id: "merge" });
                  fetchProcessData();
                } catch (e: unknown) {
                  const err = e as Error;
                  toast.error(err.message, { id: "merge" });
                }
              }}
              className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              {t.processDetail.finalPackage.mergeBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-success/10 border border-success/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <RiCheckDoubleLine className="text-2xl text-success" />
                <h4 className="text-sm font-black text-text">Pacote Final Pronto</h4>
              </div>
              <div className="flex gap-2">
                <a href={finalPackageUrl} target="_blank" rel="noreferrer" className="bg-card border border-border text-text px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><RiDownload2Line /> {t.processDetail.finalPackage.reviewPdf}</a>
              </div>
            </div>
            {isActive && renderCardActions(t.processDetail.finalPackage.approveBtn)}
          </div>
        )}
      </CollapsibleStep>
    );
  };

  const renderMotionAcquisitionAdmin = () => {
    if (!proc.service_slug.includes("consultancy-motion-")) return null;
    const acquisitionIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_motion_acquisition");
    if (acquisitionIdx === -1) return null;
    const isActive = currentStepIdx === acquisitionIdx;
    const isPast = currentStepIdx > acquisitionIdx;
    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const purchases = Array.isArray(stepData.purchases) ? (stepData.purchases as Array<{ slug?: string; created_at?: string; date?: string }>) : [];
    const hasPaid = purchases.some((p) =>
      [
        "analysis-motion-cos",
        "analysis-motion-eos",
        "apoio-rfe-motion-inicio",
      ].includes(String(p.slug || "").toLowerCase()),
    );
    const paidAt = purchases.find((p) => [
      "analysis-motion-cos",
      "analysis-motion-eos",
      "apoio-rfe-motion-inicio",
    ].includes(String(p.slug || "").toLowerCase()))?.created_at
      || purchases.find((p) => [
        "analysis-motion-cos",
        "analysis-motion-eos",
        "apoio-rfe-motion-inicio",
      ].includes(String(p.slug || "").toLowerCase()))?.date;

    return (
      <CollapsibleStep title="Motion - Adquirir" icon={RiMoneyDollarCircleLine} isActive={isActive} isPast={isPast}>
        <div className="p-5 rounded-2xl bg-bg-subtle border border-border text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Pagamento</p>
          <p className={`text-sm font-black ${hasPaid ? "text-success" : "text-text"}`}>
            {hasPaid ? "Pago pelo cliente" : "Aguardando pagamento"}
          </p>
          {paidAt && (
            <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">
              {new Date(paidAt).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderMotionInstructionAdmin = () => {
    if (!proc.service_slug.includes("consultancy-motion-")) return null;
    const instructionIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_motion_instruction");
    if (instructionIdx === -1) return null;
    const isActive = currentStepIdx === instructionIdx;
    const isPast = currentStepIdx > instructionIdx;
    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const reason = String(stepData.motion_reason || "").trim();
    const docs = ((stepData.docs || {}) as Record<string, string>);
    const denialPath = docs.motion_denial_letter;
    const supportPath = docs.motion_supporting_docs;
    const denialUrl = denialPath ? supabase.storage.from("aplikei-profiles").getPublicUrl(denialPath).data.publicUrl : "";
    const supportUrl = supportPath ? supabase.storage.from("aplikei-profiles").getPublicUrl(supportPath).data.publicUrl : "";
    const submittedAt = String(stepData.motion_submitted_at || "").trim();
    const instructionHistory = Array.isArray(stepData.motion_instruction_history)
      ? (stepData.motion_instruction_history as Array<Record<string, unknown>>)
      : [];
    const proposalHistory = Array.isArray(stepData.motion_proposal_history)
      ? (stepData.motion_proposal_history as Array<Record<string, unknown>>)
      : [];

    return (
      <CollapsibleStep title="Motion - Suas Informações" icon={RiFileTextLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-4 text-left">
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Motivo enviado pelo cliente</p>
            <p className="text-sm font-bold text-text whitespace-pre-wrap">{reason || "Cliente ainda não enviou o motivo."}</p>
            {submittedAt && (
              <p className="text-[10px] font-bold text-text-muted mt-3 uppercase tracking-widest">
                Enviado em {new Date(submittedAt).toLocaleString("pt-BR")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Carta de negativa</p>
              {denialUrl ? (
                <a href={denialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <RiExternalLinkLine /> Visualizar arquivo
                </a>
              ) : (
                <p className="text-xs font-bold text-text-muted">Não enviado.</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Documentos de apoio</p>
              {supportUrl ? (
                <a href={supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <RiExternalLinkLine /> Visualizar arquivo
                </a>
              ) : (
                <p className="text-xs font-bold text-text-muted">Não enviado.</p>
              )}
            </div>
          </div>

          {instructionHistory.length > 0 && (
            <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Histórico de envios</p>
              <div className="space-y-3">
                {[...instructionHistory].reverse().map((entry, idx) => {
                  const entryReason = String(entry.reason || "").trim();
                  const entryAt = String(entry.submitted_at || "").trim();
                  const entryDocs = (entry.docs || {}) as Record<string, string>;
                  const entryDenial = entryDocs.motion_denial_letter
                    ? supabase.storage.from("aplikei-profiles").getPublicUrl(entryDocs.motion_denial_letter).data.publicUrl
                    : "";
                  const entrySupport = entryDocs.motion_supporting_docs
                    ? supabase.storage.from("aplikei-profiles").getPublicUrl(entryDocs.motion_supporting_docs).data.publicUrl
                    : "";

                  return (
                    <div key={`motion-history-${idx}`} className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        Envio {instructionHistory.length - idx}
                        {entryAt ? ` • ${new Date(entryAt).toLocaleString("pt-BR")}` : ""}
                      </p>
                      <p className="text-sm font-bold text-text whitespace-pre-wrap mb-3">
                        {entryReason || "Sem descrição"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {entryDenial && (
                          <a href={entryDenial} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <RiExternalLinkLine /> Carta de negativa
                          </a>
                        )}
                        {entrySupport && (
                          <a href={entrySupport} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <RiExternalLinkLine /> Documento de apoio
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {proposalHistory.length > 0 && (
            <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Histórico de propostas</p>
              <div className="space-y-3">
                {[...proposalHistory].reverse().map((entry, idx) => {
                  const entryText = String(entry.proposal_text || "").trim();
                  const entryAmount = Number(entry.proposal_amount || 0);
                  const entryAt = String(entry.sent_at || "").trim();

                  return (
                    <div key={`motion-proposal-history-${idx}`} className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
                        Proposta {proposalHistory.length - idx}
                        {entryAt ? ` • ${new Date(entryAt).toLocaleString("pt-BR")}` : ""}
                      </p>
                      <p className="text-sm font-bold text-text whitespace-pre-wrap mb-3">
                        {entryText || "Sem descrição"}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Valor: USD {entryAmount.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderMotionProposalHistoryAdmin = () => {
    if (!proc.service_slug.includes("consultancy-motion-")) return null;
    const proposalIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_motion_proposal");
    if (proposalIdx === -1) return null;
    const isActive = currentStepIdx === proposalIdx;
    const isPast = currentStepIdx > proposalIdx;
    if (!isActive && !isPast) return null;

    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const purchases = Array.isArray(stepData.purchases)
      ? (stepData.purchases as Array<{ slug?: string; created_at?: string; date?: string }>)
      : [];
    const proposalHistory = Array.isArray(stepData.motion_proposal_history)
      ? (stepData.motion_proposal_history as Array<Record<string, unknown>>)
      : [];
    const latestText = String(stepData.motion_proposal_text || "").trim();
    const latestAmount = Number(stepData.motion_proposal_amount ?? stepData.motion_amount ?? 0);
    const latestSentAt = String(stepData.motion_proposal_sent_at || "").trim();
    const motionFinalResult = String(stepData.motion_final_result || "").toLowerCase();
    const isMotionRejected = motionFinalResult === "rejected" || motionFinalResult === "denied";
    const isMotionApproved = motionFinalResult === "approved";
    const isProposalPaid =
      Boolean(stepData.motion_proposal_paid) ||
      Boolean(stepData.motion_payment_completed_at) ||
      purchases.some((p) =>
        ["consultancy-motion-cos", "consultancy-motion-eos", "proposta-rfe-motion"].includes(
          String(p.slug || "").toLowerCase(),
        ),
      );
    const proposalPaidAt = String(stepData.motion_payment_completed_at || "").trim()
      || purchases.find((p) =>
        ["consultancy-motion-cos", "consultancy-motion-eos", "proposta-rfe-motion"].includes(
          String(p.slug || "").toLowerCase(),
        ),
      )?.created_at
      || purchases.find((p) =>
        ["consultancy-motion-cos", "consultancy-motion-eos", "proposta-rfe-motion"].includes(
          String(p.slug || "").toLowerCase(),
        ),
      )?.date
      || "";

    return (
      <CollapsibleStep title="Motion - Proposal" icon={RiShieldCheckLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-4 text-left">
          {(isMotionRejected || isMotionApproved) && (
            <div className={`p-4 rounded-2xl border ${isMotionRejected ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isMotionRejected ? "text-red-700" : "text-emerald-700"}`}>
                {isMotionRejected ? "Motion reprovado pelo cliente" : "Motion aprovado pelo cliente"}
              </p>
            </div>
          )}

          <div className={`p-4 rounded-2xl border ${isProposalPaid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isProposalPaid ? "text-emerald-700" : "text-amber-700"}`}>
              {isProposalPaid ? "Motion - Proposal paga pelo cliente" : "Aguardando pagamento da Motion - Proposal"}
            </p>
            {isProposalPaid && proposalPaidAt && (
              <p className="text-[10px] font-bold text-emerald-700/80 mt-1 uppercase tracking-widest">
                {new Date(proposalPaidAt).toLocaleString("pt-BR")}
              </p>
            )}
          </div>

          {(latestText || latestAmount > 0 || latestSentAt || proposalHistory.length > 0) && (
            <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Proposta enviada</p>
              <p className="text-sm font-bold text-text whitespace-pre-wrap mb-3">{latestText || "Sem descrição"}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Valor: USD {latestAmount.toFixed(2)}
              </p>
              {latestSentAt && (
                <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">
                  {new Date(latestSentAt).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderRFEAcquisitionAdmin = () => {
    if (!proc.service_slug.includes("analysis-rfe-")) return null;
    const acquisitionIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_rfe_explanation");
    if (acquisitionIdx === -1) return null;
    const isActive = currentStepIdx === acquisitionIdx;
    const isPast = currentStepIdx > acquisitionIdx;
    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const hasPaid = Boolean(stepData.rfe_initial_paid) || Boolean(stepData.rfe_analysis_paid);
    return (
      <CollapsibleStep title="RFE - Adquirir" icon={RiMoneyDollarCircleLine} isActive={isActive} isPast={isPast}>
        <div className="p-5 rounded-2xl bg-bg-subtle border border-border text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Pagamento</p>
          <p className={`text-sm font-black ${hasPaid ? "text-success" : "text-text"}`}>
            {hasPaid ? "Pago pelo cliente" : "Aguardando pagamento"}
          </p>
        </div>
      </CollapsibleStep>
    );
  };

  const renderRFEInstructionAdmin = () => {
    if (!proc.service_slug.includes("analysis-rfe-")) return null;
    const instructionIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_rfe_instruction");
    if (instructionIdx === -1) return null;
    const isActive = currentStepIdx === instructionIdx;
    const isPast = currentStepIdx > instructionIdx;
    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const description = String(stepData.rfe_description || "").trim();
    const docs = (stepData.docs || {}) as Record<string, string>;
    const rfePath = docs.rfe_letter;
    const rfeUrl = rfePath ? supabase.storage.from("aplikei-profiles").getPublicUrl(rfePath).data.publicUrl : "";
    return (
      <CollapsibleStep title="RFE - Suas Informações" icon={RiFileTextLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-4 text-left">
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Descrição enviada pelo cliente</p>
            <p className="text-sm font-bold text-text whitespace-pre-wrap">{description || "Cliente ainda não enviou a descrição."}</p>
          </div>
          <div className="p-4 rounded-2xl bg-bg-subtle border border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Carta RFE</p>
            {rfeUrl ? (
              <a href={rfeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <RiExternalLinkLine /> Visualizar arquivo
              </a>
            ) : (
              <p className="text-xs font-bold text-text-muted">Não enviado.</p>
            )}
          </div>
        </div>
      </CollapsibleStep>
    );
  };

  const renderRFEProposalHistoryAdmin = () => {
    if (!proc.service_slug.includes("analysis-rfe-")) return null;
    const proposalIdx = effectiveSteps.findIndex((s) => normalizeLegacyStepId(s.id) === "cos_rfe_accept_proposal");
    if (proposalIdx === -1) return null;
    const isActive = currentStepIdx === proposalIdx;
    const isPast = currentStepIdx > proposalIdx;
    if (!isActive && !isPast) return null;

    const stepData = (proc.step_data || {}) as Record<string, unknown>;
    const latestText = String(stepData.rfe_proposal_text || "").trim();
    const latestAmount = Number(stepData.rfe_proposal_amount || 0);
    const latestSentAt = String(stepData.rfe_proposal_sent_at || "").trim();
    const result = String(stepData.uscis_rfe_result || "").toLowerCase();
    const isRejected = result === "denied" || result === "rejected";
    const isApproved = result === "approved";
    const isPaid = Boolean(stepData.rfe_proposal_paid) || Boolean(stepData.rfe_payment_completed_at);

    return (
      <CollapsibleStep title="RFE - Proposta" icon={RiShieldCheckLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-4 text-left">
          {(isRejected || isApproved) && (
            <div className={`p-4 rounded-2xl border ${isRejected ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isRejected ? "text-red-700" : "text-emerald-700"}`}>
                {isRejected ? "RFE reprovado pelo cliente" : "RFE aprovado pelo cliente"}
              </p>
            </div>
          )}
          <div className={`p-4 rounded-2xl border ${isPaid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
              {isPaid ? "RFE - Proposta paga pelo cliente" : "Aguardando pagamento da RFE - Proposta"}
            </p>
          </div>
          {(latestText || latestAmount > 0 || latestSentAt) && (
            <div className="p-5 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Proposta enviada</p>
              <p className="text-sm font-bold text-text whitespace-pre-wrap mb-3">{latestText || "Sem descrição"}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Valor: USD {latestAmount.toFixed(2)}</p>
              {latestSentAt && (
                <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">
                  {new Date(latestSentAt).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24 bg-bg min-h-screen">
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(isRecoveryChildView ? `${processRoutePrefix}/cases/${parentIdFromQuery}` : `${processRoutePrefix}/processes`)} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm">
            <RiArrowLeftLine className="text-xl" />
          </button>
          {officeLogoUrl && (
            <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center overflow-hidden shadow-sm p-1.5 shrink-0">
              <img src={officeLogoUrl} alt={officeName ?? ""} className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-black text-3xl text-text tracking-tight">{proc.user_accounts?.full_name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{service?.title}</p>
              {officeName && (
                <>
                  <span className="text-border text-xs">•</span>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{officeName}</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border shadow-sm text-text-muted text-[10px] font-black uppercase tracking-widest">
          <RiCalendarLine className="text-text-muted" />
          <span className="flex items-center gap-1.5">{new Date(proc.created_at ?? Date.now()).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {(() => {
            const allSteps = [
              renderMotionAcquisitionAdmin(),
              renderMotionInstructionAdmin(),
              renderMotionProposalHistoryAdmin(),
              renderRFEAcquisitionAdmin(),
              renderRFEInstructionAdmin(),
              renderRFEProposalHistoryAdmin(),
              !proc.service_slug.includes("consultancy-motion-") &&
                !proc.service_slug.includes("analysis-rfe-") &&
                renderFormData(),
              renderCOSDocumentsAdmin(),
              renderCoverLetterAdmin(),
              renderOfficialForms(),
              renderCOSAnalysisI20SevisAdmin(),
              renderFinalFormsAdmin(),
              renderB1B2CredentialsAdmin(),
              renderB1B2FinalDocsAdmin(),
              renderF1DocumentsAdmin(),
              renderF1FinalDocsAdmin(),
              renderB1B2CASVAdmin(),
              renderB1B2AccountCreationAdmin(),
              renderB1B2MRVSetupAdmin(),
              renderB1B2FinalSchedulingAdmin(),
              currentStepBaseId === "cos_rfe_proposal" && (
                <CollapsibleStep key="cos_rfe_proposal" title={t.processDetail.rfe.panelTitle} icon={RiShieldCheckLine} isActive={true} isPast={false} badge={t.shared.administrativeAction}>
                  <RFEProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
                </CollapsibleStep>
              ),
              (currentStepBaseId === "cos_motion_proposal" || workflowStatus === "awaiting_proposal") && (
                <CollapsibleStep key="cos_motion_proposal" title={t.processDetail.motion.panelTitle} icon={RiShieldCheckLine} isActive={true} isPast={false} badge={t.shared.administrativeAction}>
                  <MotionProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
                </CollapsibleStep>
              ),
              currentStepBaseId === "cos_rfe_end" &&
                !proc.service_slug.includes("analysis-rfe-") && (
                <CollapsibleStep key="cos_rfe_end" title={t.processDetail.rfe.finalPackageTitle} icon={RiFileUploadLine} isActive={true} isPast={false} badge={t.shared.administrativeAction}>
                  <RFEFinalShipPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={true} />
                </CollapsibleStep>
              )
            ].filter(React.isValidElement);

            return (
              <>
                {allSteps.map((step, idx) => React.cloneElement(step as React.ReactElement, { key: `step-${idx}` }))}
              </>
            );
          })()}

          {!isRecoveryChildView && dedupedRecoveryChildren.length > 0 && (
            <div className="bg-card rounded-[32px] border border-border shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <RiGitBranchLine className="text-sm" />
                </div>
                <h3 className="font-black text-text text-sm uppercase tracking-tight">Recovery Products</h3>
              </div>
              <div className="space-y-2">
                {dedupedRecoveryChildren.map((child) => {
                  const sd = (child.step_data || {}) as Record<string, unknown>;
                  const childFlow = String(
                    sd.workflow_type ||
                    (child.service_slug.toLowerCase().includes("motion") ? "motion" : "rfe"),
                  ).toLowerCase();
                  const childService = getServiceBySlug(child.service_slug);
                  const childCurrentStep = Math.max(0, Number(child.current_step ?? 0));
                  const childStepType = childService?.steps?.[childCurrentStep]?.type;
                  const needsCustomerAction = child.status === "active" && (childStepType === "form" || childStepType === "upload");
                  const motionResult = String(sd.motion_final_result || "").toLowerCase();
                  const rfeResult = String(sd.uscis_rfe_result || sd.rfe_final_result || "").toLowerCase();
                  const isRejected =
                    motionResult === "rejected" ||
                    motionResult === "denied" ||
                    rfeResult === "rejected" ||
                    rfeResult === "denied";
                  const isApproved =
                    !isRejected &&
                    (motionResult === "approved" || rfeResult === "approved");
                  const statusLabel = isApproved ? "Aprovado" : isRejected ? "Reprovado" : "Em andamento";
                  const statusClass = isApproved
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isRejected
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <button
                      key={child.id}
                      onClick={() => navigate(`${processRoutePrefix}/cases/${child.id}?parentId=${proc.id}`)}
                      className="w-full flex items-center justify-between rounded-xl border border-border bg-bg-subtle px-4 py-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <div>
                        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-text">
                          <RiGitBranchLine className="text-primary" />
                          {childFlow === "motion" ? "Motion" : "RFE"}
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          {child.service_slug}
                        </p>
                        <span className={`mt-2 inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${statusClass}`}>
                          {statusLabel}
                        </span>
                        {needsCustomerAction && (
                          <span className="ml-2 mt-2 inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
                            <RiUser3Line className="text-[10px]" />
                            Customer action
                          </span>
                        )}
                      </div>
                      <RiArrowRightLine className="text-text-muted" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Card de Contato do Cliente & Vendedor */}
          <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <RiUser3Line className="text-xl" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-text text-sm uppercase tracking-tight">Detalhes do Cliente</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Informações de contato e venda</p>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Nome Completo</span>
                <span className="text-xs font-bold text-text">{proc.user_accounts?.full_name || "—"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">E-mail</span>
                <span className="text-xs font-bold text-text break-all">{proc.user_accounts?.email || "—"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Telefone</span>
                <span className="text-xs font-bold text-text">{proc.user_accounts?.mobilePhone || "—"}</span>
              </div>

              <div className="flex flex-col gap-1 pt-4 border-t border-border/50">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Vendedor (Seller ID)</span>
                {sellerId ? (
                  <div className="mt-1.5 flex flex-col gap-1 bg-bg-subtle p-3 rounded-2xl border border-border">
                    <span className="text-xs font-bold text-primary">Nome: {sellerName || "Vendedor Identificado"}</span>
                    <span className="font-mono text-[9px] text-text-muted break-all">ID: {sellerId}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-text-muted italic mt-1 block">Nenhum (Venda Direta / Sem Link)</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[32px] border border-border shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-text text-lg uppercase">{t.cases.table.flowActions}</h3>
              <div className="px-3 py-1 bg-primary/5 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest">
                {t.processDetail.steps.stepCounter.replace('{{current}}', String(currentStepIdx + 1)).replace('{{total}}', String(effectiveSteps.length))}
              </div>
            </div>
            <div className="space-y-4">
              {effectiveSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i < currentStepIdx ? 'bg-success text-white' : i === currentStepIdx ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-bg-subtle text-text-muted'}`}>
                    {i < currentStepIdx ? <RiCheckLine /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-tight transition-all ${i <= currentStepIdx ? 'text-text' : 'text-text-muted'}`}>
                    {vt.processSteps[step.id]?.title || step.title}
                  </span>
                </div>
              ))}

              {/* Resultado Final (se houver) */}
              {proc.status === 'completed' && (
                <div className="flex items-center gap-3 pt-3 mt-4 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] shadow-lg shadow-emerald-500/20">
                    <RiCheckDoubleLine />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-emerald-600 tracking-tight">
                      {vt.onboardingPage?.processingStatus?.outcomeApproved}
                    </span>
                    {(proc.step_data as any)?.reported_at && (
                      <span className="text-[8px] font-bold text-emerald-600/60 uppercase">
                        {new Date((proc.step_data as any).reported_at as string).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {proc.status === 'rejected' && (
                <div className="flex items-center gap-3 pt-3 mt-4 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] shadow-lg shadow-rose-500/20">
                    <RiCloseLine />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-rose-600 tracking-tight">
                      {vt.onboardingPage?.processingStatus?.outcomeRejected}
                    </span>
                    {(proc.step_data as any)?.reported_at && (
                      <span className="text-[8px] font-bold text-rose-600/60 uppercase">
                        {new Date((proc.step_data as any).reported_at as string).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <PurchasesPanel stepData={(proc?.step_data as any) || {}} />

          <button
            onClick={() => setIsLogsModalOpen(true)}
            className="w-full p-6 bg-card border border-border rounded-[32px] shadow-sm hover:border-primary/30 transition-all group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <RiHistoryLine className="text-xl" />
                </div>
                <div>
                  <h3 className="font-black text-text text-sm uppercase tracking-tight">Log History</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Clique para visualizar</p>
                </div>
              </div>
              <RiArrowRightLine className="text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRejectionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectionModal(false)} className="absolute inset-0 bg-bg/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-border rounded-[32px] p-8 shadow-2xl">
              <h3 className="font-display font-black text-text text-xl mb-4">{t.analysisPanel.actions.requestMoreInfo}</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t.analysisPanel.finalMessagePlaceholder}
                className="w-full h-40 rounded-2xl border border-border bg-bg-subtle p-4 text-sm font-medium text-text outline-none mb-6 resize-none"
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowRejectionModal(false)} className="flex-1 h-12 font-black text-[10px] text-text-muted uppercase hover:bg-bg-subtle/50 rounded-xl transition-all">{t.shared.cancel}</button>
                <button
                  type="button"
                  onClick={handleRejectStep}
                  disabled={!rejectionReason.trim() || isSubmitting}
                  className={`flex-[2] h-12 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                    !rejectionReason.trim()
                      ? "bg-danger/40 text-white/50 cursor-not-allowed"
                      : "bg-danger text-white hover:bg-danger/90 active:scale-[0.98] shadow-lg shadow-danger/20"
                  }`}
                >
                  {isSubmitting ? <RiLoader4Line className="animate-spin text-lg" /> : t.cases.actions.reject}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLogsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogsModalOpen(false)}
              className="absolute inset-0 bg-bg/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-card border border-border rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-bg-subtle/50">
                <div className="text-left">
                  <h3 className="font-display font-black text-text text-2xl uppercase tracking-tight flex items-center gap-3">
                    <RiHistoryLine className="text-primary" />
                    Interaction Logs
                  </h3>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
                    Event history for {proc.user_accounts?.full_name}
                  </p>
                </div>
                <button
                  onClick={() => setIsLogsModalOpen(false)}
                  className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-text-muted hover:text-danger transition-all hover:rotate-90"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <ProcessLogPanel
                  serviceId={proc.id}
                  clientName={proc.user_accounts?.full_name || proc.user_accounts?.email || "Cliente"}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
