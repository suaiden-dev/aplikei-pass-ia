import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  RiGraduationCapLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiExchangeLine,
  RiLoader4Line,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiSaveLine,
} from "react-icons/ri";
import { cn } from "@shared/utils/cn";
import { useAuth } from "@shared/hooks/useAuth";
import { Label } from "@shared/components/atoms/label";
import { Input } from "@shared/components/atoms/input";
import { Button } from "@shared/components/atoms/button";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";
import {
  resolveProductsOffice,
  listOfficeServicePrices,
  updateServicePriceRows,
  cleanPrice,
  getFlowConfig,
  type ServicePrice,
} from "@features/admin/services/productsService";

// Flow ordering: F-1, B1/B2, EOS, COS
const FLOW_ORDER = ["f1", "b1b2", "eos", "cos"] as const;
const DRAFTS_STORAGE_KEY = "admin_onboarding_products_drafts_v1";
type FlowKey = (typeof FLOW_ORDER)[number];

const FLOW_META: Record<FlowKey, {
  icon: React.ReactNode;
  label: string;
  description: string;
}> = {
  f1: {
    icon: <RiGraduationCapLine className="h-6 w-6" />,
    label: "F-1 Student Visa",
    description: "Academic visa for students enrolling in US universities and colleges.",
  },
  b1b2: {
    icon: <RiBriefcaseLine className="h-6 w-6" />,
    label: "B1/B2 Visitor Visa",
    description: "Temporary visa for business travel and tourism to the United States.",
  },
  eos: {
    icon: <RiTimeLine className="h-6 w-6" />,
    label: "Extension of Status",
    description: "Extend your current visa status beyond the authorized stay period.",
  },
  cos: {
    icon: <RiExchangeLine className="h-6 w-6" />,
    label: "Change of Status",
    description: "Switch from one visa category to another without leaving the US.",
  },
};

function getFlowKey(slug: string): FlowKey | null {
  const cfg = getFlowConfig(slug);
  if (!cfg) return null;
  return cfg.key as FlowKey;
}

