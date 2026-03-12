import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Loader2, Trash2, AlertCircle } from "lucide-react";
import { UploadedDocument } from "../../types";

interface F1F2UploadDocumentsStepProps {
  uploadedDocs: UploadedDocument[];
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  handleRemove: (name: string) => void;
  uploading: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedDoc: (doc: string) => void;
  lang: "pt" | "en" | "es";
  t: any;
  o: any;
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
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {t.f1f2.steps[lang][9]}
      </h2>
      
      <div className="rounded-md border border-primary/20 bg-primary/5 p-4 flex gap-3 mb-4">
         <AlertCircle className="w-5 h-5 text-primary shrink-0" />
         <p className="text-sm font-medium text-primary">
            {t.f1f2.i20DocumentDesc[lang]}
         </p>
      </div>

      <div className="space-y-3">
        {docsList.map((doc, i) => {
          const uploaded = uploadedDocs.some((d) => d.name === doc);
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{getDocLabel(doc)}</span>
                {uploaded && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={uploaded ? "ghost" : "outline"}
                  className="w-full gap-1 sm:w-auto"
                  onClick={() => {
                    setSelectedDoc(doc);
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading === doc}
                >
                  {uploading === doc ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {uploading === doc
                    ? o.uploadingBtn[lang]
                    : uploaded
                      ? o.replaceBtn[lang]
                      : o.upload[lang]}
                </Button>

                {uploaded && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
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
