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
  RiMailCheckLine,
  RiBarcodeLine,
  RiCalendarEventLine
} from "react-icons/ri";
import { getServiceBySlug } from "../../../data/services";
import { supabase } from "../../../lib/supabase";
import { processService, type UserService } from "../../../services/process.service";
import { packageService } from "../../../services/package.service";
import { toast } from "sonner";

interface ProcessWithUser extends UserService {
  user_accounts: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface RFEHistoryItem {
  proposal_text: string;
  proposal_amount: number;
  result: "approved" | "rfe" | "denied";
  rfe_letter?: string;
  sent_at: string;
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

  return (
    <div className={`bg-white rounded-[32px] border transition-all mb-8 overflow-hidden ${isActive ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-slate-100 shadow-sm opacity-80'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : isPast ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {isPast ? <RiCheckLine className="text-xl" /> : <Icon className="text-xl" />}
                </div>
                <div className="text-left">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{title}</h3>
                    {isPast && <p className="text-[10px] text-emerald-500 font-black uppercase mt-0.5 tracking-tighter">Etapa Concluída</p>}
                    {isActive && <p className="text-[10px] text-primary font-black uppercase mt-0.5 tracking-tighter">Aguardando sua ação</p>}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {badge && <span className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest">{badge}</span>}
                <RiArrowDownSLine className={`text-xl text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        </button>
        
        <AnimatePresence>
            {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-50"
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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [boletoPath, setBoletoPath] = useState("");

  useEffect(() => {
    const d = proc.step_data || {};
    setLogin((d.mrv_login as string) || "");
    setPassword((d.mrv_password as string) || "");
    setBoletoPath((d.mrv_boleto_path as string) || "");
  }, [proc]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `mrv_${proc.id}_${Date.now()}.pdf`;
      const filePath = `mrv_fees/${fileName}`;
      const { error } = await supabase.storage.from("profiles").upload(filePath, file);
      if (error) throw error;
      setBoletoPath(filePath);
      toast.success("Boleto enviado com sucesso!");
    } catch (err: unknown) {
      toast.error("Erro no upload: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!login || !password || !boletoPath) {
      toast.error("Preencha o login, senha e envie o boleto.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(proc.id, {
        mrv_login: login,
        mrv_password: password,
        mrv_boleto_path: boletoPath
      });
      await onApprove();
      onRefresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Login Consulado (E-mail)</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            disabled={!isActive}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder="E-mail da conta consular"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Senha Consulado</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!isActive}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder="Senha da conta consular"
          />
        </div>
      </div>

      <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Boleto da Taxa MRV</p>
        <div className="flex flex-col items-center justify-center py-6">
          {boletoPath ? (
             <div className="flex items-center gap-4 w-full text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <RiBarcodeLine className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black text-slate-800 uppercase">Boleto Enviado</p>
                   <p className="text-[10px] text-slate-400 truncate">{boletoPath.split('/').pop()}</p>
                </div>
                <div className="flex gap-2">
                   <a 
                     href={supabase.storage.from("profiles").getPublicUrl(boletoPath).data.publicUrl}
                     target="_blank" rel="noreferrer"
                     className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase"
                   >Ver</a>
                   {isActive && (
                     <button onClick={() => setBoletoPath("")} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase">Remover</button>
                   )}
                </div>
             </div>
          ) : (
            <>
              <RiBarcodeLine className="text-4xl text-slate-300 mb-4" />
              <label className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                 <RiFileUploadLine />
                 {uploading ? <RiLoader4Line className="animate-spin text-lg" /> : "Selecionar Boleto PDF"}
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
          {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Finalizar Geração de Taxa</>}
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
      toast.error("Preencha os dados do CASV.");
      return;
    }
    if (!sameLocation && (!consuladoDate || !consuladoTime || !consuladoLocation)) {
      toast.error("Preencha os dados do Consulado.");
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
      toast.success(isPast ? "Agendamento atualizado!" : "Cliente notificado do agendamento!");
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
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Plano Upsell Adquirido</h4>
                    <p className="text-xs text-amber-600 font-bold uppercase">{upsellPlan}</p>
                </div>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-amber-100 text-[10px] font-black text-amber-600 uppercase">
                Intervir Conforme Plano
            </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
          <button 
            disabled={!canEdit}
            onClick={() => setSameLocation(true)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sameLocation ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Mesmo Local
          </button>
          <button 
            disabled={!canEdit}
            onClick={() => setSameLocation(false)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!sameLocation ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Locais Diferentes
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <RiCalendarEventLine className="text-lg text-primary" /> Dados CASV
              </h4>
              <div className="space-y-4">
                  <input 
                    type="date" 
                    value={casvDate} 
                    onChange={e => setCasvDate(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
                  />
                  <input 
                    type="time" 
                    value={casvTime} 
                    onChange={e => setCasvTime(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Local do CASV" 
                    value={casvLocation} 
                    onChange={e => setCasvLocation(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
                  />
              </div>
          </div>

          {!sameLocation && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <RiCalendarEventLine className="text-lg text-primary" /> Dados Consulado
                  </h4>
                  <div className="space-y-4">
                      <input 
                        type="date" 
                        value={consuladoDate} 
                        onChange={e => setConsuladoDate(e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
                      />
                      <input 
                        type="time" 
                        value={consuladoTime} 
                        onChange={e => setConsuladoTime(e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Local do Consulado" 
                        value={consuladoLocation} 
                        onChange={e => setConsuladoLocation(e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-800 outline-none"
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
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {isPast ? "Atualizar Agendamento" : "Informar ao Cliente"}</>}
          </button>
      )}
    </div>
  );
}


function MotionProposalPanel({ proc, onRefresh, isActive }: { proc: ProcessWithUser; onRefresh: () => void; isActive: boolean }) {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const clientReason = data.motion_reason as string;
  const docs = (data.docs as Record<string, string>) || {};
  const denialLetterPath = docs.motion_denial_letter;
  const denialLetterUrl = denialLetterPath ? supabase.storage.from('profiles').getPublicUrl(denialLetterPath).data.publicUrl : null;

  useEffect(() => {
    if (data.motion_proposal_text) setText(data.motion_proposal_text as string);
    if (data.motion_proposal_amount) setAmount(Number(data.motion_proposal_amount));
  }, [data.motion_proposal_text, data.motion_proposal_amount, setText, setAmount]);

  const handleSendProposal = async () => {
    if (!text || amount <= 0) {
      toast.error("Preencha a proposta e o valor.");
      return;
    }
    setLoading(true);
    try {
      await processService.updateStepData(proc.id, {
        motion_proposal_text: text,
        motion_proposal_amount: Number(amount),
        motion_proposal_sent_at: new Date().toISOString()
      });
      
      const currentStepIdx = proc.current_step ?? 0;
      const nextStep = currentStepIdx + 1;
      
      await processService.approveStep(proc.id, nextStep);
      
      toast.success("Proposta de Motion enviada!");
      onRefresh();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Erro ao enviar proposta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 mb-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RiShieldCheckLine className="text-lg" />
            Formular Proposta de Motion
         </h3>
         <div className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest">
            Ação Administrativa
         </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100/50">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
               <RiInformationLine className="text-lg" />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instruções do Cliente</h4>
         </div>
         
         <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo Informado:</p>
               <p className="text-sm font-bold text-slate-700 italic">
                  {clientReason || "Nenhuma descrição fornecida."}
               </p>
            </div>
            
            {denialLetterUrl && (
               <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <RiFileTextLine className="text-xl text-primary" />
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Carta de Negativa / Docs</span>
                  </div>
                  <a 
                     href={denialLetterUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                     <RiExternalLinkLine className="text-sm" /> Ver Documento
                  </a>
               </div>
            )}
         </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Estratégia / Proposta</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descreva a estratégia técnica para o Motion..."
            className="w-full h-32 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Valor do Serviço ($)</label>
          <div className="relative">
            <RiMoneyDollarCircleLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
        {isActive && (
          <button 
            onClick={handleSendProposal}
            disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Enviar Proposta ao Cliente</>}
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
  const data = (proc.step_data || {}) as Record<string, unknown>;
  
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
      toast.error("Preencha o texto e o valor da proposta.");
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
      
      toast.success("Proposta de RFE enviada!");
      onRefresh();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Erro ao enviar proposta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 mb-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RiShieldCheckLine className="text-lg" />
            Formular Proposta de Resposta RFE
         </h3>
         <div className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-100 text-[9px] font-black text-amber-600 uppercase tracking-widest">
            Ação Administrativa
         </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100/50">
         <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
               <RiInformationLine className="text-lg" />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informações da RFE</h4>
         </div>
         
         <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Descrição do Cliente:</p>
                <p className="text-sm font-bold text-slate-700 italic">
                  {clientDescription || "Nenhuma descrição fornecida."}
                </p>
            </div>
            
            {rfeLetterUrl && (
               <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                     <RiFileTextLine className="text-xl text-primary" />
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Carta de RFE Oficial</span>
                  </div>
                  <a 
                     href={rfeLetterUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                     <RiExternalLinkLine className="text-sm" /> Ver RFE
                  </a>
               </div>
            )}
         </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Estratégia de Resposta</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descreva como a RFE será respondida..."
            className="w-full h-32 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Valor da Assessoria RFE ($)</label>
          <div className="relative">
            <RiMoneyDollarCircleLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
        {isActive && (
          <button 
            onClick={handleSendProposal}
            disabled={loading}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Enviar Proposta de RFE</>}
          </button>
        )}

        {/* RFE History Section */}
        {(() => {
          const history = (data.rfe_history as RFEHistoryItem[]) || [];
          if (history.length === 0) return null;
          
          return (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4 px-1">
                <RiHistoryLine className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Histórico de RFEs ({history.length})</h3>
              </div>
              
              <div className="space-y-3">
                {[...history].reverse().map((hist, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Ciclo #{history.length - idx}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        hist.result === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        hist.result === 'rfe' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {hist.result === 'approved' ? 'Aprovado' : hist.result === 'rfe' ? 'Nova RFE' : 'Reprovado'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 italic mb-3 leading-relaxed line-clamp-2">"{hist.proposal_text}"</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Valor:</span>
                        <span className="text-[10px] font-black text-slate-700">${Number(hist.proposal_amount).toFixed(2)}</span>
                      </div>
                      
                      {hist.rfe_letter && (
                        <a 
                          href={supabase.storage.from('profiles').getPublicUrl(hist.rfe_letter).data.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          Ver Documento <RiArrowRightLine />
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

function MotionFinalShipPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const docs = (data.docs as Record<string, string>) || {};
  const motionLetterPath = docs.motion_final_package;

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      toast.loading("Enviando pacote final...", { id: "ship" });
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/motion/motion_final_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      const currentDocs = (data.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, { 
        docs: { ...currentDocs, motion_final_package: filePath }
      });
      
      toast.success("Arquivo enviado!", { id: "ship" });
      onRefresh();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Erro no upload: " + err.message, { id: "ship" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 mb-8">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <RiFileUploadLine className="text-lg" />
        Envio do Pacote Final (Motion)
      </h3>
      
      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          {motionLetterPath ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <RiCheckDoubleLine className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase">Documento de Motion Pronto</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{motionLetterPath}</p>
                </div>
              </div>
              <a 
                href={supabase.storage.from('profiles').getPublicUrl(motionLetterPath).data.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Visualizar
              </a>
            </div>
          ) : (
            <div className="py-4">
               <RiFileTextLine className="text-4xl text-slate-200 mx-auto mb-3" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Nenhum pacote enviado ainda</p>
               <label className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm inline-flex items-center gap-2">
                  <RiFileUploadLine className="text-lg" />
                  Selecionar PDF Final
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
            disabled={loading || !motionLetterPath}
            className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Fornecer Pacote ao Cliente</>}
          </button>
        )}
      </div>
    </div>
  );
}

function RFEFinalShipPanel({ proc, onApprove, onRefresh, isActive }: { proc: ProcessWithUser; onApprove: () => void; onRefresh: () => void; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const docs = (data.docs as Record<string, string>) || {};
  const rfeFinalPath = docs.rfe_final_package;

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      toast.loading("Enviando resposta RFE...", { id: "ship" });
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
      
      toast.success("Arquivo enviado!", { id: "ship" });
      onRefresh();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Erro no upload: " + err.message, { id: "ship" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 mb-8">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <RiFileUploadLine className="text-lg" />
        Envio da Resposta Final (RFE)
      </h3>
      
      <div className="space-y-6">
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          {rfeFinalPath ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <RiCheckDoubleLine className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase">Resposta RFE Pronta</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{rfeFinalPath}</p>
                </div>
              </div>
              <a 
                href={supabase.storage.from('profiles').getPublicUrl(rfeFinalPath).data.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Visualizar
              </a>
            </div>
          ) : (
            <div className="py-4">
               <RiFileTextLine className="text-4xl text-slate-200 mx-auto mb-3" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Nenhum pacote enviado ainda</p>
               <label className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm inline-flex items-center gap-2">
                  <RiFileUploadLine className="text-lg" />
                  Selecionar PDF RFE
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
            className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Fornecer ao Cliente</>}
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

  useEffect(() => {
    const d = proc.step_data || {};
    setAppId((d.ds160_application_id as string) || "");
    setMotherName((d.ds160_security_answer as string) || (d.motherName as string) || "");
    setBirthDate((d.ds160_birth_date as string) || (d.birthDate as string) || "");
  }, [proc]);

  const handleSaveAndApprove = async () => {
    if (!appId || !motherName || !birthDate) {
      toast.error("Preencha todos os campos.");
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
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 mb-8">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <RiShieldCheckLine className="text-lg" />
        Credenciais da DS-160 (CEAC)
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Application ID</label>
          <input type="text" value={appId} onChange={e => setAppId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase" placeholder="Ex: AA00XXXXXX" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Resposta de Segurança (Primeiros 5 caracteres do Sobrenome da Mãe)</label>
          <input type="text" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase" placeholder="Ex: SILVA" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Ano de Nascimento (YYYY)</label>
          <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black outline-none focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Ex: 1990" />
        </div>
        {isActive && (
          <button onClick={handleSaveAndApprove} disabled={loading} className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
            {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Enviar ao Cliente</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminProcessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [proc, setProc] = useState<ProcessWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [coverLetterHtml, setCoverLetterHtml] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  const toggleItem = (key: string) => {
    setSelectedItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      const data = await processService.getServiceById(id);
      setProc(data as ProcessWithUser);
      if (data?.step_data?.generatedCoverLetterHTML) {
          setCoverLetterHtml(data.step_data.generatedCoverLetterHTML as string);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar detalhes do processo.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProcessData();
  }, [fetchProcessData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  if (!proc) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400">Processo não encontrado.</p>
        <button onClick={() => navigate("/admin/processes")} className="mt-4 text-primary font-bold">Voltar</button>
      </div>
    );
  }

  const service = getServiceBySlug(proc.service_slug);
  const currentStepIdx = proc.current_step ?? 0;
  const currentStep = service?.steps[currentStepIdx];
  
  const handleApproveStep = async (extraData?: Record<string, unknown>) => {
    if (!service || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let nextStep = currentStepIdx + 1;
      
      const isConsular = proc.service_slug.startsWith("visto-b1-b2") || proc.service_slug.startsWith("visto-f1");
      const isFinal = nextStep >= service.steps.length && !isConsular;
      
      const additionalData = { ...extraData };
      if (currentStep?.id === 'cos_analysis_presentation_letter') {
        additionalData.generatedCoverLetterHTML = coverLetterHtml;
      }

      await processService.approveStep(proc.id, nextStep, isFinal, isFinal ? 'approved' : undefined, additionalData);
      
      // se a próxima etapa para o B1/B2 ou F1 for credenciais ou criação de conta, 
      // certifique-se de que o card aparecerá na fila do administrador na página de listagem
      const nextStepId = service.steps[nextStep]?.id;
      const isAdminTask = 
        nextStepId.includes("_admin_credentials") || 
        nextStepId.includes("_admin_account_creation") ||
        nextStepId.includes("_admin_analysis");

      if (isAdminTask) {
         await processService.updateProcessStatus(proc.id, "awaiting_review");
      }

      toast.success("Etapa aprovada com sucesso!");
      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      console.error(error);
      toast.error("Erro ao aprovar etapa: " + msg);
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
      const isFinal = currentStepIdx >= (service?.steps.length || 0) - 1;

      if (isFinal) {
        await processService.rejectStep(proc.id, true, 'denied');
        toast.success("Processo Finalizado (Negado).");
      } else if ((isB1B2 && currentStep?.id === "b1b2_admin_final_analysis") || (isF1 && currentStep?.id === "f1_admin_final_analysis")) {
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
        toast.success("Correção solicitada.");
      } else if (isF1 && currentStep?.id === "f1_admin_analysis") {
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
        toast.success("Correção de I-20/DS160 solicitada.");
      } else {
        await processService.updateStepData(proc.id, {
          admin_feedback: rejectionReason,
          rejected_items: selectedItems,
          rejected_at: new Date().toISOString()
        });
        
        await processService.rejectStep(proc.id);
        toast.success("Feedback enviado ao cliente.");
      }
      
      fetchProcessData();
      window.scrollTo(0, 0);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      console.error(error);
      toast.error("Erro ao rejeitar etapa: " + msg);
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
      toast.success("Cover Letter gerada com sucesso pela IA!");
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

    const isActive = currentStep?.id === "cos_analysis_form_docs" || currentStep?.id === "b1b2_admin_analysis";
    const isPast = currentStep?.id === "b1b2_admin_analysis" ? currentStepIdx > 1 : currentStepIdx > 2; 

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
              <div key={key} className={`${isArray ? 'col-span-full' : 'border-b border-slate-100 pb-4'}`}>
                <div className="flex justify-between items-center mb-3 px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</p>
                  {isActive && (
                    <button 
                      onClick={() => toggleItem(key)}
                      className={`p-1.5 rounded-lg transition-all ${isSelected ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-300 hover:bg-slate-100'}`}
                      title="Marcar para correção"
                    >
                      <RiErrorWarningLine className="text-sm" />
                    </button>
                  )}
                </div>
                
                {isArray ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(value as unknown[]).map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black">
                              {idx + 1}
                            </div>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Registro</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {typeof item === 'object' && item !== null ? (
                            Object.entries(item as Record<string, unknown>).filter(([k]) => k !== 'id').map(([k, v]) => (
                              <div key={k} className="flex justify-between items-start gap-4 text-[11px]">
                                <span className="text-slate-400 font-bold uppercase shrink-0">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                <span className="text-slate-700 font-black text-right">{String(v)}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-700 font-black">{String(item)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-700 px-1">
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
    const isActive = currentStep?.id === "cos_analysis_official_forms";
    const isPast = currentStepIdx > 4;

    return (
      <CollapsibleStep
        title="Formulários Oficiais"
        icon={RiFileTextLine}
        isActive={isActive}
        isPast={isPast}
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isSelected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <RiFileTextLine className="text-3xl" />
             </div>
             <h4 className="font-black text-slate-800 text-lg mb-1">Formulário I-539</h4>
             <p className="text-xs text-slate-500 font-medium mb-6">Documento preenchido digitalmente.</p>
             <div className="flex gap-3 w-full">
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                  <RiExternalLinkLine className="text-sm" /> Visualizar PDF
                </a>
                {isActive && (
                  <button onClick={() => toggleItem('i539PdfUrl')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>
                     <RiErrorWarningLine className="text-sm" /> Reprovar
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
    const isActive = currentStep?.id === "cos_analysis_presentation_letter";
    const isPast = currentStepIdx > 6;

    return (
      <CollapsibleStep title="Análise: Cover Letter" icon={RiFileTextLine} isActive={isActive} isPast={isPast}>
        <div>
          <div className="flex items-center justify-between mb-4">
             <h4 className="font-black text-slate-800 text-lg">Carta Final Gerada</h4>
             {isActive && (
               <button onClick={() => handleGenerateCoverLetter()} disabled={isGeneratingCoverLetter} className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
                 {isGeneratingCoverLetter ? <RiLoader4Line className="animate-spin text-lg" /> : <RiFileTextLine className="text-lg" />}
                 Gerar via IA
               </button>
             )}
          </div>
          <div 
            contentEditable={isActive}
            suppressContentEditableWarning={true}
            onBlur={(e) => isActive && setCoverLetterHtml(e.currentTarget.innerHTML)}
            className={`w-full min-h-[500px] bg-white border border-slate-200 rounded-2xl p-8 overflow-y-auto shadow-sm prose prose-sm max-w-none text-slate-700 ${isActive ? 'outline-none focus:ring-4 focus:ring-primary/20' : 'opacity-80'}`}
            dangerouslySetInnerHTML={{ __html: coverLetterHtml }}
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
    const isActive = currentStep?.id === `${prefix}analysis_final_forms`;
    const isPast = currentStepIdx > 11;

    return (
      <CollapsibleStep title="Formulários G-1145 / G-1450" icon={RiBankCardLine} isActive={isActive} isPast={isPast}>
        <div className="space-y-6">
          {g1145PdfUrl && (
            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-4">
                <RiFileTextLine className="text-2xl text-blue-600" />
                <h4 className="text-sm font-black text-slate-800">G-1145</h4>
              </div>
              <a href={g1145PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase rounded-xl">Visualizar</a>
            </div>
          )}
          {g1450PdfUrl && (
            <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-4">
                <RiBankCardLine className="text-2xl text-indigo-600" />
                <h4 className="text-sm font-black text-slate-800">G-1450</h4>
              </div>
              <a href={g1450PdfUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-xl">Visualizar</a>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1DocumentsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStep?.id === "f1_admin_analysis";
    const isPast = currentStepIdx > 2;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const i20Url = docs.i20_document ? supabase.storage.from("profiles").getPublicUrl(docs.i20_document).data.publicUrl : null;

    if (!isActive && !isPast && !i20Url) return null;

    const isI20Selected = selectedItems.includes('docs.i20_document');

    return (
      <CollapsibleStep title="Análise Aplicakei: Documento I-20" icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? "Aguardando Revisão" : undefined}>
        <div className="flex flex-col gap-6">
          <div className="max-w-md">
            {i20Url && (
               <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isI20Selected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-16 h-16 bg-violet-100 text-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                     <RiFileTextLine className="text-3xl" />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm mb-1 uppercase">Formulário I-20</h4>
                  <div className="flex gap-2 w-full mt-4">
                     <a href={i20Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                       Ver
                     </a>
                     {isActive && (
                       <button onClick={() => toggleItem('docs.i20_document')} className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2 px-3 rounded-xl transition-all shadow-sm ${isI20Selected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>
                          Rejeitar
                       </button>
                     )}
                  </div>
               </div>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-red-200 hover:text-red-500 hover:bg-red-50">
                <RiCloseLine className="text-xl" /> Pedir Correção
              </button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20">
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Aprovar Documentos</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderF1FinalDocsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStep?.id === "f1_admin_final_analysis";
    const isPast = currentStepIdx > 5;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep title="Comprovantes Estudantis (DS-160 / SEVIS)" icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? "Aguardando Revisão Final" : undefined}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {ds160Url && (
               <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDsSelected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                  <h4 className="font-black text-slate-800 text-lg mb-1">DS-160 Assinada</h4>
                  <div className="flex gap-3 w-full mt-4">
                     <a href={ds160Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> Ver PDF</a>
                     {isActive && <button onClick={() => toggleItem('docs.ds160_assinada')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isDsSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}><RiErrorWarningLine className="text-sm" /> Rejeitar</button>}
                  </div>
               </div>
            )}
            {comprovanteUrl && (
               <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isComprovanteSelected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm"><RiFileTextLine className="text-3xl" /></div>
                  <h4 className="font-black text-slate-800 text-lg mb-1">Comprovante Final</h4>
                  <div className="flex gap-3 w-full mt-4">
                     <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"><RiExternalLinkLine className="text-sm" /> Ver PDF</a>
                     {isActive && <button onClick={() => toggleItem('docs.ds160_comprovante')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isComprovanteSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}><RiErrorWarningLine className="text-sm" /> Rejeitar</button>}
                  </div>
               </div>
            )}
          </div>
          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-red-200 hover:text-red-500 hover:bg-red-50"><RiCloseLine className="text-xl" /> Pedir Correção</button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20">{isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Aprovar Revisão Final</>}</button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CredentialsAdmin = () => {
    if (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStep?.id === "b1b2_admin_credentials" || currentStep?.id === "f1_admin_credentials";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 3 : 2);

    if (!isActive && !isPast) return null;

    return (
      <CollapsibleStep title="Credenciais CEAC" icon={RiShieldCheckLine} isActive={isActive} isPast={isPast} badge="Ação Administrativa">
        <B1B2CredentialsPanel proc={proc} onApprove={() => handleApproveStep()} onRefresh={fetchProcessData} isActive={isActive} />
      </CollapsibleStep>
    );
  };

  const renderB1B2FinalDocsAdmin = () => {
    if (proc.service_slug !== "visto-b1-b2") return null;
    const isActive = currentStep?.id === "b1b2_admin_final_analysis";
    const isPast = currentStepIdx > 4;

    const docs = (proc.step_data?.docs || {}) as Record<string, string>;
    const ds160Url = docs.ds160_assinada ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_assinada).data.publicUrl : null;
    const comprovanteUrl = docs.ds160_comprovante ? supabase.storage.from("profiles").getPublicUrl(docs.ds160_comprovante).data.publicUrl : null;

    if (!isActive && !isPast && !ds160Url && !comprovanteUrl) return null;

    const isDsSelected = selectedItems.includes('docs.ds160_assinada');
    const isComprovanteSelected = selectedItems.includes('docs.ds160_comprovante');

    return (
      <CollapsibleStep title="Comprovantes Finais DS-160" icon={RiFileTextLine} isActive={isActive} isPast={isPast} badge={isActive ? "Aguardando Revisão" : undefined}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {ds160Url && (
               <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isDsSelected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                     <RiFileTextLine className="text-3xl" />
                  </div>
                  <h4 className="font-black text-slate-800 text-lg mb-1">DS-160 Assinada</h4>
                  <div className="flex gap-3 w-full mt-4">
                     <a href={ds160Url} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                       <RiExternalLinkLine className="text-sm" /> Ver PDF
                     </a>
                     {isActive && (
                       <button onClick={() => toggleItem('docs.ds160_assinada')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isDsSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>
                          <RiErrorWarningLine className="text-sm" /> Rejeitar
                       </button>
                     )}
                  </div>
               </div>
            )}

            {comprovanteUrl && (
               <div className={`flex-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isComprovanteSelected ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                     <RiFileTextLine className="text-3xl" />
                  </div>
                  <h4 className="font-black text-slate-800 text-lg mb-1">Comprovante CEAC</h4>
                  <div className="flex gap-3 w-full mt-4">
                     <a href={comprovanteUrl} target="_blank" rel="noreferrer" className="flex-[2] flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                       <RiExternalLinkLine className="text-sm" /> Ver PDF
                     </a>
                     {isActive && (
                       <button onClick={() => toggleItem('docs.ds160_comprovante')} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all shadow-sm ${isComprovanteSelected ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>
                          <RiErrorWarningLine className="text-sm" /> Rejeitar
                       </button>
                     )}
                  </div>
               </div>
            )}
          </div>

          {/* Ações de aprovação / rejeição para etapa 5 */}
          {isActive && (
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowRejectionModal(true)}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
              >
                <RiCloseLine className="text-xl" /> Pedir Correção
              </button>
              <button
                onClick={() => handleApproveStep()}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Aprovar Documentação</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2CASVAdmin = () => {
    if (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1")) return null;
    const isActive = currentStep?.id === "b1b2_casv_scheduling" || currentStep?.id === "f1_casv_scheduling";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 6 : 5);
    if (!isActive && !isPast) return null;

    const casvDate = proc.step_data?.casv_preferred_date as string;
    const consulado = proc.step_data?.interviewLocation as string;

    const consuladoLabels: Record<string, { flag: string; cidade: string; estado: string }> = {
      Brasilia:         { flag: "🏛️", cidade: "Brasília",       estado: "DF" },
      "Rio de Janeiro": { flag: "🌆", cidade: "Rio de Janeiro", estado: "RJ" },
      "São Paulo":      { flag: "🏙️", cidade: "São Paulo",      estado: "SP" },
      Recife:           { flag: "🌴", cidade: "Recife",         estado: "PE" },
      "Porto Alegre":   { flag: "🌉", cidade: "Porto Alegre",   estado: "RS" },
    };
    const consuladoInfo = consulado ? consuladoLabels[consulado] : null;

    return (
      <CollapsibleStep
        title="Agendamento CASV — Consulado"
        icon={RiCalendarLine}
        isActive={isActive}
        isPast={isPast}
        badge={isActive ? "Aguardando Confirmação" : undefined}
      >
        <div className="space-y-6">
          {/* Consulado */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Consulado Selecionado</p>
            {consuladoInfo ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl">{consuladoInfo.flag}</span>
                <div>
                  <h4 className="font-black text-slate-800 text-base">{consuladoInfo.cidade}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{consuladoInfo.estado}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium">Consulado não informado</p>
            )}
          </div>

          {/* Data solicitada */}
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
            <p className="text-[10px] font-black text-sky-800 uppercase tracking-widest mb-1">Data Preferencial Solicitada</p>
            {casvDate ? (
              <p className="text-lg font-black text-slate-800">
                {new Date(casvDate + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">Nenhuma data informada ainda.</p>
            )}
          </div>

          {/* Ações */}
          {isActive && (
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRejectionModal(true)}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
              >
                <RiCloseLine className="text-xl" /> Pedir Ajuste
              </button>
              <button
                onClick={() => handleApproveStep()}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Confirmar Agendamento</>}
              </button>
            </div>
          )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2AccountCreationAdmin = () => {
    if (!proc || (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1"))) return null;
    const isActive = currentStep?.id === "b1b2_admin_account_creation" || currentStep?.id === "f1_admin_account_creation";
    const isPast = currentStepIdx > (proc.service_slug.startsWith("visto-f1") ? 7 : 6);
    if (!isActive && !isPast) return null;

    const email = (proc.step_data?.primaryEmail || proc.user_accounts?.email || "Não informado") as string;
    const name = (proc.step_data?.fullName || proc.user_accounts?.full_name || "Não informado") as string;
    const phone = (proc.step_data?.primaryPhone || proc.user_accounts?.phone || "Não informado") as string;
    
    return (
      <CollapsibleStep title="Criação de Conta no Site do Consulado" icon={RiMailCheckLine} isActive={isActive} isPast={isPast} badge="Ação Administrativa">
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Completo</p>
                <p className="text-sm font-bold text-slate-800">{name || "Não informado"}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                <p className="text-sm font-bold text-slate-800">{email || "Não informado"}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone</p>
                <p className="text-sm font-bold text-slate-800">{phone || "Não informado"}</p>
              </div>
           </div>

           {isActive && (
             <div className="pt-4 border-t border-slate-100 text-left">
                <p className="text-xs text-slate-500 font-medium mb-4 italic">
                  Utilize os dados acima para criar a conta oficial no site do consulado. Uma vez criada, confirme abaixo para que o cliente possa validar o acesso.
                </p>
                <button
                  onClick={() => handleApproveStep()}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Confirmar que Conta foi Criada</>}
                </button>
             </div>
           )}
        </div>
      </CollapsibleStep>
    );
  };

  const renderB1B2MRVSetupAdmin = () => {
    if (!proc || (!proc.service_slug.startsWith("visto-b1-b2") && !proc.service_slug.startsWith("visto-f1"))) return null;
    const isActive = currentStep?.id === "b1b2_admin_mrv_setup" || currentStep?.id === "f1_admin_mrv_setup";
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
    const isActive = currentStep?.id === "b1b2_final_scheduling" || currentStep?.id === "f1_final_scheduling";
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
    const isActive = currentStep?.id === `${prefix}final_package`;
    const isPast = currentStepIdx > 12;

    return (
      <CollapsibleStep title={`${proc.service_slug === 'extensao-status' ? 'EOS' : 'COS'} Final Package`} icon={RiCheckDoubleLine} isActive={isActive} isPast={isPast}>
        {!finalPackageUrl ? (
          <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px]">
             <RiFileTextLine className="text-4xl text-slate-300 mx-auto mb-4" />
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
               Merge All Documents
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <RiCheckDoubleLine className="text-2xl text-emerald-600" />
                <h4 className="text-sm font-black text-slate-800">Pacote Final Pronto</h4>
              </div>
              <div className="flex gap-2">
                <a href={finalPackageUrl} target="_blank" rel="noreferrer" className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><RiDownload2Line /> Review PDF</a>
                <button onClick={() => handleApproveStep()} className="px-8 py-2.5 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-xl transition-all">Aprovar Etapa</button>
              </div>
            </div>
          </div>
        )}
      </CollapsibleStep>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="flex items-start justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/admin/processes")} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
            <RiArrowLeftLine className="text-xl" />
          </button>
          <div>
            <h1 className="font-display font-black text-3xl text-slate-800 tracking-tight">{proc.user_accounts?.full_name}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{service?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <RiCalendarLine className="text-slate-400" />
            <span className="flex items-center gap-1.5">{new Date(proc.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {renderFormData()}
          {renderOfficialForms()}
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

          {/* RFE Admin Actions */}
          {currentStep?.id === "cos_rfe_proposal" && (
            <CollapsibleStep title="Proposta de RFE" icon={RiShieldCheckLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <RFEProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {/* Motion Admin Actions */}
          {currentStep?.id === "cos_motion_proposal" && (
            <CollapsibleStep title="Proposta de Motion" icon={RiShieldCheckLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <MotionProposalPanel proc={proc} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {/* Shipments */}
          {currentStep?.id === "cos_rfe_final_ship" && (
            <CollapsibleStep title="Envio RFE" icon={RiFileUploadLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <RFEFinalShipPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}
          {currentStep?.id === "cos_motion_final_ship" && (
            <CollapsibleStep title="Envio Motion" icon={RiFileUploadLine} isActive={true} isPast={false} badge="Ação Administrativa">
              <MotionFinalShipPanel proc={proc} onApprove={handleApproveStep} onRefresh={fetchProcessData} isActive={true} />
            </CollapsibleStep>
          )}

          {/* Default Analysis for everything else */}
          {currentStep?.type === "admin_action" && !["cos_rfe_proposal", "cos_motion_proposal", "cos_rfe_final_ship", "cos_motion_final_ship", "b1b2_admin_credentials", "b1b2_admin_final_analysis", "b1b2_casv_scheduling", "b1b2_admin_account_creation", "b1b2_admin_mrv_setup", "b1b2_final_scheduling"].includes(currentStep.id) && (
            <div className="flex items-center gap-4 pt-4">
              <button onClick={() => setShowRejectionModal(true)} className="flex-1 h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                <RiCloseLine className="text-xl" /> Pedir Ajustes
              </button>
              <button onClick={() => handleApproveStep()} disabled={isSubmitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> Aprovar Etapa</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800 text-lg uppercase">Fluxo do Processo</h3>
                <div className="px-3 py-1 bg-primary/5 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest">
                  Etapa {currentStepIdx + 1} de {service?.steps.length}
                </div>
              </div>
              <div className="space-y-4">
                {service?.steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i < currentStepIdx ? 'bg-emerald-500 text-white' : i === currentStepIdx ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                      {i < currentStepIdx ? <RiCheckLine /> : i + 1}
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight transition-all ${i <= currentStepIdx ? 'text-slate-700' : 'text-slate-400'}`}>{step.title}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showRejectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectionModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl">
              <h3 className="font-display font-black text-slate-800 text-xl mb-4">Pedir Ajustes</h3>
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o que precisa ser corrigido..."
                className="w-full h-40 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium outline-none mb-6 resize-none"
              />
              <div className="flex gap-4">
                 <button onClick={() => setShowRejectionModal(false)} className="flex-1 h-12 font-black text-[10px] uppercase">Cancelar</button>
                 <button onClick={handleRejectStep} disabled={!rejectionReason || isSubmitting} className="flex-[2] h-12 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase">Rejeitar Etapa</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
