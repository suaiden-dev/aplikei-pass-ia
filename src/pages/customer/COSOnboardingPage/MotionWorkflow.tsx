import { useState, useRef, useCallback } from "react";
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
  RiUploadCloud2Line,
  RiImageLine,
  RiCheckLine,
  RiErrorWarningLine
} from "react-icons/ri";
import { MdPix } from "react-icons/md";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { type UserService, processService } from "../../../services/process.service";
import { paymentService, type StripePaymentMethod } from "../../../services/payment.service";
import { useAuth } from "../../../hooks/useAuth";
import { DocUploadCard } from "../../../components/DocUploadCard";
import { ZELLE_RECIPIENT } from "../../../config/zelle";
import { Input } from "../../../components/Input";
import { Label } from "../../../components/Label";
import { maskCPF, validateCPF } from "../../../utils/cpf";
import { getServiceBySlug } from "../../../data/services";
import { estimateCardTotal } from "../../../services/payment.service";
import { cn } from "../../../utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepProps {
  proc: UserService;
  onComplete: () => void;
}

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface MotionCheckoutOverlayProps {
  amount: number;
  slug: string;
  proc: UserService;
  onClose: () => void;
}

// ─── Payment method config ────────────────────────────────────────────────────

const PAYMENT_METHODS: { id: PaymentTab; label: string; sublabel: string; icon: React.ReactNode }[] = [
  {
    id: "card",
    label: "Cartão",
    sublabel: "USD",
    icon: <RiBankCardLine className="text-xl" />,
  },
  {
    id: "pix",
    label: "Pix",
    sublabel: "BRL",
    icon: <MdPix className="text-xl" />,
  },
  {
    id: "zelle",
    label: "Zelle",
    sublabel: "USD",
    icon: <span className="text-xs font-black tracking-tight leading-none">Z$</span>,
  },
  {
    id: "parcelow",
    label: "Parcelow",
    sublabel: "BRL",
    icon: <span className="text-[10px] font-black tracking-tighter leading-none">PRC</span>,
  },
];

const ZELLE_EMAIL = ZELLE_RECIPIENT.email;
const ZELLE_PHONE = ZELLE_RECIPIENT.phone;
const ZELLE_NAME = ZELLE_RECIPIENT.name;

// ─── Checkout Overlay ─────────────────────────────────────────────────────────

