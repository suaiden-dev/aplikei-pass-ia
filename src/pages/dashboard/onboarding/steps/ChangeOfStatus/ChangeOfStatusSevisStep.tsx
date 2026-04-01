import React from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { Upload, X, CreditCard, CheckCircle2, Loader2, ExternalLink, Info, DollarSign, ListChecks, XCircle, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/atoms/badge";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary shrink-0" />
          {phase5.sevisTitle[lang]}
        </h2>
        <p className="text-muted-foreground font-medium">
          {lang === "pt" ? "Siga as instruções para o pagamento e envio do comprovante da taxa SEVIS." : "Follow instructions for payment and uploading your SEVIS fee voucher."}
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        {/* Payment Confirmation Card */}
        <div className="bg-card/10 backdrop-blur-sm p-8 rounded-[2.5rem] border border-border/50 space-y-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <ShieldCheck className="w-40 h-40" />
          </div>
          
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              <Label className="text-xl font-bold text-foreground leading-tight">
                {phase5.sevisQuestion[lang]}
              </Label>
            </div>

            <RadioGroup 
              value={hasPaid} 
              onValueChange={(val) => setValue?.("sevisPaid" as any, val)}
              className="flex flex-col sm:flex-row gap-6 pl-2"
            >
              <div className={cn(
                "flex items-center space-x-3 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer group/item",
                hasPaid === "yes" ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-primary/30"
              )} onClick={() => setValue?.("sevisPaid" as any, "yes")}>
                <RadioGroupItem value="yes" id="sevis-yes" className="h-5 w-5" />
                <Label htmlFor="sevis-yes" className="font-black cursor-pointer text-sm uppercase tracking-widest">{t.common.yes[lang]}</Label>
              </div>
              <div className={cn(
                "flex items-center space-x-3 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer group/item",
                hasPaid === "no" ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-primary/30"
              )} onClick={() => setValue?.("sevisPaid" as any, "no")}>
                <RadioGroupItem value="no" id="sevis-no" className="h-5 w-5" />
                <Label htmlFor="sevis-no" className="font-black cursor-pointer text-sm uppercase tracking-widest">{t.common.no[lang]}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <AnimatePresence>
          {hasPaid === "no" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Info className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="font-display text-3xl font-black tracking-tight leading-none">
                        {phase5.sevisInstructionTitle[lang]}
                      </h3>
                    </div>
                    <p className="text-lg text-blue-50 font-medium leading-relaxed opacity-90 max-w-2xl">
                      {phase5.sevisInstructionBody[lang]}
                    </p>
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                      <ShieldCheck className="h-5 w-5 text-blue-200" />
                      <p className="text-sm font-bold text-white tracking-tight">
                        {phase5.sevisAddressTip[lang]}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto h-16 bg-white hover:bg-blue-50 border-none text-blue-700 font-black uppercase text-xs tracking-widest px-10 rounded-2xl shadow-2xl shadow-blue-900/40 gap-3 group/btn transition-all active:scale-[0.98]"
                    asChild
                  >
                    <a href="https://www.fmjfee.com/i901fee/index.html#" target="_blank" rel="noopener noreferrer">
                      {phase5.sevisLinkText[lang]}
                      <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  </Button>

                  <div className="space-y-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Guia de Pagamento:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/10 group/step">
                          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white text-blue-700 flex items-center justify-center text-sm font-black shadow-lg group-hover/step:rotate-12 transition-transform">
                            {num}
                          </span>
                          <p className="text-sm text-blue-50 font-semibold leading-relaxed">
                            {(phase5 as any)[`sevisStep${num}`][lang]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-2xl shadow-inner",
                isRejected ? "bg-red-50 text-red-600" : 
                isApproved ? "bg-green-50 text-green-600" :
                isPending ? "bg-blue-50 text-blue-600" :
                "bg-primary/10 text-primary"
              )}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-lg font-black text-foreground tracking-tight leading-none">{phase5.sevisUploadLabel[lang]}</Label>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Envie o arquivo original em PDF</p>
              </div>
            </div>
            
            <AnimatePresence>
              {isRejected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Badge variant="destructive" className="bg-red-500 text-white border-none text-[10px] font-black px-3 py-1.5 h-auto uppercase tracking-tighter shadow-lg shadow-red-500/20">
                    RECUSADO
                  </Badge>
                </motion.div>
              )}
              {isPending && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Badge className="bg-blue-600 text-white border-none text-[10px] font-black px-3 py-1.5 h-auto uppercase tracking-tighter shadow-lg shadow-blue-600/20">
                    EM ANÁLISE
                  </Badge>
                </motion.div>
              )}
              {isApproved && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Badge className="bg-green-600 text-white border-none text-[10px] font-black px-3 py-1.5 h-auto uppercase tracking-tighter shadow-lg shadow-green-600/20">
                    VERIFICADO
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            className={cn(
              "relative flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed p-12 transition-all duration-500 group overflow-hidden",
              isRejected ? "border-red-300 bg-red-50/20" :
              isApproved ? "border-green-300 bg-green-50/20" :
              isPending ? "border-blue-300 bg-blue-50/20" :
              isUploaded ? "border-primary/40 bg-primary/5" : 
              "border-border/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
            )}
          >
            {isUploaded ? (
              <div className="flex flex-col items-center space-y-6 w-full relative z-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className={cn(
                    "rounded-[2rem] p-6 shadow-2xl relative",
                    isRejected ? "bg-red-600 text-white" : 
                    isApproved ? "bg-green-600 text-white" :
                    isPending ? "bg-blue-600 text-white" :
                    "bg-primary text-white"
                  )}
                >
                  <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
                  {isRejected ? <XCircle className="h-10 w-10 relative z-10" /> : 
                   isApproved ? <CheckCircle2 className="h-10 w-10 relative z-10" /> :
                   isPending ? <Loader2 className="h-10 w-10 animate-spin relative z-10" /> :
                   <CheckCircle2 className="h-10 w-10 relative z-10" />}
                </motion.div>
                
                <div className="text-center space-y-1 w-full">
                  <p className={cn(
                    "text-sm font-black tracking-widest uppercase",
                    isRejected ? "text-red-700" : 
                    isApproved ? "text-green-700" :
                    isPending ? "text-blue-700" :
                    "text-foreground"
                  )}>
                    SEVIS_VOUCHER.PDF
                  </p>
                  {isPending && (
                    <p className="text-xs font-bold text-blue-600/60 uppercase tracking-tighter mt-1 animate-pulse">
                      {lang === "pt" ? "Aguardando verificação por nossos especialistas" : "Waiting for verification by our specialists"}
                    </p>
                  )}
                </div>
                {isRejected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(docId)}
                    className="mt-2 h-10 px-6 text-red-700 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95"
                  >
                    <X className="mr-2 h-4 w-4" /> {lang === "pt" ? "Remover e Corrigir" : "Remove and Fix"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-center relative z-10">
                <div className="rounded-3xl bg-primary shadow-2xl shadow-primary/20 p-5 text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-foreground tracking-tight leading-none">
                    {isUploading ? (lang === "pt" ? "Enviando..." : "Uploading...") : (lang === "pt" ? "Clique ou arraste para enviar" : "Click or drag to upload")}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    PDF, JPG, PNG (Máx 10MB)
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

        <AnimatePresence>
          {isRejected && doc.feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-4 p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] shadow-lg shadow-red-500/5"
            >
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-red-800 uppercase tracking-widest">Feedback do Consultor:</p>
                <p className="text-sm text-red-700/80 font-bold leading-relaxed">{doc.feedback}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
