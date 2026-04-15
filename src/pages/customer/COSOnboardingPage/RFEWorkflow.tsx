import { useState } from "react";
import { 
  RiMoneyDollarCircleLine, 
  RiArrowRightLine, 
  RiInformationLine,
  RiCheckDoubleLine,
  RiShieldCheckLine,
  RiSpam2Line,
  RiDownload2Line,
  RiBankCardLine,
  RiQrCodeLine,
  RiCloseLine,
  RiLockLine,
  RiTimeLine,
  RiCheckLine,
  RiLoader4Line,
  RiHistoryLine,
  RiExternalLinkLine
} from "react-icons/ri";
import { MdPix } from "react-icons/md";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { type UserService, processService } from "../../../services/process.service";
import { paymentService } from "../../../services/payment.service";
import { useAuth } from "../../../hooks/useAuth";
import { DocUploadCard } from "../../../components/DocUploadCard";
import { ZELLE_RECIPIENT } from "../../../config/zelle";
import { Input } from "../../../components/Input";
import { Label } from "../../../components/Label";
import { maskCPF, validateCPF } from "../../../utils/cpf";
import { getServiceBySlug } from "../../../data/services";
import { cn } from "../../../utils/cn";
import { useT } from "../../../i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
  proc: UserService;
  onComplete?: () => void;
  onJumpToMotion?: () => void;
  onJumpToNewRFE?: () => void;
}

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface RFEHistoryItem {
  proposal_text: string;
  proposal_amount: number;
  result: "approved" | "rfe" | "denied";
  rfe_letter?: string;
  sent_at: string;
  rfe_final_package?: string;
}

interface RFECheckoutOverlayProps {
  amount: number;
  slug: string;
  proc: UserService;
  onClose: () => void;
}

// ─── Payment method config ────────────────────────────────────────────────────



const ZELLE_EMAIL = ZELLE_RECIPIENT.email;
const ZELLE_PHONE = ZELLE_RECIPIENT.phone;
const ZELLE_NAME = ZELLE_RECIPIENT.name;

// ─── Checkout Overlay ─────────────────────────────────────────────────────────

