import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  FileText,
  Shield,
  Fingerprint,
  Calendar,
  User,
  Eye,
  Clock,
  Camera,
  Upload,
  Loader2,
  CheckSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useOnboardingLogic } from "./useOnboardingLogic";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { HistoryStep } from "./steps/HistoryStep";
import { ProcessStep } from "./steps/ProcessStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { PersonalInfo1Step } from "./steps/visto-b1-b2/PersonalInfo1Step";
import { PersonalInfo2Step } from "./steps/visto-b1-b2/PersonalInfo2Step";
import { TravelInfoStep } from "./steps/visto-b1-b2/TravelInfoStep";
import { CompanionsStep } from "./steps/visto-b1-b2/CompanionsStep";
import { PreviousTravelStep } from "./steps/visto-b1-b2/PreviousTravelStep";
import { AddressPhoneStep } from "./steps/visto-b1-b2/AddressPhoneStep";
import { SocialMediaStep } from "./steps/visto-b1-b2/SocialMediaStep";
import { PassportStep } from "./steps/visto-b1-b2/PassportStep";
import { USContactStep } from "./steps/visto-b1-b2/USContactStep";
import { FamilyInfoStep } from "./steps/visto-b1-b2/FamilyInfoStep";
import { WorkEducationStep } from "./steps/visto-b1-b2/WorkEducationStep";
import { AdditionalInfoStep } from "./steps/visto-b1-b2/AdditionalInfoStep";
import { ReviewAndSignDS160Step } from "./steps/visto-b1-b2/ReviewAndSignDS160Step";
import { CASVSchedulingStep } from "./steps/visto-b1-b2/CASVSchedulingStep";
import { FeeProcessingStep } from "./steps/visto-b1-b2/FeeProcessingStep";
import { PaymentPendingStep } from "./steps/visto-b1-b2/PaymentPendingStep";
import { AwaitingInterviewStep } from "./steps/visto-b1-b2/AwaitingInterviewStep";
import { DS160ReviewModal } from "./components/DS160ReviewModal";
import { ProcessingStatusStep } from "./steps/visto-b1-b2/ProcessingStatusStep";

