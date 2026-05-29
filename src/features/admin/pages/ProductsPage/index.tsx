import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RiCheckLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiEyeLine,
  RiInformationLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiQuestionLine,
} from "react-icons/ri";
import { supabase } from "@shared/lib/supabase";
import { useT } from "@app/app/i18n";
import { useAuth } from "@shared/hooks/useAuth";
import { encodeCheckoutToken } from "@shared/utils/checkoutToken";

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

type PriceMode = "keep" | "custom";

function cn(...classes: Array<string | boolean | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatUsd(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(amount)) return "$0.00";
  return `$${amount.toFixed(2)}`;
}

function looksPortuguese(text: string) {
  const sample = text.toLowerCase();
  return (
    /[ãõáàâéêíóôúç]/.test(sample) ||
    /\b(para|com|você|cliente|etapa|processo|pendência|treinamento|entrevista|serviço)\b/.test(sample)
  );
}

function englishDescription(text: string | null | undefined, fallback: string) {
  const clean = (text || "").trim();
  if (!clean) return fallback;
  return looksPortuguese(clean) ? fallback : clean;
}

function MainProductConfigModal({
  mainProduct,
  relatedProducts,
  onClose,
  onSaved,
}: {
  mainProduct: ServicePrice;
  relatedProducts: ServicePrice[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mainEnabled, setMainEnabled] = useState(mainProduct.is_active);
  const [mainPriceMode, setMainPriceMode] = useState<PriceMode>("keep");
  const [mainCustomPrice, setMainCustomPrice] = useState(mainProduct.price.toFixed(2));
  const [saving, setSaving] = useState(false);

  const [subConfig, setSubConfig] = useState<Record<string, { enabled: boolean; priceMode: PriceMode; customPrice: string }>>(
    () =>
      relatedProducts.reduce((acc, p) => {
        acc[p.id] = { enabled: p.is_active, priceMode: "keep", customPrice: p.price.toFixed(2) };
        return acc;
      }, {} as Record<string, { enabled: boolean; priceMode: PriceMode; customPrice: string }>),
  );

  const normalizedMainSlug = mainProduct.slug.toLowerCase();
  const isB1B2Main =
    normalizedMainSlug.includes("b1-b2") ||
    normalizedMainSlug.includes("b1b2") ||
    normalizedMainSlug.includes("visto-b1-b2") ||
    normalizedMainSlug.includes("visa-b1b2");
  const hasB1B2MentorshipQuestion = isB1B2Main;
  const mentorshipSlugs = ["mentoria-individual", "mentoria-bronze", "mentoria-prata", "mentoria-silver", "mentoria-gold"];
  const mentorshipTargets = relatedProducts.filter((p) => mentorshipSlugs.includes(p.slug));
  const [enableMentorshipAtInterview, setEnableMentorshipAtInterview] = useState<boolean | null>(() => {
    if (!hasB1B2MentorshipQuestion || mentorshipTargets.length === 0) return null;
    return mentorshipTargets.every((p) => p.is_active);
  });

  const updateSub = (id: string, patch: Partial<{ enabled: boolean; priceMode: PriceMode; customPrice: string }>) => {
    setSubConfig((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const handleMentorshipQuestion = (enabled: boolean) => {
    setEnableMentorshipAtInterview(enabled);
    setSubConfig((prev) => {
      const next = { ...prev };
      mentorshipTargets.forEach((p) => {
        next[p.id] = { ...next[p.id], enabled };
      });
      return next;
    });
  };

  const parsePrice = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSave = async () => {
    if (mainPriceMode === "custom") {
      const p = parsePrice(mainCustomPrice);
      if (isNaN(p) || p <= 0) {
        toast.error("Invalid main product price.");
        return;
      }
    }

    for (const p of relatedProducts) {
      const cfg = subConfig[p.id];
      if (cfg?.priceMode === "custom") {
        const val = parsePrice(cfg.customPrice);
        if (isNaN(val) || val <= 0) {
          toast.error(`Invalid price for ${p.name}.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updates = [
        {
          id: mainProduct.id,
          is_active: mainEnabled,
          price: mainPriceMode === "custom" ? parsePrice(mainCustomPrice) : undefined,
        },
        ...relatedProducts.map((p) => {
          const cfg = subConfig[p.id];
          return {
            id: p.id,
            is_active: cfg?.enabled ?? p.is_active,
            price: cfg?.priceMode === "custom" ? parsePrice(cfg.customPrice) : undefined,
          };
        }),
      ];

      await Promise.all(
        updates.map((u) =>
          supabase
            .from("user_service_prices")
            .update({
              is_active: u.is_active,
              ...(typeof u.price === "number" ? { price: u.price } : {}),
            })
            .eq("id", u.id),
        ),
      );

      toast.success("Configuration saved successfully.");
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-black uppercase tracking-tight">Configure {mainProduct.name}</h3>
            <p className="text-xs text-text-muted font-bold">Enable subproducts and define pricing through this form.</p>
            <p className="text-xs text-text-muted mt-2 max-w-2xl">
              {englishDescription(
                mainProduct.description,
                "This main product defines the case workflow and which steps/subproducts will be available to the customer.",
              )}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center">
            <RiCloseLine />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          <section className="rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-wider">Do you want to keep the main product active?</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setMainEnabled(true)} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", mainEnabled ? "bg-emerald-100 text-emerald-700" : "bg-white text-text-muted border border-border")}>Yes</button>
                <button onClick={() => setMainEnabled(false)} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", !mainEnabled ? "bg-red-100 text-red-700" : "bg-white text-text-muted border border-border")}>No</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setMainPriceMode("keep")} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", mainPriceMode === "keep" && "bg-primary/10 text-primary", mainPriceMode !== "keep" && "bg-bg-subtle text-text-muted")}>Keep current price</button>
              <button onClick={() => setMainPriceMode("custom")} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", mainPriceMode === "custom" && "bg-primary/10 text-primary", mainPriceMode !== "custom" && "bg-bg-subtle text-text-muted")}>Update price</button>
              {mainPriceMode === "keep" && <span className="text-xs font-black text-text-muted">Current: {formatUsd(mainProduct.price)}</span>}
              {mainPriceMode === "custom" && (
                <input type="number" step="0.01" min="0.01" value={mainCustomPrice} onChange={(e) => setMainCustomPrice(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-bg-subtle w-40 text-sm font-bold" />
              )}
            </div>
          </section>

          {hasB1B2MentorshipQuestion && mentorshipTargets.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <p className="text-sm font-black text-amber-700">At the "Awaiting interview" stage, do you want to enable Bronze/Silver/Gold mentoring?</p>
              <div className="flex items-center gap-2">
                <button onClick={() => handleMentorshipQuestion(true)} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", enableMentorshipAtInterview === true ? "bg-emerald-100 text-emerald-700" : "bg-white text-text-muted border border-border")}>Yes</button>
                <button onClick={() => handleMentorshipQuestion(false)} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", enableMentorshipAtInterview === false ? "bg-red-100 text-red-700" : "bg-white text-text-muted border border-border")}>No</button>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <p className="text-sm font-black uppercase tracking-wider flex items-center gap-2"><RiQuestionLine /> Workflow subproducts</p>
            {relatedProducts.length === 0 ? (
              <div className="rounded-2xl border border-border p-4 text-xs font-bold text-text-muted uppercase">No related subproducts found.</div>
            ) : relatedProducts.map((p) => {
              const cfg = subConfig[p.id];
              return (
                <div key={p.id} className="rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-sm font-black">{p.name}</p>
                      <p className="text-[11px] text-text-muted font-semibold">{p.slug}</p>
                      <p className="text-xs text-text-muted mt-1 max-w-2xl">
                        {englishDescription(
                          p.description,
                          "This subproduct adds a complementary service step and can be enabled based on the case strategy.",
                        )}
                      </p>
                      <p className="text-xs text-primary font-semibold mt-1 max-w-2xl">
                        Once this subproduct is paid, a chat is created so you can interact with the client and resolve pending items or training.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSub(p.id, { enabled: true })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-black uppercase",
                          cfg?.enabled ? "bg-emerald-100 text-emerald-700" : "bg-white text-text-muted border border-border",
                        )}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updateSub(p.id, { enabled: false })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-xs font-black uppercase",
                          !cfg?.enabled ? "bg-red-100 text-red-700" : "bg-white text-text-muted border border-border",
                        )}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-text-muted">Do you want to make this subproduct available?</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => updateSub(p.id, { priceMode: "keep" })} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", cfg?.priceMode === "keep" ? "bg-primary/10 text-primary" : "bg-bg-subtle text-text-muted")}>Keep current price</button>
                    <button onClick={() => updateSub(p.id, { priceMode: "custom" })} className={cn("px-3 py-2 rounded-xl text-xs font-black uppercase", cfg?.priceMode === "custom" ? "bg-primary/10 text-primary" : "bg-bg-subtle text-text-muted")}>Update price</button>
                    {cfg?.priceMode === "keep" && <span className="text-xs font-black text-text-muted">Current: {formatUsd(p.price)}</span>}
                    {cfg?.priceMode === "custom" && (
                      <input type="number" step="0.01" min="0.01" value={cfg.customPrice} onChange={(e) => updateSub(p.id, { customPrice: e.target.value })} className="px-3 py-2 rounded-xl border border-border bg-bg-subtle w-40 text-sm font-bold" />
                    )}
                  </div>
                  {mainProduct.slug.toLowerCase().includes("f1") &&
                    ["mentoria-bronze", "mentoria-prata", "mentoria-silver", "mentoria-gold", "mentoring-bronze", "mentoring-silver", "mentoring-gold"].includes(p.slug.toLowerCase()) && (
                      <p className="text-[11px] font-bold text-amber-700">Changes to this subproduct also apply to the B1/B2 flow.</p>
                    )}
                </div>
              );
            })}
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-xs font-black uppercase">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase disabled:opacity-60 inline-flex items-center gap-2">
            {saving ? <RiLoader4Line className="animate-spin" /> : <RiCheckLine />}
            Save configuration
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/acompanhar-meu-caso` : "/acompanhar-meu-caso";
  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(user?.officeId ?? null);
  const [officeSlug, setOfficeSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMainProduct, setSelectedMainProduct] = useState<ServicePrice | null>(null);

  useEffect(() => {
    if (user?.officeId) {
      setResolvedOfficeId(user.officeId);
      supabase.from("offices").select("slug").eq("id", user.officeId).single().then(({ data }) => setOfficeSlug(data?.slug ?? null));
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
      .select("id, office_id, service_id, price, currency, is_active, services(name, category, slug, description)")
      .eq("office_id", resolvedOfficeId)
      .order("service_id");

    if (error) {
      toast.error(t.cases.messages.errorAction);
    } else {
      setProducts(
        ((data ?? []) as Array<any>).map((p) => ({
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
        })),
      );
    }
    setIsLoading(false);
  }, [resolvedOfficeId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const mainServices = products.filter((p) => p.category === "main_visa");
  const subServices = products.filter((p) => p.category !== "main_visa");
  const avgTicket = mainServices.reduce((sum, p) => sum + p.price, 0) / Math.max(mainServices.length, 1);
  const checkoutBase = typeof window !== "undefined" ? window.location.origin : "";
  const checkoutUrl = (slug: string) => {
    if (!officeSlug || !checkoutBase) return "";
    const token = encodeCheckoutToken({ office: officeSlug, product: slug, ref: user?.id || "" });
    return `${checkoutBase}/l/${token}`;
  };

  const getRelatedSubProducts = (mainProduct: ServicePrice): ServicePrice[] => {
    const slug = mainProduct.slug.toLowerCase();
    const isB1B2 =
      slug.includes("b1-b2") ||
      slug.includes("b1b2") ||
      slug.includes("visto-b1-b2") ||
      slug.includes("visa-b1b2");
    const isF1 = slug.includes("f1") || slug.includes("visto-f1") || slug.includes("visa-f1");
    const isEos = slug.includes("extensao-status") || slug.includes("eos");
    const isCos = slug.includes("troca-status") || slug.includes("cos");

    if (isB1B2) {
      return subServices.filter((p) =>
        [
          "mentoria-individual",
          "mentoria-bronze",
          "mentoria-prata",
          "mentoria-silver",
          "mentoria-gold",
          "mentoring-bronze",
          "mentoring-silver",
          "mentoring-gold",
          "mentoria-negativa-consular",
          "consultancy-negative-b1b2",
          "consultoria-especialista",
        ].includes(p.slug),
      );
    }
    if (isF1) {
      return subServices.filter((p) =>
        [
          "mentoria-bronze",
          "mentoria-prata",
          "mentoria-silver",
          "mentoria-gold",
          "mentoring-bronze",
          "mentoring-silver",
          "mentoring-gold",
          "consultoria-f1-negativa",
          "consultancy-negative-f1",
          "consultoria-especialista",
        ].includes(p.slug),
      );
    }
    if (isEos) {
      return subServices.filter((p) =>
        [
          "consultancy-motion-eos",
          "analysis-motion-eos",
          "analysis-rfe-eos",
          "dependent-eos",
        ].includes(p.slug),
      );
    }
    if (isCos) {
      return subServices.filter((p) =>
        [
          "consultancy-motion-cos",
          "analysis-motion-cos",
          "analysis-rfe-cos",
          "dependent-cos",
        ].includes(p.slug),
      );
    }
    return [];
  };

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8 text-left">
        <h1 className="font-display text-4xl font-black text-text uppercase tracking-tighter">{t.products.title}</h1>
        <p className="text-base text-text-muted font-medium mt-1">Form-based setup for main products and subproducts.</p>
      </div>

      <div className="mb-8 p-4 rounded-2xl border border-border bg-bg-subtle/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest break-all">
          Login URL: <span className="text-text normal-case font-bold">{loginUrl}</span>
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(loginUrl);
            toast.success("Login URL copied!");
          }}
          className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-primary/20 transition-all uppercase tracking-widest self-start sm:self-auto"
          title="Copy login URL"
        >
          <RiFileCopyLine className="text-sm" />
          Copy Login URL
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <button onClick={() => setSelectedMainProduct(main)} className="w-full h-11 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all">
                  Configure
                </button>
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
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-bg-subtle/50 rounded-3xl border border-border text-center">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
          <RiInformationLine className="text-lg text-primary" />
          Subproducts are enabled through this form, without manual client clicks.
        </p>
      </div>

      {selectedMainProduct && (
        <MainProductConfigModal
          mainProduct={selectedMainProduct}
          relatedProducts={getRelatedSubProducts(selectedMainProduct)}
          onClose={() => setSelectedMainProduct(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
