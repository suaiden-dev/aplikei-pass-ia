import { IVisaOrderRepository } from "@/application/ports/IVisaOrderRepository";
import { IPaymentService } from "@/application/ports/IPaymentService";
import { IExchangeRateService } from "@/application/ports/IExchangeRateService";
import { SupabaseVisaOrderRepository } from "@/infrastructure/repositories/SupabaseVisaOrderRepository";
import { StripePaymentService } from "@/infrastructure/services/StripePaymentService";
import { StripeExchangeRateService } from "@/infrastructure/services/StripeExchangeRateService";

let visaOrderInstance: IVisaOrderRepository | null = null;
let paymentInstance: IPaymentService | null = null;
let exchangeRateInstance: IExchangeRateService | null = null;

export function getVisaOrderRepository(): IVisaOrderRepository {
  if (!visaOrderInstance) visaOrderInstance = new SupabaseVisaOrderRepository();
  return visaOrderInstance;
}

export function getPaymentService(): IPaymentService {
  if (!paymentInstance) paymentInstance = new StripePaymentService();
  return paymentInstance;
}

export function getExchangeRateService(): IExchangeRateService {
  if (!exchangeRateInstance) exchangeRateInstance = new StripeExchangeRateService();
  return exchangeRateInstance;
}
