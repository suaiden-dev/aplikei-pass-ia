export interface PaymentMethodConfig {
  id?: string;
  user_id: string;
  provider: "stripe" | "zelle" | "parcelow" | "aplikei";
  is_active: boolean;
  display_name?: string;
  config: any;
  created_at?: string;
  updated_at?: string;
}

export interface StripeConfig {
  stripe_account_id: string;
  connection_status: "connected" | "disconnected";
}

export interface ZelleConfig {
  recipient_name: string;
  email: string;
  phone: string;
  instructions: string;
}

export interface ParcelowConfig {
  account_identifier: string;
  checkout_link: string;
  instructions: string;
}
