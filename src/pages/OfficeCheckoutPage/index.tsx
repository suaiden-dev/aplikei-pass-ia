import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { authService } from "../../features/auth/lib/auth";
import {
    RiShieldCheckLine,
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
import { Input } from "../../components/atoms/input";
import { Label } from "../../components/atoms/label";
import { zodValidate } from "../../utils/zodValidate";
import { useAuth } from "../../hooks/useAuth";
import { LogoLoader } from "../../components/atoms/logo-loader";
import { type StripePaymentMethod } from "../../features/payment/lib/paymentOps";
import { estimateCardTotal, estimatePixTotal } from "../../features/payment/lib/fees";
import { useCheckout } from "../../features/payment/hooks/useCheckout";
import PhoneInput from "../../components/molecules/PhoneInput";
import { ZELLE_RECIPIENT } from "../../config/zelle";
import { maskCPF, validateCPF } from "../../utils/cpf";
import { useT } from "../../i18n";
import { calculateDiscount } from "../../features/payment/lib/coupon";
import { useCoupon } from "../../features/payment/hooks/useCoupon";
import { supabase } from "../../shared/lib/supabase";

const FALLBACK_EXCHANGE_RATE = 5.7;

type PaymentTab = "card" | "pix" | "zelle" | "parcelow";

interface PaymentMethod {
    id: PaymentTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    available: boolean;
    config?: any;
}

const PAYMENT_METHODS_BASE: PaymentMethod[] = [
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
        label: "Parcelar",
        sublabel: "BRL",
        icon: (
            <span className="text-[10px] font-black tracking-tight leading-none tracking-tighter">12x</span>
        ),
        available: true,
    },
];