function RFECheckoutOverlay({ amount, slug, proc, onClose }: RFECheckoutOverlayProps) {
  const t = useT("checkout").product;
  const t_onboarding = useT("onboarding");
  const { user } = useAuth();
  const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
  const [loading, setLoading] = useState(false);
  const [parcelowCpf, setParcelowCpf] = useState("");

  // Zelle state
  const [zelleAmount, setZelleAmount] = useState("");
  const [zelleCode, setZelleCode] = useState("");
  const [zelleDate] = useState(new Date().toISOString().split("T")[0]);
  const [zelleProof, setZelleProof] = useState<File | null>(null);
  const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(null);
  const [zelleDone, setZelleDone] = useState(false);

  const handlePay = async () => {
    if (!user) {
      toast.error(t_onboarding.toasts.noAuth);
      return;
    }

    if (activeMethod === "card" || activeMethod === "pix") {
      setLoading(true);
      try {
        const res = await paymentService.createStripeCheckout({
          slug,
          email: user.email,
          fullName: user.fullName || user.email,
          phone: user.phoneNumber || '',
          paymentMethod: activeMethod as any, // "card" | "pix"
          amount: amount,
          proc_id: proc.id,
          userId: user.id
        });

        if (res.url) window.location.href = res.url;
      } catch (e: unknown) {
        const err = e as Error;
        toast.error(err.message || "Erro no checkout");
      } finally {
        setLoading(false);
      }
    } else if (activeMethod === "zelle") {
      if (!zelleAmount || !zelleCode || !zelleProof) {
        toast.error(t.paymentMethods.zelle.confirmTitle);
        return;
      }
      setLoading(true);
      try {
        const proofPath = await paymentService.uploadZelleProof(zelleProof, slug);

        await paymentService.createZellePayment({
          slug,
          serviceName: "Assessment RFE Support",
          expectedAmount: amount,
          amount: parseFloat(zelleAmount),
          confirmationCode: zelleCode,
          paymentDate: zelleDate,
          proofPath,
          guestEmail: user.email,
          guestName: user.fullName || user.email,
          phone: user.phoneNumber || '',
          userId: user.id,
          proc_id: proc.id
        });

        toast.success(t.paymentMethods.zelle.pendingReview);
        setZelleDone(true);
      } catch (e: unknown) {
        const err = e as Error;
        toast.error(err.message || "Erro no Zelle");
      } finally {
        setLoading(false);
      }
    } else if (activeMethod === "parcelow") {
      if (!validateCPF(parcelowCpf)) {
         toast.error(t.paymentMethods.parcelow.cpfRequired);
         return;
      }
      setLoading(true);
      try {
        const res = await paymentService.createParcelowCheckout({
          slug,
          email: user.email,
          fullName: user.fullName || user.email,
          phone: user.phoneNumber || '',
          cpf: parcelowCpf.replace(/\D/g, ''),
          amount: amount,
          proc_id: proc.id,
          userId: user.id
        });
        if (res.url) window.location.href = res.url;
      } catch (e: unknown) {
        const err = e as Error;
        toast.error(err.message || "Erro Parcelow");
      } finally {
        setLoading(false);
      }
    }
  };

  const onZelleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setZelleProof(file);
      setZelleProofPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-display font-black text-slate-800 text-xl uppercase tracking-tight">{t_onboarding.workflows.shared.assessmentTitle}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t_onboarding.workflows.shared.assessmentSub}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-primary/5 rounded-3xl p-6 mb-8 flex items-center justify-between border border-primary/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">{t.summary.total}</span>
              <span className="text-3xl font-black text-primary tracking-tight">${amount.toFixed(2)}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
               <RiShieldCheckLine className="text-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { id: "card", label: t.paymentMethods.card.label, icon: <RiBankCardLine className="text-xl" /> },
              { id: "pix", label: t.paymentMethods.pix.label, icon: <MdPix className="text-xl" /> },
              { id: "zelle", label: t.paymentMethods.zelle.label, icon: <span className="text-xs font-black tracking-tight leading-none">Z$</span> },
              { id: "parcelow", label: t.paymentMethods.parcelow.label, icon: <span className="text-[10px] font-black tracking-tighter leading-none">PRC</span> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMethod(m.id as PaymentTab)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5",
                  activeMethod === m.id
                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-105"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                )}
              >
                {m.icon}
                <span className="text-[8px] font-black uppercase tracking-tighter">{m.label}</span>
              </button>
            ))}
          </div>

          {activeMethod === "zelle" && !zelleDone && (
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                 <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <RiInformationLine /> {t.paymentMethods.zelle.notice}
                 </h4>
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">{t.paymentMethods.zelle.email} <span className="font-black text-indigo-600">{ZELLE_EMAIL}</span></p>
                    <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">{t.paymentMethods.zelle.phone} <span className="font-black text-indigo-600">{ZELLE_PHONE}</span></p>
                    <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">{t.paymentMethods.zelle.name} <span className="font-black text-indigo-600">{ZELLE_NAME}</span></p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.workflows.checkout.zelle.amountLabel}</Label>
                    <Input type="number" value={zelleAmount} onChange={(e) => setZelleAmount(e.target.value)} placeholder="0.00" className="h-11 rounded-xl text-xs font-black" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.workflows.checkout.zelle.codeLabel}</Label>
                    <Input value={zelleCode} onChange={(e) => setZelleCode(e.target.value)} placeholder={t.workflows.checkout.zelle.codePlaceholder} className="h-11 rounded-xl text-xs font-black" />
                </div>
              </div>
              <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.paymentMethods.zelle.uploadProof}</Label>
                  <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden group">
                     {zelleProofPreview ? (
                        <>
                           <img src={zelleProofPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                           <RiCheckLine className="text-emerald-500 text-2xl relative z-10" />
                           <span className="text-[9px] font-black text-emerald-600 uppercase relative z-10">{t.paymentMethods.zelle.uploadProof}</span>
                        </>
                     ) : (
                        <>
                           <RiQrCodeLine className="text-2xl text-slate-300 group-hover:text-primary transition-colors" />
                           <span className="text-[9px] font-black text-slate-400 uppercase mt-1">{t.paymentMethods.zelle.uploadProof}</span>
                        </>
                     )}
                     <input type="file" accept="image/*" className="hidden" onChange={onZelleFile} />
                  </label>
              </div>
            </div>
          )}

          {activeMethod === "parcelow" && (
            <div className="space-y-4 mb-8">
               <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-4">
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed text-center" dangerouslySetInnerHTML={{ __html: t.paymentMethods.parcelow.notice }} />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.paymentMethods.parcelow.cpfLabel}</Label>
                  <Input 
                    value={parcelowCpf} 
                    onChange={(e) => setParcelowCpf(maskCPF(e.target.value))} 
                    placeholder="000.000.000-00" 
                    className="h-12 rounded-xl text-sm font-black text-center" 
                  />
               </div>
            </div>
          )}

          {activeMethod === "card" && (
            <div className="space-y-4 mb-8">
               <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                  <p className="text-center text-xs font-bold text-slate-500" dangerouslySetInnerHTML={{ __html: t.paymentMethods.card.notice }} />
               </div>
            </div>
          )}

          {activeMethod === "pix" && (
             <div className="space-y-4 mb-8">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl border-dashed flex flex-col items-center">
                   <MdPix className="text-3xl text-emerald-500 mb-2" />
                   <p className="text-center text-xs font-bold text-emerald-700" dangerouslySetInnerHTML={{ __html: t.paymentMethods.pix.notice }} />
                </div>
             </div>
          )}

          {activeMethod === "zelle" && zelleDone && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <RiCheckLine className="text-emerald-500 text-3xl mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">{t.paymentMethods.zelle.pendingReview.split("!")[0]}!</p>
              <p className="text-xs text-slate-500 mt-1">{t.paymentMethods.zelle.pendingReview.split("!")[1] || t.paymentMethods.zelle.pendingReview}</p>
            </div>
          )}

          {!zelleDone && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-[#1649c0] transition-all disabled:opacity-50"
            >
              {loading ? (
                <RiLoader4Line className="animate-spin text-lg" />
              ) : (
                <>
                  <RiLockLine className="text-base" />
                  {activeMethod === "card" && t.paymentMethods.card.label}
                  {activeMethod === "pix" && t.paymentMethods.pix.label}
                  {activeMethod === "zelle" && t.paymentMethods.zelle.submit}
                  {activeMethod === "parcelow" && t.paymentMethods.parcelow.label}
                  <RiArrowRightLine className="text-base" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RFE History Panel ───────────────────────────────────────────────────────

function RFEHistoryPanel({ proc }: { proc: UserService }) {
  const t = useT("onboarding");
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const history = (data.rfe_history as RFEHistoryItem[]) || [];

  if (history.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto mb-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <RiHistoryLine className="text-slate-400" />
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.workflows.rfe.history.title.replace("{count}", String(history.length))}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {history.map((hist, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                hist.result === "approved" ? "bg-emerald-50 text-emerald-500" :
                hist.result === "rfe" ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"
              )}>
                {hist.result === "approved" ? <RiCheckDoubleLine className="text-xl" /> :
                 hist.result === "rfe" ? <RiTimeLine className="text-xl" /> : <RiSpam2Line className="text-xl" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{t.workflows.rfe.history.cycle.replace("{count}", String(idx + 1))}</span>
                  <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight",
                    hist.result === "approved" ? "bg-emerald-100 text-emerald-700" :
                    hist.result === "rfe" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  )}>
                    {hist.result === "approved" ? t.workflows.rfe.history.statusApproved : hist.result === "rfe" ? t.workflows.rfe.history.statusRfe : t.workflows.rfe.history.statusDenied}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium line-clamp-1 italic">"{hist.proposal_text}"</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              {hist.rfe_letter && (
                <a 
                  href={supabase.storage.from('profiles').getPublicUrl(hist.rfe_letter).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-all flex items-center gap-2"
                >
                  <RiExternalLinkLine className="text-sm" /> {t.workflows.rfe.history.btnRfe}
                </a>
              )}
              {hist.rfe_final_package && (
                <a 
                  href={supabase.storage.from('profiles').getPublicUrl(hist.rfe_final_package).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-emerald-100 transition-all flex items-center gap-2"
                >
                  <RiDownload2Line className="text-sm" /> {t.workflows.rfe.history.btnPackage}
                </a>
              )}
            </div>
          </div>
        )).reverse() as React.ReactNode[]}
      </div>
    </div>
  );
}

