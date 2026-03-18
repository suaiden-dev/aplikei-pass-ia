
import { IVisaOrderRepository } from "@/application/ports/IVisaOrderRepository";

export interface ProcessZellePaymentRequest {
  clientName: string;
  clientEmail: string;
  productSlug: string;
  totalPriceUsd: number;
  contractSelfieUrl?: string;
  termsAcceptedAt?: string;
  metadata?: Record<string, unknown>;
}

export class ProcessZellePayment {
  constructor(private visaOrderRepository: IVisaOrderRepository) {}

  async execute(request: ProcessZellePaymentRequest): Promise<{ id: string } | null> {
    const orderData = {
      client_name: request.clientName,
      client_email: request.clientEmail,
      product_slug: request.productSlug,
      total_price_usd: request.totalPriceUsd,
      payment_method: "zelle",
      payment_status: "pending",
      contract_selfie_url: request.contractSelfieUrl || null,
      terms_accepted_at: request.termsAcceptedAt || null,
      payment_metadata: request.metadata || {},
    };

    return this.visaOrderRepository.createOrder(orderData);
  }
}
