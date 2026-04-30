import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "react-icons/ri";
import { getServiceBySlug } from "../../../data/services";
import { MOTION_STEPS_TEMPLATE, RFE_STEPS_TEMPLATE } from "../../../data/workflowTemplates";
import { normalizeLegacyFinalShipSteps, normalizeLegacyStepId } from "../../../utils/legacyWorkflow";
import { supabase } from "../../../lib/supabase";
import { processService, type UserService } from "../../../services/process.service";
import { notificationService } from "../../../services/notification.service";
import { packageService } from "../../../services/package.service";
import { toast } from "sonner";
import { useT } from "../../../i18n";
import type { StepConfig } from "../../../templates/ServiceDetailTemplate";

interface ProcessWithUser extends UserService {
  user_accounts: {
    full_name: string;
    email: string;
    phone?: string;
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

// ─── Process Log Panel ────────────────────────────────────────────────────────
// ─── Purchases History Panel ──────────────────────────────────────────────────
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
    // 1. Prioridade absoluta para a mensagem do banco de dados (nossa nova lógica clear)
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
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="mt-1 w-6 h-6 rounded-full bg-bg-subtle flex items-center justify-center shrink-0">
                <RiUser3Line className="text-text-muted text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${getActorColor(log)}`}>
                    {getActorLabel(log)}
                  </span>
                  <span className="text-[9px] text-text-muted font-bold">{formatDate(log.created_at)}</span>
                </div>
                <p className="text-[11px] text-text font-bold">{getActionDescription(log)}</p>
                <div className="text-[10px] text-text-muted font-medium space-y-0.5 mt-0.5">
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
    const d = proc.step_data || {};
    setLogin((d.mrv_login as string) || "");
    setPassword((d.mrv_password as string) || "");
    setBoletoPath((d.mrv_boleto_path as string) || "");
  }, [proc]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/mrv/boleto_${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
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
    if (!login || !password || !boletoPath) {
      toast.error(t.processDetail.mrv.messages.fillFields);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        mrv_login: login,
        mrv_password: password,
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
                  href={supabase.storage.from("profiles").getPublicUrl(boletoPath).data.publicUrl}
                  target="_blank" rel="noreferrer"
                  className="px-4 py-2 bg-card border border-border rounded-lg text-[10px] font-black text-text uppercase"
                >{t.shared.confirm.replace('Confirmar', 'Ver')}</a>
                {isActive && (
                  <button onClick={() => setBoletoPath("")} className="px-4 py-2 bg-danger/10 text-danger rounded-lg text-[10px] font-black uppercase">{t.shared.cancel.replace('Cancelar', 'Remover')}</button>
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

function FinalSchedulingPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [sameLocation, setSameLocation] = useState(true);
  const [casvDate, setCasvDate] = useState("");
  const [casvTime, setCasvTime] = useState("");
  const [casvLocation, setCasvLocation] = useState("");
  const [consuladoDate, setConsuladoDate] = useState("");
  const [consuladoTime, setConsuladoTime] = useState("");
  const [consuladoLocation, setConsuladoLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useT("admin");

  const currentStepIdx = proc.current_step ?? 0;
  const isPast = currentStepIdx > 10;
  const canEdit = isActive || isPast;

  useEffect(() => {
    const d = proc.step_data || {};
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

      // Only approve if not already past
      if (isActive) {
        await onApprove();
      }

      onRefresh();
      toast.success(isPast ? t.processDetail.scheduling.messages.updateSuccess : t.processDetail.scheduling.messages.notifiedSuccess);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const upsellPlan = proc.step_data?.upsell_plan as string;

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
  );
}


function MotionProposalPanel({ proc, onRefresh, isActive }: { proc: ProcessWithUser; onRefresh: () => void; isActive: boolean }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const t = useT("admin");
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const purchases = (data.purchases || []) as Array<{ slug?: string }>;
  const hasPaidProposal = purchases.some(p => p.slug === "proposta-rfe-motion" || p.slug === "apoio-rfe-motion-inicio" || p.slug === "analise-especialista-cos");

  const clientReason = data.motion_reason as string;
  const docs = (data.docs as Record<string, string>) || {};
  const denialLetterPath = docs.motion_denial_letter;
  const denialLetterUrl = denialLetterPath ? supabase.storage.from('profiles').getPublicUrl(denialLetterPath).data.publicUrl : null;

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
      await processService.updateStepData(proc.id, {
        motion_proposal_text: text,
        motion_amount: Number(amount),
        motion_proposal_amount: Number(amount),
        motion_proposal_sent_at: new Date().toISOString(),
        workflow_status: "awaiting_payment",
      });

      const currentStepIdx = proc.current_step ?? 0;
      const nextStep = currentStepIdx + 1;

      await processService.approveStep(proc.id, nextStep);

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
                <RiExternalLinkLine className="text-sm" /> {t.shared.confirm.replace('Confirmar', 'Ver')}
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
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const purchases = (data.purchases || []) as Array<{ slug?: string }>;
  const hasPaidProposal = purchases.some(p => p.slug === "proposta-rfe-motion" || p.slug === "apoio-rfe-motion-inicio" || p.slug === "analise-rfe-cos" || p.slug === "apoio-rfe-cos");

  const clientDescription = data.rfe_description as string;
  const docs = (data.docs as Record<string, string>) || {};
  const rfeLetterPath = docs.rfe_letter;
  const rfeLetterUrl = rfeLetterPath ? supabase.storage.from('profiles').getPublicUrl(rfeLetterPath).data.publicUrl : null;

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

      await processService.approveStep(proc.id, nextStep);

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
                <RiExternalLinkLine className="text-sm" /> {t.shared.confirm.replace('Confirmar', 'Ver')}
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
                          href={supabase.storage.from('profiles').getPublicUrl(hist.rfe_letter).data.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          {t.shared.confirm.replace('Confirmar', 'Ver')} <RiArrowRightLine />
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
        .from("profiles")
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
                href={supabase.storage.from('profiles').getPublicUrl(rfeFinalPath).data.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                {t.shared.confirm.replace('Confirmar', 'Ver')}
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
    const d = proc.step_data || {};
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
      const message = err instanceof Error ? err.message : "Erro";
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
  const t = useT("admin");
  const vt = useT("visas");
  const [proc, setProc] = useState<ProcessWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterHtml, setCoverLetterHtml] = useState("");

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_services")
        .select(`
          *,
          user_accounts:profiles (full_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProc(data as ProcessWithUser);
      if (data?.step_data?.generatedCoverLetterHTML) {
        const rawHtml = data.step_data.generatedCoverLetterHTML as string;
        setCoverLetterHtml(rawHtml.replace(/color:\s*#000;?/gi, '').replace(/color:\s*black;?/gi, ''));
      }
    } catch (err: unknown) {
      console.error("Error loading process:", err);
      toast.error(t.cases.messages.loadError);
      navigate("/admin/processes");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    fetchProcessData();
  }, [fetchProcessData]);

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
        <button onClick={() => navigate("/admin/processes")} className="mt-4 text-primary font-bold">{t.shared.back}</button>
      </div>
    );
  }

  const service = getServiceBySlug(proc.service_slug);
  const currentStepIdx = proc.current_step ?? 0;
  const history = (proc.step_data?.history as Array<{ type?: string; steps?: unknown[] }>) || [];
  const effectiveSteps = service ? buildEffectiveSteps(service.steps, history) : [];
  const currentStep = effectiveSteps[currentStepIdx];
  const currentStepBaseId = normalizeLegacyStepId(currentStep?.id);
  const workflowStatus = String(proc.step_data?.workflow_status ?? "").toLowerCase();

  const handleApproveStep = async (extraData?: Record<string, unknown>) => {
    if (!service || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let nextStep = currentStepIdx + 1;

      // --- SKIP LOGIC: Se o visto de destino NÃO for F1, pula I-20 e SEVIS ---
      const isCOS = proc.service_slug.includes("troca-status") || proc.service_slug.includes("extensao-status");
      if (isCOS) {
        const targetVisa = proc.step_data?.targetVisa as string;
        if (targetVisa !== "F1") {
          const stepsToSkipIds = ["cos_i20_upload", "cos_sevis_fee", "cos_analysis_i20_sevis", "eos_i20_upload", "eos_sevis_fee", "eos_analysis_i20_sevis"];
          while (nextStep < service.steps.length && stepsToSkipIds.includes(service.steps[nextStep].id)) {
            nextStep++;
          }
        }
      }

      const isConsular = proc.service_slug.startsWith("visto-b1-b2") || proc.service_slug.startsWith("visto-f1");

      const additionalData = { ...extraData };
      if (currentStepBaseId === 'cos_analysis_presentation_letter') {
        additionalData.generatedCoverLetterHTML = coverLetterHtml;
      }
      const isFinal = nextStep >= effectiveSteps.length && !isConsular;

      await processService.approveStep(proc.id, nextStep, isFinal, isFinal ? 'approved' : undefined, additionalData);

      // se a próxima etapa para o B1/B2 ou F1 for credenciais ou criação de conta,
      // certifique-se de que o card aparecerá na fila do administrador na página de listagem
      const nextStepId = effectiveSteps[nextStep]?.id;
      const nextStepBaseId = normalizeLegacyStepId(nextStepId);
      const isAdminTask =
        !!nextStepBaseId &&
        (nextStepBaseId.includes("_admin_credentials") ||
         nextStepBaseId.includes("_admin_account_creation") ||
         nextStepBaseId.includes("_admin_analysis"));

      if (isAdminTask) {
        await processService.updateProcessStatus(proc.id, "awaiting_review");
      }

      if (proc.user_id) {
        const serviceName = service.title ?? proc.service_slug;
        if (isFinal) {
          notificationService.notifyClient({
            userId: proc.user_id,
            serviceId: proc.id,
            template: "process_completed_approved",
            templateData: { service_name: serviceName },
            link: `/dashboard/processes/${proc.service_slug}`,
          });
        } else {
          notificationService.notifyClient({
            userId: proc.user_id,
            serviceId: proc.id,
            template: "step_approved",
            templateData: {
              step_name: currentStep?.title ?? "",
              next_step_name: service.steps[nextStep]?.title ?? "",
            },
            link: `/dashboard/processes/${proc.service_slug}`,
          });
        }
      }

      toast.success(isFinal ? t.cases.messages.approveFinalSuccess : t.cases.messages.approveSuccess.replace("{name}", proc.user_accounts?.full_name || "Cliente"));
      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
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
      const isB1B2 = proc.service_slug.startsWith("visto-b1-b2");
      const isF1 = proc.service_slug.startsWith("visto-f1");
      const isFinal = currentStepIdx >= effectiveSteps.length - 1;

      if (isFinal) {
        await processService.rejectStep(proc.id, true, 'denied');
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
          template: "step_rejected_feedback",
          templateData: { step_name: currentStep?.title ?? "", feedback: rejectionReason },
          link: `/dashboard/processes/${proc.service_slug}`,
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
          template: "step_rejected_feedback",
          templateData: { step_name: currentStep?.title ?? "", feedback: rejectionReason },
          link: `/dashboard/processes/${proc.service_slug}`,
        });
        toast.success("Correção de I-20/DS160 solicitada.");
      } else {
        await processService.updateStepData(proc.id, {
          admin_feedback: rejectionReason,
          rejected_items: selectedItems,
          rejected_at: new Date().toISOString()
        });

        await processService.rejectStep(proc.id);
        toast.success(t.cases.messages.rejectSuccess);
      }

      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
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
        coverLetter: proc.step_data?.coverLetter,
        user: proc.user_accounts
      };
      const res = await fetch(import.meta.env.VITE_N8N_BOT_COVERLATTER as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Falha na chamada do n8n");
      const result = await res.json();
      const html = result.html || result.content || result.response || result.data || JSON.stringify(result);
      setCoverLetterHtml(html);
      toast.success(t.processDetail.messages?.aiCoverLetterSuccess || "Cover Letter gerada com sucesso pela IA!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error("Erro ao gerar: " + msg);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const renderFormData = () => {
    const data = proc.step_data || {};
    const entries = Object.entries(data).filter(([key]) =>
      !['docs', 'admin_feedback', 'rejected_at', 'review', 'i539', 'i539PdfUrl', 'coverLetter', 'generatedCoverLetterHTML', 'finalForms', 'g1145PdfUrl', 'g1450PdfUrl', 'finalFormsGeneratedAt', 'finalPackagePdfUrl', 'rfe_history'].includes(key)
    );

    if (entries.length === 0) return null;

    const isActive = currentStepBaseId === "cos_analysis_form_docs" || currentStepBaseId === "b1b2_admin_analysis";
    const isPast = currentStepBaseId === "b1b2_admin_analysis" ? currentStepIdx > 1 : currentStepIdx > 2;

    return (
      <CollapsibleStep
        title={proc.service_slug === "visto-b1-b2" ? "Revisão da DS-160" : "Dados do Formulário (Revisão)"}
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
                      title="Marcar para correção"
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
      </CollapsibleStep>
    );
  };

  const renderOfficialForms = () => {
    const pdfUrl = proc.step_data?.i539PdfUrl as string | undefined;
    if (!pdfUrl) return null;

    const isSelected = selectedItems.includes('i539PdfUrl');
    const isActive = currentStepBaseId === "cos_analysis_official_forms";
    const isPast = currentStepIdx > 4;

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
                  <RiErrorWarningLine className="text-sm" /> {t.processDetail.officialForms.reject}
                </button>
              )}
            </div>
          </div>
        </div>
      </CollapsibleStep>
    );
  };

  const renderCoverLetterAdmin = () => {
    if (!proc.step_data?.coverLetter) return null;
    const isActive = currentStepBaseId === "cos_analysis_presentation_letter";
    const isPast = currentStepIdx > 6;

    return (
      <CollapsibleStep title={t.processDetail.coverLetter.title || "Análise: Cover Letter"} icon={RiFileTextLine} isActive={isActive} isPast={isPast}>
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
            className={`w-full min-h-[500px] bg-card border border-border rounded-2xl p-8 overflow-y-auto shadow-sm prose prose-sm dark:prose-invert max-w-none text-text dark:text-white ${isActive ? 'outline-none focus:ring-4 focus:ring-primary/20' : 'opacity-80'}`}
            dangerouslySetInnerHTML={{ __html: coverLetterHtml.replace(/color:\s*#000;?/gi, '').replace(/color:\s*black;?/gi, '') }}
          />
        </div>
      </CollapsibleStep>
    );
  };

  const renderFinalFormsAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const g1145PdfUrl = proc.step_data?.g1145PdfUrl as string;
    const g1450PdfUrl = proc.step_data?.g1450PdfUrl as string;
    if (!g1145PdfUrl && !g1450PdfUrl) return null;
    const isActive = currentStepBaseId === `${prefix}analysis_final_forms`;
    const isPast = currentStepIdx > 11;

    return (
      <CollapsibleStep title={`${t.processDetail.finalForms?.g1145} / ${t.processDetail.finalForms?.g1450}`} icon={RiBankCardLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-6">
          {g1145PdfUrl && (
            <div className="flex items-center justify-between p-6 bg-bg-subtle border border-border rounded-2xl">
              <div className="flex items-center gap-4">
                <RiFileTextLine className="text-2xl text-info" />
                <h4 className="text-sm font-black text-text">G-1145</h4>
              </div>
              <a href={g1145PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-info text-white font-black text-[10px] uppercase rounded-xl">{t.processDetail.officialForms.viewPdf}</a>
            </div>
          )}
          {g1450PdfUrl && (
            <div className="flex items-center justify-between p-6 bg-bg-subtle border border-border rounded-2xl">
              <div className="flex items-center gap-4">
                <RiBankCardLine className="text-2xl text-primary" />
                <h4 className="text-sm font-black text-text">G-1450</h4>
              </div>
              <a href={g1450PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-primary text-white font-black text-[10px] uppercase rounded-xl">{t.processDetail.officialForms.viewPdf}</a>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderCOSDocumentsAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const isActive = currentStepBaseId === `${prefix}analysis_form_docs`;
    const isPast = currentStepIdx > 2;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    if (Object.keys(docs).length === 0) return null;

    return (
      <CollapsibleStep title={t.analysisPanel.clientDocuments} icon={RiFileUploadLine} isActive={isActive} isPast={isPast}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(docs).map(([key, path]) => {
            if (key === 'i20_document' || key === 'sevis_receipt') return null; // Handled in a separate step
            const url = supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
            const isSelected = selectedItems.includes(`docs.${key}`);

            return (
              <div key={key} className={`p-4 rounded-2xl border transition-all ${isSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-text uppercase tracking-tight truncate pr-2">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  {isActive && (
                    <button onClick={() => toggleItem(`docs.${key}`)} className={`p-1.5 rounded-lg transition-all ${isSelected ? 'bg-danger text-white' : 'text-text-muted hover:bg-bg-subtle'}`}>
                      <RiErrorWarningLine className="text-sm" />
                    </button>
                  )}
                </div>
                <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                  {t.processDetail.officialForms.viewPdf}
                </a>
              </div>
            );
          })}
        </div>
      </CollapsibleStep>
    );
  };

  const renderCOSAnalysisI20SevisAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const isActive = currentStepBaseId === `${prefix}analysis_i20_sevis`;
    const isPast = currentStepIdx > 9;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const i20Url = docs.i20_document ? supabase.storage.from("profiles").getPublicUrl(docs.i20_document).data.publicUrl : null;
    const sevisUrl = docs.sevis_receipt ? supabase.storage.from("profiles").getPublicUrl(docs.sevis_receipt).data.publicUrl : null;

    if (!isActive && !isPast && !i20Url && !sevisUrl) return null;

    return (
      <CollapsibleStep title={t.processDetail.i20Sevis.title} icon={RiShieldCheckLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {i20Url && (
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${selectedItems.includes('docs.i20_document') ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-sm mb-1 uppercase">Formulário I-20</h4>
                <div className="flex gap-2 w-full mt-4">
                  <a href={i20Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.i20_document')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${selectedItems.includes('docs.i20_document') ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      {t.processDetail.i20Sevis.rejectBtn}
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
                      {t.processDetail.i20Sevis.rejectBtn}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10">
                <RiCloseLine className="text-xl" /> {t.processDetail.i20Sevis.requestCorrection}
              </button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-success text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-success/20">
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.i20Sevis.approveBtn}</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1DocumentsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStepBaseId === "f1_admin_analysis";
    const isPast = currentStepIdx > 2;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const i20Url = docs.i20_document ? supabase.storage.from("profiles").getPublicUrl(docs.i20_document).data.publicUrl : null;

    if (!isActive && !isPast && !i20Url) return null;

    const isI20Selected = selectedItems.includes('docs.i20_document');

    return (
      <CollapsibleStep title={t.processDetail.f1Documents.title} icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="flex flex-col gap-6">
          <div className="max-w-md">
            {i20Url && (
              <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isI20Selected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <RiFileTextLine className="text-3xl" />
                </div>
                <h4 className="font-black text-text text-sm mb-1 uppercase">Formulário I-20</h4>
                <div className="flex gap-2 w-full mt-4">
                  <a href={i20Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-bg-subtle transition-all shadow-sm">
                    {t.processDetail.officialForms.viewPdf}
                  </a>
                  {isActive && (
                    <button onClick={() => toggleItem('docs.i20_document')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${isI20Selected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}>
                      {t.processDetail.i20Sevis.rejectBtn}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10">
                <RiCloseLine className="text-xl" /> {t.processDetail.i20Sevis.requestCorrection}
              </button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20">
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.f1Documents.approveBtn}</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1FinalDocsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStepBaseId === "f1_admin_final_analysis";
    const isPast = currentStepIdx > 5;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep title={t.processDetail.f1FinalDocs.title} icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {ds160Url && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDsSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-info/10 text-info rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.ds160Signed}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={ds160Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}</a>
                  {isActive && <button onClick={() => toggleItem('docs.ds160_assinada')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isDsSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}><RiErrorWarningLine className="text-sm" /> {t.processDetail.i20Sevis.rejectBtn}</button>}
                </div>
              </div>
            )}
            {comprovanteUrl && (
              <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isComprovanteSelected ? 'bg-danger/10 border-danger/30' : 'bg-bg-subtle border-border'}`}>
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                <h4 className="font-black text-text text-lg mb-1">{t.processDetail.f1FinalDocs.finalProof}</h4>
                <div className="flex gap-3 w-full mt-4">
                  <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-card border border-border text-text text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-bg-subtle transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> {t.processDetail.officialForms.viewPdf}</a>
                  {isActive && <button onClick={() => toggleItem('docs.ds160_comprovante')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isComprovanteSelected ? 'bg-danger text-white' : 'bg-danger/10 text-danger'}`}><RiErrorWarningLine className="text-sm" /> {t.processDetail.i20Sevis.rejectBtn}</button>}
                </div>
              </div>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"><RiCloseLine className="text-xl" /> {t.processDetail.i20Sevis.requestCorrection}</button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20">{isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.f1FinalDocs.approveBtn}</>}</button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CredentialsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStepBaseId === "b1b2_admin_credentials" || currentStepBaseId === "f1_admin_credentials";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 3 : 2);

    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title={t.processDetail.credentials.title} icon={RiShieldCheckLine} isActive={isActive} isPast={isPast} badge={t.overview.stats.administrativeAction}>
        <B1B2CredentialsPanel proc={proc} onApprove={() => handleApproveStep()} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };

  const renderB1B2FinalDocsAdmin = () => {
    if (proc.service_slug !== "visto-b1-b2") return null;
    const isActive = currentStepBaseId === "b1b2_admin_final_analysis";
    const isPast = currentStepIdx > 4;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep title={t.processDetail.b1b2FinalDocs.title} icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
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
                      <RiErrorWarningLine className="text-sm" /> {t.processDetail.i20Sevis.rejectBtn}
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
                      <RiErrorWarningLine className="text-sm" /> {t.processDetail.i20Sevis.rejectBtn}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button
                onClick={() => setShowRejectionModal(true)}
                className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"
              >
                <RiCloseLine className="text-xl" /> {t.processDetail.i20Sevis.requestCorrection}
              </button>
              <button
                onClick={() => handleApproveStep()}
                disabled={isSubmitting}
                className="flex-1 bg-success hover:bg-success/90 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-success/20"
              >
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.b1b2FinalDocs.approveBtn}</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CASVAdmin = () => {
    if (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStepBaseId === "b1b2_casv_scheduling" || currentStepBaseId === "f1_casv_scheduling";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 6 : 5);
    if (!isActive && !isPast) return null;

    const casvDate = proc.step_data?.casv_preferred_date as string;
    const consulado = proc.step_data?.interviewLocation as string;

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

          {isActive && proc.status === "awaiting_review" && casvDate && (
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <button
                onClick={() => setShowRejectionModal(true)}
                className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-danger/30 hover:text-danger hover:bg-danger/10"
              >
                <RiCloseLine className="text-xl" /> {t.processDetail.casv.requestAdjustment}
              </button>
              <button
                onClick={() => handleApproveStep()}
                disabled={isSubmitting}
                className="flex-1 bg-success hover:bg-success/90 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-success/20"
              >
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.casv.confirmBtn}</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2AccountCreationAdmin = () => {
    if (!proc || (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1"))) return null;
    const isActive = currentStepBaseId === "b1b2_admin_account_creation" || currentStepBaseId === "f1_admin_account_creation";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 7 : 6);
    if (!isActive && !isPast) return null;

    const email = (proc.step_data?.primaryEmail || proc.user_accounts?.email || "Não informado") as string;
    const name = (proc.step_data?.fullName || proc.user_accounts?.full_name || "Não informado") as string;
    const phone = (proc.step_data?.phone || "Não informado") as string;

    return (
      <CollapsibleStep title={t.processDetail.accountCreation.title} icon={RiUser3Line} isActive={isActive} isPast={isPast} badge={isActive ? t.cases.statusLabel.awaitingReview : undefined}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nome Completo</p>
              <p className="text-sm font-bold text-text">{name || "Não informado"}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">E-mail</p>
              <p className="text-sm font-bold text-text">{email || "Não informado"}</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-subtle border border-border text-left">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Telefone</p>
              <p className="text-sm font-bold text-text">{phone || "Não informado"}</p>
            </div>
          </div>

          {isActive && (
            <div className="pt-4 border-t border-border text-left">
              <p className="text-xs text-text-muted font-medium mb-4 italic">
                {t.processDetail.accountCreation.instruction}
              </p>
              <button
                onClick={() => handleApproveStep()}
                disabled={isSubmitting}
                className="w-full bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.processDetail.accountCreation.confirmBtn}</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2MRVSetupAdmin = () => {
    if (!proc || (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1"))) return null;
    const isActive = currentStepBaseId === "b1b2_admin_mrv_setup" || currentStepBaseId === "f1_admin_mrv_setup";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 9 : 8);
    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title="Taxa MRV e Acesso ao Consulado" icon={RiMoneyDollarCircleLine} isActive={isActive} isPast={isPast} badge="Ação Administrativa">
        <MRVSetupPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };
  const renderB1B2FinalSchedulingAdmin = () => {
    if (!proc || (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1"))) return null;
    const isActive = currentStepBaseId === "b1b2_final_scheduling" || currentStepBaseId === "f1_final_scheduling";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 11 : 10);
    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title="Agendamento Final (CASV/Consulado)" icon={RiCalendarEventLine} isActive={isActive} isPast={isPast} badge="Ação Administrativa">
        <FinalSchedulingPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };

  const renderFinalPackageAdmin = () => {
    if (proc.service_slug !== "troca-status" && proc.service_slug !== "extensao-status") return null;
    const prefix = proc.service_slug === "extensao-status" ? "eos_" : "cos_";
    const finalPackageUrl = proc.step_data?.finalPackagePdfUrl as string;
    const isActive = currentStepBaseId === `${prefix}final_package`;
    const isPast = currentStepIdx > 12;

    return (
      <CollapsibleStep title={`${proc.service_slug === 'extensao-status' ? 'EOS' : 'COS'} Final Package`} icon={RiCheckDoubleLine} isActive={isActive} isPast={isPast}>
        {!finalPackageUrl ? (
          <div className="text-center py-10 bg-bg-subtle border-2 border-dashed border-border rounded-[28px]">
            <RiFileTextLine className="text-4xl text-text-muted/30 mx-auto mb-4" />
            <button
              onClick={async () => {
                try {
                  toast.loading("Gerando pacote final...", { id: "merge" });
                  await packageService.mergeAndUploadPackage(proc.id, proc.user_id!);
                  toast.success("Pacote gerado!", { id: "merge" });
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
                <button onClick={() => handleApproveStep()} className="px-8 py-2.5 bg-success text-white font-black text-[10px] uppercase rounded-xl transition-all">{t.processDetail.finalPackage.approveBtn}</button>
              </div>
            </div>
          </div>
        )}
      </CollapsibleStep>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24 bg-bg min-h-screen">
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/admin/processes")} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm">
            <RiArrowLeftLine className="text-xl" />
          </button>
          <div>
            <h1 className="font-display font-black text-3xl text-text tracking-tight">{proc.user_accounts?.full_name}</h1>
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{service?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border shadow-sm text-text-muted text-[10px] font-black uppercase tracking-widest">
          <RiCalendarLine className="text-text-muted" />
          <span className="flex items-center gap-1.5">{new Date(proc.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {renderFormData()}
          {renderCOSDocumentsAdmin()}
          {renderOfficialForms()}
          {renderCOSAnalysisI20SevisAdmin()}
          {renderCoverLetterAdmin()}
          {renderFinalFormsAdmin()}
          {renderFinalPackageAdmin()}
          {renderB1B2CredentialsAdmin()}
          {renderB1B2FinalDocsAdmin()}
          {renderF1DocumentsAdmin()}
          {renderF1FinalDocsAdmin()}
          {renderB1B2CASVAdmin()}
          {renderB1B2AccountCreationAdmin()}
          {renderB1B2MRVSetupAdmin()}
          {renderB1B2FinalSchedulingAdmin()}

          {currentStepBaseId === "cos_rfe_proposal" && (
            <CollapsibleStep title="Proposta de RFE" icon={RiShieldCheckLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <RFEProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {(currentStepBaseId === "cos_motion_proposal" || workflowStatus === "awaiting_proposal") && (
            <CollapsibleStep title="Proposta de Motion" icon={RiShieldCheckLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <MotionProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {currentStepBaseId === "cos_rfe_end" && (
            <CollapsibleStep title="Resultado RFE" icon={RiFileUploadLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <RFEFinalShipPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {currentStep?.type === "admin_action" && !["cos_rfe_proposal", "cos_motion_proposal", "cos_rfe_end", "b1b2_admin_credentials", "b1b2_admin_final_analysis", "b1b2_casv_scheduling", "b1b2_admin_account_creation", "b1b2_admin_mrv_setup", "b1b2_final_scheduling"].includes(currentStepBaseId || "") && (
            <div className="flex items-center gap-4 pt-4">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-border text-text-muted font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                <RiCloseLine className="text-xl" /> {t.analysisPanel.actions.requestMoreInfo}
              </button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-success hover:bg-success/90 text-white h-14 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.cases.actions.approve}</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-card rounded-[32px] border border-border shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-text text-lg uppercase">{t.cases.table.flowActions}</h3>
              <div className="px-3 py-1 bg-primary/5 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest">
                Etapa {currentStepIdx + 1} de {effectiveSteps.length}
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
            </div>
          </div>

          <PurchasesPanel stepData={proc?.step_data} />

          <ProcessLogPanel
            serviceId={proc.id}
            clientName={proc.user_accounts?.full_name || proc.user_accounts?.email || "Cliente"}
          />
        </div>
      </div>

      <AnimatePresence>
        {showRejectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
                <button onClick={() => setShowRejectionModal(false)} className="flex-1 h-12 font-black text-[10px] text-text-muted uppercase">{t.shared.cancel}</button>
                <button onClick={handleRejectStep} disabled={!rejectionReason || isSubmitting} className="flex-[2] h-12 bg-danger text-white rounded-xl font-black text-[10px] uppercase">
                  {t.cases.actions.reject}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
