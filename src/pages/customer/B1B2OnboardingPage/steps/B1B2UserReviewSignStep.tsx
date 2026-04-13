import { useState, useRef } from "react";
import { useT } from "../../../../i18n/LanguageContext";
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
import { DocUploadCard, type DocFile } from "../../../../components/DocUploadCard";

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
  const t = useT("visas");
  const tc = useT("common");

  // useRef para garantir que uploadDoc sempre veja os docs mais recentes (evita sobrescrever o 1º ao enviar o 2º)
  const docsRef = useRef<Record<string, string>>((stepData.docs || {}) as Record<string, string>);
  
  const [docs, setDocs] = useState<Record<string, DocFile>>({
    ds160_assinada: { file: null, label: t.onboardingPage.uploadSignedDS160, path: docsRef.current.ds160_assinada },
    ds160_comprovante: { file: null, label: t.onboardingPage.uploadConfirmation, path: docsRef.current.ds160_comprovante },
  });

  // Feedback do admin quando retorna para correção
  const adminFeedback = (stepData.admin_feedback as string) || null;

  const appId = (stepData.ds160_application_id as string) || "AA00XXXXXX";
  const motherName = (stepData.ds160_security_answer as string) || "SILVA";
  const birthDate = (stepData.ds160_birth_date as string) || "1990";

  const tutorialSteps = [
    {
      title: t.onboardingPage.reviewSign.tutorial.step1Title,
      desc: t.onboardingPage.reviewSign.tutorial.step1Desc,
      img: firstPhaseImg,
    },
    {
      title: t.onboardingPage.reviewSign.tutorial.step2Title,
      desc: t.onboardingPage.reviewSign.tutorial.step2Desc,
      img: secondPhaseImg,
    },
    {
      title: t.onboardingPage.reviewSign.tutorial.step3Title,
      desc: t.onboardingPage.reviewSign.tutorial.step3Desc,
      img: thirdPhaseImg,
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.onboardingPage.copySuccess);
  };

  const uploadDoc = async (key: string, file: File) => {
    // Feedback visual imediato
    setDocs(prev => ({ ...prev, [key]: { ...prev[key], file } }));
    
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
      
      await processService.updateStepData(procId, { docs: updatedDocs });
      toast.success(t.onboardingPage.uploadSuccess);
    } catch (err: unknown) {
      toast.error((err as Error).message || t.onboardingPage.uploadError);
      // Reverte se deu erro
      setDocs(prev => ({ ...prev, [key]: { ...prev[key], file: null } }));
    }
  };

  const handleComplete = async () => {
    const isReady = (docs.ds160_assinada.file || docs.ds160_assinada.path) && 
                    (docs.ds160_comprovante.file || docs.ds160_comprovante.path);
                    
    if (!isReady) {
      toast.error(t.onboardingPage.uploadRequired);
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
      toast.success(t.onboardingPage.uploadAllSuccess);
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
              {t.onboardingPage.correctionRequested}
            </h3>
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              &ldquo;{adminFeedback}&rdquo;
            </p>
            <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-widest">
              {t.onboardingPage.resubmitDocs}
            </p>
          </div>
        </div>
      )}
      
      {/* ── Tutorial Carousel ── */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 pb-4 border-b border-slate-100 items-center justify-between">
          <h3 className="font-display font-black text-2xl text-slate-800">
            {t.onboardingPage.reviewSign.title}
          </h3>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {t.onboardingPage.reviewSign.desc}
          </p>
        </div>

        {/* Credentials */}
        <div className="bg-slate-50 p-6 md:p-8 flex flex-col md:flex-row gap-6">
           <div className="basis-1/3">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {t.onboardingPage.applicationId}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 uppercase tracking-wider">{appId}</span>
                <button onClick={() => handleCopy(appId)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><RiFileCopyLine /></button>
              </div>
           </div>
           <div className="basis-1/3 border-l border-slate-200 pl-6">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {t.onboardingPage.motherSecurity}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 uppercase tracking-wider">{motherName}</span>
                <button onClick={() => handleCopy(motherName)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all"><RiFileCopyLine /></button>
              </div>
           </div>
           <div className="basis-1/3 border-l border-slate-200 pl-6">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {t.onboardingPage.birthYear}
              </span>
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
             {t.onboardingPage.accessPortalCeac} <RiArrowRightLine className="text-lg" />
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
             <h4 className="text-lg font-black text-slate-800 tracking-tight">
               {t.onboardingPage.step} {activeStep + 1}: {tutorialSteps[activeStep].title}
             </h4>
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
                <RiArrowLeftLine /> {t.onboardingPage.previous}
              </button>
              <button 
                onClick={() => setActiveStep(p => Math.min(tutorialSteps.length - 1, p + 1))}
                disabled={activeStep === tutorialSteps.length - 1}
                className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                {t.onboardingPage.next} <RiArrowRightLine />
              </button>
           </div>
        </div>
      </div>

      {/* ── File Uploads ── */}
      <h3 className="font-display font-black text-xl text-slate-800 mt-12 mb-6 text-center">
        {t.onboardingPage.reviewAndSignDocs}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocUploadCard
          docKey="ds160_assinada"
          title={t.onboardingPage.uploadSignedDS160}
          subtitle={t.onboardingPage.sendFinalFile}
          doc={docs.ds160_assinada}
          onChange={uploadDoc}
        />

        <DocUploadCard
          docKey="ds160_comprovante"
          title={t.onboardingPage.uploadConfirmation}
          subtitle={t.onboardingPage.sendCeacConfirmation}
          doc={docs.ds160_comprovante}
          onChange={uploadDoc}
        />
      </div>

      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            {t.onboardingPage.previous}
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || !(docs.ds160_assinada.file || docs.ds160_assinada.path) || !(docs.ds160_comprovante.file || docs.ds160_comprovante.path)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RiLoader4Line className="animate-spin text-lg" />
            ) : (
              <>
                {t.onboardingPage.finishDocumentation}
                <RiArrowRightLine className="text-lg" />
              </>
            )}
          </button>
      </div>

    </div>
  );
}