export default function Onboarding() {
  const {
    lang,
    t,
    o,
    steps,
    serviceSlug,
    currentStep,
    setCurrentStep,
    loading,
    serviceStatus,
    orderNumber,
    register,
    formData,
    setValue,
    watch,
    errors,
    handleNext,
    handleFinish,
    handleSkip,
    uploading,
    uploadedDocs,
    fileInputRef,
    handleUpload,
    handleRemoveDoc,
    selectedDoc,
    setSelectedDoc,
    pendingFiles,
    serviceId,
    securityData,
    hasConsularCredentials,
    requiresSelfie,
    setRequiresSelfie,
    uploadingSelfie,
    selfieFile,
    setSelfieFile,
    handleSelfieUpload,
  } = useOnboardingLogic();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);

  const handleOpenDoc = async (doc: {
    name: string;
    path: string;
    bucket_id?: string;
  }) => {
    if (doc.path === "pending...") return;
    try {
      const { data, error } = await supabase.storage
        .from(doc.bucket_id || "process-documents")
        .createSignedUrl(doc.path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      toast.error(o.errorOpeningDoc[lang]);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    const commonProps = {
      register,
      o,
      lang,
      formData,
      t,
      setValue,
      watch,
      errors,
      serviceSlug,
      serviceStatus,
      securityData,
    };

    if (
      serviceSlug === "visto-b1-b2" &&
      serviceStatus === "casvSchedulingPending"
    ) {
      return (
        <CASVSchedulingStep
          serviceId={serviceId}
          onComplete={() => {
            // Success logic if needed, reload is handled inside component
          }}
        />
      );
    }

    if (
      serviceSlug === "visto-b1-b2" &&
      serviceStatus === "casvFeeProcessing"
    ) {
      return (
        <FeeProcessingStep
          serviceId={serviceId}
          hasConsularCredentials={hasConsularCredentials}
          onComplete={() => {
            // Success logic if needed
          }}
        />
      );
    }

    if (
      serviceSlug === "visto-b1-b2" &&
      serviceStatus === "casvPaymentPending"
    ) {
      return (
        <PaymentPendingStep
          serviceId={serviceId}
          onComplete={() => {
            // Success logic if needed
          }}
        />
      );
    }

    if (
      serviceSlug === "visto-b1-b2" &&
      (serviceStatus === "review_pending" ||
        serviceStatus === "ds160Processing" ||
        serviceStatus === "uploadsUnderReview")
    ) {
      return <ProcessingStatusStep status={serviceStatus} />;
    }

    if (
      serviceSlug === "visto-b1-b2" &&
      (serviceStatus === "awaitingInterview" ||
        serviceStatus === "approved" ||
        serviceStatus === "rejected" ||
        serviceStatus === "completed")
    ) {
      return (
        <AwaitingInterviewStep
          serviceId={serviceId}
          serviceStatus={serviceStatus}
        />
      );
    }

    if (
      serviceSlug === "visto-b1-b2" &&
      (serviceStatus === "ds160AwaitingReviewAndSignature" ||
        serviceStatus === "ds160upload_documents" ||
        serviceStatus === "review_assign")
    ) {
      return (
        <ReviewAndSignDS160Step
          uploadedDocs={uploadedDocs}
          handleUpload={handleUpload}
          handleRemove={handleRemoveDoc}
          uploading={uploading}
          fileInputRef={fileInputRef}
          setSelectedDoc={setSelectedDoc}
          securityData={securityData}
          lang={lang}
          t={t}
        />
      );
    }

    if (serviceSlug === "visto-b1-b2") {
      switch (currentStep) {
        case 0:
          return <PersonalInfo1Step {...commonProps} />;
        case 1:
          return <PersonalInfo2Step {...commonProps} />;
        case 2:
          return <TravelInfoStep {...commonProps} />;
        case 3:
          return <CompanionsStep {...commonProps} />;
        case 4:
          return <PreviousTravelStep {...commonProps} />;
        case 5:
          return <AddressPhoneStep {...commonProps} />;
        case 6:
          return <SocialMediaStep {...commonProps} />;
        case 7:
          return <PassportStep {...commonProps} />;
        case 8:
          return <USContactStep {...commonProps} />;
        case 9:
          return <FamilyInfoStep {...commonProps} />;
        case 10:
          return <WorkEducationStep {...commonProps} />;
        case 11:
          return <AdditionalInfoStep {...commonProps} />;
        case 12:
          return (
            <DocumentsStep
              {...commonProps}
              uploadedDocs={uploadedDocs}
              handleUpload={handleUpload}
              handleRemove={handleRemoveDoc}
              uploading={uploading}
              fileInputRef={fileInputRef}
              setSelectedDoc={setSelectedDoc}
              handleSkip={handleSkip}
              serviceSlug={serviceSlug}
            />
          );
        case 13:
          return <ReviewStep {...commonProps} />;
        default:
          return null;
      }
    }

    switch (currentStep) {
      case 0:
        return <PersonalInfoStep {...commonProps} />;
      case 1:
        return <HistoryStep {...commonProps} />;
      case 2:
        return <ProcessStep {...commonProps} />;
      case 3:
        return (
          <DocumentsStep
            {...commonProps}
            uploadedDocs={uploadedDocs}
            handleUpload={handleUpload}
            handleRemove={handleRemoveDoc}
            uploading={uploading}
            fileInputRef={fileInputRef}
            setSelectedDoc={setSelectedDoc}
            handleSkip={handleSkip}
            serviceSlug={serviceSlug}
          />
        );
      case 4:
        return <ReviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="pb-24 pt-4 md:pb-0 md:pt-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />

        <div className="mt-4 rounded-md border border-border bg-card p-4 shadow-card md:p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="mt-3 h-2 w-full" />
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-md border border-border bg-card p-4 shadow-card md:p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="mt-5 flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pb-0 md:pt-0">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main Content (Left Column on Desktop) */}
        <div className="space-y-4">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-title font-bold text-foreground">
                {o.title[lang]}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-muted-foreground">{o.subtitle[lang]}</p>
                {serviceSlug && (
                  <>
                    <span className="text-muted-foreground hidden md:inline">
                      •
                    </span>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">
                      {serviceSlug.replace("-", " ")}
                    </span>
                  </>
                )}
                {orderNumber && (
                  <>
                    <span className="text-muted-foreground hidden md:inline">
                      •
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      #{orderNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </header>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => selectedDoc && handleUpload(e, selectedDoc)}
          />

          {/* Step Content */}
          <div className="rounded-md border border-border bg-card p-4 shadow-card md:p-4">
            {renderStep()}

            {/* Desktop Buttons - Hide if in post-scheduling stages */}
            {serviceStatus !== "casvSchedulingPending" &&
              serviceStatus !== "casvFeeProcessing" &&
              serviceStatus !== "casvPaymentPending" &&
              serviceStatus !== "awaitingInterview" &&
              serviceStatus !== "review_pending" &&
              serviceStatus !== "ds160Processing" &&
              serviceStatus !== "approved" &&
              serviceStatus !== "rejected" &&
              serviceStatus !== "completed" && (
                <div className="mt-5 hidden justify-between md:flex">
                  <Button
                    variant="outline"
                    disabled={
                      currentStep === 0 ||
                      serviceStatus === "ds160AwaitingReviewAndSignature" ||
                      serviceStatus === "ds160upload_documents" ||
                      serviceStatus === "review_assign" ||
                      serviceStatus === "uploadsUnderReview"
                    }
                    onClick={() => setCurrentStep((s) => s - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> {o.previous[lang]}
                  </Button>
                  {currentStep < steps.length - 1 &&
                  !(
                    serviceStatus === "ds160AwaitingReviewAndSignature" ||
                    serviceStatus === "ds160upload_documents" ||
                    serviceStatus === "review_assign" ||
                    serviceStatus === "uploadsUnderReview"
                  ) ? (
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-green-dark"
                      onClick={handleNext}
                    >
                      {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-green-dark"
                      onClick={handleFinish}
                      disabled={
                        serviceStatus === "review_pending" ||
                        serviceStatus === "ds160Processing" ||
                        serviceStatus === "completed" ||
                        ((serviceStatus === "ds160AwaitingReviewAndSignature" ||
                          serviceStatus === "ds160upload_documents" ||
                          serviceStatus === "review_assign") &&
                          ((!uploadedDocs.some(
                            (d) => d.name === "ds160_assinada",
                          ) &&
                            !pendingFiles["ds160_assinada"]) ||
                            (!uploadedDocs.some(
                              (d) => d.name === "ds160_comprovante",
                            ) &&
                              !pendingFiles["ds160_comprovante"])))
                      }
                    >
                      {serviceStatus === "review_pending" ||
                      serviceStatus === "ds160Processing"
                        ? o.processing[lang]
                        : serviceStatus === "review_assign" ||
                            serviceStatus === "ds160upload_documents" ||
                            serviceStatus === "ds160AwaitingReviewAndSignature"
                          ? o.submitDocs[lang]
                          : serviceStatus === "uploadsUnderReview" ||
                              serviceStatus ===
                                "ds160AwaitingReviewAndSignature"
                            ? o.docsUnderReview[lang]
                            : serviceStatus === "completed" ||
                                serviceStatus === "approved" ||
                                serviceStatus === "rejected"
                              ? o.completed[lang]
                              : o.confirmGenerate[lang]}
                    </Button>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Sidebar (Right Column on Desktop) */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
          {/* Progress & Steps Indicator */}
          <div className="rounded-md border border-border bg-card p-4 shadow-card md:p-4">
            {serviceSlug !== "visto-b1-b2" && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {o.stepLabel[lang]}{" "}
                    {currentStep + 1} {o.stepOf[lang]} {steps.length}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="mt-3 h-2" />

                <div className="mt-4 flex flex-wrap gap-2 lg:flex-nowrap lg:flex-col lg:items-stretch lg:gap-3">
                  {steps.map((step: string, i: number) => (
                    <button
                      key={i}
                      onClick={() =>
                        i <= currentStep ? setCurrentStep(i) : null
                      }
                      disabled={i > currentStep}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-all ring-1 ${
                        i === currentStep
                          ? "bg-accent/10 text-accent ring-accent/20"
                          : i < currentStep
                            ? "text-foreground ring-transparent hover:bg-muted"
                            : "cursor-not-allowed text-muted-foreground opacity-50 ring-transparent"
                      }`}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {i < currentStep ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : i === currentStep ? (
                          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                      <span className="truncate">{step}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {serviceSlug === "visto-b1-b2" ? (
              <div className="text-center py-2">
                <p className="text-xs font-bold text-accent uppercase tracking-widest">
                  {o.ds160Form[lang]}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground bg-muted/30 p-3 rounded-md border border-dashed border-border mb-4">
                
                </div>

                <Button
                  onClick={() => setIsPreviewModalOpen(true)}
                  variant="outline"
                  className="w-full gap-2 border-accent/20 text-accent hover:bg-accent/5 hover:text-accent font-bold text-xs"
                >
                  <FileText className="w-4 h-4" />
                  {o.viewMyDS160[lang]}
                </Button>

                {(serviceStatus === "review_pending" ||
                  serviceStatus === "ds160Processing" ||
                  serviceStatus === "uploadsUnderReview" ||
                  serviceStatus === "ds160AwaitingReviewAndSignature" ||
                  serviceStatus === "completed" ||
                  serviceStatus === "approved" ||
                  serviceStatus === "rejected" ||
                  serviceStatus === "awaitingInterview" ||
                  serviceStatus === "casvSchedulingPending" ||
                  serviceStatus === "casvFeeProcessing" ||
                  serviceStatus === "casvPaymentPending") &&
                  uploadedDocs.length > 0 && (
                    <Button
                      onClick={() => setIsViewDocsModalOpen(true)}
                      variant="outline"
                      className="w-full mt-3 gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-bold text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      {o.viewDocuments[lang]}
                    </Button>
                  )}
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <DS160ReviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        serviceId={serviceId || ""}
        lang={lang}
      />

      <Dialog open={isViewDocsModalOpen} onOpenChange={setIsViewDocsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {o.submittedDocs[lang]}
            </DialogTitle>
            <DialogDescription>
              {o.viewSubmittedDocs[lang]}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            {uploadedDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {o.noDocsFound[lang]}
              </p>
            ) : (
              uploadedDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium pr-4 break-all">
                      {doc.name.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDoc(doc)}
                    disabled={doc.path === "pending..."}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {o.open[lang]}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={requiresSelfie} onOpenChange={setRequiresSelfie}>
        <DialogContent
          className="sm:max-w-[450px] rounded-3xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-subtitle font-bold">
              <Camera className="w-5 h-5 text-primary" />
              {o.identityVerification[lang]}
            </DialogTitle>
            <DialogDescription>
              {o.selfieInstructions[lang]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900 rounded-md border border-dashed border-border group relative overflow-hidden">
              {selfieFile ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {selfieFile.name}
                  </p>
                  <button
                    onClick={() => setSelfieFile(null)}
                    className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                  >
                    {o.remove[lang]}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {o.selectSelfie[lang]}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      JPG, PNG {o.or[lang]} JPEG
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-md shadow-lg shadow-primary/20"
              disabled={!selfieFile || uploadingSelfie}
              onClick={handleSelfieUpload}
            >
              {uploadingSelfie ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {o.uploading[lang]}
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  {o.uploadSelfie[lang]}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Sticky Buttons - Hide if in post-scheduling stages */}
      {serviceStatus !== "casvSchedulingPending" &&
        serviceStatus !== "casvFeeProcessing" &&
        serviceStatus !== "casvPaymentPending" &&
        serviceStatus !== "awaitingInterview" &&
        serviceStatus !== "review_pending" &&
        serviceStatus !== "ds160Processing" &&
        serviceStatus !== "approved" &&
        serviceStatus !== "rejected" &&
        serviceStatus !== "completed" && (
          <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-background p-4 md:hidden">
            <div className="flex gap-3">
              {!(
                serviceStatus === "ds160AwaitingReviewAndSignature" ||
                serviceStatus === "ds160upload_documents" ||
                serviceStatus === "review_assign" ||
                serviceStatus === "uploadsUnderReview"
              ) && (
                <Button
                  variant="outline"
                  className="flex-1 whitespace-normal h-auto py-2 min-h-10"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => s - 1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4 shrink-0" /> {o.previous[lang]}
                </Button>
              )}
              {currentStep < steps.length - 1 &&
              !(
                serviceStatus === "ds160AwaitingReviewAndSignature" ||
                serviceStatus === "ds160upload_documents" ||
                serviceStatus === "review_assign" ||
                serviceStatus === "uploadsUnderReview"
              ) ? (
                <Button
                  className="flex-1 bg-accent text-accent-foreground hover:bg-green-dark whitespace-normal h-auto py-2 min-h-10"
                  onClick={handleNext}
                >
                  {o.next[lang]} <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              ) : (
                <Button
                  className="flex-[2] bg-accent text-accent-foreground hover:bg-green-dark whitespace-normal h-auto py-2 min-h-10"
                  onClick={handleFinish}
                  disabled={
                    serviceStatus === "review_pending" ||
                    serviceStatus === "ds160Processing" ||
                    serviceStatus === "completed" ||
                    ((serviceStatus === "ds160AwaitingReviewAndSignature" ||
                      serviceStatus === "ds160upload_documents" ||
                      serviceStatus === "review_assign") &&
                      (!uploadedDocs.some((d) => d.name === "ds160_assinada") ||
                        !uploadedDocs.some(
                          (d) => d.name === "ds160_comprovante",
                        )))
                  }
                >
                  {serviceStatus === "review_pending" ||
                  serviceStatus === "ds160Processing"
                    ? o.processing[lang]
                    : serviceStatus === "review_assign" ||
                        serviceStatus === "ds160upload_documents" ||
                        serviceStatus === "ds160AwaitingReviewAndSignature"
                      ? o.submitDocs[lang]
                      : serviceStatus === "uploadsUnderReview"
                        ? o.docsUnderReview[lang]
                        : serviceStatus === "completed"
                          ? o.completed[lang]
                          : o.confirmGenerate[lang]}
                </Button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