function PriceSummary({
    baseUSD,
    depUSD,
    dependents,
    method,
    discountUSD,
    couponCode,
    isUpgrade,
}: {
    baseUSD: number;
    depUSD: number;
    dependents: number;
    method: PaymentTab;
    discountUSD?: number;
    couponCode?: string;
    isUpgrade?: boolean;
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
        <div className="rounded-2xl border border-border bg-bg-subtle p-4 space-y-2.5 text-sm">
            {!isUpgrade && (
                <div className="flex justify-between text-text-muted">
                    <span>{t.summary.mainService}</span>
                    <span className="font-semibold text-text">US$ {baseUSD.toFixed(2)}</span>
                </div>
            )}
            {dependents > 0 && (
                <div className="flex justify-between text-text-muted">
                    <span>{isUpgrade ? `${t.summary.slotsCount} (${dependents}x)` : t.summary.dependentsCount.replace("{{count}}", dependents.toString())}</span>
                    <span className="font-semibold text-text">US$ {(dependents * depUSD).toFixed(2)}</span>
                </div>
            )}

            {discountUSD && discountUSD > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{t.coupon.discount.replace("{{code}}", couponCode || "")}</span>
                    <span>- US$ {discountUSD.toFixed(2)}</span>
                </div>
            )}

            <div className="h-px bg-border" />

            {isCard && cardTotal && (
                <>
                    <div className="flex justify-between text-text-muted text-xs">
                        <span className="flex items-center gap-1">
                            <RiInformationLine /> {t.summary.stripeFee}
                        </span>
                        <span>+ US$ {(cardTotal - subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-text text-base">
                        <span>{t.summary.total}</span>
                        <span>US$ {cardTotal.toFixed(2)}</span>
                    </div>
                </>
            )}

            {isPix && pixTotal && (
                <>
                    <div className="flex justify-between text-text-muted text-xs">
                        <span className="flex items-center gap-1">
                            <RiInformationLine /> {t.summary.exchangeTax}
                        </span>
                        <span>~R$ {pixTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-text text-base">
                        <span>{t.summary.total}</span>
                        <span>R$ {pixTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted/60 italic">
                        {t.summary.estimatedNotice}
                    </p>
                </>
            )}

            {(method === "zelle" || method === "parcelow") && (
                <div className="flex justify-between font-black text-text text-base">
                    <span>{t.summary.subtotal}</span>
                    <span>US$ {subtotal.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
}

export default function OfficeCheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const officeSlug = searchParams.get("office") ?? "";
    const serviceSlug = searchParams.get("product") ?? "";
    const isUpgrade = searchParams.get("upgrade") === "true";
    const parentId = searchParams.get("id") || searchParams.get("parentId") || searchParams.get("processId");
    const sellerRef = searchParams.get("ref") ?? undefined;

    const [office, setOffice] = useState<any>(null);
    const [dbService, setDbService] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [customPrice, setCustomPrice] = useState<{ price: number; dependentPrice: number } | null>(null);
    const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
    const [zelleConfig, setZelleConfig] = useState<any>(ZELLE_RECIPIENT);

    const [activeMethod, setActiveMethod] = useState<PaymentTab>("card");
    const [dependents, setDependents] = useState(searchParams.get("upgrade") === "true" ? 1 : 0);
    const { isProcessing: isRedirecting, stripe: submitStripe, parcelow: submitParcelow, zelle: submitZelle } = useCheckout();

    const [zelleDone, setZelleDone] = useState(false);
    const [zelleAutoApproved, setZelleAutoApproved] = useState(false);
    const [zelleProof, setZelleProof] = useState<File | null>(null);
    const [zelleProofPreview, setZelleProofPreview] = useState<string | null>(null);

    const {
        input: couponInput,
        setInput: setCouponInput,
        isValidating: isValidatingCoupon,
        applied: appliedCoupon,
        apply: applyCoupon,
        remove: handleRemoveCoupon,
    } = useCoupon();

    const t = useT("checkout").product;

    useEffect(() => {
        async function load() {
            if (!officeSlug || !serviceSlug) return;
            try {
                // 1. Fetch Office
                const { data: officeData, error: officeError } = await supabase
                    .from("offices")
                    .select("*")
                    .eq("slug", officeSlug)
                    .single();

                if (officeError || !officeData) {
                    toast.error("Escritório não encontrado");
                    navigate("/dashboard");
                    return;
                }
                setOffice(officeData);

                // 2. Fetch Service from DB
                const { data: serviceData, error: serviceError } = await supabase
                    .from("services")
                    .select("id, name, slug, description, category, dependent_service_id")
                    .eq("slug", serviceSlug)
                    .maybeSingle();

                if (serviceError) {
                    console.error("[checkout] Error fetching service:", serviceError.message);
                }

                if (serviceData) {
                    setDbService(serviceData);
                } else {
                    console.warn(`[checkout] Service slug "${serviceSlug}" not found in DB — custom price and service linking will be skipped.`);
                }

                // 3. Fetch Payment Methods
                const { data: methods } = await supabase
                    .from("view_public_office_payment_methods")
                    .select("*")
                    .eq("user_id", officeData.owner_id);

                const configs = methods || [];
                const useAplikei = configs.find(m => m.provider === "aplikei")?.is_active ?? true;

                if (useAplikei) {
                    setAvailableMethods(PAYMENT_METHODS_BASE.map(m => ({ ...m, available: true })));
                    setZelleConfig(ZELLE_RECIPIENT);
                } else {
                    setAvailableMethods(PAYMENT_METHODS_BASE.map(m => {
                        const config = configs.find(c => c.provider === m.id);
                        return {
                            ...m,
                            available: config?.is_active ?? false,
                            config: config?.config
                        };
                    }));

                    const officeZelle = configs.find(c => c.provider === "zelle" && c.is_active);
                    if (officeZelle?.config) {
                        setZelleConfig({
                            name: officeZelle.config.recipient_name,
                            email: officeZelle.config.email,
                            phone: officeZelle.config.phone,
                            instructions: officeZelle.config.instructions
                        });
                    }
                }

                // 4. Fetch Custom Price (requires service to exist in DB)
                if (serviceData) {
                    const [{ data: priceData }, { data: depPriceData }] = await Promise.all([
                        supabase
                            .from("user_service_prices")
                            .select("price")
                            .eq("office_id", officeData.id)
                            .eq("service_id", serviceData.id)
                            .eq("is_active", true)
                            .maybeSingle(),
                        serviceData.dependent_service_id
                            ? supabase
                                .from("user_service_prices")
                                .select("price")
                                .eq("office_id", officeData.id)
                                .eq("service_id", serviceData.dependent_service_id)
                                .eq("is_active", true)
                                .maybeSingle()
                            : Promise.resolve({ data: null }),
                    ]);

                    if (priceData) {
                        setCustomPrice({
                            price: priceData.price,
                            dependentPrice: depPriceData?.price ?? 0,
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading office checkout:", err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [officeSlug, serviceSlug, navigate]);

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

    const handleProofSelect = (file: File) => {
        if (file.size > 8 * 1024 * 1024) {
            toast.error(t.paymentMethods.zelle.fileTooLarge);
            return;
        }
        setZelleProof(file);
        const reader = new FileReader();
        reader.onloadend = () => setZelleProofPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const baseUSD = customPrice?.price ?? 0;
    const depUSD = isUpgrade ? baseUSD : (customPrice?.dependentPrice ?? 0);
    const subtotalUSD = isUpgrade ? (dependents * baseUSD) : (baseUSD + (dependents * depUSD));

    const discountUSD = appliedCoupon?.valid
        ? calculateDiscount(subtotalUSD, appliedCoupon.discount_type!, appliedCoupon.discount_value!)
        : 0;

    const finalSubtotalUSD = Math.max(0, subtotalUSD - discountUSD);

    const handleApplyCoupon = async () => {
        try {
            const result = await applyCoupon(serviceSlug!);
            if (result.valid) {
                if (result.min_purchase_usd && subtotalUSD < result.min_purchase_usd) {
                    toast.error(t.coupon.errors.minPurchase.replace("{{value}}", result.min_purchase_usd.toString()));
                    handleRemoveCoupon();
                    return;
                }
                toast.success(t.coupon.applied);
            } else {
                toast.error(result.error === "NOT_APPLICABLE" ? t.coupon.errors.notApplicable : t.coupon.errors.invalid);
            }
        } catch {
            toast.error(t.coupon.errors.invalid);
        }
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
            try {
                let currentUserId = user?.id;

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
                            terms: true,
                            role: "customer",
                        });
                        if (signUpRes.user) currentUserId = signUpRes.user.id;
                    } catch (signUpErr) {
                        const error = signUpErr as Error;
                        if (error.message?.includes("already registered")) {
                            throw new Error(t.userData.errors.emailTaken);
                        }
                        throw error;
                    }
                }

                const billingSlug = serviceSlug!;
                const totalToCharge = finalSubtotalUSD;
                const currentServiceId = dbService?.id;

                if (activeMethod === "card" || activeMethod === "pix") {
                    const { url, orderId } = await submitStripe({
                        slug: billingSlug,
                        email: values.email,
                        fullName: values.fullName,
                        phone: values.phone,
                        dependents: dependents,
                        paymentMethod: activeMethod as StripePaymentMethod,
                        userId: currentUserId,
                        amount: totalToCharge,
                        proc_id: parentId || undefined,
                        serviceId: currentServiceId,
                        coupon_code: appliedCoupon?.valid ? couponInput : undefined,
                        office_id: office?.id,
                        seller_id: sellerRef,
                    });

                    localStorage.setItem("checkout_slug", billingSlug);
                    if (orderId) localStorage.setItem("checkout_order_id", orderId);
                    localStorage.setItem("checkout_dependents", dependents.toString());
                    window.location.href = url;

                } else if (activeMethod === "parcelow") {
                    if (!values.parcelowCpf || !validateCPF(values.parcelowCpf)) {
                        throw new Error(t.paymentMethods.parcelow.cpfRequired);
                    }

                    const { url, orderId } = await submitParcelow({
                        slug: billingSlug,
                        email: values.email,
                        fullName: values.fullName,
                        phone: values.phone,
                        cpf: values.parcelowCpf,
                        dependents: dependents,
                        userId: currentUserId,
                        amount: totalToCharge,
                        proc_id: parentId || undefined,
                        serviceId: currentServiceId,
                        coupon_code: appliedCoupon?.valid ? couponInput : undefined,
                        office_id: office?.id,
                        seller_id: sellerRef,
                    });

                    localStorage.setItem("checkout_slug", billingSlug);
                    if (orderId) localStorage.setItem("checkout_order_id", orderId);
                    localStorage.setItem("checkout_dependents", dependents.toString());
                    window.location.href = url;

                } else if (activeMethod === "zelle") {
                    if (!zelleProof)
                        throw new Error(t.paymentMethods.zelle.proofRequired);

                    const zelleResult = await submitZelle({
                        slug: billingSlug,
                        serviceName: service?.title || billingSlug,
                        expectedAmount: totalToCharge,
                        amount: totalToCharge,
                        confirmationCode: `UPLD_${Date.now()}`,
                        paymentDate: new Date().toISOString().split("T")[0],
                        proofFile: zelleProof,
                        guestEmail: values.email,
                        guestName: values.fullName,
                        phone: values.phone,
                        userId: currentUserId || null,
                        dependents: dependents,
                        proc_id: parentId || undefined,
                        coupon_code: appliedCoupon?.valid ? couponInput : undefined,
                        office_id: office?.id,
                        serviceId: currentServiceId,
                        seller_id: sellerRef,
                    });

                    setZelleAutoApproved(zelleResult.autoApproved === true);
                    setZelleDone(true);
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro ao processar pagamento.");
            }
        },
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LogoLoader /></div>;
    if (!officeSlug || !serviceSlug || !dbService) return <div className="min-h-screen flex items-center justify-center text-text-muted text-sm">Serviço não encontrado.</div>;

    return (
        <div className="min-h-screen bg-bg py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#003da5] text-white py-3.5 px-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-900/20 border border-white/10"
                >
                    <div className="flex items-center gap-3 font-display tracking-tight">
                        <RiFlashlightFill className="text-amber-400 text-xl animate-pulse" />
                        <span className="font-black text-xs sm:text-base uppercase">
                            {t.scarcityBanner.lastSlots}
                        </span>
                    </div>

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
                </motion.div>

                <div className="text-center pt-4">
                    {office && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                            Checkout por: {office.name}
                        </div>
                    )}
                    <h1 className="text-2xl font-black text-text font-display">
                        Finalize seu Checkout
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    <motion.aside
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        <div className="rounded-2xl bg-card border border-border shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                                    <RiShieldCheckLine className="text-primary text-xl" />
                                </div>
                                <div>
                                    <p className="font-display font-bold text-text text-sm leading-tight">
                                        {dbService.name}
                                    </p>
                                    {dbService.description && (
                                        <p className="text-[11px] text-text-muted">{dbService.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end gap-2 pt-3 border-t border-border">
                                <span className="text-2xl font-black text-text">US$ {baseUSD.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-card border border-border shadow-sm p-5">
                            <div className="flex items-center justify-between mb-1">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        {isUpgrade ? t.dependents.slotsLabel : t.dependents.label}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {isUpgrade
                                            ? `US$ ${baseUSD.toFixed(2)} por slot`
                                            : `US$ ${depUSD.toFixed(2)} por pessoa`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDependents(Math.max(isUpgrade ? 1 : 0, dependents - 1))}
                                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-subtle disabled:opacity-40 transition-colors"
                                        disabled={dependents <= (isUpgrade ? 1 : 0)}
                                    >
                                        <RiSubtractLine className="text-text-muted" />
                                    </button>
                                    <span className="w-4 text-center font-bold text-text">{dependents}</span>
                                    <button
                                        type="button"
                                        onClick={() => setDependents(Math.min(10, dependents + 1))}
                                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-subtle transition-all font-mono"
                                    >
                                        <RiAddLine className="text-text-muted" />
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

                        <div className="rounded-2xl bg-card border border-border shadow-sm p-4">
                            <Label className="text-xs text-text-muted mb-2 block">{t.coupon.label}</Label>
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
                                        className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm shadow-primary/10"
                                    >
                                        {isValidatingCoupon ? t.coupon.applying : t.coupon.apply}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.aside>

                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-3"
                    >
                        <form
                            onSubmit={formik.handleSubmit}
                            className="rounded-2xl bg-card border border-border shadow-sm p-6 space-y-6"
                        >
                            <div>
                                <h2 className="font-display font-bold text-text text-base mb-4">
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
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="font-display font-bold text-text text-base mb-3">
                                    {t.paymentMethods.title}
                                </h2>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {availableMethods.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            disabled={!m.available}
                                            onClick={() => m.available && setActiveMethod(m.id)}
                                            className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${activeMethod === m.id
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : m.available
                                                        ? "border-border text-text-muted hover:border-primary/50 hover:bg-bg-subtle"
                                                        : "border-border/50 text-text-muted/40 cursor-not-allowed"
                                                }`}
                                        >
                                            {m.icon}
                                            <span className="text-[11px] font-bold leading-none">{m.label}</span>
                                            <span className="text-[9px] font-medium leading-none opacity-70">{m.sublabel}</span>
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeMethod === "card" && (
                                        <motion.div
                                            key="card"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/20 p-3"
                                        >
                                            <RiBankCardLine className="text-primary mt-0.5 shrink-0" />
                                            <p className="text-xs text-text leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.card.notice }} />
                                        </motion.div>
                                    )}
                                    {activeMethod === "pix" && (
                                        <motion.div
                                            key="pix"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex items-start gap-2.5 rounded-xl bg-success/5 border border-success/20 p-3"
                                        >
                                            <RiQrCodeLine className="text-success mt-0.5 shrink-0" />
                                            <p className="text-xs text-text leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.pix.notice }} />
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
                                            <div className="flex flex-col gap-2 rounded-xl bg-warning/5 border border-warning/20 p-3">
                                                <div className="flex items-start gap-2.5">
                                                    <RiTimeLine className="text-warning mt-0.5 shrink-0" />
                                                    <p className="text-xs text-text leading-relaxed" dangerouslySetInnerHTML={{ __html: t.paymentMethods.parcelow.notice }} />
                                                </div>
                                                {availableMethods.find(m => m.id === "parcelow")?.config?.instructions && (
                                                    <div className="mt-2 pt-2 border-t border-warning/10 text-[10px] text-text-muted italic">
                                                        {availableMethods.find(m => m.id === "parcelow")?.config?.instructions}
                                                    </div>
                                                )}
                                            </div>

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
                                            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                                                <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">
                                                    {t.paymentMethods.zelle.notice}
                                                </p>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-text">{t.paymentMethods.zelle.name} {zelleConfig.name}</p>
                                                    {zelleConfig.email && <p className="text-sm text-text-muted font-mono">{t.paymentMethods.zelle.email} {zelleConfig.email}</p>}
                                                    {zelleConfig.phone && <p className="text-sm text-text-muted font-mono">{t.paymentMethods.zelle.phone} {zelleConfig.phone}</p>}
                                                    {zelleConfig.instructions && (
                                                        <div className="mt-3 pt-3 border-t border-primary/10 text-[11px] text-text-muted italic leading-relaxed">
                                                            {zelleConfig.instructions}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

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
                                                    <div className="mt-1.5 relative rounded-xl overflow-hidden border border-border">
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
                                                            className="absolute top-2 right-2 w-6 h-6 bg-slate-800/70 rounded-full flex items-center justify-center text-white"
                                                        >
                                                            <RiCloseLine className="text-sm" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="mt-1.5 w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2 text-text-muted hover:border-primary/40 hover:bg-primary/5 transition-colors"
                                                    >
                                                        <RiUploadCloud2Line className="text-2xl" />
                                                        <span className="text-xs font-medium">{t.paymentMethods.zelle.uploadProof}</span>
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
                                            className={`rounded-xl border p-5 text-center ${zelleAutoApproved
                                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                                    : "bg-amber-500/10 border-amber-500/20"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                {zelleAutoApproved ? (
                                                    <RiCheckLine className="text-emerald-500 text-3xl" />
                                                ) : (
                                                    <RiTimeLine className="text-amber-500 text-3xl" />
                                                )}
                                                <p className="font-bold text-text text-sm">
                                                    {zelleAutoApproved ? "Pagamento Aprovado!" : "Aguardando Análise"}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {zelleAutoApproved
                                                        ? "Seu serviço já está ativo no seu painel."
                                                        : "Recebemos seu comprovante. Em breve seu serviço será ativado."}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/dashboard")}
                                                    className="mt-4 px-6 py-2 bg-text text-bg rounded-lg text-xs font-bold"
                                                >
                                                    Ir para o Dashboard
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!zelleDone && (
                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isRedirecting}
                                            className="w-full bg-primary text-white py-4 rounded-2xl font-display font-black text-sm uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isRedirecting ? "Processando..." : "Confirmar Pagamento"}
                                            {!isRedirecting && <RiArrowRightLine className="text-lg" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
