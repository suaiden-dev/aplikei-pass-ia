import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  RiArrowRightLine,
  RiLoader4Line,
  RiCheckDoubleLine,
  RiFileTextLine,
  RiCheckLine
} from "react-icons/ri";

import { uploadOnboardingDocument } from "@features/onboarding/services/onboardingStorageService";
import * as processService from "@features/process/services/processOps";
import * as notificationService from "@features/notifications/services/notify";

interface F1I20UploadStepProps {
  procId: string;
  userId: string;
  stepData: Record<string, unknown>;
  labels: any;
  onComplete: () => void;
  onBack: () => void;
  procStatus?: string | null;
  currentStep?: number;
  nextStepIdx?: number;
}

type DocType = "i20_document";

export function F1I20UploadStep({
  procId,
  userId,
  stepData,
  labels,
  onComplete,
  onBack,
  procStatus,
  currentStep = 0,
  nextStepIdx = 2,
}: F1I20UploadStepProps) {
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

  const rejectedItems = (stepData.rejected_items as string[]) || [];

  const handleFileUpload = async (file: File, docType: DocType) => {
    setUploadingDoc(docType);
    try {
      const fileExt = file.name.split(".").pop();
      const prefix = docType.split('_')[0];
      const filePath = `${userId}/f1/${prefix}_${crypto.randomUUID()}.${fileExt}`;
      
      await uploadOnboardingDocument(filePath, file);

      const currentDocs = (stepData.docs as Record<string, string>) || {};
      const updatedDocs = { ...currentDocs, [docType]: filePath };
      
      setPaths(prev => ({ ...prev, [docType]: filePath }));

      await processService.updateStepData(procId, { docs: updatedDocs });
      toast.success(labels.onboardingPage.f1.i20Success);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Error");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleComplete = async () => {
    if (!paths.i20_document) {
      toast.error(labels.onboardingPage.f1.i20SelectError);
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
      
      await processService.approveStep(procId, nextStepIdx, false);
      await processService.requestStepReview(procId);
      
      await notificationService.notifyAdmin({
        serviceId: procId,
        userId,
        link: `/master/processes/${procId}`,
        category: "f1",
        action: "i20_uploaded",
      });

      toast.success(labels.onboardingPage.f1.i20AnalysisToast);
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAwaitingReview = procStatus === "awaiting_review" && currentStep >= nextStepIdx;
  const isStepApproved = currentStep > nextStepIdx;

  // ── Etapa aprovada ──────────────────────────────────────────────────────────
  if (isStepApproved) {
    return (
      <div className="bg-card rounded-[32px] border border-border shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <RiCheckLine className="text-3xl" />
        </div>
        <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">Etapa Aprovada</h3>
        <p className="text-sm text-text-muted font-medium max-w-sm mx-auto">
          O seu I-20 foi validado pela equipe. Você já pode avançar para a próxima etapa.
        </p>
        <button
          onClick={onComplete}
          className="mt-6 px-8 py-3 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all"
        >
          {labels.onboardingPage?.backToDashboard ?? "Voltar para Dashboard"}
        </button>
      </div>
    );
  }

  // ── Aguardando revisão ──────────────────────────────────────────────────────
  if (isAwaitingReview) {
    return (
      <div className="bg-card rounded-[32px] border border-border shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 shadow-inner">
          <RiLoader4Line className="text-3xl animate-spin" />
        </div>
        <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">
          {labels.onboardingPage?.awaitingReview ?? "Aguardando Revisão"}
        </h3>
        <p className="text-sm text-text-muted font-medium max-w-sm mx-auto">
          O seu I-20 foi enviado com sucesso e está sendo analisado pela nossa equipe.
        </p>
        <button
          onClick={onComplete}
          className="mt-6 px-8 py-3 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all"
        >
          {labels.onboardingPage?.backToDashboard ?? "Voltar para Dashboard"}
        </button>
      </div>
    );
  }

  const docConfigs: { type: DocType; label: string; desc: string; icon: typeof RiFileTextLine }[] = [
    { 
      type: "i20_document", 
      label: labels.onboardingPage.f1.i20DocLabel, 
      desc: labels.onboardingPage.f1.i20DocDesc, 
      icon: RiFileTextLine 
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-black text-text tracking-tight mb-3">
          {labels.onboardingPage.f1.i20UploadTitle}
        </h2>
        <p className="text-text-muted font-medium text-sm leading-relaxed">
          {labels.onboardingPage.f1.i20UploadDesc}
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
              className={`relative bg-card rounded-[32px] border transition-all p-10 text-center flex flex-col items-center group
                ${isUploaded ? 'border-success/30 bg-success/5' : 'border-border hover:border-primary/30 hover:bg-bg-subtle'}
                ${isRejected ? 'border-danger/40 bg-danger/5 ring-1 ring-danger/20' : ''}
              `}
            >
              <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-all
                ${isUploaded ? 'bg-success text-white' : 'bg-bg-subtle text-text-muted group-hover:bg-primary/10 group-hover:text-primary'}
                ${isRejected ? 'bg-danger text-white' : ''}
              `}>
                {isUploading ? <RiLoader4Line className="text-4xl animate-spin" /> : <Icon className="text-4xl" />}
              </div>

              <h3 className="text-lg font-black text-text uppercase tracking-tight mb-2">{doc.label}</h3>
              <p className="text-sm text-text-muted font-bold leading-relaxed mb-8">
                {doc.desc}
              </p>

              <label className="mt-auto w-full">
                <div className={`px-6 py-4 rounded-xl border-2 border-dashed text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                  ${isUploaded ? 'border-success/30 bg-card text-success' : 'border-border bg-bg-subtle hover:border-primary/40 hover:bg-card text-text-muted'}
                  ${isRejected ? 'border-danger/40 bg-card text-danger' : ''}
                `}>
                  {isUploading ? labels.onboardingPage.uploadingBtn : isUploaded ? (isRejected ? labels.onboardingPage.f1.resubmitFile : labels.onboardingPage.fileSent) : labels.onboardingPage.f1.selectFile}
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
                <div className="absolute top-6 right-6 text-success animate-in zoom-in duration-300">
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
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border text-text font-bold text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all"
        >
          {labels.onboardingPage.backToDashboard}
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
              {labels.onboardingPage.f1.confirmAndProceed}
              <RiArrowRightLine className="text-lg" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