// ─── RFEExplanationStep ───────────────────────────────────────────────────────

export function RFEExplanationStep({ proc, onComplete: _onComplete }: StepProps) {
  const t = useT("onboarding");
  const [showCheckout, setShowCheckout] = useState(false);
  
  const rfeService = getServiceBySlug('analise-rfe-cos');
  const baseAmount = parseInt(rfeService?.price.replace(/\D/g, '') || "50");

  return (
    <>
      <RFEHistoryPanel proc={proc} />
      
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
             <RiInformationLine className="text-4xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">{t.workflows.rfe.explanation.title}</h2>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-10 overflow-hidden" dangerouslySetInnerHTML={{ __html: t.workflows.rfe.explanation.desc }} />

          <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left border border-slate-100">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.workflows.rfe.explanation.howItWorks}</h4>
             <div className="space-y-4">
                {t.workflows.rfe.explanation.features.map((f: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <RiCheckDoubleLine className="text-primary text-lg shrink-0 mt-1" />
                    <p className="text-sm text-slate-600">{f}</p>
                  </div>
                ))}
             </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
          >
            {t.workflows.rfe.explanation.btn}
            <RiMoneyDollarCircleLine className="text-xl" />
          </button>
        </div>

        {showCheckout && (
          <RFECheckoutOverlay 
            amount={baseAmount} 
            slug="analise-rfe-cos" 
            proc={proc} 
            onClose={() => setShowCheckout(false)} 
          />
        )}
      </div>
    </>
  );
}

