import { useState } from "react";
import {
  RiFileCopyLine,
  RiLoader4Line,
  RiSaveLine,
  RiSettings3Line,
  RiLockLine,
  RiGraduationCapLine,
  RiBriefcaseLine,
  RiTimeLine,
  RiExchangeLine,
  RiArrowDownSLine,
  RiCheckLine,
} from "react-icons/ri";
import { toast } from "sonner";
import { cn } from "@shared/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@shared/components/atoms/switch";
import { Input } from "@shared/components/atoms/input";
import { Label } from "@shared/components/atoms/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";
import {
  INTERVIEW_SPECIALIST_SLUGS,
  INTERVIEW_TIER_MAP,
  INTERVIEW_TIER_INFO,
  SLUG_PRODUCT_INFO,
  cleanPrice,
  formatUsd,
  getFlowConfig,
} from "@features/admin/services/productsService";
import { useProductsPage } from "@features/admin/hooks/useProductsPage";
import { useT } from "@app/app/i18n";

// ─── Flow icon mapping ──────────────────────────────────────────────────────────

const FLOW_ICONS: Record<string, React.ReactNode> = {
  f1: <RiGraduationCapLine className="h-5 w-5" />,
  b1b2: <RiBriefcaseLine className="h-5 w-5" />,
  eos: <RiTimeLine className="h-5 w-5" />,
  cos: <RiExchangeLine className="h-5 w-5" />,
};

