const MARKUP = 1.04; // 4% de spread
const FALLBACK_BRL = 5.60;

export async function getUsdToBrl(): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error("exchange rate fetch failed");
    const data = await res.json();
    return Math.round(parseFloat(data.rates.BRL) * MARKUP * 1000) / 1000;
  } catch {
    return FALLBACK_BRL;
  }
}
