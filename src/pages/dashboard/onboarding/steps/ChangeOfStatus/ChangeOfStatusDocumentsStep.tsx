import React from "react";
import { DocumentStepProps } from "../../types";
import { Label } from "@/presentation/components/atoms/label";
import { Button } from "@/presentation/components/atoms/button";
import { 
  Upload, X, FileText, CheckCircle2, Loader2, Info, ExternalLink, 
  MapPin, Book, Landmark, Home, Heart, Baby, Mail, FolderPlus, Users, Navigation, XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/atoms/badge";

export const ChangeOfStatusDocumentsStep = ({
  lang,
  t,
  uploadedDocs,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  formData,
  originalServiceSlug
}: DocumentStepProps) => {
  const cos = t.changeOfStatus;

  const isExtension = originalServiceSlug === "extensao-status";
  const numDependents = formData?.dependents?.length || 0;

  const financialNote = isExtension 
    ? (lang === "pt" ? "Extensão 1.000U$/mês = U$ 6.000" : "Extension $1,000/mo = $6,000")
    : (lang === "pt" 
        ? `Extensão (U$ 6.000) - COS (U$ 22.000 + U$ 5.000 por dep.)` 
        : `Extension ($6,000) - COS ($22,000 + $5,000/dep)`);

  const totalNeeded = isExtension ? 6000 : 28000 + (numDependents * 5000);
  const formattedTotal = new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalNeeded);

  const categories = [
    {
      title: lang === "pt" ? "Documentos Pessoais" : "Personal Documents",
      icon: Users,
      items: [
        { id: "cos_i94", label: cos.docs.i94, note: lang === "pt" ? "Registro de entrada nos EUA" : "U.S. Entry Record", icon: Navigation },
        { id: "cos_passport_visa_principal", label: lang === "pt" ? "Passaporte e Visto (Principal)" : "Passport and Visa (Principal)", icon: Book },
        { id: "cos_proof_of_residence_brazil", label: lang === "pt" ? "Comprovante de Residência (Brasil)" : "Proof of Residence (Brazil)", icon: Home },
      ]
    },
    {
      title: lang === "pt" ? "Documentos Financeiros" : "Financial Documents",
      icon: Landmark,
      items: [
        { id: "cos_bank_statement", label: cos.docs.bankStatement, note: `${financialNote} | Total: ${formattedTotal}`, icon: Landmark },
      ]
    }
  ];

  // Dependent documents group
  if (formData?.dependents && formData.dependents.length > 0) {
    const dependentItems: any[] = [];
    formData.dependents.forEach((dep: any, idx: number) => {
      dependentItems.push({
        id: `cos_i94_dependent_${idx}`,
        label: `${lang === "pt" ? "I-94 de" : "I-94 of"} ${dep.name}`,
        note: lang === "pt" ? "Principal + Dependentes" : "Principal + Dependents",
        icon: Navigation
      });
      dependentItems.push({
        id: `cos_passport_visa_dependent_${idx}`,
        label: `${lang === "pt" ? "Passaporte e Visto de" : "Passport and Visa of"} ${dep.name}`,
        icon: Book
      });
    });

    categories.push({
      title: lang === "pt" ? "Documentos dos Dependentes" : "Dependent Documents",
      icon: Users,
      items: dependentItems
    });

    // Family certificates
    const familyItems = [
      { id: "cos_marriage_certificate", label: lang === "pt" ? "Certidão de Casamento" : "Marriage Certificate", icon: Heart },
      { id: "cos_birth_certificate", label: lang === "pt" ? "Certidões de Nascimento dos Filhos" : "Children's Birth Certificates", icon: Baby },
    ];
    
    categories.push({
      title: lang === "pt" ? "Vínculos Familiares" : "Family Ties",
      icon: Heart,
      items: familyItems
    });
  }

  const renderUploadField = (docId: string, label: string, note?: string, Icon?: any) => {
    const doc = uploadedDocs.find((d) => d.name === docId);
    console.log(`DEBUG: Field ${docId} status:`, doc?.status, "feedback:", doc?.feedback);
    const isUploaded = !!doc;
    const isRejected = doc?.status === "resubmit";
    const isApproved = doc?.status === "approved";
    const isPending = isUploaded && !isRejected && !isApproved;
    const isUploading = uploading === docId;

    return (
      <div key={docId} className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn(
            "p-1.5 rounded-lg",
            isRejected ? "bg-red-50 text-red-600" : 
            isApproved ? "bg-green-50 text-green-600" :
            isPending ? "bg-blue-50 text-blue-600" :
            "bg-primary/5 text-primary/70"
          )}>
            {Icon ? <Icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div className="flex flex-col gap-0.5">
            <Label className="text-[13px] font-bold text-foreground leading-tight">{label}</Label>
            {note && <p className="text-[9.5px] text-muted-foreground italic font-medium">{note}</p>}
          </div>
          {isRejected && (
            <Badge className="ml-auto bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              RECUSADO
            </Badge>
          )}
          {isPending && (
            <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              EM ANÁLISE
            </Badge>
          )}
          {isApproved && (
            <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0">
              VERIFICADO
            </Badge>
          )}
        </div>
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 transition-all duration-300 group",
            isRejected ? "border-red-300 bg-red-50/30" :
            isApproved ? "border-green-300 bg-green-50/30" :
            isPending ? "border-blue-300 bg-blue-50/30" :
            isUploaded ? "border-accent/30 bg-accent/5" : 
            "border-border hover:border-primary/40 hover:bg-primary/5 shadow-sm"
          )}
        >
          {isUploaded ? (
            <div className="flex flex-col items-center space-y-3">
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
              <div className="text-center space-y-1">
                <p className={cn(
                  "text-[10px] font-bold text-center line-clamp-1 opacity-70",
                  isRejected ? "text-red-700" : 
                  isApproved ? "text-green-700" :
                  isPending ? "text-blue-700" :
                  "text-foreground"
                )}>
                  {doc.name.replace(/_/g, " ").toUpperCase()}
                </p>
                {isPending && (
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                    {lang === "pt" ? "Aguardando aprovação" : "Waiting for approval"}
                  </p>
                )}
              </div>
              
              {isRejected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(docId)}
                  className={cn(
                    "h-8 px-2 z-10 cursor-pointer text-[10px] font-bold uppercase tracking-wider",
                    "text-red-700 hover:bg-red-100"
                  )}
                >
                  <X className="mr-1 h-3 w-3" /> {lang === "pt" ? "Remover e Corrigir" : "Remove and Fix"}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">
                  {isUploading ? (lang === "pt" ? "Enviando..." : "Uploading...") : (lang === "pt" ? "Clique p/ enviar" : "Click to upload")}
                </p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">
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
          <FileText className="h-6 w-6 text-primary" />
          {lang === "pt" ? "Upload de Documentos" : "Document Uploads"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Faça o upload dos documentos no início do seu processo." : "Upload the required documents at the beginning of your process."}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
            {lang === "pt" ? "Instruções do I-94" : "I-94 Instructions"}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-normal">
            {lang === "pt" 
              ? "Obtenha seu registro de entrada mais recente no site oficial do CBP." 
              : "Get your most recent entry record from the official CBP website."}
          </p>
          <a 
            href="https://i94.cbp.dhs.gov/I94/#/recent-search" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] text-blue-800 dark:text-blue-400 font-bold underline flex items-center gap-1 mt-1"
          >
            Acessar site do I-94 <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="space-y-10">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <cat.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {cat.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((doc) => renderUploadField(doc.id, doc.label, doc.note, doc.icon))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