function MotionCheckoutOverlay({ amount, slug, proc, onClose }: MotionCheckoutOverlayProps) {
  const { user } = useAuth();
  const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
  const [loading, setLoading] = useState(false);
  const [parcelowCpf, setParcelowCpf] = useState("");

  // Zelle state
  const [zelleAmount, setZelleAmount] = useState("");
  const [zelleCode, setZelleCode] = useState("");
  const [zelleDate, setZelleDate] = useState(new Date().toISOString().split("T")[0]);
  const [zelleProof, setZelleProof] = useState<File | null>(null);
  const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(null);
  const [zelleDone, setZelleDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProofSelect = useCallback((file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 8MB.");
      return;
    }
    setZelleProof(file);
    setZelleProofPreview(URL.createObjectURL(file));
  }, []);

  const preRegisterOrder = async (email: string, method: string) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser?.id) {
      try {
        await supabase.from("visa_orders").insert({
          user_id: authUser.id,
          client_name: user?.fullName || authUser.user_metadata?.full_name || "Cliente",
          client_email: email,
          product_slug: slug,
          total_price_usd: amount,
          payment_method: method,
          payment_status: "pending",
        });
      } catch (e) {
        console.error("[Motion] visa_orders pre-registration error:", e);
      }
    }
  };

  const savePaymentIntent = () => {
    localStorage.setItem('pending_payment_advance', JSON.stringify({
      procId: proc.id,
      fromStep: proc.current_step
    }));
    localStorage.setItem("checkout_slug", slug);
  };

  const handlePay = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const email = user.email || authUser?.email || "";
      const fullName = user.fullName || authUser?.user_metadata?.full_name || "Cliente";
      const phone = user.phoneNumber || authUser?.user_metadata?.phone_number || "0000000000";

      if (!email) {
        toast.error("E-mail não encontrado no perfil ou na sessão. Por favor, contate o suporte.");
        return;
      }

      if (activeMethod === "card" || activeMethod === "pix") {
        await preRegisterOrder(email, activeMethod === "card" ? "stripe_card" : "stripe_pix");

        const { url } = await paymentService.createStripeCheckout({
          slug,
          email,
          fullName,
          phone,
          paymentMethod: activeMethod as StripePaymentMethod,
          amount,
          proc_id: proc.id,
        });

        savePaymentIntent();
        window.location.href = url;

      } else if (activeMethod === "parcelow") {
        if (!parcelowCpf || !validateCPF(parcelowCpf)) {
          throw new Error("Informe um CPF válido para prosseguir com a Parcelow.");
        }

        const { url } = await paymentService.createParcelowCheckout({
          slug,
          email,
          fullName,
          phone,
          cpf: parcelowCpf,
          amount,
          proc_id: proc.id,
        });

        savePaymentIntent();
        window.location.href = url;

      } else if (activeMethod === "zelle") {
        if (!zelleAmount || parseFloat(zelleAmount) <= 0)
          throw new Error("Informe o valor enviado via Zelle.");
        if (!zelleDate)
          throw new Error("Informe a data do pagamento.");
        if (!zelleProof)
          throw new Error("Anexe o comprovante do pagamento.");

        const proofPath = await paymentService.uploadZelleProof(zelleProof, slug);

        await paymentService.createZellePayment({
          slug,
          serviceName: "Motion - " + slug,
          expectedAmount: amount,
          amount: parseFloat(zelleAmount),
          confirmationCode: zelleCode,
          paymentDate: zelleDate,
          proofPath,
          guestEmail: email,
          guestName: fullName,
          phone,
          userId: user.id ?? null,
          proc_id: proc.id,
        });

        setZelleDone(true);
      }
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Forma de Pagamento</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Selecione como deseja pagar</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Amount banner */}
        <div className="mx-8 mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Valor</p>
            <h4 className="text-2xl font-black text-slate-800">$ {amount.toFixed(2)}</h4>
          </div>
          <RiMoneyDollarCircleLine className="text-4xl text-primary opacity-20" />
        </div>

        {/* Payment methods */}
        <div className="px-8 pt-6 pb-2">
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${
                  activeMethod === m.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {m.icon}
                <span className="text-[11px] font-bold leading-none">{m.label}</span>
                <span className="text-[9px] font-medium leading-none opacity-70">{m.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific info */}
        <div className="px-8 pt-3 pb-6 space-y-4">
          {activeMethod === "card" && (
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3">
              <RiBankCardLine className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Você será redirecionado ao checkout seguro da <strong>Stripe</strong>. Aceitamos Visa, Mastercard e American Express em USD.
              </p>
            </div>
          )}

          {activeMethod === "pix" && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <RiQrCodeLine className="text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                Você será redirecionado ao checkout da <strong>Stripe com Pix</strong>. Um QR Code será gerado em BRL. O valor inclui câmbio + IOF.
              </p>
            </div>
          )}

          {activeMethod === "parcelow" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-100 p-3">
                <RiTimeLine className="text-orange-500 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-800 leading-relaxed">
                  Pague em até <strong>12 parcelas</strong> fixas via <strong>Parcelow</strong>. Valor convertido em BRL com taxas de parcelamento.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motionParcelowCpf">CPF do Titular do Cartão</Label>
                <Input
                  id="motionParcelowCpf"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={parcelowCpf}
                  onChange={e => setParcelowCpf(maskCPF(e.target.value))}
                />
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <RiInformationLine className="text-orange-400" />
                  <span>Obrigatório para emissão da fatura pela Parcelow.</span>
                </div>
              </div>
            </div>
          )}

          {activeMethod === "zelle" && !zelleDone && (
            <div className="space-y-4">
              {/* Recipient info */}
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                <p className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-2">Envie o Zelle para:</p>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{ZELLE_NAME}</p>
                  <p className="text-sm text-slate-600 font-mono">{ZELLE_EMAIL}</p>
                  <p className="text-sm text-slate-600 font-mono">{ZELLE_PHONE}</p>
                </div>
                <p className="text-[11px] text-violet-500 mt-2 leading-snug">
                  Após enviar, preencha os campos abaixo e anexe o comprovante.
                </p>
              </div>

              {/* Zelle fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="motionZelleAmount">Valor enviado (USD)</Label>
                  <Input
                    id="motionZelleAmount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="50.00"
                    className="mt-1.5"
                    value={zelleAmount}
                    onChange={e => setZelleAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="motionZelleDate">Data do pagamento</Label>
                  <Input
                    id="motionZelleDate"
                    type="date"
                    className="mt-1.5"
                    value={zelleDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={e => setZelleDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="motionZelleCode">
                  Código de confirmação <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="motionZelleCode"
                  placeholder="Ex: ABCD1234"
                  className="mt-1.5"
                  value={zelleCode}
                  onChange={e => setZelleCode(e.target.value)}
                />
              </div>

              {/* Proof upload */}
              <div>
                <Label>Comprovante</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleProofSelect(f);
                  }}
                />
                {zelleProofPreview ? (
                  <div className="mt-1.5 relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={zelleProofPreview} alt="Comprovante" className="w-full max-h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setZelleProof(null); setZelleProofPreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-slate-800/70 rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                    >
                      <RiCloseLine className="text-sm" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-800/60 px-3 py-1.5 flex items-center gap-2">
                      <RiImageLine className="text-white text-xs" />
                      <span className="text-white text-[11px] truncate">{zelleProof?.name}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleProofSelect(f);
                    }}
                    className="mt-1.5 w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-primary/40 hover:bg-primary/3 transition-colors"
                  >
                    <RiUploadCloud2Line className="text-2xl" />
                    <span className="text-xs font-medium">Clique ou arraste o comprovante</span>
                    <span className="text-[10px]">PNG, JPG, HEIC • máx. 8MB</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeMethod === "zelle" && zelleDone && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <RiCheckLine className="text-emerald-500 text-3xl mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Comprovante enviado!</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Seu pagamento está em <strong>análise</strong>. Você receberá uma confirmação por e-mail assim que for aprovado.
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                <RiTimeLine />
                Prazo de verificação: até 24 horas úteis
              </div>
            </div>
          )}

          {/* Submit button */}
          {!zelleDone && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-[#1649c0] hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {activeMethod === "zelle" ? "Enviando..." : "Redirecionando..."}
                </>
              ) : (
                <>
                  <RiLockLine className="text-base" />
                  {activeMethod === "card" && "Pagar com Cartão"}
                  {activeMethod === "pix" && "Pagar com Pix"}
                  {activeMethod === "zelle" && "Enviar Comprovante Zelle"}
                  {activeMethod === "parcelow" && "Pagar com Parcelow"}
                  <RiArrowRightLine className="text-base" />
                </>
              )}
            </button>
          )}

          <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <RiShieldCheckLine />
            Seus dados estão protegidos por criptografia SSL de 256 bits.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MotionExplanationStep ────────────────────────────────────────────────────