// ─── RFEInstructionStep ───────────────────────────────────────────────────────

export function RFEInstructionStep({ proc, onComplete }: StepProps) {
  const t = useT("onboarding");
  const data = (proc.step_data || {}) as Record<string, unknown>;

  const handleFileUpload = async (file: File) => {
    try {
      toast.loading(t.workflows.shared.sendingFile, { id: "u" });
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/rfe/rfe_letter_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file);
      if (uploadError) throw uploadError;

      const currentDocs = (data.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, {
        docs: { ...currentDocs, rfe_letter: filePath }
      });
      
      toast.success(t.workflows.shared.fileSent, { id: "u" });
      onComplete?.();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message, { id: "u" });
    }
  };

  const handleManualComplete = () => {
     const docs = (data.docs as Record<string, string>) || {};
     if (!docs.rfe_letter && !data.rfe_description) {
        toast.error(t.workflows.rfe.instruction.summaryLabel);
        return;
     }
     onComplete?.();
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
         <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
            <RiDownload2Line className="text-3xl" />
         </div>
         <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">{t.workflows.rfe.instruction.title}</h3>
         <p className="text-sm font-medium text-slate-400">{t.workflows.rfe.instruction.desc}</p>
      </div>

      <div className="space-y-6">
        <DocUploadCard 
          docKey="rfe_letter"
          title={t.workflows.rfe.instruction.uploadTitle}
          doc={{
            file: null,
            label: t.workflows.rfe.instruction.uploadSubtitle,
            path: (data.docs as Record<string, string>)?.rfe_letter
          }}
          onChange={(_key, file) => handleFileUpload(file)}
        />

        <div className="relative py-4 flex items-center">
           <div className="flex-grow border-t border-slate-100"></div>
           <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.workflows.rfe.instruction.orDescribe}</span>
           <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <div className="space-y-2">
           <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.workflows.rfe.instruction.summaryLabel}</Label>
           <textarea
             className="w-full h-32 rounded-2xl border border-slate-100 p-5 text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none bg-slate-50/50"
             placeholder={t.workflows.rfe.instruction.summaryPlaceholder}
             defaultValue={data.rfe_description as string || ""}
             onBlur={async (e) => {
               if (e.target.value !== data.rfe_description) {
                 await processService.updateStepData(proc.id, { rfe_description: e.target.value });
               }
             }}
           />
        </div>

        <button 
          onClick={handleManualComplete}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3"
        >
          {t.workflows.shared.confirmBtn}
          <RiArrowRightLine className="text-xl" />
        </button>
      </div>
    </div>
  );
}

