import React, { useState } from "react";
import { UploadedDocument } from "../../types";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Fingerprint,
  Calendar,
  User,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import firstPhaseImg from "@/assets/application_tutorial/first_phase.png";
import secondPhaseImg from "@/assets/application_tutorial/second_phase.png";
import thirdPhaseImg from "@/assets/application_tutorial/three_phase.png";

interface ReviewAndSignDS160StepProps {
  uploadedDocs: UploadedDocument[];
  handleUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    docName: string,
  ) => Promise<void>;
  handleRemove: (docName: string) => Promise<void>;
  uploading: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedDoc: (docName: string) => void;
  securityData?: {
    appId: string | null;
    dob: string | null;
    grandma: string | null;
  } | null;
  lang: string;
  t: any;
}

export function ReviewAndSignDS160Step({
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  securityData,
  lang,
  t,
}: ReviewAndSignDS160StepProps) {
  const rs = t.onboardingPage.reviewAndSign;

  const requiredDocs = [
    {
      id: "ds160_assinada",
      title: rs.requiredDocs.ds160_assinada.title[lang],
      description: rs.requiredDocs.ds160_assinada.description[lang],
    },
    {
      id: "ds160_comprovante",
      title: rs.requiredDocs.ds160_comprovante.title[lang],
      description: rs.requiredDocs.ds160_comprovante.description[lang],
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleCopy = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(rs.copied[lang]);
  };

  const tutorialSteps = [
    {
      title: rs.tutorialSteps[0].title[lang],
      desc: rs.tutorialSteps[0].desc[lang],
      img: firstPhaseImg,
    },
    {
      title: rs.tutorialSteps[1].title[lang],
      desc: rs.tutorialSteps[1].desc[lang],
      img: secondPhaseImg,
    },
    {
      title: rs.tutorialSteps[2].title[lang],
      desc: rs.tutorialSteps[2].desc[lang],
      img: thirdPhaseImg,
    },
    {
      title: rs.tutorialSteps[3].title[lang],
      desc: rs.tutorialSteps[3].desc[lang],
      img: undefined,
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-title font-bold font-display text-foreground">
          {rs.tutorialTitle[lang]}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {rs.tutorialSubtitle[lang]}
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        {/* Timeline Header */}
        <div className="bg-muted/30 p-4 pb-8 md:p-6 md:pb-12 border-b border-border">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            {/* Base Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(activeStep / (tutorialSteps.length - 1)) * 100}%`,
              }}
            />

            {tutorialSteps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="relative z-10 flex flex-col items-center group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 shadow-sm ${
                    i <= activeStep
                      ? "bg-accent border-accent text-white"
                      : "bg-background border-border text-muted-foreground group-hover:border-accent/40"
                  }`}
                >
                  {i < activeStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap transition-colors duration-300 ${
                    i === activeStep ? "text-accent" : "text-muted-foreground"
                  } hidden md:block`}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Display */}
          <div className="relative aspect-video lg:aspect-auto h-64 lg:h-[400px] overflow-hidden bg-slate-100 border-b lg:border-b-0 lg:border-r border-border flex items-center justify-center">
            {tutorialSteps[activeStep].img ? (
              <img
                src={tutorialSteps[activeStep].img}
                alt={tutorialSteps[activeStep].title}
                className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
              />
            ) : (
              <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-title font-bold text-foreground mb-2">
                  {lang === 'pt' ? 'Quase lá!' : lang === 'es' ? '¡Casi allí!' : 'Almost there!'}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {lang === 'pt' ? 'Role a página para baixo e faça o upload dos documentos solicitados.' : lang === 'es' ? 'Desplácese hacia abajo y suba los documentos solicitados.' : 'Scroll down and upload the requested documents.'}
                </p>
              </div>
            )}
          </div>

          {/* Description & Navigation */}
          <div className="p-5 flex flex-col justify-center text-center sm:text-left">
            <div className="space-y-4 mb-5">
              <div className="flex justify-center sm:justify-start">
                <Badge className="bg-accent/10 text-accent border-none font-bold uppercase tracking-wider text-[10px] py-1 px-3">
                  {rs.stepLabel[lang]} {activeStep + 1} {rs.of[lang]} {tutorialSteps.length}
                </Badge>
              </div>
              <h3 className="text-title font-bold text-foreground">
                {tutorialSteps[activeStep].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {tutorialSteps[activeStep].desc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="rounded-md border-border hover:bg-muted font-bold text-xs w-full sm:w-auto justify-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1 hidden sm:inline-block" />
                {rs.previous[lang]}
              </Button>
              <Button
                size="sm"
                disabled={activeStep === tutorialSteps.length - 1}
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="bg-accent hover:bg-green-dark text-white rounded-md shadow-lg shadow-accent/20 font-bold text-xs px-4 w-full sm:w-auto justify-center"
              >
                {rs.nextStep[lang]}
                <ChevronRight className="w-4 h-4 ml-1 hidden sm:inline-block" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {securityData && (
        <div className="mt-5 space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-subtitle font-bold text-primary mb-2">
            <Shield className="w-6 h-6 text-accent" />
            {rs.securityDataTitle[lang]}
          </div>
          <p className="text-muted-foreground text-sm">
            {rs.securityDataSubtitle[lang]}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-md border border-border flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Fingerprint className="w-4 h-4 text-accent" />
                  Application ID
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-transparent"
                  onClick={() => handleCopy(securityData.appId)}
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
                </Button>
              </div>
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-md text-center">
                {securityData.appId}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-md border border-border flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  {rs.birthDate[lang]}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-transparent"
                  onClick={() => handleCopy(securityData.dob)}
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
                </Button>
              </div>
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-md text-center">
                {securityData.dob}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-md border border-border flex flex-col justify-between shadow-sm lg:col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="w-4 h-4 text-accent" />
                  {rs.grandmaName[lang]}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-transparent"
                  onClick={() => handleCopy(securityData.grandma)}
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
                </Button>
              </div>
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-md text-center">
                {securityData.grandma}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-accent/5 border border-accent/20 rounded-md p-4 space-y-4">
        <h3 className="font-bold text-base md:text-lg text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
          <span className="truncate">
            {rs.documentUploadTitle[lang]}
          </span>
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {requiredDocs.map((doc) => {
            const isUploaded = uploadedDocs.some((d) => d.name === doc.id);
            const isUploading = uploading === doc.id;

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-md border-2 transition-all ${
                  isUploaded
                    ? "border-green-500 bg-green-500/5"
                    : isUploading
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <h4 className="font-bold text-sm">{doc.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 h-8">
                  {doc.description}
                </p>

                {isUploaded ? (
                  <button
                    onClick={() => handleRemove(doc.id)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 rounded-md transition-colors border border-red-200 dark:border-red-900/30"
                  >
                    <X className="w-4 h-4" />
                    {rs.remove[lang]}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDoc(doc.id);
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-md transition-colors disabled:opacity-50 border border-accent/20"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading
                      ? rs.uploading[lang]
                      : rs.uploadFile[lang]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
