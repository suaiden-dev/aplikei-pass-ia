export interface OfficeRow {
  id: string;
  name: string;
  slug: string;
  landing_page_config?: Record<string, unknown> | null;
  address: string | null;
  phone: string | null;
  cnpj?: string | null;
  email?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  owner_id: string;
  owner_name?: string | null;
  owner_email?: string | null;
}

export interface UpsertOfficePayload {
  name: string;
  slug?: string | null;
  address?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  email?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  owner_id: string;
}

export interface OfficeStats {
  revenueTotal: number;
  feesTotal: number;
  activeProcesses: number;
  totalProcesses: number;
  finishedProcesses: number;
  availableBalance: number;
  monthlyRevenue: { month: string; value: number }[];
  serviceDistribution: { label: string; percent: number; color: string }[];
}

export interface OfficePaymentSettings {
  id: string;
  office_id: string;
  default_payout_method: "stripe" | "zelle";
  stripe_enabled?: boolean;
  zelle_enabled?: boolean;
  zelle_name: string | null;
  zelle_identifier: string | null;
  stripe_payment_link?: string;
  zelle_payment_link?: string;
}
