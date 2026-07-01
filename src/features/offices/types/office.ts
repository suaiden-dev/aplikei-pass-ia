export interface OfficeRow {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
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
  pendingPayments: number;
  availableBalance: number;
  monthlyRevenue: { month: string; value: number }[];
  serviceDistribution: { label: string; percent: number; color: string }[];
}

export interface MasterOfficeStats {
  office_id: string;
  office_name: string;
  owner_id?: string | null;
  responsible_name: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  process_count: number;
  total_revenue: number;
  available_balance: number;
  pending_requests: number;
  pending_amount: number;
  active_plan_name: string;
  subscription_status: string;
  subscription_id: string;
  plan_id: string;
}

export interface OfficeTeamMember {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

export interface OfficeProcess {
  id: string;
  service_slug: string;
  status: string | null;
  current_step: number | null;
  created_at: string | null;
  user_id: string;
  user_accounts?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface OfficeDetails {
  office: MasterOfficeStats | null;
  sellers: OfficeTeamMember[];
  managers: OfficeTeamMember[];
  processes: OfficeProcess[];
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
