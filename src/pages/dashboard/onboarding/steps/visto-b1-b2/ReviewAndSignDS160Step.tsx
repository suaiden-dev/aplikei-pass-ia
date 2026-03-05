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
}

export function ReviewAndSignDS160Step({
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  securityData,
}: ReviewAndSignDS160StepProps) {
  const { lang } = useLanguage();

  const requiredDocs = [
    {
      id: "ds160_assinada",
      title: lang === "pt" ? "DS-160 Assinada" : "Signed DS-160",
      description:
        lang === "pt"
          ? "Faça o upload do formulário DS-160 assinado."
          : "Upload the signed DS-160 form.",
    },
    {
      id: "ds160_comprovante",
      title: lang === "pt" ? "Comprovante DS-160" : "DS-160 Confirmation",
      description:
        lang === "pt"
          ? "Faça o upload do comprovante de envio."
          : "Upload the submission confirmation.",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleCopy = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(lang === "pt" ? "Copiado!" : "Copied!");
  };

  const tutorialSteps = [
    {
      title: lang === "pt" ? "Acesse o Portal" : "Access the Portal",
      desc:
        lang === "pt"
          ? "Use seu Application ID e dados de segurança para entrar no portal consular."
          : "Use your Application ID and security data to log in to the consular portal.",
      img: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c205?q=80&w=800&h=450&auto=format&fit=crop",
    },
    {
      title: lang === "pt" ? "Revise as Informações" : "Review Information",
      desc:
        lang === "pt"
          ? "Confira detalhadamente cada seção do formulário preenchido por nossa equipe."
          : "Carefully check each section of the form filled out by our team.",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&h=450&auto=format&fit=crop",
    },
    {
      title: lang === "pt" ? "Assine Digitalmente" : "Sign Digitally",
      desc:
        lang === "pt"
          ? "Role até o final, confirme sua identidade e realize a assinatura digital."
          : "Scroll to the end, confirm your identity, and complete the digital signature.",
      img: "https://images.unsplash.com/photo-1554224155-169641357599?q=80&w=800&h=450&auto=format&fit=crop",
    },
    {
      title: lang === "pt" ? "Baixe a Confirmação" : "Download Confirmation",
      desc:
        lang === "pt"
          ? "Salve o formulário completo e a página de confirmação com código de barras."
          : "Save the complete form and the confirmation page with the barcode.",
      img: "https://images.unsplash.com/photo-1618044733300-9472154094ee?q=80&w=800&h=450&auto=format&fit=crop",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold font-display text-foreground">
          {lang === "pt"
            ? "Tutorial: Revisão e Assinatura"
            : "Tutorial: Review and Signature"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {lang === "pt"
            ? "Siga os passos abaixo no portal oficial para concluir seu processo."
            : "Follow the steps below on the official portal to complete your process."}
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        {/* Timeline Header */}
        <div className="bg-muted/30 p-4 md:p-6 border-b border-border">
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
          <div className="relative aspect-video lg:aspect-auto h-64 lg:h-[400px] overflow-hidden bg-slate-100 border-b lg:border-b-0 lg:border-r border-border">
            <img
              src={tutorialSteps[activeStep].img}
              alt={tutorialSteps[activeStep].title}
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
            />
          </div>

          {/* Description & Navigation */}
          <div className="p-8 flex flex-col justify-center">
            <div className="space-y-4 mb-8">
              <Badge className="bg-accent/10 text-accent border-none font-bold uppercase tracking-wider text-[10px] py-1 px-3">
                {lang === "pt"
                  ? `Passo ${activeStep + 1} de ${tutorialSteps.length}`
                  : `Step ${activeStep + 1} of ${tutorialSteps.length}`}
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">
                {tutorialSteps[activeStep].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {tutorialSteps[activeStep].desc}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="rounded-xl border-border hover:bg-muted font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {lang === "pt" ? "Anterior" : "Previous"}
              </Button>
              <Button
                size="sm"
                disabled={activeStep === tutorialSteps.length - 1}
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="bg-accent hover:bg-green-dark text-white rounded-xl shadow-lg shadow-accent/20 font-bold text-xs px-6"
              >
                {lang === "pt" ? "Próximo Passo" : "Next Step"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {securityData && (
        <div className="mt-8 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xl font-bold text-primary mb-2">
            <Shield className="w-6 h-6 text-accent" />
            {lang === "pt"
              ? "Seus Dados de Segurança da DS-160"
              : "Your DS-160 Security Data"}
          </div>
          <p className="text-muted-foreground text-sm">
            {lang === "pt"
              ? "Utilize essas informações para acessar a sua DS-160 oficial através do portal consular do governo."
              : "Use this information to access your official DS-160 through the government consular portal."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-border flex flex-col justify-between shadow-sm">
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
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-lg text-center">
                {securityData.appId}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-border flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  {lang === "pt" ? "Data de Nascimento" : "Birth Date"}
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
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-lg text-center">
                {securityData.dob}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-border flex flex-col justify-between shadow-sm lg:col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="w-4 h-4 text-accent" />
                  {lang === "pt" ? "Nome da Avó" : "Grandma Name"}
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
              <p className="font-mono text-base font-black text-foreground truncate select-all bg-muted/30 p-2 rounded-lg text-center">
                {securityData.grandma}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          {lang === "pt" ? "Envio de Documentos" : "Document Upload"}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {requiredDocs.map((doc) => {
            const isUploaded = uploadedDocs.some((d) => d.name === doc.id);
            const isUploading = uploading === doc.id;

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-xl border-2 transition-all ${
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
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-red-200 dark:border-red-900/30"
                  >
                    <X className="w-4 h-4" />
                    {lang === "pt" ? "Remover" : "Remove"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDoc(doc.id);
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors disabled:opacity-50 border border-accent/20"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading
                      ? lang === "pt"
                        ? "Enviando..."
                        : "Uploading..."
                      : lang === "pt"
                        ? "Fazer Upload"
                        : "Upload File"}
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
