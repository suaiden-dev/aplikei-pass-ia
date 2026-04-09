import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { authService } from "../../services/auth.service";
import {
  RiShieldCheckLine,
  RiLockLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiArrowRightLine,
  RiSubtractLine,
  RiAddLine,
  RiCheckLine,
  RiInformationLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiImageLine,
  RiTimeLine,
  RiFlashlightFill,
} from "react-icons/ri";
import { MdPix } from "react-icons/md";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { zodValidate } from "../../utils/zodValidate";
import { getServiceBySlug } from "../../data/services";
import { useAuth } from "../../hooks/useAuth";
import {
  paymentService,
  parsePriceUSD,
  estimateCardTotal,
  estimatePixTotal,
  type StripePaymentMethod,
} from "../../services/payment.service";
import PhoneInput from "../../components/PhoneInput";
import { ZELLE_RECIPIENT } from "../../config/zelle";
import { maskCPF, validateCPF } from "../../utils/cpf";

const ZELLE_EMAIL = ZELLE_RECIPIENT.email;
const ZELLE_PHONE = ZELLE_RECIPIENT.phone;
const ZELLE_NAME  = ZELLE_RECIPIENT.name;

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_EXCHANGE_RATE = 5.7;

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Informe seu nome completo").min(3, "Nome muito curto"),
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  phone: z.string().min(10, "Informe um telefone válido"),
  password: z.string().optional(),
});

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface PaymentMethod {
  id: PaymentTab;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  available: boolean;
}

// ─── Payment method pills ─────────────────────────────────────────────────────

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    label: "Cartão",
    sublabel: "USD",
    icon: <RiBankCardLine className="text-xl" />,
    available: true,
  },
  {
    id: "pix",
    label: "Pix",
    sublabel: "BRL",
    icon: <MdPix className="text-xl" />,
    available: true,
  },
  {
    id: "zelle",
    label: "Zelle",
    sublabel: "USD",
    icon: (
      <span className="text-xs font-black tracking-tight leading-none">Z$</span>
    ),
    available: true,
  },
  {
    id: "parcelow",
    label: "Parcelow",
    sublabel: "BRL",
    icon: (
      <span className="text-[10px] font-black tracking-tight leading-none tracking-tighter">PRC</span>
    ),
    available: true,
  },
];

// ─── Price summary ────────────────────────────────────────────────────────────

