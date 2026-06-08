import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiFileCopyLine,
  RiLoader4Line,
  RiLockLine,
  RiSaveLine,
  RiSettings3Line,
  RiPriceTag3Line,
  RiEyeLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { encodeCheckoutToken } from "@shared/utils/checkoutToken";
import { cn } from "@shared/utils/cn";
import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";
import { Switch } from "@shared/components/atoms/switch";
import { Input } from "@shared/components/atoms/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";

interface ServicePrice {
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

interface DraftState {
  is_active: boolean;
  price: string;
}

type DraftMap = Record<string, DraftState>;
type PhaseName = "addons" | "finalization";

interface FlowConfig {
  key: "b1b2" | "f1" | "eos" | "cos";
  matchSlugs: string[];
  initialItems: Array<{ title: string; description: string }>;
  phaseMap: Record<PhaseName, string[]>;
}

const INTERVIEW_SPECIALIST_SLUGS = new Set([
  "mentoria-bronze",
  "mentoria-prata",
  "mentoria-silver",
  "mentoria-gold",
  "mentoring-bronze",
  "mentoring-silver",
  "mentoring-gold",
]);

type InterviewTier = "Bronze" | "Silver" | "Gold";

const INTERVIEW_TIER_MAP: Record<string, InterviewTier> = {
  "mentoring-bronze": "Bronze",
  "mentoria-bronze": "Bronze",
  "mentoring-silver": "Silver",
  "mentoria-silver": "Silver",
  "mentoria-prata": "Silver",
  "mentoring-gold": "Gold",
  "mentoria-gold": "Gold",
};

const INTERVIEW_TIER_INFO: Record<
  InterviewTier,
  { description: string; appliedTo: string; onPurchase: string; badgeClass: string; borderClass: string }
> = {
  Bronze: {
    description: "Entry-level consular interview coaching to help clients feel prepared and confident.",
    appliedTo: "Displayed in the add-ons step of the application flow, after document preparation is confirmed.",
    onPurchase: "Client schedules a live 1-on-1 session covering the most common consular interview questions and proper response structure.",
    badgeClass: "bg-amber-100 text-amber-800",
    borderClass: "border-amber-200",
  },
  Silver: {
    description: "Intermediate coaching with personalized feedback and a complete mock interview.",
    appliedTo: "Displayed in the add-ons step of the application flow, after document preparation is confirmed.",
    onPurchase: "Client receives one mock interview session, written feedback on their answers, and guidance on body language and tone.",
    badgeClass: "bg-slate-200 text-slate-700",
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

const FLOW_CONFIGS: FlowConfig[] = [
  {
    key: "b1b2",
    matchSlugs: ["b1-b2", "b1b2", "visto-b1-b2", "visa-b1b2"],
    initialItems: [
      {
        title: "Application Review",
        description: "Comprehensive review of client provided details.",
      },
      {
        title: "Document Preparation",
        description: "Assembly of required forms and supporting evidence.",
      },
    ],
    phaseMap: {
      addons: [
        "mentoria-individual",
        "mentoria-bronze",
        "mentoria-prata",
        "mentoria-silver",
        "mentoria-gold",
        "mentoring-bronze",
        "mentoring-silver",
        "mentoring-gold",
        "consultoria-especialista",
      ],
      finalization: ["mentoria-negativa-consular", "consultancy-negative-b1b2"],
    },
  },
  {
    key: "f1",
    matchSlugs: ["f1", "visto-f1", "visa-f1"],
    initialItems: [
      {
        title: "Application Review",
        description: "Comprehensive review of client provided details.",
      },
      {
        title: "Document Preparation",
        description: "Assembly of required forms and supporting evidence.",
      },
    ],
    phaseMap: {
      addons: [
        "mentoria-bronze",
        "mentoria-prata",
        "mentoria-silver",
        "mentoria-gold",
        "mentoring-bronze",
        "mentoring-silver",
        "mentoring-gold",
        "consultoria-especialista",
      ],
      finalization: ["consultoria-f1-negativa", "consultancy-negative-f1"],
    },
  },
  {
    key: "eos",
    matchSlugs: ["extensao-status", "eos"],
    initialItems: [
      {
        title: "I-539 Petition Preparation",
        description: "Guided completion of the official USCIS I-539 form for extension of status.",
      },
      {
        title: "Support Cover Letter",
        description: "Drafted narrative justifying the need for status extension, tailored to the client's situation.",
      },
      {
        title: "Document Review",
        description: "Verification of I-94, passport, bank statements and all required supporting evidence.",
      },
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
      {
        title: "I-539 Petition Preparation",
        description: "Guided completion of the official USCIS I-539 form for the requested status change.",
      },
      {
        title: "Support Cover Letter",
        description: "Drafted narrative justifying the change of visa category, tailored to the client's situation.",
      },
      {
        title: "Document Review",
        description: "Verification of I-94, passport, bank statements and all required supporting evidence.",
      },
    ],
    phaseMap: {
      addons: ["analysis-rfe-cos", "dependent-cos"],
      finalization: ["consultancy-motion-cos", "analysis-motion-cos"],
    },
  },
];

const PRICE_OVERRIDDEN_BY_ADMIN = "The price configured here is not used in checkout. The amount charged to the client is set case by case by the admin when sending the Motion proposal in the process detail.";

const SLUG_PRODUCT_INFO: Record<string, { description: string; appliedTo: string; onPurchase: string; priceWarning?: string }> = {
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

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`;
}

function getFlowConfig(mainSlug: string): FlowConfig | null {
  const normalized = mainSlug.toLowerCase();
  return (
    FLOW_CONFIGS.find((cfg) =>
      cfg.matchSlugs.some((token) => normalized.includes(token)),
    ) ?? null
  );
}

function cleanPrice(raw: string) {
  const value = raw.replace(",", ".");
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function ProductsPage() {
  const t = useT("admin");
  const { user } = useAuth();

  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(
    user?.officeId ?? null,
  );

  const loginUrl = useMemo(() => {
    const base =
      typeof window !== "undefined"
        ? `${window.location.origin}/track-my-visa`
        : "/track-my-visa";
    if (!resolvedOfficeId) return base;
    return `${base}?office_id=${resolvedOfficeId}`;
  }, [resolvedOfficeId]);
  const [officeSlug, setOfficeSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [draft, setDraft] = useState<DraftMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [productInfoItem, setProductInfoItem] = useState<ServicePrice | null>(null);

  useEffect(() => {
    if (user?.officeId) {
      setResolvedOfficeId(user.officeId);
      supabase
        .from("offices")
        .select("slug")
        .eq("id", user.officeId)
        .single()
        .then(({ data }) => setOfficeSlug(data?.slug ?? null));
      return;
    }

    if (!user?.id) {
      setResolvedOfficeId(null);
      setOfficeSlug(null);
      return;
    }

    supabase
      .from("offices")
      .select("id, slug")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setResolvedOfficeId(data?.id ?? null);
        setOfficeSlug(data?.slug ?? null);
      });
  }, [user?.id, user?.officeId]);

  const load = useCallback(async () => {
    if (!resolvedOfficeId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_service_prices")
      .select(
        "id, office_id, service_id, price, currency, is_active, services(name, category, slug, description)",
      )
      .eq("office_id", resolvedOfficeId)
      .order("service_id");

    if (error) {
      toast.error(t.cases.messages.errorAction);
      setIsLoading(false);
      return;
    }

    const parsed = ((data ?? []) as Array<any>).map((p) => ({
      id: p.id,
      office_id: p.office_id,
      service_id: p.service_id,
      name: p.services?.name ?? p.service_id,
      description: p.services?.description ?? null,
      category: p.services?.category ?? "other",
      slug: p.services?.slug ?? p.service_id,
      price: p.price,
      currency: p.currency,
      is_active: p.is_active ?? true,
    })) as ServicePrice[];

    setProducts(parsed);
    setDraft(
      parsed.reduce((acc, item) => {
        acc[item.id] = {
          is_active: item.is_active,
          price: item.price.toFixed(2),
        };
        return acc;
      }, {} as DraftMap),
    );
    setIsLoading(false);
  }, [resolvedOfficeId, t.cases.messages.errorAction]);

  useEffect(() => {
    void load();
  }, [load]);

  const mainServices = useMemo(
    () => products.filter((p) => p.category === "main_visa"),
    [products],
  );
  const avgTicket = useMemo(() => {
    const activeMain = mainServices.filter((p) => p.is_active);
    if (activeMain.length === 0) return 0;
    const sum = activeMain.reduce((acc, p) => acc + p.price, 0);
    return sum / activeMain.length;
  }, [mainServices]);
  const subServices = useMemo(
    () => products.filter((p) => p.category !== "main_visa"),
    [products],
  );

  useEffect(() => {
    if (!selectedMainId && mainServices.length > 0) {
      setSelectedMainId(mainServices[0].id);
    }
    if (selectedMainId && !mainServices.some((item) => item.id === selectedMainId)) {
      setSelectedMainId(mainServices[0]?.id ?? null);
    }
  }, [mainServices, selectedMainId]);

  const getRelatedSubProducts = useCallback(
    (mainProduct: ServicePrice): ServicePrice[] => {
      const config = getFlowConfig(mainProduct.slug);
      if (!config) return [];

      const allSlugs = [...config.phaseMap.addons, ...config.phaseMap.finalization];
      const indexBySlug = new Map(allSlugs.map((slug, idx) => [slug, idx]));

      return subServices
        .filter((p) => indexBySlug.has(p.slug))
        .sort(
          (a, b) =>
            (indexBySlug.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
            (indexBySlug.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
        );
    },
    [subServices],
  );

  const selectedMain = mainServices.find((p) => p.id === selectedMainId) ?? null;
  const selectedFlowConfig = selectedMain ? getFlowConfig(selectedMain.slug) : null;
  const relatedProducts = selectedMain ? getRelatedSubProducts(selectedMain) : [];
  const addons = relatedProducts.filter((item) =>
    selectedFlowConfig?.phaseMap.addons.includes(item.slug),
  );
  const finalization = relatedProducts.filter((item) =>
    selectedFlowConfig?.phaseMap.finalization.includes(item.slug),
  );

  const interviewItems = addons.filter((a) => INTERVIEW_SPECIALIST_SLUGS.has(a.slug));
  const interviewGroupActive =
    interviewItems.length > 0 &&
    interviewItems.every((i) => draft[i.id]?.is_active ?? i.is_active);
  const interviewPricesDefined = interviewItems.every((i) => {
    const p = cleanPrice(draft[i.id]?.price ?? String(i.price));
    return Number.isFinite(p) && p > 0;
  });

  const checkoutBase = typeof window !== "undefined" ? window.location.origin : "";
  const checkoutUrl = (slug: string) => {
    if (!officeSlug || !checkoutBase) return "";
    const token = encodeCheckoutToken({
      office: officeSlug,
      product: slug,
      ref: user?.id || "",
    });
    return `${checkoutBase}/l/${token}`;
  };

  const updateDraft = (id: string, patch: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveConfiguration = async () => {
    if (!selectedMain) return;

    const rowsToSave = [selectedMain, ...relatedProducts];
    for (const row of rowsToSave) {
      const item = draft[row.id];
      const price = cleanPrice(item?.price ?? "");
      if (!Number.isFinite(price) || price < 0) {
        toast.error(`Invalid price for ${row.name}.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await Promise.all(
        rowsToSave.map((row) => {
          const item = draft[row.id];
          return supabase
            .from("user_service_prices")
            .update({
              is_active: item.is_active,
              price: cleanPrice(item.price),
            })
            .eq("id", row.id);
        }),
      );
      toast.success("Configuration saved successfully.");
      await load();
    } catch {
      toast.error("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 w-full max-w-[1500px] mx-auto space-y-5 font-['Inter']">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="text-left">
          <h1 className="text-[56px] leading-[1.02] font-semibold text-slate-900 tracking-[-0.03em]">
            Products & Offer Builder
          </h1>
          <p className="text-[14px] leading-6 text-slate-500 font-[500] mt-2 max-w-3xl">
            Configure the services, prices and upsells your clients will see during each application flow.
          </p>
        </div>
        <button
          onClick={() => void saveConfiguration()}
          disabled={isSaving || !selectedMain}
          className="h-14 px-7 rounded-xl bg-primary text-white text-sm font-[700] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 inline-flex items-center gap-2 self-start"
        >
          {isSaving ? <RiLoader4Line className="animate-spin" /> : <RiSaveLine />}
          Save Configuration
        </button>
      </div>


      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest break-all">
          Login URL: <span className="text-text normal-case font-medium">{loginUrl}</span>
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(loginUrl);
            toast.success("Login URL copied!");
          }}

          className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"

        >
          <RiFileCopyLine className="text-sm" />
          Copy         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Main Visas", value: mainServices.length, icon: RiPriceTag3Line, bg: "bg-info/10", color: "text-info" },
          { label: "Active", value: mainServices.filter((p) => p.is_active).length, icon: RiEyeLine, bg: "bg-success/10", color: "text-success" },
          { label: "Avg. Ticket", value: `$${avgTicket.toFixed(0)}`, icon: RiMoneyDollarCircleLine, bg: "bg-primary/10", color: "text-primary" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-3xl border border-border shadow-sm p-6 flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                <Icon className={`text-2xl ${s.color}`} />
              </div>
              <div className="text-left">
                <p className="text-3xl font-black text-text leading-none tracking-tight">{s.value}</p>
                <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mainServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card rounded-[32px] border border-border">
          <RiPriceTag3Line className="text-6xl text-text-muted/20" />
          <p className="text-lg font-bold text-text-muted">No main visas found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {mainServices.map((main) => (
            <div key={main.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="text-left mb-4">
                <p className="text-lg font-black text-text">{main.name}</p>
                <p className="text-xs font-bold text-text-muted uppercase">{main.slug}</p>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-2xl font-black text-primary">${main.price.toFixed(2)}</span>
                <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-full border", main.is_active ? "bg-success/10 text-success border-success/20" : "bg-bg-subtle text-text-muted border-border")}>{main.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="space-y-3">
                <button onClick={() => setSelectedMainId(main.id)} className="w-full h-11 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all">
                  Configure
                </button>
                {main.is_active && (
                  <div className="rounded-xl border border-border bg-bg-subtle/50 p-2.5">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Product link</p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={checkoutUrl(main.slug)}
                        placeholder="Office slug required to generate the link"
                        className="flex-1 h-9 px-2.5 rounded-lg border border-border bg-card text-[11px] font-medium text-text"
                      />
                      <button
                        onClick={() => {
                          const url = checkoutUrl(main.slug);
                          if (!url) {
                            toast.error("Unable to generate link. Set office slug first.");
                            return;
                          }
                          navigator.clipboard.writeText(url);
                          toast.success("Product link copied!");
                        }}
                        className="h-9 px-3 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all inline-flex items-center gap-1"
                        title="Copy product link"
                      >
                        <RiFileCopyLine className="text-sm" />
                        Copy
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
        </div>
      )}

        {selectedMain && (
          <>
            <div className="px-6 py-5 space-y-8 bg-card rounded-3xl border border-border p-6 shadow-sm mt-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                      1
                    </span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Initial Phase</p>
                  </div>
                  {(selectedFlowConfig?.initialItems ?? [
                    {
                      title: selectedMain.name,
                      description: "Core service selected for this flow.",
                    },
                  ]).map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                          Included
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                      2
                    </span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Add-ons & Upsells</p>
                  </div>
                  {addons.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500 text-left">
                      No add-ons mapped for this flow.
                    </div>
                  ) : (() => {
                    let interviewRendered = false;
                    return addons.map((item) => {
                      if (INTERVIEW_SPECIALIST_SLUGS.has(item.slug)) {
                        if (interviewRendered) return null;
                        interviewRendered = true;
                        return (
                          <div key="interview-specialist" className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-slate-900">Interview Specialist</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Bronze, Silver & Gold coaching — all tiers activate together.{" "}
                                  <button
                                    type="button"
                                    onClick={() => setIsInterviewModalOpen(true)}
                                    className="text-primary font-bold hover:underline leading-none"
                                  >more info</button>
                                </p>
                                {(() => {
                                  const crossFlow =
                                    selectedFlowConfig?.key === "b1b2" ? "F1" :
                                    selectedFlowConfig?.key === "f1" ? "B1/B2" :
                                    null;
                                  return crossFlow ? (
                                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 mt-2">
                                      <p className="text-xs text-amber-800">
                                        <strong>Important:</strong> Any changes to this product, including activation status or pricing, will be automatically applied to the {crossFlow} product as well.
                                      </p>
                                    </div>
                                  ) : null;
                                })()}
                                {!interviewPricesDefined && (
                                  <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                    <RiLockLine />
                                    Define prices for all tiers before activating.
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsInterviewModalOpen(true)}
                                  className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                                  title="Configure Interview Specialist"
                                >
                                  <RiSettings3Line className="text-sm" />
                                </button>
                                <Switch
                                  checked={interviewGroupActive}
                                  disabled={!interviewPricesDefined}
                                  onCheckedChange={(checked) => {
                                    for (const gi of interviewItems) {
                                      updateDraft(gi.id, { is_active: checked });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.description || SLUG_PRODUCT_INFO[item.slug]?.description || "Complementary offer in this stage."}
                                {SLUG_PRODUCT_INFO[item.slug] && (
                                  <>{" "}<button
                                    type="button"
                                    onClick={() => setProductInfoItem(item)}
                                    className="text-primary font-bold hover:underline leading-none"
                                  >more info</button></>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setProductInfoItem(item)}
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                                title="View product details"
                              >
                                <RiSettings3Line className="text-sm" />
                              </button>
                              <Switch
                                checked={draft[item.id]?.is_active ?? item.is_active}
                                onCheckedChange={(checked) =>
                                  updateDraft(item.id, { is_active: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}

                  <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
                    <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
                      <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
                        <DialogTitle className="text-[20px] font-semibold text-slate-900 tracking-[-0.02em]">
                          Interview Specialist
                        </DialogTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          Configure prices for each coaching tier. All tiers activate and deactivate together.
                        </p>
                      </DialogHeader>
                      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        {interviewItems.map((item) => {
                          const tier = INTERVIEW_TIER_MAP[item.slug];
                          const info = tier ? INTERVIEW_TIER_INFO[tier] : null;
                          const priceVal = draft[item.id]?.price ?? item.price.toFixed(2);
                          const parsedPrice = cleanPrice(priceVal);
                          const missingPrice = !Number.isFinite(parsedPrice) || parsedPrice <= 0;
                          return (
                            <div
                              key={item.id}
                              className={`rounded-xl border p-4 ${info?.borderClass ?? "border-slate-200"}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    {tier && (
                                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${info?.badgeClass}`}>
                                        {tier}
                                      </span>
                                    )}
                                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                                  </div>
                                  {info && (
                                    <>
                                      <p className="text-xs text-slate-600 leading-relaxed">{info.description}</p>
                                      <div className="space-y-1.5">
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applied to</span>
                                          <p className="text-xs text-slate-500 mt-0.5">{info.appliedTo}</p>
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">When purchased</span>
                                          <p className="text-xs text-slate-500 mt-0.5">{info.onPurchase}</p>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="w-[130px] shrink-0">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Price (USD)</p>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={priceVal}
                                    onChange={(e) => updateDraft(item.id, { price: e.target.value })}
                                    className={missingPrice ? "border-red-300 focus:border-red-400" : ""}
                                  />
                                  {missingPrice && (
                                    <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                                      <RiLockLine className="shrink-0" />
                                      Required to activate
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsInterviewModalOpen(false)}
                          className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                      3
                    </span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Finalization</p>
                  </div>
                  {finalization.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500 text-left">
                      No finalization offers mapped for this flow.
                    </div>
                  ) : (
                    finalization.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.description || SLUG_PRODUCT_INFO[item.slug]?.description || "Final stage cross-sell opportunity."}
                              {SLUG_PRODUCT_INFO[item.slug] && (
                                <>{" "}<button
                                  type="button"
                                  onClick={() => setProductInfoItem(item)}
                                  className="text-primary font-bold hover:underline leading-none"
                                >more info</button></>
                              )}
                            </p>
                            {SLUG_PRODUCT_INFO[item.slug]?.priceWarning && (
                              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
                                ⚠ {SLUG_PRODUCT_INFO[item.slug]!.priceWarning}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setProductInfoItem(item)}
                              className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                              title="View product details"
                            >
                              <RiSettings3Line className="text-sm" />
                            </button>
                            <Switch
                              checked={draft[item.id]?.is_active ?? item.is_active}
                              onCheckedChange={(checked) =>
                                updateDraft(item.id, { is_active: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}


      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest inline-flex items-center gap-2">
          <RiSettings3Line className="text-primary" />
          Subproducts are enabled automatically when configured in this flow.
        </p>
      </div>

      <Dialog open={!!productInfoItem} onOpenChange={(open) => { if (!open) setProductInfoItem(null); }}>
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
            <DialogTitle className="text-[20px] font-semibold text-slate-900 tracking-[-0.02em]">
              {productInfoItem?.name}
            </DialogTitle>
          </DialogHeader>
          {productInfoItem && (() => {
            const info = SLUG_PRODUCT_INFO[productInfoItem.slug];
            const priceVal = draft[productInfoItem.id]?.price ?? productInfoItem.price.toFixed(2);
            const parsedPrice = cleanPrice(priceVal);
            const missingPrice = !Number.isFinite(parsedPrice) || parsedPrice <= 0;
            return (
              <div className="px-6 py-5 space-y-4">
                {info && (
                  <>
                    <p className="text-sm text-slate-600 leading-relaxed">{info.description}</p>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applied to</span>
                        <p className="text-xs text-slate-500 mt-0.5">{info.appliedTo}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">When purchased</span>
                        <p className="text-xs text-slate-500 mt-0.5">{info.onPurchase}</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-slate-200">
                  {info?.priceWarning ? (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>⚠ Price not configurable here.</strong><br />
                        {info.priceWarning}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Price (USD)</p>
                      <div className="w-[140px]">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={priceVal}
                          onChange={(e) => updateDraft(productInfoItem.id, { price: e.target.value })}
                          className={missingPrice ? "border-red-300 focus:border-red-400" : ""}
                        />
                      </div>
                      {missingPrice && (
                        <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <RiLockLine className="shrink-0" />
                          Define a price to enable activation.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              type="button"
              onClick={() => setProductInfoItem(null)}
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
