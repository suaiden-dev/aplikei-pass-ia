
export interface CheckoutRequest {
  slug: string;
  email: string;
  fullName: string;
  phone: string;
  dependents: number;
  originUrl: string;
  paymentMethod: 'card' | 'pix';
  contractSelfieUrl?: string;
  termsAcceptedAt?: string;
  action?: string | null;
  serviceId?: string | null;
  amount?: number | null;
}

export interface IPaymentService {
  initiateCheckout(request: CheckoutRequest, accessToken?: string): Promise<{ url: string } | null>;
}
