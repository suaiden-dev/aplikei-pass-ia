import React from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { Upload, X, CreditCard, CheckCircle2, Loader2, ExternalLink, Info, DollarSign, ListChecks, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/atoms/badge";

export const ChangeOfStatusSevisStep = ({
  setValue,
  watch,
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

  const docId = "cos_sevis_voucher";
  const doc = uploadedDocs.find((d) => d.name === docId);
  const isUploaded = !!doc;
  const isRejected = doc?.status === "resubmit";
  const isApproved = doc?.status === "approved";
  const isPending = isUploaded && !isRejected && !isApproved;
  const isUploading = uploading === docId;

  const hasPaid = watch?.("sevisPaid" as any);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          {phase5.sevisTitle[lang]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Siga as instruções para o pagamento e envio do comprovante da taxa SEVIS." : "Follow instructions for payment and uploading your SEVIS fee voucher."}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-muted/30 p-8 rounded-3xl border border-border space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <Label className="text-base font-bold text-foreground">
              {phase5.sevisQuestion[lang]}
            </Label>
          </div>
          <RadioGroup 
            value={hasPaid} 
            onValueChange={(val) => setValue?.("sevisPaid" as any, val)}
            className="flex gap-10 pl-11"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="sevis-yes" className="h-5 w-5" />
              <Label htmlFor="sevis-yes" className="font-bold cursor-pointer text-sm">{t.common.yes[lang]}</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="sevis-no" className="h-5 w-5" />
              <Label htmlFor="sevis-no" className="font-bold cursor-pointer text-sm">{t.common.no[lang]}</Label>
            </div>
          </RadioGroup>
        </div>

        {hasPaid === "no" && (
          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-8 rounded-2xl space-y-5">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                    {phase5.sevisInstructionTitle[lang]}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {phase5.sevisInstructionBody[lang]}
                  </p>
                  <p className="text-sm font-black text-blue-900 dark:text-blue-100 mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                    {phase5.sevisAddressTip[lang]}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-14 bg-white hover:bg-white/90 border-blue-200 text-blue-700 font-bold px-6 rounded-xl shadow-sm"
                  asChild
                >
                  <a href="https://www.fmjfee.com/i901fee/index.html#" target="_blank" rel="noopener noreferrer">
                    {phase5.sevisLinkText[lang]}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="space-y-4 pt-2 border-t border-blue-100 dark:border-blue-900/50 pt-5">
                <p className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-widest">Passo a Passo:</p>
                <div className="grid grid-cols-1 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex gap-4 items-start bg-white/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-50/50 dark:border-blue-900/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold leading-none">
                        {num}
                      </span>
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-normal">
                        {(phase5 as any)[`sevisStep${num}`][lang]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "p-1.5 rounded-lg",
              isRejected ? "bg-red-50 text-red-600" : 
              isApproved ? "bg-green-50 text-green-600" :
              isPending ? "bg-blue-50 text-blue-600" :
              "bg-primary/5 text-primary"
            )}>
              <DollarSign className="h-4 w-4" />
            </div>
            <Label className="text-[13px] font-bold text-foreground leading-tight">{phase5.sevisUploadLabel[lang]}</Label>
            {isRejected && (
              <Badge variant="destructive" className="ml-auto bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[9px] font-black uppercase tracking-widest">
                RECUSADO
              </Badge>
            )}
            {isPending && (
              <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[9px] font-black uppercase tracking-widest">
                EM ANÁLISE
              </Badge>
            )}
            {isApproved && (
              <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[9px] font-black uppercase tracking-widest">
                VERIFICADO
              </Badge>
            )}
          </div>
          <div 
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300 group",
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
                    SEVIS_VOUCHER.PDF
                  </p>
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
                    onClick={() => handleRemove(docId)}
                    className="mt-1 h-7 px-3 text-red-700 hover:bg-red-50 font-bold text-[9px] uppercase tracking-wider"
                  >
                    <X className="mr-1 h-3 w-3" /> {lang === "pt" ? "Remover e Corrigir" : "Remove and Fix"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    {isUploading ? (lang === "pt" ? "Enviando..." : "Uploading...") : (lang === "pt" ? "Clique para enviar seu comprovante" : "Click to upload your receipt")}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
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
    </div>
  );
};
