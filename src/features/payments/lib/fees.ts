const CARD_FIXED_FEE = 0.3;
const CARD_PERCENTAGE_FEE = 0.039;
const PIX_PROCESSING_FEE = 0.018;
const IOF_RATE = 0.035;

export function parsePriceUSD(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
}

export function estimateCardTotal(netUSD: number): number {
  return (netUSD + CARD_FIXED_FEE) / (1 - CARD_PERCENTAGE_FEE);
}

export function estimatePixTotal(netUSD: number, exchangeRate: number): number {
  const netBRL = netUSD * exchangeRate;
  const withFees = netBRL / (1 - PIX_PROCESSING_FEE);
  return withFees * (1 + IOF_RATE);
}
