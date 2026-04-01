
import { IPaymentService, CheckoutRequest } from "@/application/ports/IPaymentService";
import { supabase } from "@/integrations/supabase/client";
import { ProcessZellePayment } from "@/application/use-cases/ProcessZellePayment";
import { getVisaOrderRepository } from "@/infrastructure/factories/paymentFactory";

export class UnifiedPaymentService implements IPaymentService {
  async initiateCheckout(request: CheckoutRequest, accessToken?: string): Promise<{ url?: string; id?: string } | null> {
    const paymentMethod = request.paymentMethod;

    if (paymentMethod === "stripe" || paymentMethod === "stripe_pix") {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          slug: request.slug,
          email: request.email,
          fullName: request.fullName,
          phone: request.phone,
          dependents: request.dependents,
          origin_url: request.originUrl,
          paymentMethod: paymentMethod === "stripe_pix" ? "pix" : "card",
          contract_selfie_url: request.contractSelfieUrl,
          terms_accepted_at: request.termsAcceptedAt,
          action: request.action,
          serviceId: request.serviceId,
          amount: request.amount,
          discountPct: request.discountPct,
        },
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      });

      if (error) {
        console.error("[UnifiedPaymentService] Error in stripe-checkout:", error);
        throw error;
      }
      return data?.url ? { url: data.url } : null;
    }

    if (paymentMethod === "parcelow") {
      const { data, error } = await supabase.functions.invoke("create-parcelow-checkout", {
        body: {
          slug: request.slug,
          email: request.email,
          fullName: request.fullName,
          phone: request.phone,
          dependents: request.dependents,
          cpf: request.cpf,
          paymentMethod: request.parcelowSubMethod || "credit_card",
          payerInfo: request.payerInfo,
          origin_url: request.originUrl,
          contract_selfie_url: request.contractSelfieUrl,
          terms_accepted_at: request.termsAcceptedAt,
          action: request.action,
          serviceId: request.serviceId,
          amount: request.amount,
          discountPct: request.discountPct,
        },
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      });

      if (error) {
        console.error("[UnifiedPaymentService] Error in parcelow-checkout:", error);
        throw error;
      }
      return data?.checkoutUrl ? { url: data.checkoutUrl } : null;
    }

    if (paymentMethod === "zelle") {
      const visaOrderRepository = getVisaOrderRepository();
      const processZellePayment = new ProcessZellePayment(visaOrderRepository);

      const zelleOrderData = await processZellePayment.execute({
        clientName: request.fullName,
        clientEmail: request.email,
        productSlug: request.slug,
        totalPriceUsd: request.amount || 0,
        contractSelfieUrl: request.contractSelfieUrl,
        termsAcceptedAt: request.termsAcceptedAt,
        metadata: {
          action: request.action,
          serviceId: request.serviceId,
        },
      });

      return zelleOrderData ? { id: zelleOrderData.id } : null;
    }

    throw new Error(`Método de pagamento desconhecido: ${paymentMethod}`);
  }
}
