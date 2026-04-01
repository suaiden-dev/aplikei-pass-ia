import { Button } from "@/presentation/components/atoms/button";
import { Progress } from "@/presentation/components/atoms/progress";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Eye,
  Camera,
  Upload,
  CheckSquare,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/presentation/components/atoms/dialog";
import { useState } from "react";
import { useOnboardingBase } from "./hooks/useOnboardingBase";
import { useB1B2Flow } from "./hooks/useB1B2Flow";
import { useF1F2Flow } from "./hooks/useF1F2Flow";
import { useCOSFlow } from "./hooks/useCOSFlow";
import { B1B2Renderer } from "./components/B1B2Renderer";
import { F1F2Renderer } from "./components/F1F2Renderer";
import { COSRenderer } from "./components/COSRenderer";
import { CASVSchedulingStep } from "./steps/visto-b1-b2/CASVSchedulingStep";
import { FeeProcessingStep } from "./steps/visto-b1-b2/FeeProcessingStep";
import { PaymentPendingStep } from "./steps/visto-b1-b2/PaymentPendingStep";
import { AwaitingInterviewStep } from "./steps/visto-b1-b2/AwaitingInterviewStep";
import { ProcessingStatusStep } from "./steps/visto-b1-b2/ProcessingStatusStep";
import { ReviewAndSignDS160Step } from "./steps/visto-b1-b2/ReviewAndSignDS160Step";
import { DS160ReviewModal } from "@/presentation/components/organisms/DS160ReviewModal";
import { cn } from "@/lib/utils";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { HistoryStep } from "./steps/HistoryStep";
import { ProcessStep } from "./steps/ProcessStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ChangeOfStatusOfficialFormsStep } from "./steps/ChangeOfStatus/ChangeOfStatusOfficialFormsStep";
import { ChangeOfStatusCoverLetterStep } from "./steps/ChangeOfStatus/ChangeOfStatusCoverLetterStep";

