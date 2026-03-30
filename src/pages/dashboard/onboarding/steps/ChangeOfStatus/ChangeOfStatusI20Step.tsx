import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import { Upload, X, FileCheck, CheckCircle2, Loader2, GraduationCap, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/atoms/badge";

export const ChangeOfStatusI20Step = ({
  lang,
  t,
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
}: DocumentStepProps) => {
  const cos = t.changeOfStatus;
  const phase5 = (cos as any).phase5;

  const docId = "cos_i20_official";

  const renderUpload = (targetDocId: string, fileName: string, Icon: any = GraduationCap) => {
    const doc = uploadedDocs.find((d) => d.name === targetDocId);
    const isUploaded = !!doc;
    const isRejected = doc?.status === "resubmit";
    const isApproved = doc?.status === "approved";
    const isPending = isUploaded && !isRejected && !isApproved;
    const isUploading = uploading === targetDocId;

    return (
      <div className="space-y-4">
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
            isRejected ? "border-red-300 bg-red-50/30" :
            isApproved ? "border-green-300 bg-green-50/30" :
            isPending ? "border-blue-300 bg-blue-50/30" :
            isUploaded ? "border-accent/30 bg-accent/5" : 
            "border-border hover:border-primary/40 hover:bg-primary/5 shadow-sm"
          )}
        >
          {isUploaded ? (
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className={cn(
                "rounded-full p-2",
                isRejected ? "bg-red-200 text-red-700" : 
                isApproved ? "bg-green-200 text-green-700" :
                isPending ? "bg-blue-200 text-blue-700" :
                "bg-accent/20 text-accent"
              )}>
                {isRejected ? <XCircle className="h-6 w-6" /> : 
                 isApproved ? <CheckCircle2 className="h-6 w-6" /> :
                 isPending ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> :
                 <CheckCircle2 className="h-6 w-6" />}
              </div>
              
              <div className="text-center space-y-1 w-full">
                <p className={cn(
                  "text-[10px] font-bold text-center line-clamp-1 opacity-70",
                  isRejected ? "text-red-700" : 
                  isApproved ? "text-green-700" :
                  isPending ? "text-blue-700" :
                  "text-foreground"
                )}>
                  {lang === "pt" ? "Documento Recebido" : "Document Received"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {fileName}
                </p>
                
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  {isRejected && (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[9px] font-black uppercase tracking-widest">
                      RECUSADO
                    </Badge>
                  )}
                  {isPending && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[9px] font-black uppercase tracking-widest">
                      EM ANÁLISE
                    </Badge>
                  )}
                  {isApproved && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green- green-100 border-green-200 text-[9px] font-black uppercase tracking-widest">
                      VERIFICADO
                    </Badge>
                  )}
                </div>

                {isPending && (
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter mt-1">
                    {lang === "pt" ? "Aguardando aprovação" : "Waiting for approval"}
                  </p>
                )}
              </div>

              {isRejected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(targetDocId)}
                  className="mt-2 h-8 px-4 text-red-700 hover:bg-red-50 font-bold text-[10px] uppercase tracking-wider"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" /> {lang === "pt" ? "Remover e Corrigir" : "Remove and Fix"}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  {isUploading ? (lang === "pt" ? "Enviando..." : "Uploading...") : (lang === "pt" ? "Clique para selecionar" : "Click to select")}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  PDF, JPG, PNG (MÁX. 10MB)
                </p>
              </div>
              <button
                type="button"
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                onClick={() => {
                  setSelectedDoc(targetDocId);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              />
            </div>
          )}
        </div>

        {isRejected && doc.feedback && (
          <div className="flex gap-2 p-3 bg-red-100/50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <Info className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-red-800 uppercase tracking-wider">Motivo da Recusa:</p>
              <p className="text-xs text-red-700 font-medium leading-relaxed">{doc.feedback}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          {phase5.i20Title[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {phase5.i20Description[lang]}
        </p>
      </div>

      <div className="max-w-xl space-y-10">
        <div key={docId} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <Label className="text-[13px] font-bold text-foreground leading-tight">
              {lang === "pt" ? "Formulário I-20 (F-1) - Aplicante Principal" : "I-20 Form (F-1) - Main Applicant"}
            </Label>
          </div>
          {renderUpload(docId, "I-20_F1.PDF", GraduationCap)}
        </div>

      </div>
    </div>
  );
};
