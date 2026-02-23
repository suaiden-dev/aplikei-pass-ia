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

export default function Onboarding() {
    const {
        lang, t, o, steps,
        currentStep, setCurrentStep,
        loading,
        register, formData,
        handleNext, handleFinish,
        uploading, uploadedDocs, fileInputRef,
        handleUpload, handleRemoveDoc, selectedDoc, setSelectedDoc
    } = useOnboardingLogic();

    const progress = ((currentStep + 1) / steps.length) * 100;

    const renderStep = () => {
        const commonProps = { register, o, lang, formData, t };

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
            <h1 className="font-display text-2xl font-bold text-foreground">{o.title[lang]}</h1>
            <p className="mt-1 text-muted-foreground">{o.subtitle[lang]}</p>

            {/* Progress & Steps Indicator */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{lang === "en" ? "Step" : lang === "pt" ? "Etapa" : "Paso"} {currentStep + 1} {o.stepOf[lang]} {steps.length}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="mt-3 h-2" />

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0">
                    {steps.map((step: string, i: number) => (
                        <button
                            key={i}
                            onClick={() => i <= currentStep ? setCurrentStep(i) : null}
                            disabled={i > currentStep}
                            className={`flex min-w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${i === currentStep
                                ? "bg-accent/10 text-accent"
                                : i < currentStep
                                    ? "bg-muted text-foreground hover:bg-muted/80"
                                    : "text-muted-foreground opacity-50 cursor-not-allowed"
                                }`}
                        >
                            {i < currentStep ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <Circle className="h-3.5 w-3.5" />}
                            {step}
                        </button>
                    ))}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => selectedDoc && handleUpload(e, selectedDoc)}
            />

            {/* Step Content */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6">
                {renderStep()}

                {/* Desktop Buttons */}
                <div className="mt-8 hidden justify-between md:flex">
                    <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> {o.previous[lang]}
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button className="bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleNext}>
                            {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleFinish}>
                            {o.confirmGenerate[lang]}
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Sticky Buttons */}
            <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-background p-4 md:hidden">
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" disabled={currentStep === 0} onClick={() => setCurrentStep((s) => s - 1)}>
                        <ChevronLeft className="mr-1 h-4 w-4" /> {o.previous[lang]}
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button className="flex-1 bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleNext}>
                            {o.next[lang]} <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="flex-1 bg-accent text-accent-foreground hover:bg-green-dark" onClick={handleFinish}>{o.confirmGenerate[lang]}</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