/**
 * COSPage - Motion Explanation + $50 Upsell
 */
export function MotionExplanationStep({ proc }: Omit<StepProps, "onComplete">) {
  const [showCheckout, setShowCheckout] = useState(false);
  
  const motionService = getServiceBySlug('analise-especialista-cos');
  const baseAmount = parseInt(motionService?.price.replace(/\D/g, '') || "50");

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
             <RiErrorWarningLine className="text-4xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">O Caso foi Negado (Denial)</h2>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-10">
            A negativa do USCIS não é necessariamente o fim. Podemos entrar com um **Motion to Reopen/Reconsider** para contestar a decisão com novos argumentos técnicos.
          </p>

          <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left border border-slate-100">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Como funciona nosso suporte Motion?</h4>
             <div className="space-y-4">
                <div className="flex gap-3">
                   <RiCheckDoubleLine className="text-primary text-lg shrink-0 mt-1" />
                   <p className="text-sm text-slate-600">Revisão jurídica completa dos motivos da negativa.</p>
                </div>
                <div className="flex gap-3">
                   <RiCheckDoubleLine className="text-primary text-lg shrink-0 mt-1" />
                   <p className="text-sm text-slate-600">Elaboração de petição técnica fundamentada.</p>
                </div>
             </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
          >
            Iniciar Suporte para Motion
            <RiMoneyDollarCircleLine className="text-xl" />
          </button>
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
              Taxa de análise inicial: US$ {baseAmount.toFixed(2)}
            </p>
            <p className="text-[9px] text-primary/50 font-black uppercase tracking-tighter">
              + taxas de processamento
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Overlay */}
      {showCheckout && (
        <MotionCheckoutOverlay
          amount={baseAmount}
          slug="analise-especialista-cos"
          proc={proc}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}

// ─── MotionInstructionStep ────────────────────────────────────────────────────

/**
 * COSInstruction - Form for client (reason + upload)
 */
export function MotionInstructionStep({ proc, onComplete }: StepProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      toast.loading("Enviando arquivo...", { id: "upload" });
      const fileExt = file.name.split(".").pop();
      const filePath = `${proc.user_id}/motion/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;

      const currentDocs = (data.docs as Record<string, string>) || {};
      await processService.updateStepData(proc.id, { 
        docs: { ...currentDocs, motion_denial_letter: filePath }
      });
      
      toast.success("Arquivo enviado!", { id: "upload" });
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Erro no upload: " + err.message, { id: "upload" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, descreva o motivo da negativa.");
      return;
    }
    try {
      setLoading(true);
      await processService.updateStepData(proc.id, { 
        motion_reason: reason,
        motion_submitted_at: new Date().toISOString()
      });
      onComplete();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Instruções para o Motion</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Motivo da Negativa (O que o USCIS alegou?)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[150px]"
              placeholder="Descreva aqui o que você recebeu na carta de negativa..."
            />
          </div>

          <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Upload da Carta de Negativa / Documentos Extras
             </label>
             <DocUploadCard
                docKey="motion_denial_letter"
                title="Carta de Negativa (USCIS)"
                subtitle="Documento recebido pelo correio ou online"
                doc={{
                  file: null,
                  label: "Negativa",
                  path: (data.docs as Record<string, string>)?.motion_denial_letter
                }}
                onChange={(_key: string, file: File) => handleFileUpload(file)}
             />
          </div>

          <button
            disabled={loading}
            onClick={handleSave}
            className={cn(
              "w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Salvando..." : "Enviar para Análise"}
            {!loading && <RiArrowRightLine className="text-xl" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MotionAcceptProposalStep ─────────────────────────────────────────────────

/**
 * COSAceptProposal - Receive proposal & pay custom amount
 */
export function MotionAcceptProposalStep({ proc }: Omit<StepProps, "onComplete">) {
  const [showCheckout, setShowCheckout] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const proposalText = (data.motion_proposal_text as string) || "O administrador ainda não enviou a estratégia detalhada do Motion.";
  const proposalAmount = Number(data.motion_proposal_amount) || 0;

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
             <RiShieldCheckLine className="text-4xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">Proposta para Motion</h2>
          
          <div className="flex items-center justify-center gap-3 mb-10">
             <div className="h-px w-8 bg-slate-100" />
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Estratégia para Reverter Negativa</p>
             <div className="h-px w-8 bg-slate-100" />
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100 italic text-slate-600 text-sm leading-relaxed font-serif text-center">
             "{proposalText}"
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 mb-4 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Custo do Serviço</p>
                <h4 className="text-3xl font-black text-slate-800">$ {proposalAmount.toFixed(2)}</h4>
             </div>
             <RiMoneyDollarCircleLine className="text-5xl text-primary opacity-20" />
          </div>

          <div className="flex items-center justify-center gap-4 mb-10 px-4">
             <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Ref:</span>
               <span className="text-[10px] font-mono text-slate-500">{proc.service_slug}</span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">ID:</span>
               <span className="text-[10px] font-mono text-slate-500">{proc.id.slice(0, 8)}</span>
             </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            disabled={proposalAmount <= 0}
            className="w-full bg-primary hover:bg-primary-hover text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            Aceitar Proposta e Pagar
            <RiArrowRightLine className="text-xl" />
          </button>
          
          {proposalAmount > 0 && (
            <p className="mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center italic">
              Total com taxas: US$ {estimateCardTotal(proposalAmount).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Checkout Overlay */}
      {showCheckout && (
        <MotionCheckoutOverlay
          amount={proposalAmount}
          slug={proc.service_slug || "troca-status"}
          proc={proc}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}

// ─── MotionEndStep ────────────────────────────────────────────────────────────

/**
 * COSEnd - Final Result reporting
 */
export function MotionEndStep({ proc, onComplete }: StepProps) {
  const [loading, setLoading] = useState(false);
  const data = (proc.step_data || {}) as Record<string, unknown>;
  const motionLetterPath = (data.docs as Record<string, string>)?.motion_final_package;
  const motionLetterUrl = motionLetterPath ? supabase.storage.from('profiles').getPublicUrl(motionLetterPath).data.publicUrl : null;

  const handleFinalResult = async (result: 'approved' | 'denied') => {
    setLoading(true);
    try {
      await processService.updateStepData(proc.id, { 
        motion_final_result: result,
        motion_ended_at: new Date().toISOString()
      });
      toast.success("Processo finalizado com sucesso!");
      onComplete();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {motionLetterUrl && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[40px] p-8 flex flex-col items-center text-center shadow-sm">
           <div className="w-16 h-16 rounded-2xl bg-white text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
              <RiDownload2Line className="text-3xl" />
           </div>
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Seu Pacote do Motion está pronto!</h3>
           <p className="text-xs text-slate-500 font-medium mt-1 mb-6">Baixe o documento final preparado pela nossa equipe.</p>
           <a 
            href={motionLetterUrl} 
            target="_blank" 
            rel="noreferrer"
            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
           >
             <RiDownload2Line className="text-lg" /> Baixar Pacote de Motion
           </a>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-8">
           <RiCheckDoubleLine className="text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">Resultado do Motion</h2>
        <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">
          O USCIS já deu o veredito final sobre o seu Motion? Reporte abaixo para encerrarmos seu processo.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleFinalResult('approved')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-3xl hover:bg-emerald-100 transition-all group"
          >
            <RiCheckDoubleLine className="text-3xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Aprovado</span>
          </button>

          <button
            onClick={() => handleFinalResult('denied')}
            disabled={loading}
            className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-3xl hover:bg-red-100 transition-all group"
          >
            <RiSpam2Line className="text-3xl text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Negado</span>
          </button>
        </div>
      </div>
    </div>
  );
}
