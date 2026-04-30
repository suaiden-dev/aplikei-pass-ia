import { useState, useRef, useEffect } from "react";
import { useParams, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { authService } from "../../../services/auth.service";
import {
  RiShieldCheckLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiSubtractLine,
  RiAddLine,
  RiCheckLine,
  RiInformationLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiTimeLine,
  RiFlashlightFill,
} from "react-icons/ri";
import { MdPix } from "react-icons/md";
import { Input } from "../../../components/Input";
import { LogoLoader } from "../../../components/ui/LogoLoader";
import { 
  validateCoupon, 
  calculateDiscount,
  type CouponValidation 
} from "../../../services/coupon.service";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { Label } from "../../../components/Label";
import { Button } from "../../../components/Button";
import { zodValidate } from "../../../utils/zodValidate";
import { getServiceBySlug } from "../../../data/services";
import { useAuth } from "../../../hooks/useAuth";
import {
  paymentService,
  estimateCardTotal,
  estimatePixTotal,
  type StripePaymentMethod,
} from "../../../services/payment.service";
import PhoneInput from "../../../components/PhoneInput";
import { ZELLE_RECIPIENT } from "../../../config/zelle";
import { maskCPF, validateCPF } from "../../../utils/cpf";
import { useT } from "../../../i18n";

const ZELLE_EMAIL = ZELLE_RECIPIENT.email;
const ZELLE_PHONE = ZELLE_RECIPIENT.phone;
const ZELLE_NAME  = ZELLE_RECIPIENT.name;

const FALLBACK_EXCHANGE_RATE = 5.7;

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface PaymentMethodOption {
  id: PaymentTab;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  available: boolean;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    label: "card",
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

function parsePriceUSD(priceStr: string): number {
  const match = priceStr.match(/[\d,.]+/);
  if (!match) return 0;
  return parseFloat(match[0].replace(",", "."));
}

function PriceSummary({
  baseUSD,
  depUSD,
  dependents,
  method,
  discountUSD,
  couponCode,
  isUpgrade,
}: {
  baseUSD: number | string;
  depUSD: number | string;
  dependents: number;
  method: PaymentTab;
  discountUSD?: number;
  couponCode?: string;
  isUpgrade?: boolean;
}) {
  const t = useT("checkout")?.product;
  const baseUSDVal = typeof baseUSD === "number" ? baseUSD : parsePriceUSD(baseUSD);
  const depUSDVal = typeof depUSD === "number" ? depUSD : parsePriceUSD(depUSD);
  const subtotalBeforeDiscount = baseUSDVal + dependents * depUSDVal;
  const subtotal = Math.max(0, subtotalBeforeDiscount - (discountUSD || 0));
  
  const isCard = method === "card";
  const isPix = method === "pix";
  const isParcelow = method === "parcelow";

  const cardTotal = isCard ? estimateCardTotal(subtotal) : null;
  const pixTotal = (isPix || isParcelow) ? estimatePixTotal(subtotal, FALLBACK_EXCHANGE_RATE) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-sm">
      {!isUpgrade && (
        <div className="flex justify-between text-text-muted">
          <span>{t?.summary?.mainService}</span>
          <span className="font-semibold text-text">US$ {baseUSDVal.toFixed(2)}</span>
        </div>
      )}
      {dependents > 0 && (
        <div className="flex justify-between text-text-muted">
          <span>{isUpgrade ? `${t?.summary?.slotsCount} (${dependents}x)` : t?.summary?.dependentsCount?.replace("{{count}}", dependents.toString())}</span>
          <span className="font-semibold text-text">US$ {(dependents * depUSDVal).toFixed(2)}</span>
        </div>
      )}
      
      {discountUSD && discountUSD > 0 && (
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>{t?.coupon?.discount?.replace("{{code}}", couponCode || "")}</span>
          <span>- US$ {discountUSD.toFixed(2)}</span>
        </div>
      )}

      <div className="h-px bg-border" />

      {isCard && cardTotal && (
        <>
          <div className="flex justify-between text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> {t?.summary?.stripeFee}
            </span>
            <span>+ US$ {(cardTotal - subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-text text-base">
            <span>{t?.summary?.total}</span>
            <span>US$ {cardTotal.toFixed(2)}</span>
          </div>
        </>
      )}

      {isPix && pixTotal && (
        <>
          <div className="flex justify-between text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <RiInformationLine /> {t?.summary?.exchangeTax}
            </span>
            <span>~R$ {pixTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-text text-base">
            <span>{t?.summary?.total}</span>
            <span>R$ {pixTotal.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-text-muted">
            {t?.summary?.estimatedNotice}
          </p>
        </>
      )}

      {(method === "zelle" || method === "parcelow") && (
        <div className="flex justify-between font-black text-text text-base">
          <span>{t?.summary?.subtotal}</span>
          <span>US$ {subtotal.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT("checkout");
  const p = t?.product;

  const isUpgrade = searchParams.get("upgrade") === "true";
  
  const service = getServiceBySlug(slug || "");
  const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
  const [dependents, setDependents] = useState(searchParams.get("upgrade") === "true" ? 1 : 0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [zelleDone, setZelleDone] = useState(false);
  const [zelleProof, setZelleProof] = useState<File | null>(null);
  const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(null);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem("checkout_timer");
    return saved ? parseInt(saved) : 3600;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const subtotalUSD = isUpgrade ? (dependents * baseUSD) : (baseUSD + (dependents * depUSD));

  const discountUSD = appliedCoupon?.valid && appliedCoupon.discount_type && appliedCoupon.discount_value
    ? calculateDiscount(subtotalUSD, appliedCoupon.discount_type, appliedCoupon.discount_value)
    : 0;
  
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    const basePrice = parsePriceUSD(service?.price || "0");
    const depPrice = parsePriceUSD(service?.dependentPrice || "0");
    const subtotalUSD = basePrice + dependents * depPrice;
    
    try {
      const result = await validateCoupon(couponInput, slug || "");
      if (result.valid) {
        if (result.min_purchase_usd && subtotalUSD < result.min_purchase_usd) {
          toast.error(p?.coupon?.errors?.minPurchase?.replace("{{value}}", result.min_purchase_usd.toString()));
          return;
        }
        setAppliedCoupon(result);
        toast.success(p?.coupon?.applied);
      } else {
        toast.error(result.error === "NOT_APPLICABLE" ? p?.coupon?.errors?.notApplicable : p?.coupon?.errors?.invalid);
      }
    } catch {
      toast.error(p?.coupon?.errors?.invalid);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 8 * 1024 * 1024) {
      toast.error(p?.paymentMethods?.zelle?.fileTooLarge);
      return;
    }

    setZelleProof(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setZelleProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formik = useFormik({
    initialValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      password: "",
      parcelowCpf: "",
    },
    enableReinitialize: true,
    validate: zodValidate(z.object({
      fullName: z.string().min(1, p?.userData?.errors?.nameRequired).min(3, p?.userData?.errors?.nameShort),
      email: z.string().min(1, p?.userData?.errors?.emailRequired).email(p?.userData?.errors?.emailInvalid),
      phone: z.string().min(10, p?.userData?.errors?.phoneRequired),
      password: user ? z.string().optional() : z.string().min(6, p?.userData?.errors?.passwordShort),
      parcelowCpf: activeMethod === "parcelow" ? z.string().min(11, p?.paymentMethods?.parcelow?.cpfRequired) : z.string().optional(),
    })),
    onSubmit: async (values) => {
      setIsRedirecting(true);
      try {
        let currentUserId = user?.id;

        if (!currentUserId) {
          try {
            const signUpRes = await authService.signUp({
              email: values.email,
              password: values.password,
              fullName: values.fullName,
              termsAccepted: true,
            });
            currentUserId = signUpRes.id;
          } catch (signUpErr) {
             const error = signUpErr as Error;
             if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
                throw new Error(p?.userData?.errors?.emailTaken, { cause: error });
             }
             throw new Error(error.message, { cause: error });
          }
        }

        const commonPayload = {
          userId: currentUserId!,
          slug: service!.slug,
          product_name: service!.title,
          dependents,
          coupon_code: appliedCoupon?.valid ? couponInput : undefined,
          customer_name: values.fullName,
          customer_email: values.email,
          customer_phone: values.phone,
        };

        if (activeMethod === "card" || activeMethod === "pix") {
          const { url, order_id } = await paymentService.createStripeCheckout({
            ...commonPayload,
            paymentMethod: activeMethod as StripePaymentMethod,
          });

          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_order_id", order_id);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.assign(url);

        } else if (activeMethod === "parcelow") {
          const { url, order_id } = await paymentService.createParcelowCheckout({
            ...commonPayload,
            cpf: values.parcelowCpf,
          });

          localStorage.setItem("checkout_slug", service!.slug);
          localStorage.setItem("checkout_order_id", order_id);
          localStorage.setItem("checkout_dependents", dependents.toString());
          window.location.assign(url);

        } else if (activeMethod === "zelle") {
          if (!zelleProof)
            throw new Error(p?.paymentMethods?.zelle?.proofRequired);

          const proofPath = await paymentService.uploadZelleProof(zelleProof, service!.slug);

          await paymentService.createZellePayment({
            ...commonPayload,
            proofPath,
          });

          setZelleDone(true);
          toast.success(p?.paymentMethods?.zelle?.pendingReview);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : p?.errorProcessing);
      } finally {
        setIsRedirecting(false);
      }
    },
  });

  // Active sync for logged in user data
  useEffect(() => {
    if (user) {
      const email = user.email || (user as any).email;
      const phone = user.phoneNumber || (user as any).phone || (user as any).user_metadata?.phone;
      const name = user.fullName || (user as any).full_name || (user as any).user_metadata?.full_name;

      if (!formik.values.email && email) formik.setFieldValue("email", email);
      if (!formik.values.phone && phone) formik.setFieldValue("phone", phone);
      if (!formik.values.fullName && name) formik.setFieldValue("fullName", name);
    }
  }, [user]);

  if (!t || !p) return <div className="min-h-screen bg-bg flex items-center justify-center"><LogoLoader /></div>;
  
  if (!service) return <Navigate to="/dashboard" replace />;

  if (zelleDone) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-[2.5rem] border border-border p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <RiCheckLine className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-text mb-4 uppercase tracking-tight">
            {p?.paymentMethods?.zelle?.confirmTitle}
          </h2>
          <p className="text-text-muted font-medium mb-10 leading-relaxed italic">
            {p?.paymentMethods?.zelle?.pendingReview}
          </p>
          <Button 
            className="w-full bg-primary text-white font-black py-4 rounded-2xl"
            onClick={() => navigate("/dashboard")}
          >
            {p?.paymentMethods?.zelle?.goDashboard}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4 antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── High-Impact Scarcity Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-white py-4 px-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/20 border border-white/10"
        >
          <div className="flex items-center gap-4">
            <RiFlashlightFill className="text-amber-400 text-2xl animate-pulse" />
            <span className="font-black text-sm sm:text-lg uppercase tracking-tight">
              {p?.scarcityBanner?.lastSlots}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {(() => {
              const { hh, mm, ss } = formatTimeParts(timeLeft);
              return (
                <div className="flex items-center gap-2">
                  {[hh, mm, ss].map((part, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/20 font-mono text-xl font-black min-w-[48px] text-center backdrop-blur-md">
                        {part}
                      </div>
                      {i < 2 && <span className="text-white/40 font-black text-xl">:</span>}
                    </div>
                  ))}
                </div>
              );
            })()}
            <span className="text-xs font-black uppercase text-white/60 tracking-widest ml-2">
              {p?.scarcityBanner?.timeLeft}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left: Price Summary & Service Card ── */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="rounded-[2.5rem] bg-card border border-border shadow-xl p-8 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <RiShieldCheckLine className="text-3xl" />
                </div>
                <div>
                  <h3 className="font-black text-text text-xl leading-tight uppercase tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mt-1">
                    {service.processType}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {service.included.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1">
                      <RiCheckLine className="text-emerald-500 text-lg shrink-0" />
                    </div>
                    <span className="text-sm text-text-muted font-medium leading-relaxed italic">{item.split(":")[0]}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-text tabular-nums">{service.price}</span>
                  <span className="text-lg text-text-muted line-through font-bold">{service.originalPrice}</span>
                </div>
                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {p?.summary?.offLabel}
                </span>
              </div>
            </div>

            {/* Dependents Toggle */}
            <div className="rounded-3xl bg-card border border-border shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-text uppercase tracking-tight mb-1">
                    {isUpgrade ? p?.dependents?.slotsLabel : p?.dependents?.label}
                  </p>
                  <p className="text-[11px] text-text-muted font-bold italic">
                    {isUpgrade 
                      ? p?.dependents?.perSlot?.replace("{{price}}", service.price) 
                      : p?.dependents?.perPerson?.replace("{{price}}", service.dependentPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setDependents(Math.max(isUpgrade ? 1 : 0, dependents - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all disabled:opacity-30"
                    disabled={dependents <= (isUpgrade ? 1 : 0)}
                  >
                    <RiSubtractLine className="text-xl" />
                  </button>
                  <span className="w-6 text-center font-black text-xl text-text">{dependents}</span>
                  <button
                    type="button"
                    onClick={() => setDependents(Math.min(10, dependents + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                  >
                    <RiAddLine className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            <PriceSummary
              baseUSD={isUpgrade ? 0 : baseUSD}
              depUSD={depUSD}
              dependents={dependents}
              method={activeMethod}
              discountUSD={discountUSD}
              couponCode={couponInput}
              isUpgrade={isUpgrade}
            />

            {/* Coupon */}
            <div className="rounded-3xl bg-card border border-border shadow-lg p-6">
              <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block">{p?.coupon?.label}</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder={p?.coupon?.placeholder}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!appliedCoupon || isValidatingCoupon}
                    className={`h-12 uppercase font-black tracking-widest rounded-xl ${appliedCoupon ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}`}
                  />
                  {appliedCoupon && (
                    <RiCheckLine className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xl" />
                  )}
                </div>
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="h-12 w-12 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                  >
                    <RiCloseLine className="text-2xl" />
                  </button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="h-12 px-6 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800"
                  >
                    {isValidatingCoupon ? p?.coupon?.applying : p?.coupon?.apply}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Personal Details & Payment Methods ── */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="rounded-[2.5rem] bg-card border border-border shadow-2xl p-10 space-y-10">
                {/* User Info */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-text uppercase tracking-tight flex items-center gap-3">
                    <RiShieldCheckLine className="text-primary" />
                    {p?.userData?.title}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest mb-2 block">{p?.userData?.fullName}</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        className="h-14 rounded-2xl text-base font-medium"
                        placeholder="João da Silva"
                        {...formik.getFieldProps("fullName")}
                      />
                      {formik.touched.fullName && formik.errors.fullName && (
                        <p className="text-xs font-bold text-red-500 mt-2">{formik.errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest mb-2 block">{p?.userData?.email}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="h-14 rounded-2xl text-base font-medium"
                        placeholder="seu@email.com"
                        {...formik.getFieldProps("email")}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-xs font-bold text-red-500 mt-2">{formik.errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest mb-2 block">{p?.userData?.phone}</Label>
                      <div className="h-14">
                        <PhoneInput
                          value={formik.values.phone}
                          onChange={(v) => {
                            formik.setFieldValue("phone", v);
                            formik.setFieldTouched("phone", true);
                          }}
                        />
                      </div>
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="text-xs font-bold text-red-500 mt-2">{formik.errors.phone}</p>
                      )}
                    </div>

                    {!user && (
                      <div className="md:col-span-2">
                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest mb-2 block">{p?.userData?.password}</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          className="h-14 rounded-2xl text-base font-medium"
                          placeholder={p?.userData?.passwordDesc}
                          {...formik.getFieldProps("password")}
                        />
                        <p className="text-[10px] font-bold text-text-muted italic mt-2">
                          {p?.userData?.passwordAutoNotice}
                        </p>
                        {formik.touched.password && formik.errors.password && (
                          <p className="text-xs font-bold text-red-500 mt-2">{formik.errors.password}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Payment Methods */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-text uppercase tracking-tight flex items-center gap-3">
                    <RiBankCardLine className="text-primary" />
                    {p?.paymentMethods?.title}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { ...PAYMENT_METHODS[0], label: p?.paymentMethods?.card?.label, sublabel: p?.paymentMethods?.card?.sublabel },
                      { ...PAYMENT_METHODS[1], label: p?.paymentMethods?.pix?.label, sublabel: p?.paymentMethods?.pix?.sublabel },
                      { ...PAYMENT_METHODS[2], label: p?.paymentMethods?.zelle?.label, sublabel: p?.paymentMethods?.zelle?.sublabel },
                      { ...PAYMENT_METHODS[3], label: p?.paymentMethods?.parcelow?.label, sublabel: p?.paymentMethods?.parcelow?.sublabel },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!m.available}
                        onClick={() => m.available && setActiveMethod(m.id)}
                        className={`relative flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 transition-all duration-300 ${
                          activeMethod === m.id
                            ? "border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-card text-text-muted hover:border-border-hover hover:bg-bg-subtle"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center">
                          {m.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
                        <span className="text-[9px] font-bold opacity-60">{m.sublabel}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMethod}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-6 rounded-3xl border-2 border-border bg-bg-subtle"
                    >
                      {activeMethod === "card" && (
                        <div className="flex gap-4">
                          <RiBankCardLine className="text-2xl text-primary shrink-0" />
                          <p className="text-sm text-text-muted font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: p?.paymentMethods?.card?.notice || "" }} />
                        </div>
                      )}
                      {activeMethod === "pix" && (
                        <div className="flex gap-4">
                          <RiQrCodeLine className="text-2xl text-emerald-500 shrink-0" />
                          <p className="text-sm text-text-muted font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: p?.paymentMethods?.pix?.notice || "" }} />
                        </div>
                      )}
                      {activeMethod === "parcelow" && (
                        <div className="space-y-6">
                          <div className="flex gap-4">
                            <RiTimeLine className="text-2xl text-orange-500 shrink-0" />
                            <p className="text-sm text-text-muted font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: p?.paymentMethods?.parcelow?.notice || "" }} />
                          </div>
                          <div className="pt-4 border-t border-border">
                            <Label htmlFor="parcelowCpf" className="text-xs font-black uppercase tracking-widest mb-2 block">{p?.paymentMethods?.parcelow?.cpfLabel}</Label>
                            <Input
                              id="parcelowCpf"
                              name="parcelowCpf"
                              placeholder={p?.paymentMethods?.parcelow?.cpfPlaceholder}
                              className="h-14 rounded-xl font-mono text-lg"
                              value={formik.values.parcelowCpf}
                              onChange={(e) => formik.setFieldValue("parcelowCpf", maskCPF(e.target.value))}
                            />
                            {formik.touched.parcelowCpf && formik.errors.parcelowCpf && (
                              <p className="text-xs font-bold text-red-500 mt-2">{formik.errors.parcelowCpf}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {activeMethod === "zelle" && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p?.paymentMethods?.zelle?.name}</p>
                              <p className="font-black text-text">{ZELLE_NAME}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p?.paymentMethods?.zelle?.email}</p>
                              <p className="font-black text-text font-mono">{ZELLE_EMAIL}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p?.paymentMethods?.zelle?.phone}</p>
                              <p className="font-black text-text font-mono">{ZELLE_PHONE}</p>
                            </div>
                          </div>

                          <div className="p-8 rounded-[2rem] border-2 border-dashed border-border bg-card hover:border-primary/40 transition-all group relative overflow-hidden">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleProofSelect}
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            
                            {zelleProofPreview ? (
                              <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-bg-subtle">
                                  <img src={zelleProofPreview} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-black text-text uppercase tracking-tight">{zelleProof?.name}</p>
                                  <p className="text-xs text-text-muted font-bold italic">{(zelleProof!.size / 1024).toFixed(0)} KB</p>
                                  <button 
                                    type="button" 
                                    onClick={() => { setZelleProof(null); setZelleProofPreview(null); }}
                                    className="text-red-500 text-xs font-black uppercase tracking-widest mt-2 hover:underline z-20 relative"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                  <RiUploadCloud2Line className="text-3xl" />
                                </div>
                                <div>
                                  <p className="font-black text-text uppercase tracking-tight">{p?.paymentMethods?.zelle?.uploadProof}</p>
                                  <p className="text-xs text-text-muted font-bold italic">{p?.paymentMethods?.zelle?.uploadDesc}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Final CTA */}
                <Button
                  type="submit"
                  disabled={isRedirecting}
                  className="w-full h-18 py-6 rounded-2xl bg-primary hover:bg-primary-hover text-white text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70"
                >
                  {isRedirecting ? (
                    <span className="flex items-center gap-3">
                      <RiTimeLine className="animate-spin text-2xl" />
                      {p?.redirecting}
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      {activeMethod === "card" || activeMethod === "pix" ? <RiBankCardLine className="text-2xl" /> : <RiCheckLine className="text-2xl" />}
                      {p?.placeOrder}
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <RiShieldCheckLine className="text-primary text-sm" />
                    {t?.paymentPending?.secureEnvironment}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span>Powered by Stripe & Zelle</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
