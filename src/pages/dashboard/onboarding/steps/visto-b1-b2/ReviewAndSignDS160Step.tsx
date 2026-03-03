import React from "react";
import { UploadedDocument } from "../../types";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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
}

export function ReviewAndSignDS160Step({
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold font-display text-foreground">
          {lang === "pt"
            ? "Revisão e Assinatura da DS-160"
            : "DS-160 Review and Signature"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {lang === "pt"
            ? "Sua DS-160 foi gerada! Assista ao vídeo abaixo para instruções sobre como revisar e assinar seu formulário. Em seguida, envie os documentos obrigatórios."
            : "Your DS-160 has been generated! Watch the video below for instructions on how to review and sign your form. Then, upload the required documents."}
        </p>
      </div>

      <div className="bg-slate-900 aspect-video rounded-2xl overflow-hidden relative flex items-center justify-center group shadow-xl border border-slate-800">
        {/* Placeholder for actual video implementation, could be an iframe (YouTube/Vimeo) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
        <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all z-20 cursor-pointer" />
        <p className="absolute bottom-6 left-6 text-white font-medium z-20">
          {lang === "pt"
            ? "Como revisar e assinar a DS-160"
            : "How to review and sign the DS-160"}
        </p>
      </div>

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
