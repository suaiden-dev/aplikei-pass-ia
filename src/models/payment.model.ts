export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'stripe' | 'zelle' | 'parcelow';

export interface Order {
  id: string;
  user_id: string | null;
  client_name: string;
  client_email: string;
  product_slug: string;
  total_price_usd: number;
  total_price_brl: number | null;
  payment_status: string;
  payment_method: string;
  coupon_code: string | null;
  discount_amount: number | null;
  exchange_rate: number | null;
  stripe_session_id: string | null;
  parcelow_order_id: string | null;
  payment_metadata: Record<string, unknown> | null;
  contract_pdf_url: string | null;
  contract_selfie_url: string | null;
  terms_accepted_at: string | null;
  order_number: string | null;
  client_ip: string | null;
  is_test: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderCreateInput {
  user_id?: string | null;
  client_name: string;
  client_email: string;
  product_slug: string;
  total_price_usd: number;
  total_price_brl?: number | null;
  payment_status?: string;
  payment_method: string;
  coupon_code?: string | null;
  discount_amount?: number | null;
  exchange_rate?: number | null;
  stripe_session_id?: string | null;
  parcelow_order_id?: string | null;
  payment_metadata?: Record<string, unknown> | null;
  terms_accepted_at?: string | null;
  order_number?: string | null;
  client_ip?: string | null;
  is_test?: boolean | null;
}

export interface ZellePayment {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  amount: number;
  confirmation_code: string | null;
  image_url: string | null;
  service_slug: string | null;
  coupon_code: string | null;
  discount_amount: number | null;
  status: string;
  admin_notes: string | null;
  admin_approved_at: string | null;
  processed_by_user_id: string | null;
  proof_path: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  payment_date: string | null;
  payment_method: string | null;
  visa_order_id: string | null;
  n8n_confidence: number | null;
  n8n_response: string | null;
  fee_type_global: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase_usd: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string;
  is_active: boolean;
  applicable_slugs: string[] | null;
  created_by: string | null;
  created_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount_type?: string;
  discount_value?: number;
  message?: string;
}
