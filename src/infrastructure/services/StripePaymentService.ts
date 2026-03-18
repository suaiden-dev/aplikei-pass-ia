
import { IPaymentService, CheckoutRequest } from "@/application/ports/IPaymentService";
import { supabase } from "@/integrations/supabase/client";

export class StripePaymentService implements IPaymentService {
  async initiateCheckout(request: CheckoutRequest, accessToken?: string): Promise<{ url: string } | null> {
    const { data, error } = await supabase.functions.invoke("stripe-checkout", {
      body: {
        slug: request.slug,
        email: request.email,
        fullName: request.fullName,
        phone: request.phone,
        dependents: request.dependents,
        origin_url: request.originUrl,
        paymentMethod: request.paymentMethod,
        contract_selfie_url: request.contractSelfieUrl,
        terms_accepted_at: request.termsAcceptedAt,
        action: request.action,
        serviceId: request.serviceId,
      },
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    });

    if (error) {
      console.error("[StripePaymentService] Error in stripe-checkout:", error);
      return null;
    }

    return data?.url ? { url: data.url } : null;
  }
}