// ─── RFEAcceptProposalStep ───────────────────────────────────────────────────

export function RFEAcceptProposalStep({ proc, onComplete: _onComplete }: StepProps) {
  const t = useT("onboarding");
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const [loading, setLoading] = useState(false);

  const handleAcceptProposal = async () => {
    setLoading(true);
    try {
      const currentStep = proc.current_step ?? 0;
      await processService.approveStep(proc.id, currentStep + 1);
      toast.success(t.toasts.strategyAccepted);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
         <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
            <RiShieldCheckLine className="text-3xl" />
         </div>
         <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">{t.workflows.rfe.proposal.title}</h3>
         <p className="text-sm font-medium text-slate-400">{t.workflows.rfe.proposal.desc}</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm">
        <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100/50">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.workflows.shared.actionPlan}</h4>
           <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
              "{ (data.rfe_proposal_text as string) || t.workflows.shared.waitingAnalysis}"
           </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t.workflows.shared.serviceCost}</span>
              <span className="text-2xl font-black text-primary">${Number(data.rfe_proposal_amount || 0).toFixed(2)}</span>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{t.workflows.shared.strategyReady}</span>
           </div>
        </div>

        <button 
          onClick={handleAcceptProposal}
          disabled={loading || !(data.rfe_proposal_text as string)}
          className="w-full bg-primary hover:bg-primary-hover text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <RiLoader4Line className="animate-spin text-xl" /> : <><RiCheckLine className="text-2xl" /> {t.workflows.shared.acceptBtn}</>}
        </button>
      </div>
    </div>
  );
}

// ─── RFEEndStep ─────────────────────────────────────────────────────────────

