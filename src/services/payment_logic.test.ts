import { describe, it, expect } from 'vitest';
import { 
    calculateSubtotal, 
    applyCoupon, 
    calculateCardAmountWithFees, 
    calculateUSDToPixFinalBRL,
    calculateIncrementedSlots,
    CouponData
} from '../../supabase/functions/stripe-checkout/payment-logic';

describe('Payment Logic - calculateSessionTotal (Subtotal & Discounts)', () => {
    it('should correctly calculate subtotal for main service and dependents', () => {
        // Base Price: 50, Dependents: 2, Dep Price: 100
        const result = calculateSubtotal(50, 2, 100);
        expect(result).toBe(250);
    });

    it('should handle zero dependents', () => {
        const result = calculateSubtotal(497, 0, 100);
        expect(result).toBe(497);
    });

    it('should apply percentage discount correctly', () => {
        const subtotal = 100;
        const coupon: CouponData = {
            valid: true,
            discount_type: 'percentage',
            discount_value: 10,
            min_purchase_usd: 50
        };
        const { finalAmount, discountAmount } = applyCoupon(subtotal, coupon);
        expect(finalAmount).toBe(90);
        expect(discountAmount).toBe(10);
    });

    it('should apply fixed discount correctly', () => {
        const subtotal = 100;
        const coupon: CouponData = {
            valid: true,
            discount_type: 'fixed',
            discount_value: 15
        };
        const { finalAmount, discountAmount } = applyCoupon(subtotal, coupon);
        expect(finalAmount).toBe(85);
        expect(discountAmount).toBe(15);
    });

    it('should not apply coupon if subtotal is below min_purchase', () => {
        const subtotal = 40;
        const coupon: CouponData = {
            valid: true,
            discount_type: 'percentage',
            discount_value: 50,
            min_purchase_usd: 50
        };
        const { finalAmount } = applyCoupon(subtotal, coupon);
        expect(finalAmount).toBe(40);
    });

    it('should not let final amount go below zero', () => {
        const subtotal = 20;
        const coupon: CouponData = {
            valid: true,
            discount_type: 'fixed',
            discount_value: 50
        };
        const { finalAmount } = applyCoupon(subtotal, coupon);
        expect(finalAmount).toBe(0);
    });
});

describe('Payment Logic - Fees and Convergence', () => {
    it('should calculate card fees correctly (Reverse math)', () => {
        // net: 100. (100 + 0.30) / (1 - 0.039) = 100.3 / 0.961 = 104.37
        const result = calculateCardAmountWithFees(100);
        expect(Number(result.toFixed(2))).toBe(104.37);
    });

    it('should calculate PIX final amount in BRL correctly', () => {
        // net: 100 USD, rate: 5.0
        // netBrl: 500. Processing: 500 / (1 - 0.018) = 500 / 0.982 = 509.16
        // Final: 509.16 * 1.035 (IOF) = 527.00
        const result = calculateUSDToPixFinalBRL(100, 5.0);
        expect(Number(result.toFixed(2))).toBe(526.99); // Due to precision
    });

    it('should return 0 for negative or zero amounts', () => {
        expect(calculateCardAmountWithFees(0)).toBe(0);
        expect(calculateUSDToPixFinalBRL(-10, 5.0)).toBe(0);
    });
});

describe('Payment Logic - incrementSlots', () => {
    const MAIN_SLUG = 'visto-b1-b2';

    it('should increment slots when buying an additional slot', () => {
        // current: 1, additional: 1
        const result = calculateIncrementedSlots(1, 1, 'slot-dependente', MAIN_SLUG);
        expect(result).toBe(2);
    });

    it('should handle legacy additional slot slugs', () => {
        // current: 0, additional: 2
        const result = calculateIncrementedSlots(0, 2, 'dependente-b1-b2', MAIN_SLUG);
        expect(result).toBe(2);
    });

    it('should upgrade slots if main service is repurchased with more dependents', () => {
        // current: 1, repurchase with 3
        const result = calculateIncrementedSlots(1, 3, MAIN_SLUG, MAIN_SLUG);
        expect(result).toBe(3);
    });

    it('should NOT reduce slots if repurchase has fewer dependents', () => {
        // current: 3, repurchase with 1
        const result = calculateIncrementedSlots(3, 1, MAIN_SLUG, MAIN_SLUG);
        expect(result).toBe(3);
    });

    it('should use 1 as default if dependents metadata is missing for additional slots', () => {
        const result = calculateIncrementedSlots(5, 0, 'slot-vip', MAIN_SLUG);
        expect(result).toBe(6);
    });
});
