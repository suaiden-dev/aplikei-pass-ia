
export interface CheckoutRequest {
  slug: string;
  email: string;
  fullName: string;
  phone: string;
  dependents: number;
  originUrl: string;
  paymentMethod: string;
  contractSelfieUrl?: string;
  termsAcceptedAt?: string;
  action?: string | null;
  serviceId?: string | null;
  amount?: number | null;
  discountPct?: number;
  // Parcelow specific fields
  cpf?: string;
  parcelowSubMethod?: string;
  isAlternativePayer?: boolean;
  payerInfo?: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  } | null;
}

export interface IPaymentService {
  initiateCheckout(request: CheckoutRequest, accessToken?: string): Promise<{ url?: string; id?: string } | null>;
}
