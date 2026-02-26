/**
 * Utility for calculating Stripe fees and currency conversion.
 * Logic: Net Recovery (ensure the business receives the exact requested value).
 */

const CARD_FIXED_FEE = 0.30;
const CARD_PERCENTAGE_FEE = 0.039; // 2.9% base + 1% international
const PIX_PROCESSING_FEE = 0.018; // 1.19% + 0.6% backup markup
const IOF_RATE = 0.035; // 3.5%
const CURRENCY_MARKUP = 0.04; // 4% commercial markup

/**
 * Calculates the gross amount to be charged on Credit Card (USD)
 * formula: Gross = (Net + 0.30) / (1 - 0.039)
 */
export const calculateCardAmountWithFees = (netAmount: number): number => {
    return (netAmount + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
};

/**
 * Calculates PIX amount with Stripe processing fees (BRL)
 */
export const calculatePIXAmountWithFees = (netBrlAmount: number): number => {
    return netBrlAmount / (1 - PIX_PROCESSING_FEE);
};

/**
 * Calculates Final PIX total with IOF (3.5%)
 */
export const calculatePIXTotalWithIOF = (brlAmountWithFees: number): number => {
    return brlAmountWithFees * (1 + IOF_RATE);
};

/**
 * Fetches the current exchange rate from USD to BRL with 4% markup
 */
export async function getExchangeRate(): Promise<number> {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Failed to fetch exchange rate');
        const data = await response.json();
        const baseRate = parseFloat(data.rates.BRL);

        // Aplicação da margem de 4% (Markup comercial)
        const exchangeRateWithMarkup = baseRate * 1.04;

        // Arredondamento para 3 casas decimais
        return Math.round(exchangeRateWithMarkup * 1000) / 1000;
    } catch (error) {
        console.error("Error fetching exchange rate, using fallback:", error);
        return 5.60; // Fallback de segurança
    }
}

/**
 * Convenience helper for the full PIX flow starting from USD
 */
export const calculateUSDToPixFinalBRL = (usdNetAmount: number, exchangeRate: number): number => {
    const netBrl = usdNetAmount * exchangeRate;
    const brlWithFees = calculatePIXAmountWithFees(netBrl);
    return calculatePIXTotalWithIOF(brlWithFees);
};

/**
 * Formats values for Stripe Subunits (cents)
 */
export const toStripeAmount = (amount: number): number => {
    return Math.round(amount * 100);
};
