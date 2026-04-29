import { useState, useEffect } from "react";
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
  RiHistoryLine
} from "react-icons/ri";
import { MdPix } from "react-icons/md";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { type UserService, processService } from "../../../services/process.service";
import { cosNotificationService } from "../../../services/cos-notification.service";
import { paymentService, type StripePaymentMethod } from "../../../services/payment.service";
import { useAuth } from "../../../hooks/useAuth";
import { DocUploadCard } from "../../../components/DocUploadCard";
import { ZELLE_RECIPIENT } from "../../../config/zelle";
import { Input } from "../../../components/Input";
import { Label } from "../../../components/Label";
import { maskCPF, validateCPF } from "../../../utils/cpf";
import { getServiceBySlug } from "../../../data/services";
import { cn } from "../../../utils/cn";
import { useT } from "../../../i18n";
import { normalizeLegacyFinalShipStep } from "../../../utils/legacyWorkflow";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
  proc: UserService;
  onComplete?: () => void;
  onJumpToMotion?: () => void;
  onJumpToNewRFE?: () => void;
}

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface RFECycle {
  cycle: number;
  status: string;
  started_at: string;
  result: string | null;
  paid_at: string | null;
  closed_at: string | null;
}

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
          paymentMethod: activeMethod as StripePaymentMethod,
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

        toast.success(t?.paymentMethods?.zelle?.pendingReview || "Pending review");
        setZelleDone(true);
      } catch (e: unknown) {
        const err = e as Error;
        toast.error(err.message || "Erro no Zelle");
      } finally {
        setLoading(false);
      }
    } else if (activeMethod === "parcelow") {
      if (!validateCPF(parcelowCpf)) {
         toast.error(t?.paymentMethods?.parcelow?.cpfRequired || "CPF required");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-card/60 backdrop-blur-md">
      <div className="bg-card w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-border flex justify-between items-center bg-bg-subtle/50">
          <div>
            <h3 className="font-display font-black text-text text-xl uppercase tracking-tight">{t_onboarding?.workflows?.shared?.assessmentTitle}</h3>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{t_onboarding?.workflows?.shared?.assessmentSub}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-text-muted hover:text-red-500 transition-all shadow-sm">
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
              { id: "card", label: t?.paymentMethods?.card?.label, icon: <RiBankCardLine className="text-xl" /> },
              { id: "pix", label: t?.paymentMethods?.pix?.label, icon: <MdPix className="text-xl" /> },
              { id: "zelle", label: t?.paymentMethods?.zelle?.label, icon: <span className="text-xs font-black tracking-tight leading-none">Z$</span> },
              { id: "parcelow", label: t?.paymentMethods?.parcelow?.label, icon: <span className="text-[10px] font-black tracking-tighter leading-none">PRC</span> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMethod(m.id as PaymentTab)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5",
                  activeMethod === m.id
                    ? "bg-card border-slate-900 text-white shadow-xl shadow-none scale-105"
                    : "bg-card border-border text-text-muted hover:border-border"
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
                    <RiInformationLine /> {t?.paymentMethods?.zelle?.notice}
                 </h4>
                 <div className="space-y-2">
                    <p className="text-[11px] font-bold text-text flex items-center justify-between">{t?.paymentMethods?.zelle?.email} <span className="font-black text-indigo-600">{ZELLE_EMAIL}</span></p>
                    <p className="text-[11px] font-bold text-text flex items-center justify-between">{t?.paymentMethods?.zelle?.phone} <span className="font-black text-indigo-600">{ZELLE_PHONE}</span></p>
                    <p className="text-[11px] font-bold text-text flex items-center justify-between">{t?.paymentMethods?.zelle?.name} <span className="font-black text-indigo-600">{ZELLE_NAME}</span></p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">{t_onboarding?.workflows?.checkout?.zelle?.amountLabel}</Label>
                    <Input type="number" value={zelleAmount} onChange={(e) => setZelleAmount(e.target.value)} placeholder="0.00" className="h-11 rounded-xl text-xs font-black" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">{t_onboarding?.workflows?.checkout?.zelle?.codeLabel}</Label>
                    <Input value={zelleCode} onChange={(e) => setZelleCode(e.target.value)} placeholder={t_onboarding?.workflows?.checkout?.zelle?.codePlaceholder} className="h-11 rounded-xl text-xs font-black" />
                </div>
              </div>
              <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">{t?.paymentMethods?.zelle?.uploadProof}</Label>
                  <label className="w-full h-24 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-bg-subtle transition-all relative overflow-hidden group">
                     {zelleProofPreview ? (
                        <>
                           <img src={zelleProofPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                           <RiCheckLine className="text-emerald-500 text-2xl relative z-10" />
                           <span className="text-[9px] font-black text-emerald-600 uppercase relative z-10">{t?.paymentMethods?.zelle?.uploadProof}</span>
                        </>
                     ) : (
                        <>
                           <RiQrCodeLine className="text-2xl text-slate-300 group-hover:text-primary transition-colors" />
                           <span className="text-[9px] font-black text-text-muted uppercase mt-1">{t?.paymentMethods?.zelle?.uploadProof}</span>
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
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed text-center" dangerouslySetInnerHTML={{ __html: t?.paymentMethods?.parcelow?.notice || "" }} />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-text-muted uppercase tracking-widest px-1">{t?.paymentMethods?.parcelow?.cpfLabel}</Label>
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
               <div className="p-5 bg-bg-subtle border border-border rounded-2xl border-dashed">
                  <p className="text-center text-xs font-bold text-text-muted" dangerouslySetInnerHTML={{ __html: t?.paymentMethods?.card?.notice || "" }} />
               </div>
            </div>
          )}

          {activeMethod === "pix" && (
             <div className="space-y-4 mb-8">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl border-dashed flex flex-col items-center">
                   <MdPix className="text-3xl text-emerald-500 mb-2" />
                   <p className="text-center text-xs font-bold text-emerald-700" dangerouslySetInnerHTML={{ __html: t?.paymentMethods?.pix?.notice || "" }} />
                </div>
             </div>
          )}

          {activeMethod === "zelle" && zelleDone && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <RiCheckLine className="text-emerald-500 text-3xl mx-auto mb-2" />
              <p className="font-bold text-text text-sm">{t?.paymentMethods?.zelle?.pendingReview?.split("!")[0]}!</p>
              <p className="text-xs text-text-muted mt-1">{t?.paymentMethods?.zelle?.pendingReview?.split("!")[1] || t?.paymentMethods?.zelle?.pendingReview}</p>
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
                  {activeMethod === "card" && t?.paymentMethods?.card?.label}
                  {activeMethod === "pix" && t?.paymentMethods?.pix?.label}
                  {activeMethod === "zelle" && t?.paymentMethods?.zelle?.submit}
                  {activeMethod === "parcelow" && t?.paymentMethods?.parcelow?.label}
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
  const cycles = (data.rfe_cycles as RFECycle[]) || [];
  const legacyHistory = (data.rfe_history as RFEHistoryItem[]) || [];

  // If we have no cycles and no legacy history, hide the panel
  if (cycles.length === 0 && legacyHistory.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto mt-12 pt-12 border-t border-border/50">
      <div className="flex items-center gap-2 mb-6 px-1">
        <RiHistoryLine className="text-text-muted" />
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">
          {t?.workflows?.rfe?.history?.title?.replace("{count}", String(Math.max(cycles.length, legacyHistory.length))) || `Histórico de Ciclos`}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {cycles.map((cycle, idx) => {
          const isCompleted = cycle.status === 'completed' || !!cycle.result;
          const result = cycle.result;
          const label = cycle.status === 'awaiting_payment' ? "Aguardando Pagamento" : 
                        cycle.status === 'paid' ? "Em Análise" : 
                        cycle.status === 'rfeInit' ? "Iniciado" :
                        isCompleted ? (result === 'approved' ? "Aprovado" : result === 'denied' ? "Negado" : "Nova RFE") : "Em Andamento";

          return (
            <div key={`cycle-${idx}`} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative">
              {cycle.status === 'paid' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              )}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  result === "approved" ? "bg-emerald-50 text-emerald-500" :
                  result === "rfe" ? "bg-amber-50 text-amber-500" : 
                  result === "denied" ? "bg-red-50 text-red-500" : "bg-bg-subtle text-text-muted"
                )}>
                  {result === "approved" ? <RiCheckDoubleLine className="text-xl" /> :
                   result === "rfe" ? <RiTimeLine className="text-xl" /> : 
                   result === "denied" ? <RiSpam2Line className="text-xl" /> : <RiLoader4Line className="text-xl animate-spin" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">
                      {t?.workflows?.rfe?.history?.cycle?.replace("{count}", String(cycle.cycle)) || `Ciclo #${cycle.cycle}`}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight",
                      result === "approved" ? "bg-emerald-100 text-emerald-700" :
                      result === "rfe" ? "bg-amber-100 text-amber-700" : 
                      result === "denied" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted font-medium italic">
                    Iniciado em {new Date(cycle.started_at).toLocaleDateString()}
                    {cycle.closed_at && ` • Finalizado em ${new Date(cycle.closed_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* Action buttons (only if completed and has files) */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                 {/* Here we could find matching legacy history or cycle-specific files if stored */}
                 {/* For now, we use the index to match legacy history for file links */}
                 {legacyHistory[idx] && (
                   <>
                     {legacyHistory[idx].rfe_letter && (
                       <a 
                         href={supabase.storage.from('profiles').getPublicUrl(legacyHistory[idx].rfe_letter!).data.publicUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="px-3 py-1.5 bg-bg-subtle hover:bg-bg-subtle text-text-muted rounded-lg font-bold text-[9px] uppercase tracking-widest border border-border transition-all flex items-center gap-2"
                       >
                         RFE
                       </a>
                     )}
                     {legacyHistory[idx].rfe_final_package && (
                       <a 
                         href={supabase.storage.from('profiles').getPublicUrl(legacyHistory[idx].rfe_final_package!).data.publicUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[9px] uppercase tracking-widest border border-emerald-100 transition-all flex items-center gap-2"
                       >
                         Package
                       </a>
                     )}
                   </>
                 )}
              </div>
            </div>
          );
        }).reverse()}

        {/* Fallback for legacy history without cycles (migration period) */}
        {cycles.length === 0 && legacyHistory.map((hist, idx) => (
          <div key={`legacy-${idx}`} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-bg-subtle text-text-muted flex items-center justify-center">
                   <RiHistoryLine />
                </div>
                <div>
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">Histórico Legado</span>
                   <p className="text-xs font-medium text-text-muted">{hist.result === 'approved' ? 'Aprovado' : hist.result === 'denied' ? 'Negado' : 'RFE'}</p>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RFEExplanationStep ───────────────────────────────────────────────────────

export function RFEExplanationStep({ proc }: StepProps) {
  const t = useT("onboarding");
  const [showCheckout, setShowCheckout] = useState(false);
  const copy = t?.workflows?.rfe?.explanation;
  const textOr = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value : fallback;
  const translatedFeatures = Array.isArray(copy?.features)
    ? copy.features.filter(
        (feature: unknown): feature is string =>
          typeof feature === "string" && feature.trim().length > 0,
      )
    : [];
  const features =
    translatedFeatures.length > 0
      ? translatedFeatures
      : [
          "Analise tecnica da carta de RFE",
          "Checklist claro com documentos necessarios",
          "Orientacao para organizar e enviar sua resposta",
        ];
  
  const [baseAmount, setBaseAmount] = useState(50);
  const analysisFeeTemplate = t?.workflows?.shared?.analysisFee;
  const analysisFeeText =
    typeof analysisFeeTemplate === "string" &&
    analysisFeeTemplate.includes("{amount}")
      ? analysisFeeTemplate.replace("{amount}", baseAmount.toFixed(2))
      : `Taxa de analise: $${baseAmount.toFixed(2)}`;

  useEffect(() => {
    supabase
      .from("services_prices")
      .select("price")
      .eq("service_id", "apoio-rfe-motion-inicio")
      .eq("is_active", true)
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.warn("[RFEExplanationStep] Failed to load base price:", error.message);
          setBaseAmount(50);
          return;
        }
        const firstPrice = data?.[0]?.price;
        const parsedPrice = Number(firstPrice);
        setBaseAmount(Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 50);
      });
  }, []);

  return (
    <>
      <RFEHistoryPanel proc={proc} />
      
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-card rounded-[40px] border border-border p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
             <RiInformationLine className="text-4xl" />
          </div>
          <h2 className="text-3xl font-black text-text mb-4 uppercase tracking-tight">{textOr(copy?.title, "RFE - Analise da Solicitacao")}</h2>
          <p className="text-text-muted leading-relaxed max-w-md mx-auto mb-10 overflow-hidden" dangerouslySetInnerHTML={{ __html: textOr(copy?.desc, "Solicite a analise especializada da sua RFE para responder com estrategia e seguranca.") }} />

          <div className="bg-bg-subtle rounded-3xl p-8 mb-10 text-left border border-border">
             <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">{textOr(copy?.howItWorks, "Como funciona")}</h4>
             <div className="space-y-4">
                {features.map((f: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <RiCheckDoubleLine className="text-primary text-lg shrink-0 mt-1" />
                    <p className="text-sm text-text-muted">{f}</p>
                  </div>
                ))}
             </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
          >
            {textOr(copy?.btn, "Pagar analise")}
            <RiMoneyDollarCircleLine className="text-xl" />
          </button>
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">
              {analysisFeeText}
            </p>
            <p className="text-[9px] text-primary/50 font-black uppercase tracking-tighter">
              {textOr(
                t?.workflows?.shared?.processingFees,
                "Taxas de processamento podem variar",
              )}
            </p>
          </div>
        </div>

        {showCheckout && (
          <RFECheckoutOverlay 
            amount={baseAmount} 
            slug="apoio-rfe-motion-inicio" 
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
  const [docs, setDocs] = useState<Record<string, string>>((data.docs as Record<string, string>) || {});
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(data.rfe_description as string || "");

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      toast.loading(t?.workflows?.shared?.sendingFile || "Sending...", { id: "u" });
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/rfe/rfe_letter_${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file);
      if (uploadError) throw uploadError;

      const currentDocs = { ...docs };
      const newDocs = { ...currentDocs, rfe_letter: filePath };
      
      await processService.updateStepData(proc.id, {
        docs: newDocs
      });

      setDocs(newDocs);
      
      toast.success(t?.workflows?.shared?.fileSent || "File sent!", { id: "u" });

      await cosNotificationService.notifyAdmin({
        event: "rfe_letter_uploaded",
        processId: proc.id,
        userId: proc.user_id,
      });

      onComplete?.();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message, { id: "u" });
    } finally {
      setLoading(false);
    }
  };

  const handleManualComplete = async () => {
     if (!docs.rfe_letter && !description.trim()) {
        toast.error(t?.workflows?.rfe?.instruction?.summaryLabel || "Description required");
        return;
     }
     
     setLoading(true);
     try {
       // Save description if changed
       if (description !== data.rfe_description) {
         await processService.updateStepData(proc.id, { rfe_description: description });
       }
       await cosNotificationService.notifyAdmin({
          event: "rfe_description_submitted",
          processId: proc.id,
          userId: proc.user_id,
       });
       
       onComplete?.();
     } catch (e: unknown) {
       const err = e as Error;
       toast.error(err.message);
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
         <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-6">
            <RiDownload2Line className="text-3xl" />
         </div>
         <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-3">{t?.workflows?.rfe?.instruction?.title}</h3>
         <p className="text-sm font-medium text-text-muted">{t?.workflows?.rfe?.instruction?.desc}</p>
      </div>

      <div className="space-y-6">
        <DocUploadCard 
          docKey="rfe_letter"
          title={t?.workflows?.rfe?.instruction?.uploadTitle}
          doc={{
            file: null,
            label: t?.workflows?.rfe?.instruction?.uploadSubtitle,
            path: docs?.rfe_letter
          }}
          onChange={(_key, file) => handleFileUpload(file)}
        />

        <div className="relative py-4 flex items-center">
           <div className="flex-grow border-t border-border"></div>
           <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t?.workflows?.rfe?.instruction?.orDescribe}</span>
           <div className="flex-grow border-t border-border"></div>
        </div>

         <div className="space-y-2">
            <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">{t?.workflows?.rfe?.instruction?.summaryLabel}</Label>
            <textarea
              className="w-full h-32 rounded-2xl border border-border p-5 text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none bg-bg-subtle/50"
              placeholder={t?.workflows?.rfe?.instruction?.summaryPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
         </div>

        <button 
          onClick={handleManualComplete}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-none hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? t?.workflows?.shared?.sendingFile : t?.workflows?.shared?.confirmBtn}
          <RiArrowRightLine className="text-xl" />
        </button>
      </div>
    </div>
  );
}

// ─── RFEAcceptProposalStep ───────────────────────────────────────────────────

export function RFEAcceptProposalStep({ proc }: StepProps) {
  const t = useT("onboarding");
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const [showCheckout, setShowCheckout] = useState(false);


  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
         <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
            <RiShieldCheckLine className="text-3xl" />
         </div>
         <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-3">{t?.workflows?.rfe?.proposal?.title}</h3>
         <p className="text-sm font-medium text-text-muted">{t?.workflows?.rfe?.proposal?.desc}</p>
      </div>

      <div className="bg-card border border-border rounded-[40px] p-10 shadow-sm">
        <div className="bg-bg-subtle rounded-3xl p-8 mb-8 border border-border/50">
           <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">{t?.workflows?.shared?.actionPlan}</h4>
           <p className="text-sm text-text-muted leading-relaxed italic whitespace-pre-wrap">
              "{ (data.rfe_proposal_text as string) || t?.workflows?.shared?.waitingAnalysis}"
           </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
           <div className="p-6 bg-bg-subtle rounded-3xl border border-border/50">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">{t?.workflows?.shared?.serviceCost}</span>
              <span className="text-2xl font-black text-primary">${Number(data.rfe_proposal_amount || 0).toFixed(2)}</span>
           </div>
           <div className="p-6 bg-bg-subtle rounded-3xl border border-border/50">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Status</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{t?.workflows?.shared?.strategyReady}</span>
           </div>
        </div>

        <button 
          onClick={() => setShowCheckout(true)}
          disabled={!(data.rfe_proposal_text as string)}
          className="w-full bg-primary hover:bg-primary-hover text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <RiCheckLine className="text-2xl" /> {t?.workflows?.shared?.acceptBtn}
        </button>
      </div>

      {showCheckout && (
        <RFECheckoutOverlay 
          amount={Number(data.rfe_proposal_amount || 0)} 
          slug="proposta-rfe-motion" 
          proc={proc} 
          onClose={() => setShowCheckout(false)} 
        />
      )}
    </div>
  );
}

// ─── RFEEndStep ─────────────────────────────────────────────────────────────

export function RFEEndStep({ proc, onComplete, onJumpToMotion, onJumpToNewRFE }: StepProps) {
  const t = useT('onboarding');
  const { user } = useAuth();
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const [loading, setLoading] = useState(false);
  const [chatSeeded, setChatSeeded] = useState(Boolean(data.rfe_chat_started_at));
  
  const rfeFinalPath = (data.docs as Record<string, string>)?.rfe_final_package;
  const rfeFinalUrl = rfeFinalPath ? supabase.storage.from('profiles').getPublicUrl(rfeFinalPath).data.publicUrl : null;

  useEffect(() => {
    if (chatSeeded || !user?.id) return;

    void (async () => {
      try {
        const stepData = (proc.step_data || {}) as Record<string, unknown>;
        if (!stepData.rfe_chat_started_at) {
          const content = `Olá! Recebi minha RFE e já organizei os documentos. O pacote de resposta está pronto para revisão final.`;
          await processService.ensureChatThread(proc.id, proc.user_id, content, true);
          await processService.updateStepData(proc.id, {
            rfe_chat_started_at: new Date().toISOString(),
          });
          setChatSeeded(true);
        }
      } catch (error) {
        console.error('[RFEEndStep] failed to seed chat:', error);
      }
    })();
  }, [chatSeeded, proc.id, user?.id, proc.step_data, proc.user_id]);

  const handleRFEOutcome = async (outcome: 'approved' | 'rfe' | 'denied') => {
    setLoading(true);
    try {
      // 1. Store the historical item from this cycle
      const cycles = (data.rfe_cycles as RFECycle[]) || [];
      const activeIndex = (Number(data.active_rfe_cycle) || 1) - 1;
      
      const updatedCycles = [...cycles];
      if (updatedCycles[activeIndex]) {
        updatedCycles[activeIndex] = {
          ...updatedCycles[activeIndex],
          status: 'completed',
          result: outcome,
          closed_at: new Date().toISOString()
        };
      }

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
        rfe_cycles: updatedCycles,
        // Reset current cycle data for future cycles if needed
        rfe_proposal_text: null,
        rfe_proposal_amount: null,
        rfe_proposal_sent_at: null,
        rfe_description: null,
        uscis_rfe_result: outcome
      };

      // 3. Apply updates and transition
      if (outcome === 'approved') {
        await processService.updateStepData(proc.id, updateData);
        await processService.updateProcessStatus(proc.id, 'completed');
        toast.success(t?.toasts?.finishSuccess || "Finished");
        onComplete?.();
      } else {
        // For 'rfe' or 'denied', we use the centralized workflow starter
        // But first we must ensure the history/cycles from current updateData are persisted
        await processService.updateStepData(proc.id, updateData);
        
        if (outcome === 'rfe') {
          await processService.startAdditionalWorkflow(proc.id, 'rfe');
          toast.success(t?.toasts?.resetRfe || "Reset RFE");
          onJumpToNewRFE?.();
        } else {
          await processService.startAdditionalWorkflow(proc.id, 'motion');
          toast.error(t?.toasts?.deniedMotion || "Denied");
          onJumpToMotion?.();
        }
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
           <div className="w-16 h-16 rounded-2xl bg-card text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
              <RiDownload2Line className="text-3xl" />
           </div>
           <h3 className="text-lg font-black text-text uppercase tracking-tight">{t?.workflows?.rfe?.end?.packageTitle}</h3>
           <p className="text-xs text-text-muted font-medium mt-1 mb-6">{t?.workflows?.rfe?.end?.packageDesc}</p>
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

      <div className="bg-card rounded-[40px] border border-border p-12 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-8">
           <RiCheckDoubleLine className="text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-text mb-3 uppercase tracking-tight">{t?.workflows?.rfe?.end?.resultTitle}</h2>
        <p className="text-sm text-text-muted font-medium max-w-sm mx-auto leading-relaxed mb-10">
          {t?.workflows?.rfe?.end?.resultDesc}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleRFEOutcome('approved')}
            disabled={loading || !!data.uscis_rfe_result}
            className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-3xl hover:bg-emerald-100 transition-all group"
          >
            <RiCheckDoubleLine className="text-2xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">{t?.workflows?.rfe?.end?.approved}</span>
          </button>

          <button
            onClick={() => handleRFEOutcome('rfe')}
            disabled={loading || !!data.uscis_rfe_result}
            className="flex flex-col items-center justify-center p-6 bg-amber-50 border border-amber-100 rounded-3xl hover:bg-amber-100 transition-all group"
          >
            <RiTimeLine className="text-2xl text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest text-center">{t?.workflows?.rfe?.end?.rfe}</span>
          </button>

          <button
            onClick={() => handleRFEOutcome('denied')}
            disabled={loading || !!data.uscis_rfe_result}
            className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-100 rounded-3xl hover:bg-red-100 transition-all group"
          >
            <RiSpam2Line className="text-2xl text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">{t?.workflows?.rfe?.end?.denied}</span>
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
  const normalizedStep = currentStep ? normalizeLegacyFinalShipStep(currentStep) : undefined;

  const renderContent = () => {
    if (!normalizedStep) return null;

    switch (normalizedStep.id) {
      case "cos_rfe_explanation":
        return <RFEExplanationStep proc={data} />;
      case "cos_rfe_docs":
        return <RFEInstructionStep proc={data} onComplete={() => onRefresh()} />;
      case "cos_rfe_proposal":
        return <RFEAcceptProposalStep proc={data} />;
      case "cos_rfe_end":
        return <RFEEndStep proc={data} onComplete={() => onRefresh()} onJumpToMotion={() => onRefresh()} onJumpToNewRFE={() => onRefresh()} />;
      default:
        return (
          <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-20 h-20 rounded-[32px] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-inner">
               <RiCheckDoubleLine className="text-4xl" />
            </div>
            <h2 className="text-3xl font-black text-text uppercase tracking-tight mb-4">{normalizedStep.title}</h2>
            <p className="text-text-muted font-medium text-lg mb-10">Sua solicitação está sendo cuidada pelo nosso time especializado.</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-bg-subtle rounded-2xl border border-border">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Aguardando Avaliação Administrativa</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[50vh] flex flex-col">
      <div className="flex-grow">
        {renderContent()}
      </div>
      <RFEHistoryPanel proc={data} />
    </div>
  );
}
