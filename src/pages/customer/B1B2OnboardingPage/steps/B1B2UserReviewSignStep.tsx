import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckDoubleLine,
  RiFileUploadLine,
  RiFileCopyLine,
  RiErrorWarningLine,
} from "react-icons/ri";

import firstPhaseImg from "../../../../assets/application_tutorial/first_phase.png";
import secondPhaseImg from "../../../../assets/application_tutorial/second_phase.png";
import thirdPhaseImg from "../../../../assets/application_tutorial/three_phase.png";

import { supabase } from "../../../../lib/supabase";
import { processService } from "../../../../services/process.service";

interface B1B2UserReviewSignStepProps {
  procId: string;
  userId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
  onBack: () => void;
}

export function B1B2UserReviewSignStep({ procId, userId, stepData, onComplete, onBack }: B1B2UserReviewSignStepProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // useRef para garantir que uploadDoc sempre veja os docs mais recentes (evita sobrescrever o 1º ao enviar o 2º)
  const docsRef = useRef<Record<string, string>>((stepData.docs || {}) as Record<string, string>);
  const [ds160Assinada, setDs160Assinada] = useState<string | null>(docsRef.current.ds160_assinada || null);
  const [ds160Comprovante, setDs160Comprovante] = useState<string | null>(docsRef.current.ds160_comprovante || null);

  // Feedback do admin quando retorna para correção
  const adminFeedback = (stepData.admin_feedback as string) || null;

  const appId = (stepData.ds160_application_id as string) || "AA00XXXXXX";
  const motherName = (stepData.ds160_security_answer as string) || "SILVA";
  const birthDate = (stepData.ds160_birth_date as string) || "1990";

  const tutorialSteps = [
    {
      title: "Acesse o site do CEAC",
      desc: "Vá para a página oficial do Governo Americano e utilize as credenciais abaixo para recuperar ou acessar sua aplicação.",
      img: firstPhaseImg,
    },
    {
      title: "Revise Suas Informações",
      desc: "Navegue pelo menu lateral para encontrar a seção principal e clique para expandir.",
      img: secondPhaseImg,
    },
    {
      title: "Assinatura Final",
      desc: "Siga o fluxo e confirme que você leu todas as entradas com cuidado antes de prosseguir.",
      img: thirdPhaseImg,
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado com sucesso!");
  };

  const uploadDoc = async (key: string, file: File) => {
    setIsUploading(key);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/b1b2/${key}_${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Atualiza o ref com os docs mais recentes antes de salvar
      const updatedDocs = { ...docsRef.current, [key]: filePath };
      docsRef.current = updatedDocs;
      
      if (key === "ds160_assinada") setDs160Assinada(filePath);
      if (key === "ds160_comprovante") setDs160Comprovante(filePath);

      await processService.updateStepData(procId, { docs: updatedDocs });
      toast.success("Documento enviado!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro no upload");
    } finally {
      setIsUploading(null);
    }
  };

  const handleComplete = async () => {
    if (!ds160Assinada || !ds160Comprovante) {
      toast.error("Você precisa enviar a DS-160 assinada e o Comprovante para continuar.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Limpa o feedback do admin ao reenviar
      await processService.updateStepData(procId, {
        admin_feedback: null,
        rejected_items: [],
        rejected_at: null,
      });
      await processService.approveStep(procId, 4, false);
      await processService.requestStepReview(procId);
      toast.success("Documentos enviados com sucesso!");
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Banner de Feedback do Admin ── */}
      {adminFeedback && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
            <RiErrorWarningLine className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">
              Correção Solicitada pela Equipe
            </h3>
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              &ldquo;{adminFeedback}&rdquo;
            </p>
            <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest">
              Por favor, reenvie os documentos corrigidos abaixo.
            </p>
          </div>
        </div>
      )}
      
      {/* ── Tutorial Carousel ── */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 pb-4 border-b border-slate-100 items-center justify-between">
          <h3 className="font-display font-black text-2xl text-slate-800">Assinatura da DS-160</h3>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Acompanhe o passo-a-passo no site do consulado para enviar as informações que revisamos.
          </p>
        </div>

        {/* Credentials */}
        <div className="bg-slate-50 p-6 md:p-8 flex flex-col md:flex-row gap-6">
           <div className="basis-1/3">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Application ID</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 uppercase tracking-wider">{appId}</span>
                <button onClick={() => handleCopy(appId)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><RiFileCopyLine /></button>
              </div>
           </div>
           <div className="basis-1/3 border-l border-slate-200 pl-6">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mãe / Segurança</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 uppercase tracking-wider">{motherName}</span>
                <button onClick={() => handleCopy(motherName)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><RiFileCopyLine /></button>
              </div>
           </div>
           <div className="basis-1/3 border-l border-slate-200 pl-6">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ano de Nascimento</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 tracking-wider">{birthDate}</span>
                <button onClick={() => handleCopy(birthDate)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><RiFileCopyLine /></button>
              </div>
           </div>
        </div>

        {/* Action Button for CEAC */}
        <div className="bg-slate-50 px-6 md:px-8 pb-8 flex justify-center border-b border-slate-100">
           <a 
             href="https://ceac.state.gov/GenNIV/Default.aspx" 
             target="_blank" 
             rel="noreferrer" 
             className="w-full md:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] shadow-xl shadow-slate-900/10"
           >
             Acessar site do consulado (CEAC) <RiArrowRightLine className="text-lg" />
           </a>
        </div>

        {/* Carousel UI */}
        <div className="p-6 md:p-8">
           <div className="flex gap-2 justify-center mb-8">
             {tutorialSteps.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveStep(i)}
                 className={`h-2 rounded-full transition-all duration-300 ${activeStep === i ? 'w-10 bg-primary' : 'w-4 bg-slate-200 hover:bg-slate-300'}`}
               />
             ))}
           </div>
           
           <div className="text-center mb-8 min-h-[60px]">
             <h4 className="text-lg font-black text-slate-800 tracking-tight">Passo {activeStep + 1}: {tutorialSteps[activeStep].title}</h4>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl mx-auto">{tutorialSteps[activeStep].desc}</p>
           </div>
           
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center">
             <img src={tutorialSteps[activeStep].img} alt={tutorialSteps[activeStep].title} className="rounded-xl shadow-sm w-full max-w-2xl object-cover ring-1 ring-slate-900/5 mt-4 mb-4" />
           </div>
           
           <div className="flex justify-between items-center mt-8">
              <button 
                onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                disabled={activeStep === 0}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <RiArrowLeftLine /> Anterior
              </button>
              <button 
                onClick={() => setActiveStep(p => Math.min(tutorialSteps.length - 1, p + 1))}
                disabled={activeStep === tutorialSteps.length - 1}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                Próximo <RiArrowRightLine />
              </button>
           </div>
        </div>
      </div>

      {/* ── File Uploads ── */}
      <h3 className="font-display font-black text-xl text-slate-800 mt-12 mb-6 text-center">Agora, envie seus comprovantes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload DS-160 Assinada */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
             {ds160Assinada ? <RiCheckDoubleLine className="text-3xl" /> : <RiFileUploadLine className="text-3xl" />}
          </div>
          <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-1">Upload da DS-160 Assinada</h4>
          <p className="text-xs text-slate-500 font-medium mb-6 min-h-[40px]">Envie o arquivo final da sua aplicação.</p>
          
          <label className={`block w-full py-3 rounded-xl border-2 border-dashed font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${ds160Assinada ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-400'}`}>
            {isUploading === 'ds160_assinada' ? (
              <span className="flex items-center justify-center gap-2"><RiLoader4Line className="animate-spin" /> Enviando...</span>
            ) : ds160Assinada ? "Arquivo Enviado" : "Selecionar Arquivo PDF"}
            <input type="file" accept=".pdf" className="hidden" disabled={isUploading === 'ds160_assinada'} onChange={(e) => e.target.files?.[0] && uploadDoc('ds160_assinada', e.target.files[0])} />
          </label>
        </div>

        {/* Upload Comprovante DS-160 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
             {ds160Comprovante ? <RiCheckDoubleLine className="text-3xl" /> : <RiFileUploadLine className="text-3xl" />}
          </div>
          <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest mb-1">Comprovante de Envio</h4>
          <p className="text-xs text-slate-500 font-medium mb-6 min-h-[40px]">Envie a Confirmação de Submissão do CEAC.</p>
          
          <label className={`block w-full py-3 rounded-xl border-2 border-dashed font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${ds160Comprovante ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-400'}`}>
            {isUploading === 'ds160_comprovante' ? (
              <span className="flex items-center justify-center gap-2"><RiLoader4Line className="animate-spin" /> Enviando...</span>
            ) : ds160Comprovante ? "Arquivo Enviado" : "Selecionar Arquivo PDF"}
            <input type="file" accept=".pdf" className="hidden" disabled={isUploading === 'ds160_comprovante'} onChange={(e) => e.target.files?.[0] && uploadDoc('ds160_comprovante', e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || !ds160Comprovante || !ds160Assinada}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RiLoader4Line className="animate-spin text-lg" />
            ) : (
              <>
                Finalizar Documentação
                <RiArrowRightLine className="text-lg" />
              </>
            )}
          </button>
      </div>

    </div>
  );
}
