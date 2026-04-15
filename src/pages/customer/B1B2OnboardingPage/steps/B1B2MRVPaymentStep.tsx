import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiBankCard2Line,
  RiBarcodeLine,
  RiCheckLine,
  RiInformationLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiShieldUserLine,
  RiLockLine,
} from "react-icons/ri";
import { processService } from "../../../../services/process.service";
import { notificationService } from "../../../../services/notification.service";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { useT } from "../../../../i18n";

interface B1B2MRVPaymentStepProps {
  procId: string;
  stepData: Record<string, unknown>;
  onComplete: () => void;
}

export function B1B2MRVPaymentStep({ procId, stepData, onComplete }: B1B2MRVPaymentStepProps) {
  const [method, setMethod] = useState<"credit_card" | "boleto" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useT("visas");

  const login = (stepData.mrv_login as string) || t.onboardingPage.paymentPending.notInformed;
  const password = (stepData.mrv_password as string) || t.onboardingPage.paymentPending.notInformed;
  const boletoPath = stepData.mrv_boleto_path as string;
  const boletoUrl = boletoPath ? supabase.storage.from("profiles").getPublicUrl(boletoPath).data.publicUrl : null;

  const handleConfirm = async () => {
    if (!method) return;
    setIsSubmitting(true);
    try {
      await processService.updateStepData(procId, {
        mrv_payment_method: method,
        mrv_payment_confirmed_at: new Date().toISOString(),
      });
      await processService.approveStep(procId, 10, false); 
      // Notifica admin para o agendamento final
      await processService.updateProcessStatus(procId, "awaiting_review");
      
      // Notify Admin
      await notificationService.notifyAdmin({
        title: "💳 Taxa MRV Confirmada",
        body: `O cliente confirmou o pagamento da taxa MRV (${method === 'credit_card' ? 'Cartão' : 'Boleto'}). O processo aguarda agendamento final no portal.`,
        serviceId: procId,
      });

      toast.success(t.onboardingPage.paymentPending.paymentProcessed);
      onComplete();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <RiBankCard2Line className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.onboardingPage.paymentPending.mrvFeeTitle}</h2>
        <p className="text-sm font-medium text-slate-400 mt-2">{t.onboardingPage.paymentPending.mrvFeeDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMethod("credit_card")}
          className={`p-6 rounded-[28px] border-2 transition-all text-left flex flex-col gap-4 ${
            method === "credit_card" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-slate-100 bg-white hover:border-slate-200"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === "credit_card" ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
            <RiBankCard2Line className="text-2xl" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{t.onboardingPage.paymentPending.creditCard}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t.onboardingPage.paymentPending.immediatePayment}</p>
          </div>
          {method === "credit_card" && <div className="ml-auto w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><RiCheckLine /></div>}
        </button>

        <button
          onClick={() => setMethod("boleto")}
          className={`p-6 rounded-[28px] border-2 transition-all text-left flex flex-col gap-4 ${
            method === "boleto" ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-slate-100 bg-white hover:border-slate-200"
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === "boleto" ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
            <RiBarcodeLine className="text-2xl" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{t.onboardingPage.paymentPending.bankSlip}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{t.onboardingPage.paymentPending.compensationDesc}</p>
          </div>
          {method === "boleto" && <div className="ml-auto w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"><RiCheckLine /></div>}
        </button>
      </div>

      {method === "credit_card" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-[28px] flex gap-4">
             <RiInformationLine className="text-2xl text-amber-600 shrink-0" />
             <div className="text-xs text-amber-800 font-medium leading-relaxed">
                {t.onboardingPage.paymentPending.accessPortalDesc}
             </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl overflow-hidden">
             <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
                <RiShieldUserLine className="text-primary" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.onboardingPage.paymentPending.portalAccessTitle}</h4>
             </div>
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.paymentPending.login}</p>
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <RiShieldUserLine className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-800 font-mono">{login}</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.onboardingPage.paymentPending.password}</p>
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <RiLockLine className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-800 font-mono">{password}</span>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-slate-900 text-center">
                <a href="https://ais.usvisa-info.com/pt-br/niv/users/sign_in" target="_blank" rel="noreferrer" className="text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:underline">
                   {t.onboardingPage.paymentPending.goToPortal} <RiExternalLinkLine className="text-lg" />
                </a>
             </div>
          </div>
        </motion.div>
      )}

      {method === "boleto" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl overflow-hidden">
             <div className="p-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                      <RiBarcodeLine className="text-3xl" />
                   </div>
                   <div>
                      <h4 className="text-base font-black text-slate-800">{t.onboardingPage.paymentPending.mrvBoletoTitle}</h4>
                      <p className="text-xs text-slate-400 font-medium">{t.onboardingPage.paymentPending.mrvBoletoDesc}</p>
                   </div>
                </div>
                {boletoUrl ? (
                   <a
                     href={boletoUrl}
                     target="_blank"
                     rel="noreferrer"
                     className="px-8 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"
                   >
                     <RiExternalLinkLine /> {t.onboardingPage.paymentPending.downloadPdfSlip}
                   </a>
                ) : (
                   <p className="text-xs font-bold text-red-500">{t.onboardingPage.paymentPending.boletoNotAvailable}</p>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {method && (
        <div className="pt-8 border-t border-slate-100">
           <button
             onClick={handleConfirm}
             disabled={isSubmitting || (method === "boleto" && !boletoUrl)}
             className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isSubmitting ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-xl" /> {t.onboardingPage.paymentPending.confirmPaymentBtn}</>}
           </button>
           <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">
              {t.onboardingPage.paymentPending.paymentDisclaimer}
           </p>
        </div>
      )}
    </div>
  );
}