function sortMainServices(services: ServicePrice[]): ServicePrice[] {
  return [...services].sort((a, b) => {
    const ai = FLOW_ORDER.indexOf(getFlowKey(a.slug) as FlowKey);
    const bi = FLOW_ORDER.indexOf(getFlowKey(b.slug) as FlowKey);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

interface ProductsStepProps {
  onSuccess: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export function ProductsStep({ onSuccess, onBack, onSkip }: ProductsStepProps) {
  const { user } = useAuth();
  const [subStep, setSubStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [drafts, setDrafts] = React.useState<Record<string, { is_active: boolean; price: string }>>({});
  const [saving, setSaving] = React.useState(false);
  const draftsInitialized = React.useRef(false);

  const { data: office } = useQuery({
    queryKey: adminQueryKeys.officeProductsResolved(user?.id, user?.officeId ?? undefined),
    queryFn: () => resolveProductsOffice({ userId: user?.id, officeId: user?.officeId ?? undefined }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const resolvedOfficeId = office?.officeId ?? null;

  const { data: products = [], isLoading } = useQuery({
    queryKey: adminQueryKeys.officeProducts(resolvedOfficeId ?? undefined),
    queryFn: () => listOfficeServicePrices(resolvedOfficeId!),
    enabled: !!resolvedOfficeId,
  });

  const mainServices = React.useMemo(
    () => sortMainServices(products.filter((p) => p.category === "main_visa")),
    [products],
  );

  React.useEffect(() => {
    if (draftsInitialized.current || mainServices.length === 0) return;
    // Try to restore drafts from localStorage first (survives page reloads)
    const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const allKeysMatch = mainServices.every((svc) => svc.id in parsed);
        if (allKeysMatch) {
          setDrafts(parsed);
          draftsInitialized.current = true;
          return;
        }
      } catch {
        // ignore parse errors, fall through to DB values
      }
    }
    const initial: Record<string, { is_active: boolean; price: string }> = {};
    for (const svc of mainServices) {
      initial[svc.id] = { is_active: svc.is_active, price: svc.price > 0 ? svc.price.toFixed(2) : "" };
    }
    setDrafts(initial);
    draftsInitialized.current = true;
  }, [mainServices]);

  // Persist drafts to localStorage on every change
  React.useEffect(() => {
    if (!draftsInitialized.current || Object.keys(drafts).length === 0) return;
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const current = mainServices[subStep] ?? null;
  const currentKey = current ? getFlowKey(current.slug) : null;
  const meta = currentKey ? FLOW_META[currentKey] : null;
  const draft = current ? (drafts[current.id] ?? { is_active: false, price: "" }) : null;

  const goTo = (next: number) => {
    setDirection(next > subStep ? 1 : -1);
    setSubStep(next);
  };

  const handleNext = () => {
    if (!current || !draft) return;
    if (draft.is_active) {
      const price = cleanPrice(draft.price);
      if (!Number.isFinite(price) || price <= 0) {
        toast.error(`Enter a valid price for ${meta?.label ?? current.name}.`);
        return;
      }
    }
    goTo(subStep + 1);
  };

  const handleSave = async () => {
    if (!current || !draft) return;
    // Validate last step
    if (draft.is_active) {
      const price = cleanPrice(draft.price);
      if (!Number.isFinite(price) || price <= 0) {
        toast.error(`Enter a valid price for ${meta?.label ?? current.name}.`);
        return;
      }
    }
    setSaving(true);
    try {
      const rows = mainServices.map((svc) => {
        const d = drafts[svc.id] ?? { is_active: svc.is_active, price: String(svc.price) };
        const price = cleanPrice(d.price);
        return { id: svc.id, is_active: d.is_active, price: Number.isFinite(price) && price > 0 ? price : 0 };
      });
      await updateServicePriceRows(rows);
      localStorage.removeItem(DRAFTS_STORAGE_KEY);
      toast.success("Services configured!");
      onSuccess();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (patch: Partial<{ is_active: boolean; price: string }>) => {
    if (!current) return;
    setDrafts((prev) => ({ ...prev, [current.id]: { ...(prev[current.id] ?? { is_active: false, price: "" }), ...patch } }));
  };

  const handleSkip = () => {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
    onSkip?.();
  };

  if (isLoading || !office) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  if (mainServices.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-text-muted">No services found for your office.</p>
        <Button onClick={onSuccess} className="rounded-xl">Continue anyway</Button>
      </div>
    );
  }

  const isLast = subStep === mainServices.length - 1;

  const variants = {
    enter: (d: number) => ({ x: d * 30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -30, opacity: 0 }),
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-text">Configure your services</h2>
        <p className="text-sm text-text-muted">Set the price for each visa flow you want to offer.</p>
      </div>

      {/* Sub-step progress */}
      <div className="flex items-center gap-2 justify-center">
        {mainServices.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < subStep ? "w-6 bg-primary" :
              i === subStep ? "w-4 bg-primary/70" :
              "w-4 bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-center text-xs text-text-muted">
        {subStep + 1} of {mainServices.length}
      </p>

      {/* Animated content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={subStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {current && meta && draft && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                {/* Visa header */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text">{meta.label}</h3>
                    <p className="text-xs text-text-muted leading-relaxed mt-0.5">{meta.description}</p>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">Offer this service</p>
                    <p className="text-xs text-text-muted mt-0.5">Clients will see this in your checkout.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.is_active}
                    onClick={() => updateDraft({ is_active: !draft.is_active })}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      draft.is_active ? "bg-primary" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200",
                        draft.is_active ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                {/* Price */}
                <div className={cn("space-y-1.5 transition-opacity duration-200", !draft.is_active && "opacity-40 pointer-events-none")}>
                  <Label htmlFor={`price-${current.id}`} className="text-xs">
                    Price (USD) <span className="text-danger">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">$</span>
                    <Input
                      id={`price-${current.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.price}
                      onChange={(e) => updateDraft({ price: e.target.value })}
                      placeholder="0.00"
                      disabled={!draft.is_active}
                      className="pl-7 rounded-xl border-border bg-bg-subtle"
                    />
                  </div>
                  {draft.is_active && draft.price && cleanPrice(draft.price) <= 0 && (
                    <p className="text-[11px] text-danger font-semibold">Price must be greater than $0.</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pb-2">
                {subStep > 0 ? (
                  <Button variant="ghost" onClick={() => goTo(subStep - 1)} className="rounded-xl text-sm">
                    <RiArrowLeftLine className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                ) : onBack ? (
                  <Button variant="ghost" onClick={onBack} className="rounded-xl text-sm">
                    <RiArrowLeftLine className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {isLast ? (
                  <Button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="rounded-xl px-7 h-11 text-sm font-semibold shadow-lg shadow-primary/20"
                  >
                    {saving ? (
                      <><RiLoader4Line className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><RiSaveLine className="mr-1.5 h-4 w-4" /> Save & Continue</>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="rounded-xl px-7 h-11 text-sm font-semibold">
                    Next <RiArrowRightLine className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Skip link */}
              {onSkip && (
                <div className="text-center pb-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-text-muted hover:text-text underline-offset-2 hover:underline transition-colors"
                  >
                    Skip for now — I'll configure later
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