function getFlowIcon(slug: string): React.ReactNode {
  const cfg = getFlowConfig(slug);
  return cfg ? FLOW_ICONS[cfg.key] ?? null : null;
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const t = useT("admin");
  const {
    isLoading,
    isSaving,
    draft,
    mainServices,
    subServices,
    selectedMainId, setSelectedMainId,
    selectedMain,
    selectedFlowConfig,
    addons,
    finalization,
    interviewItems,
    interviewGroupActive,
    interviewPricesDefined,
    directCheckoutUrl,
    updateDraft,
    saveAllConfiguration,
    isInterviewModalOpen, setIsInterviewModalOpen,
    productInfoItem, setProductInfoItem,
  } = useProductsPage();

  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);

  const getEffectiveActive = (id: string, fallback: boolean) => draft[id]?.is_active ?? fallback;
  const getEffectivePrice = (id: string, fallback: number) => {
    const price = cleanPrice(draft[id]?.price ?? fallback.toFixed(2));
    return Number.isFinite(price) ? price : fallback;
  };

  // When expanding a flow, also select it so add-ons/finalization are computed
  const toggleExpand = (mainId: string) => {
    if (expandedFlow === mainId) {
      setExpandedFlow(null);
    } else {
      setExpandedFlow(mainId);
      setSelectedMainId(mainId);
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
    <div className="px-6 py-8 w-full max-w-3xl mx-auto space-y-6 font-['Inter']">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text tracking-tight">Your Services</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">Set pricing for each visa you offer. Toggle to activate.</p>
        </div>
        <button
          onClick={() => void saveAllConfiguration()}
          disabled={isSaving}
          className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 inline-flex items-center gap-2 shrink-0"
        >
          {isSaving ? <RiLoader4Line className="animate-spin" /> : <RiSaveLine />}
          Save
        </button>
      </div>

      {/* Service cards */}
      <div className="space-y-3">
        {mainServices.map((main, idx) => {
          const isActive = getEffectiveActive(main.id, main.is_active);
          const price = getEffectivePrice(main.id, main.price);
          const priceVal = draft[main.id]?.price ?? main.price.toFixed(2);
          const parsedPrice = cleanPrice(priceVal);
          const invalidPrice = !Number.isFinite(parsedPrice) || parsedPrice < 0;
          const checkoutUrl = directCheckoutUrl(main.slug);
          const icon = getFlowIcon(main.slug);
          const isExpanded = expandedFlow === main.id;
          const flowConfig = getFlowConfig(main.slug);

          // Get add-ons and finalization for this flow
          const flowAddons = flowConfig
            ? subServices.filter((p) => flowConfig.phaseMap.addons.includes(p.slug))
            : [];
          const flowFinalization = flowConfig
            ? subServices.filter((p) => flowConfig.phaseMap.finalization.includes(p.slug))
            : [];
          const hasAdvanced = flowAddons.length > 0 || flowFinalization.length > 0;

          return (
            <motion.div
              key={main.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              {/* Main row */}
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "bg-bg-subtle text-text-muted",
                  )}>
                    {icon}
                  </div>

                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{main.name}</p>
                    <p className={cn(
                      "text-xs font-medium mt-0.5",
                      isActive ? "text-success" : "text-text-muted",
                    )}>
                      {isActive ? "Active" : "Inactive"}
                    </p>
                  </div>

                  {/* Price input */}
                  <div className="w-[120px] shrink-0">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={priceVal}
                        onChange={(e) => updateDraft(main.id, { price: e.target.value })}
                        className={cn(
                          "pl-6 h-9 text-sm rounded-lg",
                          invalidPrice && "border-danger focus:border-danger",
                        )}
                      />
                    </div>
                  </div>

                  {/* Toggle */}
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => updateDraft(main.id, { is_active: checked })}
                  />
                </div>

                {/* Checkout link + expand button */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    disabled={!checkoutUrl || !isActive}
                    onClick={() => {
                      if (!checkoutUrl) return;
                      navigator.clipboard.writeText(checkoutUrl);
                      toast.success(t.products.messages.linkCopied);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium transition-colors rounded-lg px-2.5 py-1.5",
                      isActive && checkoutUrl
                        ? "text-primary hover:bg-primary/5 cursor-pointer"
                        : "text-text-muted/50 cursor-not-allowed",
                    )}
                  >
                    <RiFileCopyLine className="h-3.5 w-3.5" />
                    Copy checkout link
                  </button>

                  {hasAdvanced && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(main.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text transition-colors rounded-lg px-2.5 py-1.5"
                    >
                      <RiSettings3Line className="h-3.5 w-3.5" />
                      Add-ons & extras
                      <RiArrowDownSLine className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable advanced section */}
              <AnimatePresence>
                {isExpanded && hasAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border bg-bg-subtle/50 px-5 py-4 space-y-4">

                      {/* Add-ons */}
                      {flowAddons.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Add-ons</p>
                          {(() => {
                            let interviewRendered = false;
                            return flowAddons.map((item) => {
                              if (INTERVIEW_SPECIALIST_SLUGS.has(item.slug)) {
                                if (interviewRendered) return null;
                                interviewRendered = true;
                                return (
                                  <div key="interview" className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-text">Interview Specialist</p>
                                      <p className="text-xs text-text-muted mt-0.5">
                                        Bronze, Silver & Gold coaching tiers.{" "}
                                        <button type="button" onClick={() => setIsInterviewModalOpen(true)} className="text-primary font-semibold hover:underline">Configure</button>
                                      </p>
                                      {!interviewPricesDefined && (
                                        <p className="text-[11px] text-danger font-medium mt-1 flex items-center gap-1">
                                          <RiLockLine className="shrink-0" /> Set prices for all tiers first.
                                        </p>
                                      )}
                                    </div>
                                    <Switch
                                      checked={interviewGroupActive}
                                      disabled={!interviewPricesDefined}
                                      onCheckedChange={(checked) => { for (const gi of interviewItems) updateDraft(gi.id, { is_active: checked }); }}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div key={item.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text">{item.name}</p>
                                    {SLUG_PRODUCT_INFO[item.slug] && (
                                      <button type="button" onClick={() => setProductInfoItem(item)} className="text-xs text-primary font-semibold hover:underline mt-0.5">
                                        Details & price
                                      </button>
                                    )}
                                  </div>
                                  <Switch
                                    checked={draft[item.id]?.is_active ?? item.is_active}
                                    onCheckedChange={(checked) => updateDraft(item.id, { is_active: checked })}
                                  />
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}

                      {/* Finalization */}
                      {flowFinalization.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Post-process</p>
                          {flowFinalization.map((item) => (
                            <div key={item.id} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text">{item.name}</p>
                                {SLUG_PRODUCT_INFO[item.slug] && (
                                  <button type="button" onClick={() => setProductInfoItem(item)} className="text-xs text-primary font-semibold hover:underline mt-0.5">
                                    Details & price
                                  </button>
                                )}
                              </div>
                              <Switch
                                checked={draft[item.id]?.is_active ?? item.is_active}
                                onCheckedChange={(checked) => updateDraft(item.id, { is_active: checked })}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {mainServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card rounded-2xl border border-border">
          <RiSettings3Line className="text-5xl text-text-muted/20" />
          <p className="text-base font-semibold text-text-muted">No services found.</p>
        </div>
      )}

      {/* ── Interview Specialist Modal ──────────────────────────────────────────── */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-semibold text-text tracking-tight">
              Interview Specialist
            </DialogTitle>
            <p className="text-sm text-text-muted mt-1">Set a price for each coaching tier. All tiers activate together.</p>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {interviewItems.map((item) => {
              const tier = INTERVIEW_TIER_MAP[item.slug];
              const info = tier ? INTERVIEW_TIER_INFO[tier] : null;
              const priceVal = draft[item.id]?.price ?? item.price.toFixed(2);
              const parsedPrice = cleanPrice(priceVal);
              const missingPrice = !Number.isFinite(parsedPrice) || parsedPrice <= 0;
              return (
                <div key={item.id} className={`rounded-xl border p-4 ${info?.borderClass ?? "border-border"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {tier && <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${info?.badgeClass}`}>{tier}</span>}
                        <p className="text-sm font-semibold text-text">{item.name}</p>
                      </div>
                      {info && (
                        <p className="text-xs text-text-muted leading-relaxed">{info.description}</p>
                      )}
                    </div>
                    <div className="w-[120px] shrink-0">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Price (USD)</Label>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        value={priceVal}
                        onChange={(e) => updateDraft(item.id, { price: e.target.value })}
                        className={cn("h-9 text-sm", missingPrice && "border-danger focus:border-danger")}
                      />
                      {missingPrice && (
                        <p className="text-[10px] text-danger font-medium mt-1 flex items-center gap-1">
                          <RiLockLine className="shrink-0" /> Required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 border-t border-border bg-bg-subtle flex justify-end">
            <button type="button" onClick={() => setIsInterviewModalOpen(false)}
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Product Info Modal ─────────────────────────────────────────────────── */}
      <Dialog open={!!productInfoItem} onOpenChange={(open) => { if (!open) setProductInfoItem(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-semibold text-text tracking-tight">{productInfoItem?.name}</DialogTitle>
          </DialogHeader>
          {productInfoItem && (() => {
            const info = SLUG_PRODUCT_INFO[productInfoItem.slug];
            const priceVal = draft[productInfoItem.id]?.price ?? productInfoItem.price.toFixed(2);
            const parsedPrice = cleanPrice(priceVal);
            const missingPrice = !Number.isFinite(parsedPrice) || parsedPrice <= 0;
            return (
              <div className="px-6 py-5 space-y-4">
                {info && (
                  <p className="text-sm text-text-muted leading-relaxed">{info.description}</p>
                )}
                <div className="pt-2 border-t border-border">
                  {info?.priceWarning ? (
                    <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
                      <p className="text-xs text-warning leading-relaxed">
                        <strong>⚠ Price set per case.</strong><br />
                        {info.priceWarning}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">Price (USD)</Label>
                      <div className="w-[140px]">
                        <Input
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={priceVal}
                          onChange={(e) => updateDraft(productInfoItem.id, { price: e.target.value })}
                          className={cn("h-9 text-sm", missingPrice && "border-danger focus:border-danger")}
                        />
                      </div>
                      {missingPrice && (
                        <p className="text-[10px] text-danger font-medium mt-1 flex items-center gap-1">
                          <RiLockLine className="shrink-0" /> Set a price to activate.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}
          <div className="px-6 py-4 border-t border-border bg-bg-subtle flex justify-end">
            <button type="button" onClick={() => setProductInfoItem(null)}
              className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
