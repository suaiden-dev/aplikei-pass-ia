
import { IExchangeRateService } from "@/application/ports/IExchangeRateService";

export class StripeExchangeRateService implements IExchangeRateService {
  async getExchangeRate(): Promise<number> {
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
}
