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
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {o.documentsTitle[lang]}
      </h2>
      <p className="text-sm text-muted-foreground">{o.documentsDesc[lang]}</p>

      <div className="flex items-start gap-4 p-5 rounded-md border border-accent/20 bg-accent/5">
        <div className="shrink-0 mt-0.5">
          <CheckCircle2 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">
            {o.photoAlreadyRegistered[lang]}
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {o.photoCollectedDesc[lang]}
          </p>
        </div>
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
                <span className="text-sm text-foreground">{doc}</span>
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
