/**
 * Payment Logic Utilities
 * Extracted for unit testing and modularity
 */

export const CARD_FIXED_FEE = 0.30;
export const CARD_PERCENTAGE_FEE = 0.039; // 3.9%
export const PIX_PROCESSING_FEE = 0.018; // 1.8%
export const IOF_RATE = 0.035; // 3.5%

export const calculateCardAmountWithFees = (netAmount: number): number => {
    if (netAmount <= 0) return 0;
    return (netAmount + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
};

export const calculateUSDToPixFinalBRL = (usdNetAmount: number, exchangeRate: number): number => {
    if (usdNetAmount <= 0) return 0;
    const netBrl = usdNetAmount * exchangeRate;
    const brlWithFees = netBrl / (1 - PIX_PROCESSING_FEE);
    return brlWithFees * (1 + IOF_RATE);
};

export interface CouponData {
    valid: boolean;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase_usd?: number;
    coupon_id?: string;
}

export const applyCoupon = (subtotal: number, coupon: CouponData | null): { finalAmount: number, discountAmount: number } => {
    if (!coupon || !coupon.valid) return { finalAmount: subtotal, discountAmount: 0 };
    
    const minPurchase = coupon.min_purchase_usd || 0;
    if (subtotal < minPurchase) return { finalAmount: subtotal, discountAmount: 0 };

    let finalAmount = subtotal;
    if (coupon.discount_type === 'percentage') {
        finalAmount = subtotal * (1 - (coupon.discount_value / 100));
    } else {
        finalAmount = subtotal - coupon.discount_value;
    }

    finalAmount = Math.max(0, finalAmount);
    return { 
        finalAmount, 
        discountAmount: subtotal - finalAmount 
    };
};

export const calculateSubtotal = (basePrice: number, dependents: number, depPrice: number): number => {
    return basePrice + (dependents * depPrice);
};

export const calculateIncrementedSlots = (currentCount: number, dependentsMetadata: number, serviceSlug: string, mainServiceSlug: string): number => {
    const isAdditionalSlot = serviceSlug.includes("dependente-adicional") || 
                             serviceSlug.includes("slot-dependente") ||
                             serviceSlug.includes("slot-vip") ||
                             serviceSlug.includes("dependente-estudante") ||
                             serviceSlug.includes("dependente-f1") ||
                             serviceSlug.includes("dependente-b1-b2");

    if (isAdditionalSlot) {
        return currentCount + (dependentsMetadata || 1);
    } else if (dependentsMetadata > currentCount && serviceSlug === mainServiceSlug) {
        // Upgrade/Repayment of same service
        return dependentsMetadata;
    }
    return currentCount;
};
