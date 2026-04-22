import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  paymentService,
  parsePriceUSD,
  type StripePaymentMethod,
} from "../../services/payment.service";
import {
  validateCoupon,
  calculateDiscount,
  type CouponValidation,
} from "../../services/coupon.service";
import { getServiceBySlug } from "../../data/services";

export interface CheckoutLabels {
  checkout: Record<string, string>;
}

export interface UseCheckoutControllerOptions {
  userId: string | undefined;
  labels: CheckoutLabels;
}

export interface UseCheckoutControllerResult {
  slug: string;
  service: ReturnType<typeof getServiceBySlug>;
  priceUSD: number;
  priceBRL: number;
  selectedMethod: string;
  setSelectedMethod: (v: string) => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  isApplyingCoupon: boolean;
  discountAmount: number;
  finalPriceUSD: number;
  finalPriceBRL: number;
  couponValidation: CouponValidation | null;
  isProcessing: boolean;
  couponInput: string;
  setCouponInput: (v: string) => void;
  handleApplyCoupon: () => Promise<void>;
  handleCreateStripeCheckout: (values: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    paymentMethod: StripePaymentMethod;
  }) => Promise<void>;
}

export function useCheckoutController({
  userId,
}: UseCheckoutControllerOptions): UseCheckoutControllerResult {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service = getServiceBySlug(slug);
  const priceUSD = parsePriceUSD(service?.price ?? "0");

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);

  const priceBRL = useMemo(() => {
    const rate = 5.7;
    return Math.round(priceUSD * rate * 100) / 100;
  }, [priceUSD]);

  const finalPriceUSD = useMemo(() => {
    return Math.max(0, priceUSD - discountAmount);
  }, [priceUSD, discountAmount]);

  const finalPriceBRL = useMemo(() => {
    const rate = 5.7;
    return Math.round(finalPriceUSD * rate * 100) / 100;
  }, [finalPriceUSD]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponCode(couponInput);

    try {
      const result = await validateCoupon(couponInput, slug);
      setCouponValidation(result);

      if (!result.valid) {
        const errorMessages: Record<string, string> = {
          INVALID_OR_EXPIRED: "Coupon is invalid or expired",
          NOT_APPLICABLE: "Coupon is not applicable for this product",
        };
        toast.error(errorMessages[result.error ?? "INVALID_OR_EXPIRED"] || "Invalid coupon");
        setDiscountAmount(0);
        return;
      }

      const discount = calculateDiscount(
        priceUSD,
        result.discount_type ?? "percentage",
        result.discount_value ?? 0
      );
      setDiscountAmount(discount);
      toast.success(`Coupon applied! You save $${discount.toFixed(2)}`);
    } catch {
      toast.error("Failed to validate coupon");
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponInput, slug, priceUSD]);

  const handleCreateStripeCheckout = useCallback(async (values: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    paymentMethod: StripePaymentMethod;
  }) => {
    setIsProcessing(true);
    try {
      const result = await paymentService.createStripeCheckout({
        slug,
        email: values.clientEmail,
        fullName: values.clientName,
        phone: values.clientPhone,
        paymentMethod: values.paymentMethod,
        userId,
        amount: finalPriceUSD,
        coupon_code: couponCode || undefined,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create checkout session");
    } finally {
      setIsProcessing(false);
    }
  }, [slug, userId, finalPriceUSD, couponCode, navigate]);

  return {
    slug,
    service,
    priceUSD,
    priceBRL,
    selectedMethod,
    setSelectedMethod,
    couponCode,
    setCouponCode,
    isApplyingCoupon,
    discountAmount,
    finalPriceUSD,
    finalPriceBRL,
    couponValidation,
    isProcessing,
    couponInput,
    setCouponInput,
    handleApplyCoupon,
    handleCreateStripeCheckout,
  };
}
