import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiCheckDoubleLine,
  RiFileUploadLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiCameraLine,
  RiUser3Line
} from "react-icons/ri";

import { supabase } from "../../../../lib/supabase";
import { processService } from "../../../../services/process.service";

interface F1I20UploadStepProps {
  procId: string;
  userId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
  onBack: () => void;
}

type DocType = "i20_document";

export function F1I20UploadStep({ procId, userId, stepData, onComplete, onBack }: F1I20UploadStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<DocType | null>(null);
  
  const [paths, setPaths] = useState<Record<DocType, string | null>>({
    i20_document: null
  });

  useEffect(() => {
    const docs = (stepData.docs as Record<string, string>) || {};
    setPaths({
      i20_document: docs.i20_document || null
    });
  }, [stepData]);

  const adminFeedback = (stepData.admin_feedback as string) || null;
  const rejectedItems = (stepData.rejected_items as string[]) || [];

  const handleFileUpload = async (file: File, docType: DocType) => {
    setUploadingDoc(docType);
    try {
      const fileExt = file.name.split(".").pop();
      const prefix = docType.split('_')[0];
      const filePath = `${userId}/f1/${prefix}_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const currentDocs = (stepData.docs as Record<string, string>) || {};
      const updatedDocs = { ...currentDocs, [docType]: filePath };
      
      setPaths(prev => ({ ...prev, [docType]: filePath }));

      await processService.updateStepData(procId, { docs: updatedDocs });
      toast.success("Documento enviado com sucesso!");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro no upload");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleComplete = async () => {
    if (!paths.i20_document) {
      toast.error("Por favor, envie o formulário I-20.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Limpa feedback e avança para análise administrativa
      await processService.updateStepData(procId, {
        admin_feedback: null,
        rejected_items: [],
        rejected_at: null,
      });
      
      await processService.approveStep(procId, 2, false);
      await processService.requestStepReview(procId);
      
      toast.success("I-20 enviado para análise!");
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const docConfigs: { type: DocType; label: string; desc: string; icon: typeof RiFileTextLine }[] = [
    { 
      type: "i20_document", 
      label: "Formulário I-20", 
      desc: "Documento emitido pela sua instituição de ensino americana.", 
      icon: RiFileTextLine 
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner de Feedback */}
      {adminFeedback && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
            <RiErrorWarningLine className="text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">
              Correção Solicitada
            </h3>
            <p className="text-sm text-red-700 font-medium leading-relaxed">
              &ldquo;{adminFeedback}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Upload do I-20</h2>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">
          Para prosseguirmos com seu visto F-1, precisamos validar seu formulário I-20. <br className="hidden sm:block" />
          Certifique-se de que a imagem está nítida e sem reflexos.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {docConfigs.map((doc) => {
          const isUploaded = !!paths[doc.type];
          const isUploading = uploadingDoc === doc.type;
          const isRejected = rejectedItems.includes(`docs.${doc.type}`);
          const Icon = doc.icon;

          return (
            <div 
              key={doc.type}
              className={`relative bg-white rounded-[32px] border transition-all p-10 text-center flex flex-col items-center group
                ${isUploaded ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 hover:border-primary/20 hover:bg-slate-50'}
                ${isRejected ? 'border-red-200 bg-red-50/30 ring-1 ring-red-100' : ''}
              `}
            >
              <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-all
                ${isUploaded ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}
                ${isRejected ? 'bg-red-500 text-white' : ''}
              `}>
                {isUploading ? <RiLoader4Line className="text-4xl animate-spin" /> : <Icon className="text-4xl" />}
              </div>

              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">{doc.label}</h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed mb-8">
                {doc.desc}
              </p>

              <label className="mt-auto w-full">
                <div className={`px-6 py-4 rounded-xl border-2 border-dashed text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                  ${isUploaded ? 'border-emerald-200 bg-white text-emerald-600' : 'border-slate-100 bg-slate-50/50 hover:border-primary/40 hover:bg-white text-slate-400'}
                  ${isRejected ? 'border-red-300 bg-white text-red-500' : ''}
                `}>
                  {isUploading ? "Enviando..." : isUploaded ? (isRejected ? "Reenviar Arquivo" : "Arquivo Enviado") : "Selecionar Arquivo"}
                </div>
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  className="hidden"
                  disabled={!!uploadingDoc}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], doc.type)}
                />
              </label>

              {isUploaded && !isUploading && (
                <div className="absolute top-6 right-6 text-emerald-500 animate-in zoom-in duration-300">
                  <RiCheckDoubleLine className="text-xl" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all font-mono"
        >
          Voltar para Dashboard
        </button>

        <button
          type="button"
          onClick={handleComplete}
          disabled={isSubmitting || !paths.i20_document}
          className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <RiLoader4Line className="animate-spin text-lg" />
          ) : (
            <>
              Confirmar e Prosseguir
              <RiArrowRightLine className="text-lg" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
