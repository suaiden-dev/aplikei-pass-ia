import React from "react";
import { Button } from "@/presentation/components/atoms/button";
import { CheckCircle2, Upload, Loader2, Trash2 } from "lucide-react";
import { DocumentStepProps } from "../types";

export const DocumentsStep = ({
  o,
  lang,
  uploadedDocs,
  handleUpload,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  serviceSlug,
}: DocumentStepProps & {
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedDoc: (doc: string) => void;
}) => {
  // Photo is now collected upfront for all services
  const docsList = [
    o.docPassport[lang],
    o.docFinancial[lang],
    o.docBond[lang],
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Upload className="h-6 w-6 text-primary" />
          {o.documentsTitle[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">{o.documentsDesc[lang]}</p>
      </div>

      <div className="flex items-start gap-4 p-5 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden group">
        <div className="absolute right-0 top-0 h-24 w-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
        <div className="shrink-0 mt-1">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="relative z-10">
          <p className="font-bold text-sm text-foreground">
            {o.photoAlreadyRegistered[lang]}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-sm">
            {o.photoCollectedDesc[lang]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docsList.map((doc, i) => {
          const uploaded = uploadedDocs.some((d) => d.name === doc);
          return (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-3xl border border-border/50 bg-card p-5 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-foreground/5 group"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-colors ${uploaded ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/5 text-primary"}`}>
                  {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{doc}</span>
                  {uploaded && (
                    <span className="text-[10px] uppercase tracking-wider font-black text-emerald-500">Documento Enviado</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={uploaded ? "ghost" : "outline"}
                  className={`h-11 px-6 rounded-2xl gap-2 font-bold uppercase tracking-widest text-[10px] transition-all ${
                    !uploaded ? "border-primary/20 text-primary hover:bg-primary hover:text-white" : "text-muted-foreground hover:bg-accent/10"
                  }`}
                  onClick={() => {
                    setSelectedDoc(doc);
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading === doc}
                >
                  {uploading === doc ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading === doc
                    ? o.uploadingBtn[lang]
                    : uploaded
                      ? o.replaceBtn[lang]
                      : o.upload[lang]}
                </Button>

                {uploaded && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => handleRemove(doc)}
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
