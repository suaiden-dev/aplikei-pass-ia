
export interface VisaOrder {
  id: string;
  order_number?: string | null;
  client_name: string;
  client_email: string;
  user_id?: string | null;
  product_slug: string;
  total_price_usd: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  exchange_rate?: number;
  client_ip?: string;
  stripe_payment_intent_id?: string;
  contract_pdf_url?: string;
  contract_selfie_url?: string;
  user_service_id?: string;
  payment_metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  is_test?: boolean;
}

export type CreateVisaOrderDTO = Omit<VisaOrder, "id" | "created_at" | "updated_at">;
export type UpdateVisaOrderDTO = Partial<CreateVisaOrderDTO>;
