import React from "react";
import { Button } from "@/presentation/components/atoms/button";
import { CheckCircle2, Upload, Loader2, Trash2, AlertCircle, FileText } from "lucide-react";
import { translations } from "@/i18n/translations";
import { UploadedDocument } from "../../types";
import { cn } from "@/lib/utils";

interface F1F2UploadDocumentsStepProps {
  uploadedDocs: UploadedDocument[];
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  handleRemove: (name: string) => void;
  uploading: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedDoc: (doc: string) => void;
  lang: "pt" | "en" | "es";
  t: typeof translations;
  o: typeof translations.onboardingPage;
}

export const F1F2UploadDocumentsStep = ({
  uploadedDocs,
  handleUpload,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  lang,
  t,
  o,
}: F1F2UploadDocumentsStepProps) => {
  const docsList = [
    "i20_document",
    o.docPassport[lang],
  ];

  const getDocLabel = (doc: string) => {
      if (doc === "i20_document") return t.f1f2.i20Document[lang];
      return doc;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][7]}
        </h2>
      </div>
      
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 flex gap-4 animate-in zoom-in-95 duration-300">
         <div className="p-2 bg-primary/10 rounded-full h-fit">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
         </div>
         <p className="text-sm font-medium text-primary leading-relaxed">
            {t.f1f2.i20DocumentDesc[lang]}
         </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docsList.map((doc, i) => {
          const uploaded = uploadedDocs.some((d) => d.name === doc);
          const isUploading = uploading === doc;

          return (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-4 rounded-3xl border p-6 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between group",
                uploaded 
                  ? "bg-green-500/5 border-green-500/20" 
                  : "bg-muted/20 border-border/50 hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  uploaded ? "bg-green-500/10 text-green-600" : "bg-primary/10 text-primary"
                )}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                    Documento #{i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{getDocLabel(doc)}</span>
                    {uploaded && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in duration-300" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={uploaded ? "ghost" : "outline"}
                  className={cn(
                    "w-full gap-2 px-6 rounded-2xl h-10 sm:w-auto font-bold transition-all",
                    !uploaded && "bg-background shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                  )}
                  onClick={() => {
                    setSelectedDoc(doc);
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading
                    ? o.uploadingBtn[lang]
                    : uploaded
                      ? o.replaceBtn[lang]
                      : o.upload[lang]}
                </Button>

                {uploaded && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                    onClick={() => handleRemove(doc)}
                    title={o.removeBtn[lang]}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                      {o.removeBtn[lang]}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
