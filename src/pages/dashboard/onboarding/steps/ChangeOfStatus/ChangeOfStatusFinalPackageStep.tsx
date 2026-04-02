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
  Check,
  Zap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from 'pdf-lib';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DOCS_CONFIG = [
  { id: "cos_g1145", label: { pt: "G-1145 (Notificação)", en: "G-1145 (e-Notification)" } },
  { id: "cos_g1450", label: { pt: "G-1450 (Autorização Cartão)", en: "G-1450 (Credit Card Auth)" } },
  { id: "cos_i539", label: { pt: "Formulário I-539 – Principal", en: "Form I-539 – Main Applicant" } },
  { id: "cos_i539a_official", label: { pt: "Formulário I-539A – Dependentes", en: "Form I-539A – Dependents" } },
  { id: "cos_i94", label: { pt: "I-94 – Aplicante principal", en: "I-94 – Main Applicant" } },
  { id: "cos_i94_dependent", label: { pt: "I-94 – Dependentes", en: "I-94 – Dependents" } },
  { id: "cos_i20_official", label: { pt: "I-20 F1", en: "I-20 F1" } },
  { id: "cos_i20_f2", label: { pt: "I-20 F2", en: "I-20 F2" } },
  { id: "cos_sevis_voucher", label: { pt: "Taxa SEVIS I-901", en: "SEVIS Fee I-901" } },
  { id: "cos_bank_statement", label: { pt: "Comprovação Financeira", en: "Financial Proof" } },
  { id: "cos_cover_letter", label: { pt: "Cover Letter", en: "Cover Letter" } },
  { id: "cos_passport_visa_principal", label: { pt: "Passaporte e Visto: Principal", en: "Passport and Visa: Principal" } },
  { id: "cos_passport_visa_dependent", label: { pt: "Passaporte e Visto: Dependentes", en: "Passport and Visa: Dependents" } },
  { id: "cos_marriage_certificate", label: { pt: "Certidão de Casamento", en: "Marriage Certificate" } },
  { id: "cos_birth_certificate", label: { pt: "Certidão de Nascimento", en: "Birth Certificate" } },
  { id: "cos_proof_of_residence_brazil", label: { pt: "Comprovante de Residência (Brasil)", en: "Proof of Residence (Brazil)" } },
  { id: "cos_supporting_docs", label: { pt: "Documentos de Suporte", en: "Supporting Documents" } },
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
  serviceStatus,
  onNext
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

  const packageDoc = uploadedDocs.find((d) => d.name === "cos_final_package");

  const matchDoc = (d: any, configId: string) => {
    if (d.name === configId) return true;
    if (d.name.startsWith(`${configId}_`)) {
      if (configId === "cos_i94" && d.name.startsWith("cos_i94_dependent")) return false;
      if (configId === "cos_passport_visa_principal" && d.name.startsWith("cos_passport_visa_dependent")) return false;
      if (configId === "cos_i539" && d.name.startsWith("cos_i539a_official")) return false;
      if (configId === "cos_i20_official" && d.name.startsWith("cos_i20_f2")) return false;
      return true;
    }
    if (configId === "cos_i539" && d.name === "i539_oficial") return true;
    if (configId === "cos_g1145" && d.name === "g1145_oficial") return true;
    if (configId === "cos_g1450" && d.name === "g1450_oficial") return true;
    if (configId === "cos_i539" && d.name === "cos_applicant_form") return true;
    if (configId === "cos_i539" && d.name === "cos_i539_official") return true;
    if (configId === "cos_i539a_official" && d.name === "cos_a_form") return true;
    if (configId === "cos_cover_letter" && d.name === "cos_cover_letter_official") return true;
    if (configId === "cos_g1145" && d.name === "cos_g1145_voucher") return true;
    if (configId === "cos_g1450" && d.name === "cos_g1450_voucher") return true;
    return false;
  };

  const getPrioritizedMatches = (matches: any[]) => {
    if (matches.length <= 1) return matches;
    const oficialMatches = matches.filter(m => m.name.endsWith("_oficial") || m.name.includes("_oficial_"));
    if (oficialMatches.length > 0) {
      return oficialMatches.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }).slice(0, 1);
    }
    return matches.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleDownload = async () => {
    await handleGeneratePackage();
  };

  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    try {
      const mergedPdf = await PDFDocument.create();
      console.log("[PackageStep] Starting package generation with", uploadedDocs.length, "total docs");

      for (const config of DOCS_CONFIG) {
        let matches = uploadedDocs.filter(d => matchDoc(d, config.id));
        matches = getPrioritizedMatches(matches);

        for (const doc of matches) {
          try {
            const storagePath = doc.path || (doc as any).storage_path;
            if (!storagePath) continue;

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
              } catch (pdfErr) {
                console.error(`Error loading PDF ${storagePath}:`, pdfErr);
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
              }
            }
          } catch (err) {
            console.error(`Error processing ${doc.name}:`, err);
          }
        }
      }

      if (mergedPdf.getPageCount() === 0) {
        toast.error(lang === "pt" ? "Nenhum documento encontrado." : "No documents found.", { id: 'merge-status' });
        return;
      }

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
    { icon: Printer, title: lang === "pt" ? "Imprimir" : "Print", desc: lang === "pt" ? "Todo o pacote em cores ou P&B." : "Whole package in color or B&W." },
    { icon: Signature, title: lang === "pt" ? "Assinar" : "Sign", desc: lang === "pt" ? "Manualmente com caneta PRETA." : "Manually with BLACK pen." },
    { icon: DollarSign, title: lang === "pt" ? "Pagar" : "Pay", desc: lang === "pt" ? "Check G-1450 auth form." : "Check G-1450 auth form." },
    { icon: Truck, title: lang === "pt" ? "Enviar" : "Ship", desc: lang === "pt" ? "FedEx/UPS com rastreio." : "FedEx/UPS with tracking." },
  ];

  const clientFullName = formData.fullName || `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Applicant";

  const getSigningInstruction = (dependent: any) => {
    if (!dependent.birthDate) return "";
    const birth = new Date(dependent.birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;

    return age < 14
      ? (lang === "pt" ? `Assinado pelo Principal (${clientFullName})` : `Signed by Principal (${clientFullName})`)
      : (lang === "pt" ? `Assinado pelo dependente (${dependent.name})` : `Signed by dependent (${dependent.name})`);
  };

  const i94Date = formData.i94AuthorizedStayDate || (formData as any).i94Date;
  const deadlineDate = i94Date ? new Date(new Date(i94Date).getTime() - 7 * 24 * 60 * 60 * 1000) : null;

  const docsInList = DOCS_CONFIG.filter(config => uploadedDocs.some(d => matchDoc(d, config.id)));
  const financialRequirement = 22000 + ((formData?.dependents?.length || 0) * 5000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12 pb-10"
    >
      <div className="flex flex-col space-y-4 border-b border-border/50 pb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[2.5rem] bg-green-500/10 flex items-center justify-center text-green-600 shadow-inner group">
            <PackageCheck className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground uppercase">
              {lang === "pt" ? "Pacote Pronto!" : "Package Ready!"}
            </h2>
            <p className="text-muted-foreground font-medium">
              {lang === "pt" ? "Siga as etapas finais para o envio oficial." : "Follow the final steps for official shipping."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-[2.5rem] border border-blue-200 bg-blue-50/50 backdrop-blur-sm space-y-4 relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:rotate-12 transition-transform">
            <ExternalLink className="h-24 w-24 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 text-blue-700">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Info className="h-4 w-4" /></div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest">{lang === "pt" ? "Registro I-94" : "I-94 Record"}</h4>
          </div>
          <p className="text-sm text-blue-600/80 leading-relaxed font-medium">
            {lang === "pt" ? "Garanta o I-94 de todos. Se faltar algum, baixe no portal oficial da CBP." : "Ensure all I-94s are included. If missing, download from the CBP portal."}
          </p>
          <Button variant="outline" asChild className="bg-white border-blue-200 text-blue-600 hover:bg-blue-100 rounded-2xl h-10 px-6 font-black uppercase text-[10px] tracking-widest gap-2">
            <a href="https://i94.cbp.dhs.gov/I94/#/recent-search" target="_blank" rel="noopener noreferrer">
              Site Oficial I-94 <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="p-8 rounded-[2.5rem] border border-purple-200 bg-purple-50/50 backdrop-blur-sm space-y-4 relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:rotate-12 transition-transform">
            <DollarSign className="h-24 w-24 text-purple-600" />
          </div>
          <div className="flex items-center gap-3 text-purple-700">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center"><TrendingUp className="h-4 w-4" /></div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest">{lang === "pt" ? "Financeiro" : "Financial Info"}</h4>
          </div>
          <div className="space-y-2 text-sm text-purple-700/80 font-bold uppercase tracking-tighter">
            <div className="flex justify-between border-b border-purple-200/50 pb-1"><span>Principal</span><span>U$ 22,000</span></div>
            <div className="flex justify-between border-b border-purple-200/50 pb-1"><span>Dep. ({formData?.dependents?.length || 0})</span><span>U$ {(formData?.dependents?.length || 0) * 5000}</span></div>
            <div className="flex justify-between pt-1 text-purple-900"><span className="font-black shrink-0">Mínimo Total</span><span className="bg-purple-200/50 px-2 rounded-lg underline">U$ {financialRequirement.toLocaleString()}</span></div>
          </div>
        </motion.div>
      </div>

      <div className={cn(
        "rounded-[3rem] border-4 p-12 text-center space-y-8 transition-all duration-700 relative overflow-hidden group",
        isSuccess ? "border-green-500/50 bg-green-50/30" : "border-primary/10 bg-primary/5"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="relative z-10 space-y-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/40">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <h3 className="font-display text-3xl font-black uppercase tracking-tight">
              {isSuccess ? (lang === "pt" ? "Pacote Montado!" : "Package Ready!") : (lang === "pt" ? "Download Completo" : "Full Download")}
            </h3>
            <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
              {lang === "pt"
                ? "Geramos um único PDF com todos os seus dados e formulários organizados na ordem correta exigida pela USCIS."
                : "We generated a single PDF with all your data and forms organized in the correct order required by USCIS."}
            </p>
          </div>

          <div className="max-w-md mx-auto bg-card rounded-[2rem] border border-border/50 overflow-hidden shadow-xl text-left">
            <div className="px-6 py-4 bg-muted/30 border-b border-border/50 flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" /> {lang === "pt" ? "Documentos" : "Docs"}
              </h4>
              <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
                {docsInList.length} {lang === "pt" ? "Itens" : "Items"}
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-primary/10">
              {docsInList.map((doc, idx) => (
                <div key={idx} className="px-4 py-3 rounded-xl flex items-center gap-4 hover:bg-primary/5 transition-colors group/item">
                  <div className="h-6 w-6 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 transition-colors group-hover/item:bg-green-500 group-hover/item:text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground/80 truncate flex-1">
                    {doc.label[lang === "pt" ? "pt" : "en"]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleDownload}
            disabled={isGenerating}
            className="h-20 px-16 gap-4 font-black uppercase text-sm tracking-widest bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all rounded-[2rem] w-full sm:w-auto overflow-hidden relative group/btn"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
            {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6 group-hover/btn:rotate-12 transition-transform" />}
            {isGenerating ? "PROCESSANDO..." : (isSuccess ? "RE-DOWNLOAD" : "BAIXAR PACOTE COMPLETO")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {nextSteps.map((step, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="flex flex-col items-center text-center p-6 rounded-[2rem] border border-border/50 bg-card/10 backdrop-blur-sm shadow-lg group"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-4 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
              <step.icon className="h-6 w-6" />
            </div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">{step.title}</h5>
            <p className="text-[9px] text-muted-foreground font-medium leading-relaxed opacity-60">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[2.5rem] border border-border/50 bg-card/20 backdrop-blur-sm p-10 space-y-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Signature className="h-5 w-5" /></div>
            <h4 className="font-display font-black text-sm uppercase tracking-[0.2em]">{lang === "pt" ? "Assinaturas" : "Signatures"}</h4>
          </div>
          <div className="space-y-4">
            <div className="p-5 rounded-[1.5rem] bg-card border border-border/50 text-xs font-medium space-y-2">
              <p className="font-black text-primary uppercase text-[10px] mb-2">Form I-539 (Principal):</p>
              <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span>Pág 5, Parte 5, Item 4 - Cante seu nome</span></div>
              <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> <span>I-20 Pág 1 - Assinatura requerida</span></div>
            </div>

            {formData.dependents?.length > 0 && (
              <div className="p-5 rounded-[1.5rem] bg-card border border-border/50 space-y-4">
                <p className="font-black text-primary uppercase text-[10px]">Dependentes (I-539A):</p>
                {formData.dependents.map((dep: any, i: number) => (
                  <div key={i} className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                    <p className="font-bold text-foreground">{dep.name}:</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">• {getSigningInstruction(dep)}</p>
                    <p className="text-[11px] text-muted-foreground">• Local: Pág 3, Parte 4, Item 4.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-border/50 bg-primary p-10 space-y-8 shadow-2xl relative overflow-hidden group/addr">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover/addr:rotate-12 transition-transform">
            <MapPin className="h-48 w-48 text-white" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h4 className="font-display font-black text-sm uppercase tracking-[0.2em] text-white">{lang === "pt" ? "Envio" : "Shipping"}</h4>
            <Button
              onClick={copyAddress}
              className="h-9 px-4 rounded-xl bg-white text-primary hover:bg-blue-600 hover:text-white font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl border-none transition-all"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "COPIADO" : "COPIAR ENDEREÇO"}
            </Button>
          </div>
          <div className="font-mono text-sm space-y-2 font-black relative z-10 pl-4 border-l-2 border-second bg-white p-6 rounded-2xl backdrop-blur-sm">
            <p>U.S. Citizenship and Immigration Services</p>
            <p>ATTN: I-539</p>
            <p>2501 S. State Highway 121 Business</p>
            <p>Suite 400</p>
            <p>Lewisville, TX 75067</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
            <ShieldCheck className="h-5 w-5 text-white" />
            <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">
              {lang === "pt" ? "Use FedEx/UPS com Rastreamento (Tracking Number)." : "Use FedEx/UPS with Tracking Number."}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {deadlineDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] bg-red-600 p-8 shadow-2xl shadow-red-600/30 flex flex-col sm:flex-row items-center gap-8 text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500/20 to-red-600 -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out" />
            <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/30 rotate-3">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1 relative z-10 text-center sm:text-left">
              <h4 className="font-display font-black text-xl uppercase tracking-tighter">{lang === "pt" ? "Prazo Crítico!" : "Critical Deadline!"}</h4>
              <p className="text-sm font-medium opacity-90">
                {lang === "pt"
                  ? `Envie seu pacote até ${deadlineDate.toLocaleDateString("pt-BR")} para evitar atrasos no seu status.`
                  : `Ship your package by ${deadlineDate.toLocaleDateString("en-US")} to avoid status lapses.`}
              </p>
            </div>
            <div className="ml-auto relative z-10 bg-white/10 px-6 py-2 rounded-full border border-white/30 font-black text-xs tracking-widest shrink-0">
              {deadlineDate.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 border-t border-border/50">
        <Button
          onClick={onNext}
          className="w-full h-16 gap-3 bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-primary/20 rounded-[2rem] transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {lang === "pt" ? "Ir para Acompanhamento" : "Go to Tracking"}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20 flex gap-6 items-center group relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform"><Sparkles className="h-20 w-20" /></div>
        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shrink-0"><Zap className="h-6 w-6" /></div>
        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
          {lang === "pt"
            ? "DICA PREMIUM: Use caneta preta profissional e confira todas as assinaturas duas vezes!"
            : "PREMIUM TIP: Use professional black pen and double check all signatures!"}
        </p>
      </div>
    </motion.div>
  );
};
