import React, { useState } from "react";
import { DocumentStepProps } from "../../types";
import { Button } from "@/presentation/components/atoms/button";
import {
  Download,
  CheckCircle2,
  MapPin,
  Info,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  Printer,
  Signature,
  DollarSign,
  Truck,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from 'pdf-lib';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DOCS_CONFIG = [
  { id: "cos_g1145",               label: { pt: "G-1145 (Notificação)",          en: "G-1145 (e-Notification)" } },
  { id: "cos_g1450",               label: { pt: "G-1450 (Autorização Cartão)",   en: "G-1450 (Credit Card Auth)" } },
  { id: "cos_i539",                label: { pt: "Formulário I-539 – Principal",  en: "Form I-539 – Main Applicant" } },
  { id: "cos_i539a_official",      label: { pt: "Formulário I-539A – Dependentes", en: "Form I-539A – Dependents" } },
  { id: "cos_i94",                 label: { pt: "I-94 – Aplicante principal",    en: "I-94 – Main Applicant" } },
  { id: "cos_i94_dependent",       label: { pt: "I-94 – Dependentes",            en: "I-94 – Dependents" } },
  { id: "cos_i20_official",        label: { pt: "I-20 F1",                       en: "I-20 F1" } },
  { id: "cos_i20_f2",              label: { pt: "I-20 F2",                       en: "I-20 F2" } },
  { id: "cos_sevis_voucher",       label: { pt: "Taxa SEVIS I-901",              en: "SEVIS Fee I-901" } },
  { id: "cos_bank_statement",      label: { pt: "Comprovação Financeira",        en: "Financial Proof" } },
  { id: "cos_cover_letter",        label: { pt: "Cover Letter",                  en: "Cover Letter" } },
  { id: "cos_passport_visa_principal",  label: { pt: "Passaporte e Visto: Principal",  en: "Passport and Visa: Principal" } },
  { id: "cos_passport_visa_dependent", label: { pt: "Passaporte e Visto: Dependentes", en: "Passport and Visa: Dependents" } },
  { id: "cos_marriage_certificate",label: { pt: "Certidão de Casamento",        en: "Marriage Certificate" } },
  { id: "cos_birth_certificate",   label: { pt: "Certidão de Nascimento",       en: "Birth Certificate" } },
  { id: "cos_proof_of_residence_brazil", label: { pt: "Comprovante de Residência (Brasil)", en: "Proof of Residence (Brazil)" } },
  { id: "cos_supporting_docs",     label: { pt: "Documentos de Suporte",        en: "Supporting Documents" } },
];

export const ChangeOfStatusFinalPackageStep = ({
  lang,
  t,
  uploadedDocs,
  formData,
  handleUpload,
  handleRemove,
  uploading,
  fileInputRef,
  setSelectedDoc,
  serviceStatus
}: DocumentStepProps) => {

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    console.log("=== COS Process Status ===");
    console.log("Service Status:", serviceStatus);
    console.log("Form Data:", formData);
    console.log("==========================");
  }, [serviceStatus, formData]);

  const cos = t.changeOfStatus;
  const packageDoc = uploadedDocs.find((d) => d.name === "cos_final_package");

  const matchDoc = (d: any, configId: string) => {
    if (d.name === configId) return true;
    if (d.name.startsWith(`${configId}_`)) {
      // Avoid duplicate matching for similar prefixes
      if (configId === "cos_i94" && d.name.startsWith("cos_i94_dependent")) return false;
      if (configId === "cos_passport_visa_principal" && d.name.startsWith("cos_passport_visa_dependent")) return false;
      if (configId === "cos_i539" && d.name.startsWith("cos_i539a_official")) return false;
      if (configId === "cos_i20_official" && d.name.startsWith("cos_i20_f2")) return false;
      return true;
    }
    // Legacy/Alias mappings — map old names to new config IDs
    if (configId === "cos_i539"           && d.name === "cos_applicant_form") return true;
    if (configId === "cos_i539"           && d.name === "cos_i539_official") return true;
    if (configId === "cos_i539a_official" && d.name === "cos_a_form") return true;
    if (configId === "cos_cover_letter"   && d.name === "cos_cover_letter_official") return true;
    if (configId === "cos_g1145"          && d.name === "cos_g1145_voucher") return true;
    if (configId === "cos_g1450"          && d.name === "cos_g1450_voucher") return true;
    return false;
  };

  const handleDownload = async () => {
    await handleGeneratePackage();
  };

  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    try {
      const mergedPdf = await PDFDocument.create();

      console.log("[PackageStep] Starting package generation with", uploadedDocs.length, "total docs");

      // Filter and sort docs based on DOCS_CONFIG
      for (const config of DOCS_CONFIG) {
        const matches = uploadedDocs.filter(d => matchDoc(d, config.id));

        if (matches.length > 0) {
          console.log(`[PackageStep] Found ${matches.length} matches for ${config.id}:`, matches.map(m => m.name));
        }

        matches.sort((a, b) => a.name.localeCompare(b.name));

        for (const doc of matches) {
          try {
            const storagePath = doc.path || (doc as any).storage_path;
            if (!storagePath) {
              console.error(`Skipping ${doc.name} because it has no path:`, doc);
              continue;
            }

            const fileName = storagePath.split('/').pop() || doc.name;
            toast.loading(
              lang === "pt" ? `Mesclando: ${fileName}...` : `Merging: ${fileName}...`,
              { id: 'merge-status' }
            );

            const { data, error } = await supabase.storage
              .from(doc.bucket_id || "process-documents")
              .download(storagePath);


            if (error) {
              console.error(`Error downloading ${storagePath}:`, error);
              toast.error(lang === "pt" ? `Erro ao baixar: ${fileName}` : `Error downloading: ${fileName}`, { id: `err-${doc.name}` });
              continue;
            }

            const arrayBuffer = await data.arrayBuffer();
            const ext = storagePath.split('.').pop()?.toLowerCase() || '';
            const contentType = data.type;
            const isPdf = contentType === 'application/pdf' || ext === 'pdf';
            const isImage = contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext);

            if (isPdf) {
              try {
                const donorPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                console.log(`[Package] Successfully added PDF: ${storagePath}`);
              } catch (pdfErr) {
                console.error(`Error loading PDF ${storagePath}:`, pdfErr);
                toast.error(lang === "pt" ? `PDF inválido: ${fileName}` : `Invalid PDF: ${fileName}`, { id: `err-${doc.name}` });
              }
            } else if (isImage) {
              let image;
              try {
                image = await mergedPdf.embedJpg(arrayBuffer);
              } catch {
                try {
                  image = await mergedPdf.embedPng(arrayBuffer);
                } catch (imgErr) {
                  console.error(`Could not embed image ${storagePath} directly:`, imgErr);
                  toast.error(lang === "pt" ? `Imagem não suportada: ${fileName}` : `Unsupported image: ${fileName}`, { id: `err-${doc.name}` });
                  continue;
                }
              }

              if (image) {
                const page = mergedPdf.addPage();
                const { width, height } = image.scale(1);
                const pageWidth = page.getWidth();
                const pageHeight = page.getHeight();
                const margin = 50;
                const maxWidth = pageWidth - (margin * 2);
                const maxHeight = pageHeight - (margin * 2);
                const scale = Math.min(maxWidth / width, maxHeight / height, 1);
                const scaledWidth = width * scale;
                const scaledHeight = height * scale;

                page.drawImage(image, {
                  x: (pageWidth - scaledWidth) / 2,
                  y: (pageHeight - scaledHeight) / 2,
                  width: scaledWidth,
                  height: scaledHeight,
                });
                console.log(`[Package] Successfully added image: ${storagePath}`);
              }
            } else {
              console.warn(`[Package] Skipping ${storagePath} because it is neither PDF nor Image.`);
            }
          } catch (err) {
            console.error(`Error processing ${doc.name}:`, err);
          }
        }
      }

      if (mergedPdf.getPageCount() === 0) {
        toast.error(lang === "pt" ? "Nenhum documento encontrado para gerar o pacote." : "No documents found to generate the package.", { id: 'merge-status' });
        return;
      }

      console.log(`[PackageStep] Final PDF has ${mergedPdf.getPageCount()} pages`);
      toast.success(lang === "pt" ? `Pacote montado: ${mergedPdf.getPageCount()} páginas.` : `Package assembled: ${mergedPdf.getPageCount()} pages.`, { id: 'merge-status' });

      const mergedPdfBytes = await mergedPdf.save();
      const pdfBlob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Pacote_Completo_COS_${formData.fullName || 'Applicant'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      toast.success(lang === "pt" ? "Pacote gerado com sucesso!" : "Package generated successfully!");
    } catch (error) {
      console.error("Error generating package:", error);
      toast.error(lang === "pt" ? "Erro ao gerar o pacote." : "Error generating package.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAddress = () => {
    const address = "U.S. Citizenship and Immigration Services\nATTN: I-539\n2501 S. State Highway 121 Business\nSuite 400\nLewisville, TX 75067";
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success(lang === "pt" ? "Endereço copiado!" : "Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextSteps = [
    { icon: Printer, title: lang === "pt" ? "Imprimir" : "Print", desc: lang === "pt" ? "Imprima todo o pacote em cores ou P&B." : "Print the entire package in color or B&W." },
    { icon: Signature, title: lang === "pt" ? "Assinar" : "Sign", desc: lang === "pt" ? "Assine manualmente com caneta PRETA." : "Sign manually with BLACK pen." },
    { icon: DollarSign, title: lang === "pt" ? "Pagar" : "Pay", desc: lang === "pt" ? "Confira o formulário G-1450 de pagamento." : "Check the G-1450 payment form." },
    { icon: Truck, title: lang === "pt" ? "Enviar" : "Ship", desc: lang === "pt" ? "Envie via FedEx/UPS com rastreio." : "Ship via FedEx/UPS with tracking." },
  ];

  const clientFullName = formData.fullName || `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Applicant";

  const getSigningInstruction = (dependent: any) => {
    if (!dependent.birthDate) return "";
    const birth = new Date(dependent.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

    if (age < 14) {
      return lang === "pt"
        ? `Deve ser assinado pelo Aplicante Principal (${clientFullName})`
        : `Must be signed by the Main Applicant (${clientFullName})`;
    } else {
      return lang === "pt"
        ? `Deve ser assinado pelo próprio dependente (${dependent.name})`
        : `Must be signed by the dependent themselves (${dependent.name})`;
    }
  };

  const i94Date = formData.i94AuthorizedStayDate || (formData as any).i94Date;
  const deadlineDate = i94Date ? new Date(new Date(i94Date).getTime() - 7 * 24 * 60 * 60 * 1000) : null;

  // Filter docs for the list
  const docsInList = DOCS_CONFIG.filter(config =>
    uploadedDocs.some(d => matchDoc(d, config.id))
  );

  const dependentsCount = formData?.dependents?.length || 0;
  const financialRequirement = 22000 + (dependentsCount * 5000);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {lang === "pt" ? "Seu Pacote está Pronto!" : "Your Package is Ready!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === "pt" ? "Siga as instruções abaixo para finalizar seu processo." : "Follow the instructions below to finalize your process."}
            </p>
          </div>
        </div>
      </div>

      {/* 0. Instructions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50 space-y-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            <h4 className="font-bold text-sm uppercase">{lang === "pt" ? "Registro I-94" : "I-94 Record"}</h4>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            {lang === "pt"
              ? "Certifique-se de que o I-94 do Aplicante Principal e de todos os dependentes foi incluído. Baixe no site oficial:"
              : "Ensure the I-94 for the Main Applicant and all dependents was included. Download from the official site:"}
          </p>
          <a
            href="https://i94.cbp.dhs.gov/I94/#/recent-search"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
          >
            SITE OFICIAL I-94 (CBP) <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50 space-y-3">
          <div className="flex items-center gap-2 text-purple-700">
            <TrendingUp className="h-5 w-5" />
            <h4 className="font-bold text-sm uppercase">{lang === "pt" ? "Comprovação Financeira" : "Financial Proof"}</h4>
          </div>
          <div className="space-y-1 text-xs text-purple-600 font-medium">
            <p>• {lang === "pt" ? "Principal: U$ 22,000" : "Principal: U$ 22,000"}</p>
            <p>• {lang === "pt" ? `Dependentes (${dependentsCount}): U$ ${dependentsCount * 5000}` : `Dependents (${dependentsCount}): U$ ${dependentsCount * 5000}`}</p>
            <div className="pt-1 border-t border-purple-200 mt-1">
              <p className="font-bold text-purple-800 underline decoration-purple-300">
                {lang === "pt" ? `Total Mínimo: U$ ${financialRequirement.toLocaleString()}` : `Minimum Total: U$ ${financialRequirement.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Download Section */}
      <div className={cn(
        "rounded-3xl border p-8 text-center space-y-6 transition-all duration-500",
        isSuccess ? "border-green-500 bg-green-50 shadow-green-100" : "border-primary/20 bg-primary/5 shadow-sm"
      )}>
        <div className="space-y-2">
          {isSuccess ? (
            <div className="rounded-full bg-green-100 p-3 w-fit mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          ) : (
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          )}
          <h3 className="font-bold text-lg uppercase tracking-wider">
            {isSuccess ? (lang === "pt" ? "Pacote Gerado com Sucesso!" : "Package Generated Successfully!") : (lang === "pt" ? "Download do Processo" : "Process Download")}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {lang === "pt"
              ? "Clique no botão abaixo para baixar o PDF único contendo todos os seus formulários e documentos organizados."
              : "Click the button below to download the single PDF containing all your forms and organized documents."}
          </p>
        </div>

        {/* 1.1 Documents Summary List */}
        <div className="max-w-md mx-auto bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-border/50 overflow-hidden mb-6 text-left">
          <div className="px-4 py-3 bg-muted/50 border-b border-border/50 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileCheck2 className="h-3.5 w-3.5" />
              {lang === "pt" ? "Documentos Incluídos" : "Included Documents"}
            </h4>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {docsInList.length} {lang === "pt" ? "Arquivos" : "Files"}
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border/30">
            {docsInList.length > 0 ? (
              docsInList.map((doc, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="h-6 w-6 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-foreground truncate flex-1">
                    {doc.label[lang === "pt" ? "pt" : "en"]}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-[11px] text-muted-foreground">
                  {lang === "pt" ? "Nenhum documento carregado ainda." : "No documents uploaded yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isGenerating}
          className="h-14 px-10 gap-3 font-bold text-base bg-accent hover:bg-green-dark shadow-lg hover:scale-105 transition-all w-full sm:w-auto"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isGenerating
            ? (lang === "pt" ? "GERANDO PACOTE..." : "GENERATING PACKAGE...")
            : isSuccess 
              ? (lang === "pt" ? "BAIXAR NOVAMENTE" : "DOWNLOAD AGAIN")
              : (lang === "pt" ? "BAIXAR PACOTE COMPLETO (PDF)" : "DOWNLOAD FULL PACKAGE (PDF)")}
        </Button>
      </div>

      {/* 2. Next Steps Roadmap */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {nextSteps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-3">
              <step.icon className="h-5 w-5" />
            </div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1">{step.title}</h5>
            <p className="text-[9px] text-muted-foreground leading-tight">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* 2. Signing Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {lang === "pt" ? "Instruções de Assinatura" : "Signing Instructions"}
          </h4>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] leading-relaxed">
              <p className="font-bold text-foreground mb-1">Formulário I-539 (Principal):</p>
              <p>• Pàg 5, Parte 5, item 4 - Assine seu nome.</p>
              <p>• I-20 Pág 1 - Assine conforme indicado.</p>
            </div>

            {formData.dependents && formData.dependents.length > 0 && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] leading-relaxed space-y-3">
                <p className="font-bold text-foreground mb-1 uppercase tracking-tighter">Dependentes (I-539A):</p>
                {formData.dependents.map((dep: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <p className="font-bold text-primary">{dep.name}:</p>
                    <p>• {getSigningInstruction(dep)}</p>
                    <p>• Local: Pág 3, Parte 4, item 4.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 relative group">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {lang === "pt" ? "Endereço de Envio" : "Shipping Address"}
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyAddress}
              className="h-7 px-2 text-[10px] font-bold uppercase gap-1.5"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? (lang === "pt" ? "Copiado" : "Copied") : (lang === "pt" ? "Copiar" : "Copy")}
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1 relative">
            <p>U.S. Citizenship and Immigration Services</p>
            <p>ATTN: I-539</p>
            <p>2501 S. State Highway 121 Business</p>
            <p>Suite 400</p>
            <p>Lewisville, TX 75067</p>
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-normal">
            {lang === "pt"
              ? "Recomendamos o uso de FedEx ou UPS com número de rastreamento (Tracking Number)."
              : "We recommend using FedEx or UPS with a tracking number."}
          </p>
        </div>
      </div>

      {/* 3. Deadline Alert */}
      {deadlineDate && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-red-700 text-sm">
              {lang === "pt" ? "Data Limite de Envio" : "Shipping Deadline"}
            </h4>
            <p className="text-xs text-red-600 leading-normal">
              {lang === "pt"
                ? `Para sua segurança, seu envelope deve ser enviado até o dia ${deadlineDate.toLocaleDateString("pt-BR")}.`
                : `For your safety, your envelope must be shipped by ${deadlineDate.toLocaleDateString("en-US")}.`}
              <br />
              {lang === "pt"
                ? "(Pelo menos 1 semana antes do vencimento do seu I-94)."
                : "(At least 1 week before your I-94 expires)."}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
        <Info className="h-5 w-5 text-blue-500 shrink-0" />
        <p className="text-[11px] text-blue-700 leading-normal font-medium">
          {lang === "pt"
            ? "Lembre-se de conferir se todas as assinaturas estão preenchidas MANUALMENTE com caneta preta antes de colocar no envelope."
            : "Remember to check if all signatures are filled out MANUALLY with black pen before placing in the envelope."}
        </p>
      </div>
    </div>
  );
};