export default function Onboarding() {
  const base = useOnboardingBase();
  const b1b2 = useB1B2Flow(base);
  const f1f2 = useF1F2Flow(base);
  const cos = useCOSFlow(base);

  const {
    lang, t, o, serviceSlug, currentStep, setCurrentStep, loading, serviceStatus, orderNumber, 
    formMethods: { register, control, setValue, watch, trigger, formState: { errors } },
    formData, handleUpload, handleRemoveDoc, uploadedDocs, fileInputRef, setSelectedDoc, serviceId,
    securityData, hasConsularCredentials, requiresSelfie, setRequiresSelfie, uploadingSelfie, selfieFile, setSelfieFile, handleSelfieUpload, handleOpenDoc
  } = base;

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);

  const getFlowData = () => {
    if (serviceSlug === "visto-b1-b2") return b1b2;
    if (serviceSlug === "visa-f1f2") return f1f2;
    if (serviceSlug === "changeofstatus") return cos;
    return { 
      steps: o.steps[lang], 
      stepSlugs: ["personal", "history", "process", "documents", "review"],
      effectiveStep: currentStep,
      handleNext: async () => setCurrentStep(currentStep + 1)
    };
  };

  const { steps, stepSlugs, effectiveStep, handleNext } = getFlowData();
  const totalSteps = steps?.length || 1;
  const progress = Math.min(((effectiveStep + 1) / totalSteps) * 100, 100);

  const renderStep = () => {
    const commonProps = { register, o, lang, formData, t, setValue, watch, trigger, errors, serviceSlug, serviceStatus, securityData, control };
    const docProps = { ...commonProps, uploadedDocs, handleUpload, handleRemove: handleRemoveDoc, uploading: base.uploading, fileInputRef, setSelectedDoc, handleSkip: async () => setCurrentStep((s) => s + 1) };

    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && serviceStatus === "casvSchedulingPending") return <CASVSchedulingStep serviceId={serviceId!} onComplete={() => {}} />;
    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && serviceStatus === "casvFeeProcessing") return <FeeProcessingStep serviceId={serviceId!} hasConsularCredentials={hasConsularCredentials} onComplete={() => {}} />;
    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && serviceStatus === "casvPaymentPending") return <PaymentPendingStep serviceId={serviceId!} onComplete={() => {}} />;
    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && ["review_pending", "ds160Processing", "uploadsUnderReview"].includes(serviceStatus || "") && !uploadedDocs.some(d => d.status === "resubmit")) {
      return <ProcessingStatusStep status={serviceStatus!} serviceSlug={serviceSlug} />;
    }
    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && ["awaitingInterview", "approved", "rejected", "completed"].includes(serviceStatus || "")) {
      return <AwaitingInterviewStep serviceId={serviceId!} serviceStatus={serviceStatus!} serviceSlug={serviceSlug} />;
    }
    if ((serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") && ["ds160AwaitingReviewAndSignature", "ds160upload_documents", "review_assign"].includes(serviceStatus || "")) {
      return <ReviewAndSignDS160Step {...docProps} handleRemove={handleRemoveDoc} />;
    }
    if (serviceSlug === "changeofstatus" && serviceStatus === "COS_OFFICIAL_FORMS") return <ChangeOfStatusOfficialFormsStep {...docProps} serviceId={serviceId!} />;
    if (serviceSlug === "changeofstatus" && serviceStatus === "COS_COVER_LETTER_FORM") return <ChangeOfStatusCoverLetterStep {...commonProps} />;

    if (serviceSlug === "visto-b1-b2") return <B1B2Renderer effectiveStep={effectiveStep} commonProps={commonProps} docProps={docProps} />;
    if (serviceSlug === "visa-f1f2") return <F1F2Renderer effectiveStep={effectiveStep} commonProps={commonProps} docProps={docProps} />;
    if (serviceSlug === "changeofstatus") return <COSRenderer stepSlugs={stepSlugs} effectiveStep={effectiveStep} commonProps={commonProps} docProps={docProps} serviceId={serviceId!} />;

    switch (currentStep) {
      case 0: return <PersonalInfoStep {...commonProps} />;
      case 1: return <HistoryStep {...commonProps} />;
      case 2: return <ProcessStep {...commonProps} />;
      case 3: return <DocumentsStep {...docProps} />;
      case 4: return <ReviewStep {...commonProps} />;
      default: return null;
    }
  };

  const handleFinish = async () => {
    base.setIsFinishing(true);
    try {
        const processRepo = (await import("@/infrastructure/factories/processFactory")).getUserProcessRepository();
        let nextStatus = ["ds160upload_documents", "ds160AwaitingReviewAndSignature", "review_assign", "uploadsUnderReview"].includes(serviceStatus || "") ? "uploadsUnderReview" : "review_pending";
        if (serviceSlug === "changeofstatus") nextStatus = serviceStatus === "COS_OFFICIAL_FORMS" ? "COS_OFFICIAL_FORMS_REVIEW" : "COS_ADMIN_SCREENING";
        await processRepo.updateStatus(serviceId!, nextStatus, steps.length - 1);
        window.location.reload();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="pb-24 pt-4 md:pb-0 md:pt-0">
        <Skeleton className="h-8 w-48" /><Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-4 rounded-md border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-8" /></div>
          <Skeleton className="mt-3 h-2 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pb-0 md:pt-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-title font-bold text-foreground">{o.title[lang]}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-muted-foreground">{o.subtitle[lang]}</p>
                {serviceSlug && <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">{serviceSlug.replace("-", " ")}</span>}
                {orderNumber && <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">#{orderNumber}</span>}
              </div>
            </div>
          </header>

          <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png" onChange={(e) => base.selectedDoc && handleUpload(e, base.selectedDoc)} />

          <div className={cn("rounded-md", ["casvPaymentPending", "awaitingInterview"].includes(serviceStatus || "") ? "w-full" : "border border-border bg-card p-4 shadow-card md:p-4")}>
            {renderStep()}

            {!["casvSchedulingPending", "casvFeeProcessing", "casvPaymentPending", "awaitingInterview", "review_pending", "ds160Processing", "approved", "rejected", "completed", "COS_ADMIN_SCREENING", "COS_OFFICIAL_FORMS_REVIEW", "COS_COVER_LETTER_ADMIN_REVIEW", "COS_F1_I20_REVIEW", "COS_SEVIS_FEE_REVIEW", "COS_FINAL_FORMS_REVIEW"].includes(serviceStatus || "") && (
              <div className="mt-5 hidden justify-between md:flex">
                <Button variant="outline" disabled={effectiveStep === 0} onClick={() => setCurrentStep((s) => s - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> {o.previous[lang]}
                </Button>
                {currentStep < (steps?.length || 1) - 1 ? (
                  <Button className="bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleNext}>
                    {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleFinish}>{o.confirmGenerate[lang]}</Button>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-md border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{o.stepLabel[lang]} {effectiveStep + 1} {o.stepOf[lang]} {steps.length}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
            <div className="mt-4 flex flex-wrap gap-2 lg:flex-nowrap lg:flex-col lg:items-stretch lg:gap-3">
                {steps.map((step: string, i: number) => (
                <button
                    key={i}
                    onClick={() => i <= effectiveStep && setCurrentStep(i)}
                    disabled={i > effectiveStep}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-all ring-1",
                        i === effectiveStep ? "bg-accent/10 text-accent ring-accent/20" : i < effectiveStep ? "text-foreground ring-transparent hover:bg-muted" : "cursor-not-allowed text-muted-foreground opacity-50 ring-transparent"
                    )}
                >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {i < effectiveStep ? <CheckCircle2 className="h-4 w-4 text-accent" /> : i === effectiveStep ? <div className="h-2 w-2 rounded-full bg-accent animate-pulse" /> : <Circle className="h-4 w-4 text-muted-foreground/30" />}
                    </div>
                    <span className="truncate">{step}</span>
                </button>
                ))}
            </div>
            {["visto-b1-b2", "visa-f1f2"].includes(serviceSlug || "") && (
                <div className="text-center py-2 mt-4 border-t border-border flex flex-col gap-2">
                    <Button onClick={() => setIsPreviewModalOpen(true)} variant="outline" className="w-full gap-2 border-accent/20 text-accent text-xs font-bold">
                        <FileText className="w-4 h-4" /> {o.viewMyDS160[lang]}
                    </Button>
                    {(serviceStatus !== "active" && serviceStatus !== "ds160InProgress") && uploadedDocs.length > 0 && (
                      <Button onClick={() => setIsViewDocsModalOpen(true)} variant="outline" className="w-full gap-2 border-primary/20 text-primary text-xs font-bold">
                        <Eye className="w-4 h-4" /> {o.viewDocuments[lang]}
                      </Button>
                    )}
                </div>
            )}
          </div>
        </aside>
      </div>

      <DS160ReviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} serviceId={serviceId || ""} lang={lang} />
      
      <Dialog open={isViewDocsModalOpen} onOpenChange={setIsViewDocsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{o.submittedDocs[lang]}</DialogTitle><DialogDescription>{o.viewSubmittedDocs[lang]}</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {uploadedDocs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{o.noDocsFound[lang]}</p> : 
              uploadedDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                  <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-accent" /><span className="text-sm font-medium pr-4 break-all">{doc.name.replace(/_/g, " ").toUpperCase()}</span></div>
                  <Button size="sm" variant="outline" onClick={() => handleOpenDoc(doc)} disabled={doc.path === "pending..."}><Eye className="w-4 h-4 mr-2" />{o.open[lang]}</Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={requiresSelfie} onOpenChange={setRequiresSelfie}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-subtitle font-bold"><Camera className="w-5 h-5 text-primary" />{o.identityVerification[lang]}</DialogTitle><DialogDescription>{o.selfieInstructions[lang]}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed border-border h-40 relative">
              {selfieFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"><CheckSquare className="w-10 h-10 text-primary" /></div>
                  <p className="text-sm font-bold text-foreground">{selfieFile.name}</p>
                  <button onClick={() => setSelfieFile(null)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">{o.remove[lang]}</button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center"><Upload className="w-8 h-8 text-primary/40" /></div>
                  <div className="space-y-1"><p className="text-sm font-bold text-foreground">{o.selectSelfie[lang]}</p><p className="text-[10px] text-muted-foreground uppercase">JPG, PNG {o.or[lang]} JPEG</p></div>
                  <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
            <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12" disabled={!selfieFile || uploadingSelfie} onClick={handleSelfieUpload}>
              {uploadingSelfie ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{o.uploading[lang]}</> : <><CheckCircle2 className="mr-2 h-4 w-4" />{lang === "pt" ? "Concluir" : "Finish"}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