function PriceSummary({
  baseUSD,
  depUSD,
  dependents,
  method,
}: {
  baseUSD: number;
  depUSD: number;
  dependents: number;
  method: PaymentTab;
}) {
  const subtotal = baseUSD + dependents * depUSD;
  const isCard = method === "card";
  const isPix = method === "pix";
  const isParcelow = method === "parcelow";

  const cardTotal = isCard ? estimateCardTotal(subtotal) : null;
  const pixTotal = (isPix || isParcelow) ? estimatePixTotal(subtotal, FALLBACK_EXCHANGE_RATE) : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2.5 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>Serviço principal</span>
        <span className="font-semibold">US$ {baseUSD.toFixed(2)}</span>
      </div>
      {dependents > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>Dependentes ({dependents}×)</span>
          <span className="font-semibold">US$ {(dependents * depUSD).toFixed(2)}</span>
        </div>
      )}

      <div className="h-px bg-slate-200" />

      {isCard && cardTotal && (
        <>
          <div className="flex justify-between text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> Taxa Stripe (~3.9% + $0.30)
            </span>
            <span>+ US$ {(cardTotal - subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-slate-800 text-base">
            <span>Total</span>
            <span>US$ {cardTotal.toFixed(2)}</span>
          </div>
        </>
      )}

      {isPix && pixTotal && (
        <>
          <div className="flex justify-between text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> Câmbio + IOF (est.)
            </span>
            <span>~R$ {pixTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-slate-800 text-base">
            <span>Total</span>
            <span>R$ {pixTotal.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            * Valor estimado. O câmbio final é calculado no momento do pagamento.
          </p>
        </>
      )}

      {(method === "zelle" || method === "parcelow") && (
        <div className="flex justify-between font-black text-slate-800 text-base">
          <span>Subtotal</span>
          <span>US$ {subtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const service = slug ? getServiceBySlug(slug) : null;
  const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
  const [dependents, setDependents] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serviceInactive, setServiceInactive] = useState(false);



  // Guard: block checkout if product is inactive
  useEffect(() => {
    if (!slug) return;
    supabase
      .from("services_prices")
      .select("is_active")
      .eq("service_id", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.is_active === false) {
          setServiceInactive(true);
        }
      });
  }, [slug]);

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

  // ── Scarcity Timer ─────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem("checkout_timer");
    return saved ? parseInt(saved, 10) : 600; // 10 minutes
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        sessionStorage.setItem("checkout_timer", next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hh: hours.toString().padStart(2, "0"),
      mm: mins.toString().padStart(2, "0"),
      ss: secs.toString().padStart(2, "0"),
    };
  };

  const baseUSD = service ? parsePriceUSD(service.price) : 0;
  const depUSD = service ? parsePriceUSD(service.dependentPrice) : 0;

  const handlePhoneChange = (value: string) => {
    formik.setFieldValue("phone", value);
    formik.setFieldTouched("phone", true);
  };

  const formik = useFormik({
    initialValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phoneNumber ?? "",
      password: "",
      parcelowCpf: "",
    },
    enableReinitialize: true,
    validate: zodValidate(checkoutSchema),
    onSubmit: async (values) => {
      setIsRedirecting(true);
      try {
        let currentUserId = user?.id;

        // Auto-signup if not logged in
        if (!currentUserId) {
          if (!values.password || values.password.length < 6) {
             throw new Error("A senha precisa ter pelo menos 6 caracteres.");
          }
          
          try {
            const signUpRes = await authService.signUp({
              email: values.email,
              password: values.password,
              fullName: values.fullName,
              phoneNumber: values.phone,
              terms: true, // Auto-accept terms at checkout
            });
            
            if (signUpRes.user) {
              currentUserId = signUpRes.user.id;
              toast.success("Conta criada com sucesso!");
            }
          } catch (signUpErr) {
             const error = signUpErr as Error;
             if (error.message?.includes("already registered")) {
                throw new Error("Este e-mail já possui uma conta. Por favor, faça login antes de contratar.");
             }
             throw error;
          }
        }

        // Some slugs are variants of a base product. The Stripe/Parcelow edge functions
        // only know the base slug, so we pass that for billing while storing the real slug
        // in localStorage so CheckoutSuccessPage activates the correct product.
        const CATALOG_SLUG: Record<string, string> = { "visto-b1-b2-reaplicacao": "visto-b1-b2" };
        const billingSlug = CATALOG_SLUG[service!.slug] || service!.slug;

        if (activeMethod === "card" || activeMethod === "pix") {
          const { url } = await paymentService.createStripeCheckout({
            slug: billingSlug,
            email: values.email,
            fullName: values.fullName,
            phone: values.phone,
            dependents,
            paymentMethod: activeMethod as StripePaymentMethod,
            userId: currentUserId,
            amount: parsePriceUSD(service!.price),
          });

          // Pre-register in visa_orders (omitted for brevity in this replace but keeping the same logic)
          try {
            await supabase.from("visa_orders").insert({
              user_id: currentUserId,
              client_name: values.fullName,
              client_email: values.email,
              product_slug: service!.slug,
              total_price_usd: parsePriceUSD(service!.price) + (dependents * depUSD),
              payment_method: activeMethod === "card" ? "stripe_card" : "stripe_pix",
              payment_status: "pending",
            });
          } catch (e) {
            console.error("[Checkout] registration error:", e);
          }

          // Always store the REAL slug so CheckoutSuccessPage activates the correct product
          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.href = url;

        } else if (activeMethod === "parcelow") {
          if (!values.parcelowCpf || !validateCPF(values.parcelowCpf)) {
            throw new Error("Informe um CPF válido para prosseguir com a Parcelow.");
          }

          const { url } = await paymentService.createParcelowCheckout({
            slug: billingSlug,
            email: values.email,
            fullName: values.fullName,
            phone: values.phone,
            cpf: values.parcelowCpf,
            dependents,
            userId: currentUserId,
            amount: parsePriceUSD(service!.price),
          });

          // Always store the REAL slug so CheckoutSuccessPage activates the correct product
          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.href = url;

        } else if (activeMethod === "zelle") {
          // Validate Zelle fields
          if (!zelleAmount || parseFloat(zelleAmount) <= 0)
            throw new Error("Informe o valor enviado via Zelle.");
          if (!zelleDate)
            throw new Error("Informe a data do pagamento.");
          if (!zelleProof)
            throw new Error("Anexe o comprovante do pagamento.");

          const proofPath = await paymentService.uploadZelleProof(zelleProof, service!.slug);

          await paymentService.createZellePayment({
            slug: service!.slug,
            serviceName: service!.title,
            expectedAmount: baseUSD + dependents * depUSD,
            amount: parseFloat(zelleAmount),
            confirmationCode: zelleCode,
            paymentDate: zelleDate,
            proofPath,
            guestEmail: values.email,
            guestName: values.fullName,
            phone: values.phone,
            userId: currentUserId || null,
            dependents, // Pass this to paymentService
          });

          setZelleDone(true);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao processar pagamento.");
      } finally {
        setIsRedirecting(false);
      }
    },
  });
  
  if (!service) return <Navigate to="/dashboard" replace />;

  if (serviceInactive) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-width-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiCloseLine className="text-red-500 text-3xl" />
          </div>
          <h2 className="font-display text-2xl font-black text-slate-800 mb-3">
            Serviço indisponível
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            Este guia está temporariamente indisponível para contratação. Você será redirecionado para o seu painel.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-[#1649c0] transition-colors"
          >
            Voltar para o Dashboard
          </button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── High-Impact Scarcity Banner (Reference Match) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#003da5] text-white py-3.5 px-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-900/20 border border-white/10"
        >
          {/* Left: Message */}
          <div className="flex items-center gap-3 font-display tracking-tight">
            <RiFlashlightFill className="text-amber-400 text-xl animate-pulse" />
            <span className="font-black text-xs sm:text-base uppercase underline-offset-4 decoration-amber-400/50">
              Últimas vagas com desconto: só hoje!
            </span>
          </div>

          {/* Center: Timer Segmented */}
          <div className="flex items-center gap-2 sm:gap-3">
            {(() => {
              const { hh, mm, ss } = formatTimeParts(timeLeft);
              return (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#1a4fb0] px-2 py-1.5 rounded-lg border border-white/10 font-mono text-lg font-black min-w-[36px] text-center shadow-inner">
                      {hh}
                    </div>
                    <span className="text-white/50 font-black">:</span>
                    <div className="bg-[#1a4fb0] px-2 py-1.5 rounded-lg border border-white/10 font-mono text-lg font-black min-w-[36px] text-center shadow-inner">
                      {mm}
                    </div>
                    <span className="text-white/50 font-black">:</span>
                    <div className="bg-[#1a4fb0] px-2 py-1.5 rounded-lg border border-white/10 font-mono text-lg font-black min-w-[36px] text-center shadow-inner">
                      {ss}
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-blue-200 tracking-widest ml-1">
                    restantes
                  </span>
                </>
              );
            })()}
          </div>

          {/* Right: CTA */}
          <button 
            type="button"
            className="bg-white text-[#003da5] px-6 py-2 rounded-full font-display font-black text-xs sm:text-sm uppercase tracking-tighter hover:bg-blue-50 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            Aproveitar Agora
          </button>
        </motion.div>

        {/* Header content below (adjusted padding) */}
        <div className="pt-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
           
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Left: Service summary ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Service card */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                  <RiShieldCheckLine className="text-primary text-xl" />
                </div>
                <div>
                  <p className="font-display font-bold text-slate-800 text-sm leading-tight">
                    {service!.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{service!.processType}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {service.included.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <RiCheckLine className="text-primary text-sm mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-600 leading-snug">{item.split(":")[0]}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-2 pt-3 border-t border-slate-100">
                <span className="text-2xl font-black text-slate-800">{service.price}</span>
                <span className="text-xs text-slate-400 line-through mb-0.5">{service.originalPrice}</span>
                <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  50% OFF
                </span>
              </div>
            </div>

            {/* Dependents */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Dependentes</p>
                  <p className="text-xs text-slate-400">{service.dependentPrice} por pessoa</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDependents(Math.max(0, dependents - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    disabled={dependents === 0}
                  >
                    <RiSubtractLine className="text-slate-600" />
                  </button>
                  <span className="w-4 text-center font-bold text-slate-800">{dependents}</span>
                  <button
                    type="button"
                    onClick={() => setDependents(Math.min(10, dependents + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <RiAddLine className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price summary */}
            <PriceSummary
              baseUSD={baseUSD}
              depUSD={depUSD}
              dependents={dependents}
              method={activeMethod}
            />

          </motion.aside>

          {/* ── Right: Payment form ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={formik.handleSubmit}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-6"
            >
              {/* Customer info */}
              <div>
                <h2 className="font-display font-bold text-slate-800 text-base mb-4">
                  Seus dados
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="João da Silva"
                      className="mt-1.5"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{formik.errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="mt-1.5"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="mt-1.5">
                      <PhoneInput
                        value={formik.values.phone}
                        onChange={handlePhoneChange}
                        onBlur={() => formik.setFieldTouched("phone", true)}
                      />
                    </div>
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{formik.errors.phone}</p>
                    )}
                  </div>
                  
                  {!user && (
                    <div>
                      <Label htmlFor="password">Crie uma senha para sua conta</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="mt-1.5"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Sua conta será criada automaticamente ao finalizar o pedido.
                      </p>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method tabs */}
              <div>
                <h2 className="font-display font-bold text-slate-800 text-base mb-3">
                  Método de pagamento
                </h2>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!m.available}
                      onClick={() => m.available && setActiveMethod(m.id)}
                      className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${
                        activeMethod === m.id
                          ? "border-primary bg-primary/5 text-primary"
                          : m.available
                          ? "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          : "border-slate-100 text-slate-300 cursor-not-allowed"
                      }`}
                    >
                      {m.icon}
                      <span className="text-[11px] font-bold leading-none">{m.label}</span>
                      <span className="text-[9px] font-medium leading-none opacity-70">{m.sublabel}</span>
                      {!m.available && (
                        <span className="absolute -top-1.5 -right-1 text-[8px] font-black bg-slate-200 text-slate-400 px-1 py-0.5 rounded-full leading-none">
                          EM BREVE
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Method-specific info */}
                <AnimatePresence mode="wait">
                  {activeMethod === "card" && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3"
                    >
                      <RiBankCardLine className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Você será redirecionado ao checkout seguro da <strong>Stripe</strong>. Aceitamos Visa, Mastercard e American Express em USD.
                      </p>
                    </motion.div>
                  )}
                  {activeMethod === "pix" && (
                    <motion.div
                      key="pix"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3"
                    >
                      <RiQrCodeLine className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Você será redirecionado ao checkout da <strong>Stripe com Pix</strong>. Um QR Code será gerado em BRL. O valor inclui câmbio + IOF.
                      </p>
                    </motion.div>
                  )}

                  {activeMethod === "parcelow" && (
                    <motion.div
                      key="parcelow"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Info box */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-orange-50 border border-orange-100 p-3">
                        <RiTimeLine className="text-orange-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-orange-800 leading-relaxed">
                          Pague em até <strong>12 parcelas</strong> fixas via <strong>Parcelow</strong>. Valor convertido em BRL com taxas de parcelamento. Câmbio garantido.
                        </p>
                      </div>

                      {/* CPF Field */}
                      <div className="space-y-1.5 px-1">
                        <Label htmlFor="parcelowCpf">CPF do Titular do Cartão</Label>
                        <Input
                          id="parcelowCpf"
                          name="parcelowCpf"
                          placeholder="000.000.000-00"
                          className="mt-1"
                          maxLength={14}
                          value={formik.values.parcelowCpf}
                          onChange={(e) => {
                            const masked = maskCPF(e.target.value);
                            formik.setFieldValue("parcelowCpf", masked);
                          }}
                          onBlur={formik.handleBlur}
                        />
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <RiInformationLine className="text-orange-400" />
                          <span>Obrigatório para emissão da fatura pela Parcelow.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeMethod === "zelle" && !zelleDone && (
                    <motion.div
                      key="zelle"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {/* Recipient info */}
                      <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-widest mb-2">
                          Envie o Zelle para:
                        </p>
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
                          <Label htmlFor="zelleAmount">Valor enviado (USD)</Label>
                          <Input
                            id="zelleAmount"
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="200.00"
                            className="mt-1.5"
                            value={zelleAmount}
                            onChange={(e) => setZelleAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zelleDate">Data do pagamento</Label>
                          <Input
                            id="zelleDate"
                            type="date"
                            className="mt-1.5"
                            value={zelleDate}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setZelleDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="zelleCode">
                          Código de confirmação <span className="text-slate-400 font-normal">(opcional)</span>
                        </Label>
                        <Input
                          id="zelleCode"
                          placeholder="Ex: ABCD1234"
                          className="mt-1.5"
                          value={zelleCode}
                          onChange={(e) => setZelleCode(e.target.value)}
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
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleProofSelect(f);
                          }}
                        />
                        {zelleProofPreview ? (
                          <div className="mt-1.5 relative rounded-xl overflow-hidden border border-slate-200">
                            <img
                              src={zelleProofPreview}
                              alt="Comprovante"
                              className="w-full max-h-40 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setZelleProof(null);
                                setZelleProofPreview(null);
                              }}
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
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
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
                    </motion.div>
                  )}

                  {activeMethod === "zelle" && zelleDone && (
                    <motion.div
                      key="zelle-done"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 text-center"
                    >
                      <RiCheckLine className="text-emerald-500 text-3xl mx-auto mb-2" />
                      <p className="font-bold text-slate-800 text-sm">Comprovante enviado!</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Seu pagamento está em <strong>análise</strong>. Você receberá uma confirmação por e-mail assim que for aprovado.
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                        <RiTimeLine />
                        Prazo de verificação: até 24 horas úteis
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              {!zelleDone && (
                <button
                  type="submit"
                  disabled={isRedirecting || formik.isSubmitting}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-[#1649c0] hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? (
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
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);
}
