import { supabase } from "@shared/lib/supabase";

// ─── Static configs ───────────────────────────────────────────────────────────

export type PhaseName = "addons" | "finalization";
export type InterviewTier = "Bronze" | "Silver" | "Gold";

export interface FlowConfig {
  key: "b1b2" | "f1" | "eos" | "cos";
  matchSlugs: string[];
  initialItems: Array<{ title: string; description: string }>;
  phaseMap: Record<PhaseName, string[]>;
}

export const INTERVIEW_SPECIALIST_SLUGS = new Set([
  "mentoria-bronze",
  "mentoria-prata",
  "mentoria-silver",
  "mentoria-gold",
  "mentoring-bronze",
  "mentoring-silver",
  "mentoring-gold",
]);

export const INTERVIEW_TIER_MAP: Record<string, InterviewTier> = {
  "mentoring-bronze": "Bronze",
  "mentoria-bronze": "Bronze",
  "mentoring-silver": "Silver",
  "mentoria-silver": "Silver",
  "mentoria-prata": "Silver",
  "mentoring-gold": "Gold",
  "mentoria-gold": "Gold",
};

export const INTERVIEW_TIER_INFO: Record<
  InterviewTier,
  { description: string; appliedTo: string; onPurchase: string; badgeClass: string; borderClass: string }
> = {
  Bronze: {
    description: "Entry-level consular interview coaching to help clients feel prepared and confident.",
    appliedTo: "Displayed in the add-ons step of the application flow, after document preparation is confirmed.",
    onPurchase: "Client schedules a live 1-on-1 session covering the most common consular interview questions and proper response structure.",
    badgeClass: "bg-orange-100 text-orange-900",
    borderClass: "border-orange-200",
  },
  Silver: {
    description: "Intermediate coaching with personalized feedback and a complete mock interview.",
    appliedTo: "Displayed in the add-ons step of the application flow, after document preparation is confirmed.",
    onPurchase: "Client receives one mock interview session, written feedback on their answers, and guidance on body language and tone.",
    badgeClass: "bg-slate-300 text-slate-950",
    borderClass: "border-slate-300",
  },
  Gold: {
    description: "Premium coaching program with multiple sessions and in-depth interview preparation.",
    appliedTo: "Displayed in the add-ons step of the application flow, after document preparation is confirmed.",
    onPurchase: "Client receives a full program: initial assessment, two mock interviews, a written debrief, and direct follow-up support before the consular interview date.",
    badgeClass: "bg-yellow-100 text-yellow-700",
    borderClass: "border-yellow-200",
  },
};

const PRICE_OVERRIDDEN_BY_ADMIN = "The price configured here is not used in checkout. The amount charged to the client is set case by case by the admin when sending the Motion proposal in the process detail.";

export const FLOW_CONFIGS: FlowConfig[] = [
  {
    key: "b1b2",
    matchSlugs: ["b1-b2", "b1b2", "visto-b1-b2", "visa-b1b2"],
    initialItems: [
      { title: "Application Review", description: "Comprehensive review of client provided details." },
      { title: "Document Preparation", description: "Assembly of required forms and supporting evidence." },
    ],
    phaseMap: {
      addons: [
        "mentoria-individual", "mentoria-bronze", "mentoria-prata", "mentoria-silver", "mentoria-gold",
        "mentoring-bronze", "mentoring-silver", "mentoring-gold", "consultoria-especialista",
      ],
      finalization: ["mentoria-negativa-consular", "consultancy-negative-b1b2"],
    },
  },
  {
    key: "f1",
    matchSlugs: ["f1", "visto-f1", "visa-f1"],
    initialItems: [
      { title: "Application Review", description: "Comprehensive review of client provided details." },
      { title: "Document Preparation", description: "Assembly of required forms and supporting evidence." },
    ],
    phaseMap: {
      addons: [
        "mentoria-bronze", "mentoria-prata", "mentoria-silver", "mentoria-gold",
        "mentoring-bronze", "mentoring-silver", "mentoring-gold", "consultoria-especialista",
      ],
      finalization: ["consultoria-f1-negativa", "consultancy-negative-f1"],
    },
  },
  {
    key: "eos",
    matchSlugs: ["extensao-status", "eos"],
    initialItems: [
      { title: "I-539 Petition Preparation", description: "Guided completion of the official USCIS I-539 form for extension of status." },
      { title: "Support Cover Letter", description: "Drafted narrative justifying the need for status extension, tailored to the client's situation." },
      { title: "Document Review", description: "Verification of I-94, passport, bank statements and all required supporting evidence." },
    ],
    phaseMap: {
      addons: ["analysis-rfe-eos", "dependent-eos"],
      finalization: ["consultancy-motion-eos", "analysis-motion-eos"],
    },
  },
  {
    key: "cos",
    matchSlugs: ["troca-status", "cos"],
    initialItems: [
      { title: "I-539 Petition Preparation", description: "Guided completion of the official USCIS I-539 form for the requested status change." },
      { title: "Support Cover Letter", description: "Drafted narrative justifying the change of visa category, tailored to the client's situation." },
      { title: "Document Review", description: "Verification of I-94, passport, bank statements and all required supporting evidence." },
    ],
    phaseMap: {
      addons: ["analysis-rfe-cos", "dependent-cos"],
      finalization: ["consultancy-motion-cos", "analysis-motion-cos"],
    },
  },
];

