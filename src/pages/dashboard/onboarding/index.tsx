import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft } from "lucide-react";
import { useOnboardingLogic } from "./useOnboardingLogic";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { HistoryStep } from "./steps/HistoryStep";
import { ProcessStep } from "./steps/ProcessStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { ReviewStep } from "./steps/ReviewStep";

// DS-160 Steps
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
  } = useOnboardingLogic();

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
    };

    if (
      serviceSlug === "visto-b1-b2" &&
      (serviceStatus === "ds160AwaitingReviewAndSignature" ||
        serviceStatus === "review_assign" ||
        serviceStatus === "uploadsUnderReview")
    ) {
      return (
        <ReviewAndSignDS160Step
          uploadedDocs={uploadedDocs}
          handleUpload={handleUpload}
          handleRemove={handleRemoveDoc}
          uploading={uploading}
          fileInputRef={fileInputRef}
          setSelectedDoc={setSelectedDoc}
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

        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
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

        <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 md:pb-0 md:pt-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Content (Left Column on Desktop) */}
        <div className="space-y-6">
          <header>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {o.title[lang]}
            </h1>
            <p className="mt-1 text-muted-foreground">{o.subtitle[lang]}</p>
          </header>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => selectedDoc && handleUpload(e, selectedDoc)}
          />

          {/* Step Content */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
            {renderStep()}

            {/* Desktop Buttons */}
            <div className="mt-8 hidden justify-between md:flex">
              <Button
                variant="outline"
                disabled={
                  currentStep === 0 ||
                  serviceStatus === "ds160AwaitingReviewAndSignature" ||
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
                      serviceStatus === "review_assign") &&
                      (!uploadedDocs.some((d) => d.name === "ds160_assinada") ||
                        !uploadedDocs.some(
                          (d) => d.name === "ds160_comprovante",
                        )))
                  }
                >
                  {serviceStatus === "review_pending" ||
                  serviceStatus === "ds160Processing"
                    ? lang === "pt"
                      ? "Processando..."
                      : "Processing..."
                    : serviceStatus === "review_assign" ||
                        serviceStatus === "ds160AwaitingReviewAndSignature"
                      ? lang === "pt"
                        ? "Enviar Documentos"
                        : "Submit Documents"
                      : serviceStatus === "uploadsUnderReview"
                        ? lang === "pt"
                          ? "Documentos em Análise..."
                          : "Documents under review..."
                        : serviceStatus === "completed"
                          ? lang === "pt"
                            ? "Concluído"
                            : "Completed"
                          : o.confirmGenerate[lang]}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column on Desktop) */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          {/* Progress & Steps Indicator */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {lang === "en" ? "Step" : lang === "pt" ? "Etapa" : "Paso"}{" "}
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
                  onClick={() => (i <= currentStep ? setCurrentStep(i) : null)}
                  disabled={i > currentStep}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ring-1 ${
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
          </div>
        </aside>
      </div>

      {/* Mobile Sticky Buttons */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-background p-4 md:hidden">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={
              currentStep === 0 ||
              serviceStatus === "ds160AwaitingReviewAndSignature" ||
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
            serviceStatus === "review_assign" ||
            serviceStatus === "uploadsUnderReview"
          ) ? (
            <Button
              className="flex-1 bg-accent text-accent-foreground hover:bg-green-dark"
              onClick={handleNext}
            >
              {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-accent text-accent-foreground hover:bg-green-dark"
              onClick={handleFinish}
              disabled={
                serviceStatus === "review_pending" ||
                serviceStatus === "ds160Processing" ||
                serviceStatus === "completed" ||
                ((serviceStatus === "ds160AwaitingReviewAndSignature" ||
                  serviceStatus === "review_assign") &&
                  (!uploadedDocs.some((d) => d.name === "ds160_assinada") ||
                    !uploadedDocs.some((d) => d.name === "ds160_comprovante")))
              }
            >
              {serviceStatus === "review_pending" ||
              serviceStatus === "ds160Processing"
                ? lang === "pt"
                  ? "Processando..."
                  : "Processing..."
                : serviceStatus === "review_assign" ||
                    serviceStatus === "ds160AwaitingReviewAndSignature"
                  ? lang === "pt"
                    ? "Enviar Documentos"
                    : "Submit Documents"
                  : serviceStatus === "uploadsUnderReview"
                    ? lang === "pt"
                      ? "Documentos em Análise..."
                      : "Documents under review..."
                    : serviceStatus === "completed"
                      ? lang === "pt"
                        ? "Concluído"
                        : "Completed"
                      : o.confirmGenerate[lang]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
