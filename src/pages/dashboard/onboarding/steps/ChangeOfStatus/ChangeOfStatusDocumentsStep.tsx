import React from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import { Upload, X, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChangeOfStatusDocumentsStep = ({
  lang,
  t,
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
}: DocumentStepProps) => {
  const cos = t.changeOfStatus;

  const documents = [
    { id: "cos_i94", label: cos.docs.i94 },
    { id: "cos_applicant_form", label: cos.docs.i539Applicant },
    { id: "cos_a_form", label: cos.docs.i539A },
    { id: "cos_cover_letter", label: cos.docs.coverLetter },
    { id: "cos_bank_statement", label: cos.docs.bankStatement },
    { id: "cos_supporting_docs", label: cos.docs.supportingDocs },
  ];

  const renderUploadField = (docId: string, label: string) => {
    const isUploaded = uploadedDocs.some((d) => d.name === docId);
    const isUploading = uploading === docId;

    return (
      <div key={docId} className="space-y-2">
        <Label className="text-sm font-semibold">{label}</Label>
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-300",
            isUploaded ? "border-accent/50 bg-accent/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {isUploaded ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-full bg-accent/20 p-2 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-foreground text-center line-clamp-2">
                {uploadedDocs.find(d => d.name === docId)?.name.replace(/_/g, " ").toUpperCase()}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(docId)}
                className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-600 z-10 cursor-pointer"
              >
                <X className="mr-1 h-3 w-3" /> {lang === "pt" ? "Remover" : "Remove"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  {isUploading ? (lang === "pt" ? "Enviando..." : "Uploading...") : (lang === "pt" ? "Clique para fazer upload" : "Click to upload")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  PDF, JPG, PNG
                </p>
              </div>
              <button
                type="button"
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                onClick={() => {
                  setSelectedDoc(docId);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {lang === "pt" ? "Upload de Documentos" : "Document Uploads"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Faça o upload dos documentos necessários para a troca de status." : "Upload the required documents for your change of status."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => renderUploadField(doc.id, doc.label))}
      </div>
    </div>
  );
};