export const SLUG_PRODUCT_INFO: Record<string, { description: string; appliedTo: string; onPurchase: string; priceWarning?: string }> = {
  "analysis-rfe-eos": {
    description: "RFE response workflow for Extension of Status — activated when USCIS issues a Request for Evidence on the I-539 petition.",
    appliedTo: "Offered as an add-on during the application flow when a USCIS RFE is received after the I-539 submission.",
    onPurchase: "Client is guided through gathering and submitting the specific evidence requested by USCIS to resolve the RFE and keep the petition active.",
  },
  "analysis-rfe-cos": {
    description: "RFE response workflow for Change of Status — activated when USCIS issues a Request for Evidence on the I-539 petition.",
    appliedTo: "Offered as an add-on during the application flow when a USCIS RFE is received after the I-539 submission.",
    onPurchase: "Client is guided through gathering and submitting the specific evidence requested by USCIS to resolve the RFE and keep the petition active.",
  },
  "dependent-eos": {
    description: "Adds a co-applicant (spouse or child) to the Extension of Status I-539 petition.",
    appliedTo: "Offered during the application step when the client declares one or more dependents who also need their status extended.",
    onPurchase: "An additional slot is added to the I-539 petition, covering the dependent's forms, documents, and USCIS fee guidance.",
  },
  "dependent-cos": {
    description: "Adds a co-applicant (spouse or child) to the Change of Status I-539 petition.",
    appliedTo: "Offered during the application step when the client declares one or more dependents who also need their status changed.",
    onPurchase: "An additional slot is added to the I-539 petition, covering the dependent's forms, documents, and USCIS fee guidance.",
  },
  "consultancy-motion-eos": {
    description: "Motion recovery flow for Extension of Status — initial step triggered after a USCIS denial.",
    appliedTo: "Activated in the finalization phase when the EOS petition is denied and the client opts to pursue a Motion to Reopen or Reconsider.",
    onPurchase: "Specialist reviews the denial notice, defines the recovery strategy, and drafts the Motion proposal for client approval before proceeding to the full analysis.",
    priceWarning: PRICE_OVERRIDDEN_BY_ADMIN,
  },
  "consultancy-motion-cos": {
    description: "Motion recovery flow for Change of Status — initial step triggered after a USCIS denial.",
    appliedTo: "Activated in the finalization phase when the COS petition is denied and the client opts to pursue a Motion to Reopen or Reconsider.",
    onPurchase: "Specialist reviews the denial notice, defines the recovery strategy, and drafts the Motion proposal for client approval before proceeding to the full analysis.",
    priceWarning: PRICE_OVERRIDDEN_BY_ADMIN,
  },
  "analysis-motion-eos": {
    description: "In-depth Motion case analysis for Extension of Status — second phase of the Motion recovery flow.",
    appliedTo: "Activated after the Motion proposal is reviewed and approved by the client in the EOS process.",
    onPurchase: "Specialist performs a full legal analysis of the denial grounds, builds the argumentation for the Motion, and prepares the final submission package.",
  },
  "analysis-motion-cos": {
    description: "In-depth Motion case analysis for Change of Status — second phase of the Motion recovery flow.",
    appliedTo: "Activated after the Motion proposal is reviewed and approved by the client in the COS process.",
    onPurchase: "Specialist performs a full legal analysis of the denial grounds, builds the argumentation for the Motion, and prepares the final submission package.",
  },
};

export function getFlowConfig(mainSlug: string): FlowConfig | null {
  const normalized = mainSlug.toLowerCase();
  return FLOW_CONFIGS.find((cfg) => cfg.matchSlugs.some((token) => normalized.includes(token))) ?? null;
}

export function cleanPrice(raw: string): number {
  const value = raw.replace(",", ".");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServicePrice {
  id: string;
  office_id: string;
  service_id: string;
  name: string;
  description: string | null;
  category: string;
  slug: string;
  price: number;
  currency: string;
  is_active: boolean;
}

export async function resolveProductsOffice(params: {
  userId?: string | null;
  officeId?: string | null;
}): Promise<{ officeId: string | null; officeSlug: string | null }> {
  if (params.officeId) {
    const { data, error } = await supabase
      .from("offices")
      .select("slug")
      .eq("id", params.officeId)
      .single();

    if (error) throw Error(error.message);
    return { officeId: params.officeId, officeSlug: data?.slug ?? null };
  }

  if (!params.userId) return { officeId: null, officeSlug: null };

  const { data, error } = await supabase
    .from("offices")
    .select("id, slug")
    .eq("owner_id", params.userId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return { officeId: data?.id ?? null, officeSlug: data?.slug ?? null };
}

interface ServicePriceRow {
  id: string;
  office_id: string;
  service_id: string;
  price: number;
  currency: string;
  is_active: boolean | null;
  services: {
    name: string | null;
    category: string | null;
    slug: string | null;
    description: string | null;
  } | null;
}

export async function listOfficeServicePrices(officeId: string): Promise<ServicePrice[]> {
  const { data, error } = await supabase
    .from("user_service_prices")
    .select("id, office_id, service_id, price, currency, is_active, services(name, category, slug, description)")
    .eq("office_id", officeId)
    .order("service_id");

  if (error) throw Error(error.message);

  return ((data ?? []) as unknown as ServicePriceRow[]).map((price) => ({
    id: price.id,
    office_id: price.office_id,
    service_id: price.service_id,
    name: price.services?.name ?? price.service_id,
    description: price.services?.description ?? null,
    category: price.services?.category ?? "other",
    slug: price.services?.slug ?? price.service_id,
    price: price.price,
    currency: price.currency,
    is_active: price.is_active ?? true,
  }));
}

export async function updateServicePriceRows(rows: Array<{
  id: string;
  is_active: boolean;
  price: number;
}>): Promise<void> {
  if (rows.length === 0) return;

  const { error } = await supabase.rpc("bulk_update_user_service_prices", {
    p_updates: rows,
  });

  if (error) throw Error(error.message);
}
