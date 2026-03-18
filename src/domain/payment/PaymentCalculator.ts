
/**
 * Constantes de Domínio para Taxas de Pagamento
 */
export const PAYMENT_CONFIG = {
  CARD_FIXED_FEE: 0.30,
  CARD_PERCENTAGE_FEE: 0.039, // 2.9% base + 1% international
  PIX_PROCESSING_FEE: 0.018, // 1.19% + 0.6% backup markup
  IOF_RATE: 0.035, // 3.5%
  CURRENCY_MARKUP: 0.04, // 4% commercial markup
};

/**
 * Entidade de Negócio para Cálculo de Taxas
 */
export class PaymentCalculator {
  static calculateCardAmount(netAmount: number): number {
    return (netAmount + PAYMENT_CONFIG.CARD_FIXED_FEE) / (1 - PAYMENT_CONFIG.CARD_PERCENTAGE_FEE);
  }

  static calculatePIXAmount(netBrlAmount: number): number {
    return netBrlAmount / (1 - PAYMENT_CONFIG.PIX_PROCESSING_FEE);
  }

  static applyIOF(amount: number): number {
    return amount * (1 + PAYMENT_CONFIG.IOF_RATE);
  }

  static convertUsdToBrl(usdAmount: number, exchangeRate: number): number {
    return usdAmount * exchangeRate;
  }

  static calculateUSDToPixTotal(usdNetAmount: number, exchangeRate: number): number {
    const netBrl = this.convertUsdToBrl(usdNetAmount, exchangeRate);
    const brlWithFees = this.calculatePIXAmount(netBrl);
    return this.applyIOF(brlWithFees);
  }
}
