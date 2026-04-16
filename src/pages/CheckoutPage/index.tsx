import { useState, useRef, useEffect } from "react";
import { useParams, Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
import { useT } from "../../i18n";
import { 
  validateCoupon, 
  calculateDiscount, 
  type CouponValidation 
} from "../../services/coupon.service";

const ZELLE_EMAIL = ZELLE_RECIPIENT.email;
const ZELLE_PHONE = ZELLE_RECIPIENT.phone;
const ZELLE_NAME  = ZELLE_RECIPIENT.name;

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_EXCHANGE_RATE = 5.7;



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
    label: "card", // Placeholder label, will be localized in JSX
    sublabel: "USD",
    icon: <RiBankCardLine className="text-xl" />,
    available: true,
  },
  {
    id: "pix",
    label: "pix",
    sublabel: "BRL",
    icon: <MdPix className="text-xl" />,
    available: true,
  },
  {
    id: "zelle",
    label: "zelle",
    sublabel: "USD",
    icon: (
      <span className="text-xs font-black tracking-tight leading-none">Z$</span>
    ),
    available: true,
  },
  {
    id: "parcelow",
    label: "parcelow",
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
  discountUSD,
  couponCode,
}: {
  baseUSD: number;
  depUSD: number;
  dependents: number;
  method: PaymentTab;
  discountUSD?: number;
  couponCode?: string;
}) {
  const t = useT("checkout").product;
  const subtotalBeforeDiscount = baseUSD + dependents * depUSD;
  const subtotal = Math.max(0, subtotalBeforeDiscount - (discountUSD || 0));
  
  const isCard = method === "card";
  const isPix = method === "pix";
  const isParcelow = method === "parcelow";

  const cardTotal = isCard ? estimateCardTotal(subtotal) : null;
  const pixTotal = (isPix || isParcelow) ? estimatePixTotal(subtotal, FALLBACK_EXCHANGE_RATE) : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2.5 text-sm">
      <div className="flex justify-between text-slate-600">
        <span>{t.summary.mainService}</span>
        <span className="font-semibold">US$ {baseUSD.toFixed(2)}</span>
      </div>
      {dependents > 0 && (
        <div className="flex justify-between text-slate-600">
          <span>{t.summary.dependentsCount.replace("{{count}}", dependents.toString())}</span>
          <span className="font-semibold">US$ {(dependents * depUSD).toFixed(2)}</span>
        </div>
      )}
      
      {discountUSD && discountUSD > 0 && (
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>{t.coupon.discount.replace("{{code}}", couponCode || "")}</span>
          <span>- US$ {discountUSD.toFixed(2)}</span>
        </div>
      )}

      <div className="h-px bg-slate-200" />

      {isCard && cardTotal && (
        <>
          <div className="flex justify-between text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> {t.summary.stripeFee}
            </span>
            <span>+ US$ {(cardTotal - subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-slate-800 text-base">
            <span>{t.summary.total}</span>
            <span>US$ {cardTotal.toFixed(2)}</span>
          </div>
        </>
      )}

      {isPix && pixTotal && (
        <>
          <div className="flex justify-between text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> {t.summary.exchangeTax}
            </span>
            <span>~R$ {pixTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-slate-800 text-base">
            <span>{t.summary.total}</span>
            <span>R$ {pixTotal.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {t.summary.estimatedNotice}
          </p>
        </>
      )}

      {(method === "zelle" || method === "parcelow") && (
        <div className="flex justify-between font-black text-slate-800 text-base">
          <span>{t.summary.subtotal}</span>
          <span>US$ {subtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isUpgrade = searchParams.get("upgrade") === "true";
  const parentId = searchParams.get("id");


  const service = getServiceBySlug(slug || "");
  const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
  const [dependents, setDependents] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [zelleDone, setZelleDone] = useState(false);
  const [zelleAutoApproved, setZelleAutoApproved] = useState(false);
  const [zelleProof, setZelleProof] = useState<File | null>(null);
  const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(null);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const handleProofSelect = (file: File) => {
    setZelleProof(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setZelleProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem("checkout_timer");
    return saved ? parseInt(saved) : 3600;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useT("checkout").product;

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
  const depUSD = isUpgrade ? baseUSD : (service ? parsePriceUSD(service.dependentPrice) : 0);
  const checkoutCount = isUpgrade ? (dependents - 1) : dependents;
  const subtotalUSD = baseUSD + (checkoutCount * depUSD);

  const discountUSD = appliedCoupon?.valid 
    ? calculateDiscount(subtotalUSD, appliedCoupon.discount_type!, appliedCoupon.discount_value!)
    : 0;
  
  const finalSubtotalUSD = Math.max(0, subtotalUSD - discountUSD);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponInput, slug);
      if (result.valid) {
        if (result.min_purchase_usd && subtotalUSD < result.min_purchase_usd) {
          toast.error(t.coupon.errors.minPurchase.replace("{{value}}", result.min_purchase_usd.toString()));
          return;
        }
        setAppliedCoupon(result);
        toast.success(t.coupon.applied);
      } else {
        toast.error(result.error === "NOT_APPLICABLE" ? t.coupon.errors.notApplicable : t.coupon.errors.invalid);
      }
    } catch {
      toast.error(t.coupon.errors.invalid);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

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
    validate: zodValidate(z.object({
      fullName: z.string().min(1, t.userData.errors.nameRequired).min(3, t.userData.errors.nameShort),
      email: z.string().min(1, t.userData.errors.emailRequired).email(t.userData.errors.emailInvalid),
      phone: z.string().min(10, t.userData.errors.phoneRequired),
      password: z.string().optional(),
    })),
    onSubmit: async (values) => {
      setIsRedirecting(true);
      try {
        let currentUserId = user?.id;

        // Auto-signup if not logged in
        if (!currentUserId) {
          if (!values.password || values.password.length < 6) {
             throw new Error(t.userData.errors.passwordShort);
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
            }
          } catch (signUpErr) {
             const error = signUpErr as Error;
             if (error.message?.includes("already registered")) {
                throw new Error(t.userData.errors.emailTaken);
             }
             throw error;
          }
        }

        const CATALOG_SLUG: Record<string, string> = { "visto-b1-b2-reaplicacao": "visto-b1-b2" };
        const billingSlug = CATALOG_SLUG[service!.slug] || service!.slug;
        const totalToCharge = finalSubtotalUSD;

        if (activeMethod === "card" || activeMethod === "pix") {
          const { url } = await paymentService.createStripeCheckout({
            slug: billingSlug,
            email: values.email,
            fullName: values.fullName,
            phone: values.phone,
            dependents: checkoutCount,
            paymentMethod: activeMethod as StripePaymentMethod,
            userId: currentUserId,
            amount: totalToCharge,
            proc_id: parentId || undefined,
            coupon_code: appliedCoupon?.valid ? couponInput : undefined,
          });

          // Pre-register in visa_orders
          try {
            await supabase.from("visa_orders").insert({
              user_id: currentUserId,
              client_name: values.fullName,
              client_email: values.email,
              billing_email: values.email,
              total_price_usd: totalToCharge,
              product_slug: service!.slug,
              payment_method: activeMethod === "card" ? "stripe_card" : "stripe_pix",
              payment_status: "pending",
            });
          } catch (e) {
            console.error("[Checkout] registration error:", e);
          }

          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.href = url;

        } else if (activeMethod === "parcelow") {
          if (!values.parcelowCpf || !validateCPF(values.parcelowCpf)) {
            throw new Error(t.paymentMethods.parcelow.cpfRequired);
          }

          const { url } = await paymentService.createParcelowCheckout({
            slug: billingSlug,
            email: values.email,
            fullName: values.fullName,
            phone: values.phone,
            cpf: values.parcelowCpf,
            dependents: checkoutCount,
            userId: currentUserId,
            amount: totalToCharge,
            proc_id: parentId || undefined,
            coupon_code: appliedCoupon?.valid ? couponInput : undefined,
          });

          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.href = url;

        } else if (activeMethod === "zelle") {
          if (!zelleProof)
            throw new Error(t.paymentMethods.zelle.proofRequired);

          const proofPath = await paymentService.uploadZelleProof(zelleProof, service!.slug);

          const zelleResult = await paymentService.createZellePayment({
            slug: service!.slug,
            serviceName: service!.title,
            expectedAmount: totalToCharge,
            amount: totalToCharge,
            confirmationCode: `UPLD_${Date.now()}`,
            paymentDate: new Date().toISOString().split("T")[0],
            proofPath,
            guestEmail: values.email,
            guestName: values.fullName,
            phone: values.phone,
            userId: currentUserId || null,
            dependents,
            proc_id: parentId || undefined,
            coupon_code: appliedCoupon?.valid ? couponInput : undefined,
          });

          setZelleAutoApproved(zelleResult.autoApproved === true);
          setZelleDone(true);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t.errors?.genericError || "Erro ao processar pagamento.");
      } finally {
        setIsRedirecting(false);
      }
    },
  });
  
  if (!service) return <Navigate to="/dashboard" replace />;



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
              {t.scarcityBanner.lastSlots}
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
                    {t.scarcityBanner.timeLeft}
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
            {t.scarcityBanner.cta}
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
                  {t.summary.offLabel}
                </span>
              </div>
            </div>

            {/* Dependents / Upgrade Slots */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {isUpgrade ? t.dependents.slotsLabel : t.dependents.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isUpgrade 
                      ? t.dependents.perSlot.replace("{{price}}", service.price) 
                      : t.dependents.perPerson.replace("{{price}}", service.dependentPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDependents(Math.max(isUpgrade ? 1 : 0, dependents - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    disabled={dependents <= (isUpgrade ? 1 : 0)}
                  >
                    <RiSubtractLine className="text-slate-600" />
                  </button>
                  <span className="w-4 text-center font-bold text-slate-800">{dependents}</span>
                  <button
                    type="button"
                    onClick={() => setDependents(Math.min(10, dependents + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all font-mono"
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
               dependents={checkoutCount}
               method={activeMethod}
               discountUSD={discountUSD}
               couponCode={couponInput}
             />

             {/* Coupon field */}
             <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
               <Label className="text-xs text-slate-500 mb-2 block">{t.coupon.label}</Label>
               <div className="flex gap-2">
                 <div className="relative flex-1">
                   <Input
                     placeholder={t.coupon.placeholder}
                     value={couponInput}
                     onChange={(e) => setCouponInput(e.target.value)}
                     disabled={!!appliedCoupon || isValidatingCoupon}
                     className={`text-sm h-10 uppercase font-mono tracking-wider ${appliedCoupon ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`}
                   />
                   {appliedCoupon && (
                     <RiCheckLine className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                   )}
                 </div>
                 {appliedCoupon ? (
                   <button
                     type="button"
                     onClick={handleRemoveCoupon}
                     className="h-10 px-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                   >
                     <RiCloseLine className="text-xl" />
                   </button>
                 ) : (
                   <button
                     type="button"
                     onClick={handleApplyCoupon}
                     disabled={isValidatingCoupon || !couponInput.trim()}
                     className="h-10 px-4 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm shadow-slate-200"
                   >
                     {isValidatingCoupon ? t.coupon.applying : t.coupon.apply}
                   </button>
                 )}
               </div>
             </div>

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
                  {t.userData.title}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t.userData.fullName}</Label>
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
                    <Label htmlFor="email">{t.userData.email}</Label>
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
                    <Label htmlFor="phone">{t.userData.phone}</Label>
                    <div className="mt-1.5">
                      <PhoneInput
                        name="phone"
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
                      <Label htmlFor="password">{t.userData.password}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t.userData.passwordDesc}
                        className="mt-1.5"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.userData.passwordAutoNotice}
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
                  {t.paymentMethods.title}
                </h2>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { ...PAYMENT_METHODS[0], label: t.paymentMethods.card.label, sublabel: t.paymentMethods.card.sublabel },
                    { ...PAYMENT_METHODS[1], label: t.paymentMethods.pix.label, sublabel: t.paymentMethods.pix.sublabel },
                    { ...PAYMENT_METHODS[2], label: t.paymentMethods.zelle.label, sublabel: t.paymentMethods.zelle.sublabel },
                    { ...PAYMENT_METHODS[3], label: t.paymentMethods.parcelow.label, sublabel: t.paymentMethods.parcelow.sublabel },
                  ].map((m) => (
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
                          {t.paymentMethods.soon}
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
                      <p className="text-xs text-blue-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.card.notice }} />
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
                      <p className="text-xs text-emerald-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.pix.notice }} />
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
                        <p className="text-xs text-orange-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.parcelow.notice }} />
                      </div>

                      {/* CPF Field */}
                      <div className="space-y-1.5 px-1">
                        <Label htmlFor="parcelowCpf">{t.paymentMethods.parcelow.cpfLabel}</Label>
                        <Input
                          id="parcelowCpf"
                          name="parcelowCpf"
                          placeholder={t.paymentMethods.parcelow.cpfPlaceholder}
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
                          <span>{t.paymentMethods.parcelow.cpfNotice}</span>
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
                          {t.paymentMethods.zelle.notice}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800">{t.paymentMethods.zelle.name} {ZELLE_NAME}</p>
                          <p className="text-sm text-slate-600 font-mono">{t.paymentMethods.zelle.email} {ZELLE_EMAIL}</p>
                          <p className="text-sm text-slate-600 font-mono">{t.paymentMethods.zelle.phone} {ZELLE_PHONE}</p>
                        </div>
                        <p className="text-[11px] text-violet-500 mt-2 leading-snug">
                          {t.paymentMethods.zelle.confirmTitle}
                        </p>
                      </div>

                      {/* Proof upload */}
                      <div>
                        <Label>{t.paymentMethods.zelle.uploadProof}</Label>
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
                              alt={t.paymentMethods.zelle.uploadProof}
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
                            <span className="text-xs font-medium">{t.paymentMethods.zelle.uploadProof}</span>
                            <span className="text-[10px]">{t.paymentMethods.zelle.uploadDesc}</span>
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
                      className={`rounded-xl border p-5 text-center ${
                        zelleAutoApproved
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {zelleAutoApproved ? (
                        <>
                          <RiCheckLine className="text-emerald-500 text-3xl mx-auto mb-2" />
                          <p className="font-bold text-slate-800 text-sm">🎉 Pagamento Aprovado!</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Seu comprovante foi verificado automaticamente e seu serviço já está ativo no painel.
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center justify-center gap-2 mx-auto mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                          >
                            Acessar Meu Painel
                          </button>
                        </>
                      ) : (
                        <>
                          <RiCheckLine className="text-amber-500 text-3xl mx-auto mb-2" />
                          <p className="font-bold text-slate-800 text-sm">{t.paymentMethods.zelle.pendingReview.split("!")[0]}!</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.zelle.pendingReview.split("!")[1] || t.paymentMethods.zelle.pendingReview }} />
                          <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center justify-center gap-2 mx-auto mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs"
                          >
                            {t.paymentMethods.zelle.goDashboard}
                          </button>
                        </>
                      )}
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
                      {t.redirecting}
                    </>
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

              <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <RiShieldCheckLine />
                {t.paymentMethods.card.notice.includes("SSL") ? t.paymentMethods.card.notice : "Protected by 256-bit SSL encryption."}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);
}