export function RFEEndStep({ proc, onComplete, onJumpToMotion, onJumpToNewRFE }: StepProps) {
  const t = useT("onboarding");
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const docs = (data.docs as Record<string, string>) || {};
  const rfeFinalPath = docs.rfe_final_package;
  const rfeFinalUrl = rfeFinalPath ? supabase.storage.from('profiles').getPublicUrl(rfeFinalPath).data.publicUrl : null;

  const handleRFEOutcome = async (outcome: 'approved' | 'rfe' | 'denied') => {
    setLoading(true);
    try {
      // 1. Store the historical item from this cycle
      const history = (data.rfe_history as RFEHistoryItem[]) || [];
      const newHistoryItem: RFEHistoryItem = {
        proposal_text: data.rfe_proposal_text as string,
        proposal_amount: Number(data.rfe_proposal_amount) || 0,
        result: outcome,
        rfe_letter: (data.docs as Record<string, string>)?.rfe_letter,
        rfe_final_package: (data.docs as Record<string, string>)?.rfe_final_package,
        sent_at: (data.rfe_proposal_sent_at as string) || new Date().toISOString()
      };

      const updatedHistory = [...history, newHistoryItem];

      // 2. Prepare update data
      const updateData: Record<string, unknown> = {
        rfe_history: updatedHistory,
        // Reset current cycle data for future cycles if needed
        rfe_proposal_text: null,
        rfe_proposal_amount: null,
        rfe_proposal_sent_at: null,
        rfe_description: null,
        uscis_rfe_result: outcome
      };

      if (outcome === 'approved') {
        await processService.updateStepData(proc.id, updateData);
        await processService.updateProcessStatus(proc.id, 'completed');
        toast.success(t.toasts.finishSuccess);
        onComplete?.();
      } else if (outcome === 'rfe') {
        // Reset steps to restart RFE flow
        await processService.updateStepData(proc.id, {
          ...updateData,
          current_step: 13, // Step 13 is RFE Explanation
          uscis_official_result: 'rfe' 
        });
        toast.success(t.toasts.resetRfe);
        onJumpToNewRFE?.();
      } else if (outcome === 'denied') {
        // Jump to Motion flow
        await processService.updateStepData(proc.id, {
          ...updateData,
          uscis_official_result: 'denied',
          current_step: 19 // Step 19 is Motion Explanation
        });
        toast.error(t.toasts.deniedMotion);
        onJumpToMotion?.();
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {rfeFinalUrl && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[40px] p-8 flex flex-col items-center text-center shadow-sm">
           <div className="w-16 h-16 rounded-2xl bg-white text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
              <RiDownload2Line className="text-3xl" />
           </div>
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t.workflows.rfe.end.packageTitle}</h3>
           <p className="text-xs text-slate-500 font-medium mt-1 mb-6">{t.workflows.rfe.end.packageDesc}</p>
           <a 
            href={rfeFinalUrl} 
            target="_blank" 
            rel="noreferrer"
            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
           >
             <RiDownload2Line className="text-lg" /> Baixar Resposta RFE
           </a>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-8">
           <RiCheckDoubleLine className="text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">{t.workflows.rfe.end.resultTitle}</h2>
        <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">
          {t.workflows.rfe.end.resultDesc}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleRFEOutcome('approved')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-3xl hover:bg-emerald-100 transition-all group"
          >
            <RiCheckDoubleLine className="text-2xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">{t.workflows.rfe.end.approved}</span>
          </button>

          <button
            onClick={() => handleRFEOutcome('rfe')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-amber-50 border border-amber-100 rounded-3xl hover:bg-amber-100 transition-all group"
          >
            <RiTimeLine className="text-2xl text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest text-center">{t.workflows.rfe.end.rfe}</span>
          </button>

          <button
            onClick={() => handleRFEOutcome('denied')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-100 rounded-3xl hover:bg-red-100 transition-all group"
          >
            <RiSpam2Line className="text-2xl text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">{t.workflows.rfe.end.denied}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main RFE Workflow ─────────────────────────────────────────────────────────

interface WorkflowProps {
  data: UserService;
  onRefresh: () => void;
}

export function RFEWorkflow({ data, onRefresh }: WorkflowProps) {
  const activeStep = data.current_step ?? 0;

  const service = getServiceBySlug(data.service_slug);
  const currentStep = service?.steps[activeStep];

  const renderContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case "cos_rfe_explanation":
        return <RFEExplanationStep proc={data} />;
      case "cos_rfe_docs":
        return <RFEInstructionStep proc={data} onComplete={() => onRefresh()} />;
      case "cos_rfe_proposal":
        return <RFEAcceptProposalStep proc={data} />;
      case "cos_rfe_final_ship":
        return <RFEEndStep proc={data} onComplete={() => onRefresh()} onJumpToMotion={() => onRefresh()} onJumpToNewRFE={() => onRefresh()} />;
      default:
        return (
          <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-20 h-20 rounded-[32px] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-inner">
               <RiCheckDoubleLine className="text-4xl" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-4">{currentStep.title}</h2>
            <p className="text-slate-500 font-medium text-lg mb-10">Sua solicitação está sendo cuidada pelo nosso time especializado.</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aguardando Avaliação Administrativa</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[50vh]">
      {renderContent()}
    </div>
  );
}
