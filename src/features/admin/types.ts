export interface LawyerRow {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PaymentSettings {
  id?: string;
  office_id: string;
  default_payout_method: string;
  stripe_enabled: boolean;
  zelle_enabled: boolean;
  zelle_name: string | null;
  zelle_identifier: string | null;
}

export interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "completed" | "approved" | "processing" | "paid" | "cancelled" | "canceled" | "rejected";
  method: "stripe" | "zelle";
  created_at: string;
  completed_at: string | null;
  payment_link?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  percentage_fee: number;
  available_after_minutes: number;
  is_active: boolean;
  category_minimums?: Record<string, number> | null;
}

export interface DiscountRules {
  seller_max_pct: number | null;
  seller_max_fixed: number | null;
  seller_allow_percentage: boolean;
  seller_allow_fixed: boolean;
  seller_max_coupons: number | null;
  seller_max_uses: number | null;
  seller_min_purchase_usd: number | null;
}

export interface InteractionLog {
  id: string;
  created_at: string;
  event_name: string;
  email: string;
  office_id: string;
  details: string;
  metadata?: {
    device?: string;
    [key: string]: unknown;
  };
}

export interface InteractionLogFilters {
  officeId?: string | null;
  isMaster: boolean;
  page: number;
  pageSize: number;
  filter: "all" | "error" | "warning";
  search: string;
}

export interface InteractionLogStats {
  total: number;
  errors: number;
}
