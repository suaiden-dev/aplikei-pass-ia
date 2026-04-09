import { useState, useEffect } from "react";
import { 
  RiDownload2Line,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiPrinterLine,
  RiEditLine,
  RiMoneyDollarCircleLine,
  RiTruckLine,
  RiExternalLinkLine,
  RiFileTextLine,
  RiCheckboxCircleFill,
  RiFlashlightFill,
  RiFileList3Line,
  RiFileCopyLine,
  RiArrowRightLine
} from "react-icons/ri";
import { toast } from "sonner";
import { type UserService, processService } from "../../../services/process.service";
import { packageService } from "../../../services/package.service";
import { 
  RiThumbUpLine, 
  RiThumbDownLine, 
  RiSpam2Line,
  RiInformationFill
} from "react-icons/ri";

interface Props {
  proc: UserService;
  onComplete: () => void;
}

export default function FinalPackageStep({ proc, onComplete }: Props) {
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;

  // Detect if already approved
  useEffect(() => {
    if (data.uscis_official_result === 'approved') {
      setShowCelebration(true);
    }
  }, [data.uscis_official_result]);

  useEffect(() => {
    if (data.finalPackagePdfUrl) {
      setMergedPdfUrl(data.finalPackagePdfUrl as string);
    }
  }, [data.finalPackagePdfUrl]);

  const handleDownloadPackage = async () => {
    if (mergedPdfUrl) {
      window.open(mergedPdfUrl, "_blank");
      return;
    }

    setIsMerging(true);
    try {
      const url = await packageService.mergeAndUploadPackage(proc.id, proc.user_id!);
      setMergedPdfUrl(url);
      window.open(url, "_blank");
      toast.success("Package generated successfully!");
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Error generating package: " + err.message);
    } finally {
      setIsMerging(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleReportResult = async (result: 'approved' | 'denied' | 'rfe') => {
    try {
      toast.loading("Salvando resultado...", { id: "report" });
      await processService.updateStepData(proc.id, { 
        uscis_official_result: result,
        uscis_reported_at: new Date().toISOString()
      });
      
      toast.success("Resultado reportado com sucesso!", { id: "report" });

      if (result === 'approved') {
        setShowCelebration(true);
      } else if (result === 'denied' || result === 'rfe') {
        // Advance to Motion/RFE Explanation step (handled by index.tsx jump logic)
        onComplete();
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Erro: " + err.message, { id: "report" });
    }
  };

  const handleFinishProcess = async () => {
    try {
      toast.loading("Finalizando processo...", { id: "finish" });
      await processService.updateProcessStatus(proc.id, 'completed');
      toast.success("Processo concluído com sucesso!", { id: "finish" });
      window.location.href = "/dashboard";
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message, { id: "finish" });
    }
  };

  if (showCelebration) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-24 h-24 rounded-[32px] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform">
           <RiCheckDoubleLine className="text-5xl" />
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tighter italic">Congratulations!</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-12">
          Seu pedido de <strong>Troca de Status</strong> foi oficialmente aprovado pelo USCIS! Estamos muito felizes por fazer parte dessa conquista.
        </p>

        <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-xl shadow-slate-200/50 mb-12 max-w-lg w-full relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <RiCheckDoubleLine className="text-8xl" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 italic">Next Step</p>
              <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Enjoy your stay in the US</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Agora que seu status foi atualizado, lembre-se de manter suas obrigações legais e aproveitar sua nova jornada!
              </p>
           </div>
        </div>

        <button
          onClick={handleFinishProcess}
          className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all flex items-center gap-3"
        >
          Finalizar e Ir para Dashboard
          <RiArrowRightLine className="text-xl" />
        </button>
      </div>
    );
  }

  const documentsOrder = [
    { name: "G-1145 (e-Notification)", ready: !!data.g1145PdfUrl },
    { name: "G-1450 (Credit Card Auth)", ready: !!data.g1450PdfUrl },
    { name: "Form I-539 (Main Applicant)", ready: !!data.i539PdfUrl },
    { name: "Form I-539A (Dependents)", ready: !!data.dependents },
    { name: "I-94 (Main Applicant)", ready: !!(data.docs as Record<string, string>)?.i94 },
    { name: "I-94 (Dependents)", ready: true },
    { name: "Financial Documents", ready: !!(data.docs as Record<string, string>)?.bankStatement },
    { name: "Cover Letter", ready: !!data.generatedCoverLetterHTML },
    { name: "Passport and Visa", ready: !!(data.docs as Record<string, string>)?.passportVisa },
    { name: "Family Certificates", ready: true },
    { name: "Proof of Residence", ready: !!(data.docs as Record<string, string>)?.proofBrazil },
  ];

  return (
    <div className="space-y-8 pb-32">
      {/* Header Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <RiCheckDoubleLine className="text-4xl" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Package Ready!</h2>
           <p className="text-sm font-medium text-slate-400">Follow the final steps for official shipping to USCIS.</p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* I-94 Card */}
        <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 rounded-[32px] border border-blue-50 flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-4">
               <RiFileList3Line className="text-xl" />
               <span className="text-[10px] font-black uppercase tracking-widest">I-94 Record</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[240px]">
              Ensure all I-94s are included. If missing, download from the CBP portal.
            </p>
          </div>
          <a 
            href="https://i94.cbp.dhs.gov/I94" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline mt-6"
          >
            Site oficial I-94 <RiExternalLinkLine className="text-sm" />
          </a>
        </div>

        {/* Financial Info Card */}
        <div className="bg-gradient-to-br from-purple-50/50 to-white p-8 rounded-[32px] border border-purple-50">
          <div className="flex items-center gap-2 text-purple-600 mb-6">
             <RiMoneyDollarCircleLine className="text-xl" />
             <span className="text-[10px] font-black uppercase tracking-widest">Financial Info</span>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
               <span>PRINCIPAL</span>
               <span className="text-slate-800">U$ 16,000</span>
             </div>
             <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
               <span>DEP. (0)</span>
               <span className="text-slate-800">U$ 0</span>
             </div>
             <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-purple-600 uppercase">Mínimo Total</span>
                <span className="text-lg font-black text-slate-800 underline decoration-purple-200 underline-offset-4">U$ 16,000</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Download Area */}
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
         <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
            <RiFileTextLine className="text-4xl" />
         </div>
         <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">Full Download</h3>
         <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">
           We generated a single PDF with all your data and forms organized in the correct order required by USCIS.
         </p>

         {/* Docs Checklist Mockup */}
         <div className="max-w-md mx-auto bg-slate-50/50 rounded-3xl border border-slate-100 p-8 mb-10 text-left space-y-4">
            {documentsOrder.map((doc, i) => (
              <div key={i} className="flex items-center gap-3">
                {doc.ready ? (
                  <RiCheckboxCircleFill className="text-emerald-500 text-lg" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                )}
                <span className={`text-[11px] font-black uppercase tracking-widest ${doc.ready ? 'text-slate-700' : 'text-slate-300'}`}>
                  {doc.name}
                </span>
              </div>
            ))}
         </div>

         <button
           onClick={handleDownloadPackage}
           disabled={isMerging}
           className="bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
         >
           {isMerging ? <RiLoader4Line className="text-xl animate-spin" /> : <RiDownload2Line className="text-xl" />}
           {mergedPdfUrl ? "Download Final Package" : "Generate Final Package"}
         </button>
      </div>

      {/* Action Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { icon: RiPrinterLine, title: "Print", sub: "Show package in colorful wax" },
           { icon: RiEditLine, title: "Sign", sub: "Handwrite BLACK PEN" },
           { icon: RiMoneyDollarCircleLine, title: "Pay", sub: "Check credit card limit" },
           { icon: RiTruckLine, title: "Ship", sub: "FEDEX / UPS with tracking" },
         ].map((item, i) => (
           <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 text-center shadow-sm">
             <item.icon className="text-2xl text-primary mx-auto mb-3" />
             <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">{item.title}</h4>
             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{item.sub}</p>
           </div>
         ))}
      </div>

      {/* Signs & Shipping Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Signatures Card */}
         <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
               <RiEditLine className="text-2xl text-blue-500" />
               <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Signatures</h4>
            </div>
            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-50 space-y-4">
               <div>
                  <h5 className="text-[9px] font-black text-blue-600 uppercase mb-2">Form I-539 (Principal)</h5>
                  <ul className="text-[11px] font-bold text-slate-500 space-y-1 pl-4 list-disc">
                     <li>Pág 5, Parte 5, Item 4 - Com seu nome</li>
                     <li>I-20 Pág 1 - Assinatura requerida</li>
                  </ul>
               </div>
            </div>
         </div>

         {/* Shipping Card */}
         <div className="bg-primary p-1 rounded-[32px] shadow-xl shadow-primary/20">
            <div className="bg-primary rounded-[30px] p-8 text-white relative overflow-hidden">
               <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-[16px] border-white" />
               </div>
               
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-2">
                     <RiTruckLine className="text-xl" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard("U.S. Citizenship and Immigration Services\nATTN: I-539\n2501 S. State Highway 121 Business\nSuite 400\nLewisville, TX 75067")}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                     <RiFileCopyLine className="text-sm" />
                     <span className="text-[8px] font-black uppercase">Copiar Endereço</span>
                  </button>
               </div>

               <div className="bg-white rounded-2xl p-6 text-slate-800 font-serif text-sm leading-relaxed mb-6 shadow-inner tracking-wide h-40 flex items-center justify-center">
                  <div className="text-center font-mono">
                     <p>U.S. Citizenship and Immigration Services</p>
                     <p>ATTN: I-539</p>
                     <p>2501 S. State Highway 121 Business</p>
                     <p>Suite 400</p>
                     <p>Lewisville, TX 75067</p>
                  </div>
               </div>

               <div className="flex items-center gap-3 relative z-10">
                  <RiCheckboxCircleFill className="text-primary-foreground opacity-40 text-xl" />
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-tight">Use FedEX/UPS with Tracking Number.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-8 space-y-4">
         <button
           onClick={onComplete}
           className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
         >
           Go to Tracking
           <RiFlashlightFill className="text-lg" />
         </button>

         <div className="bg-blue-600 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
               <RiFlashlightFill className="text-6xl rotate-12" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
               <RiFlashlightFill className="text-xl" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider relative z-10">
              Premium Tip: Use professional black pen and double check all signatures!
            </p>
         </div>

         {/* Official USCIS Feedback Form */}
         <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 mt-4 shadow-sm relative overflow-hidden group/feedback">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/feedback:opacity-10 transition-opacity">
               <RiThumbUpLine className="text-8xl rotate-12" />
            </div>
            
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-3 shadow-sm">
                  <RiInformationFill className="text-primary text-base" />
               </div>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Reporte o resultado final</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Quando tiver o retorno oficial do USCIS, nos conte por aqui:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
               <button
                 onClick={() => handleReportResult('approved')}
                 className="flex flex-col items-center justify-center p-8 bg-white border border-emerald-100 rounded-[24px] hover:bg-emerald-50 hover:border-emerald-200 transition-all group/btn shadow-sm hover:shadow-md"
               >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all shadow-inner border border-emerald-100/50">
                     <RiThumbUpLine className="text-2xl" />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Aprovado</span>
               </button>

               <button
                 onClick={() => handleReportResult('denied')}
                 className="flex flex-col items-center justify-center p-8 bg-white border border-red-100 rounded-[24px] hover:bg-red-50 hover:border-red-200 transition-all group/btn shadow-sm hover:shadow-md"
               >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:-rotate-6 transition-all shadow-inner border border-red-100/50">
                     <RiThumbDownLine className="text-2xl" />
                   </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Reprovado</span>
               </button>

               <button
                 onClick={() => handleReportResult('rfe')}
                 className="flex flex-col items-center justify-center p-8 bg-white border border-amber-100 rounded-[24px] hover:bg-amber-50 hover:border-amber-200 transition-all group/btn shadow-sm hover:shadow-md"
               >
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all shadow-inner border border-amber-100/50">
                     <RiSpam2Line className="text-2xl" />
                  </div>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest text-center leading-tight">Recebi uma RFE<br/>(Request for Evidence)</span>
               </button>
            </div>
         </div>
       </div>
    </div>
  );
}
