import { useEffect, useRef, useState } from "react";
import {
  RiEyeLine,
  RiFileCopyLine,
  RiInformationLine,
  RiLoader4Line,
  RiLockLine,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiSaveLine,
  RiSettings3Line,
} from "react-icons/ri";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/components/atoms/accordion";
import { Input } from "@shared/components/atoms/input";
import { Switch } from "@shared/components/atoms/switch";
import { cn } from "@shared/utils/cn";
import {
  cleanPrice,
  formatUsd,
  INTERVIEW_SPECIALIST_SLUGS,
  INTERVIEW_TIER_INFO,
  INTERVIEW_TIER_MAP,
  SLUG_PRODUCT_INFO,
} from "@features/admin/services/productsService";
import type { ServicePrice } from "@features/admin/services/productsService";
import { useProductsPage } from "@features/admin/hooks/useProductsPage";
import { useT } from "@app/app/i18n";

export default function ProductsPage() {
  const t = useT("admin");
  const {
    isLoading,
    isSaving,
    draft,
    hasUnsavedChanges,
    mainServices,
    avgTicket,
    selectedMainId,
    setSelectedMainId,
    selectedMain,
    selectedFlowConfig,
    addons,
    finalization,
    interviewItems,
    interviewGroupActive,
    interviewPricesDefined,
    directCheckoutUrl,
    updateDraft,
    saveConfiguration,
  } = useProductsPage();
  const [expandedAddon, setExpandedAddon] = useState<string>("");
  const [expandedFinalization, setExpandedFinalization] = useState<string>("");
  const [activationErrors, setActivationErrors] = useState<Record<string, string>>({});
  const mainPriceRef = useRef<HTMLDivElement | null>(null);
  const addonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const finalizationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const productPriceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const interviewPriceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getEffectiveActive = (id: string, fallback: boolean) => draft[id]?.is_active ?? fallback;
  const getEffectivePrice = (id: string, fallback: number) => {
    const price = cleanPrice(draft[id]?.price ?? fallback.toFixed(2));
    return Number.isFinite(price) ? price : fallback;
  };
  const hasPriceWarning = (item: ServicePrice) => Boolean(SLUG_PRODUCT_INFO[item.slug]?.priceWarning);
  const hasMissingRequiredPrice = (item: ServicePrice) => {
    if (hasPriceWarning(item)) return false;
    const priceVal = draft[item.id]?.price ?? item.price.toFixed(2);
    const parsedPrice = cleanPrice(priceVal);
    return !Number.isFinite(parsedPrice) || parsedPrice <= 0;
  };
  const setActivationError = (id: string, message: string) => {
    setActivationErrors((prev) => ({ ...prev, [id]: message }));
  };
  const clearActivationError = (id: string) => {
    setActivationErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const clearAllActivationErrors = () => {
    setActivationErrors({});
  };
  const updateDraftPrice = (id: string, price: string) => {
    updateDraft(id, { price });
    clearActivationError(id);
  };
  const handleSelectMainProduct = (id: string) => {
    clearAllActivationErrors();
    setSelectedMainId(id);
  };
  const scrollToNode = (getNode: () => HTMLElement | null) => {
    window.setTimeout(() => {
      const node = getNode();
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
  };
  const bounceToggleBack = (ids: string[]) => {
    for (const id of ids) {
      updateDraft(id, { is_active: true });
    }
    window.setTimeout(() => {
      for (const id of ids) {
        updateDraft(id, { is_active: false });
      }
    }, 520);
  };
  const handleMainToggle = (item: ServicePrice, checked: boolean) => {
    if (!checked) {
      clearActivationError(item.id);
      updateDraft(item.id, { is_active: false });
      return;
    }
    if (hasMissingRequiredPrice(item)) {
      setActivationError(item.id, t.products.builder?.errorPriceGreaterThanZero || "Define a price greater than zero to activate this product.");
      bounceToggleBack([item.id]);
      setSelectedMainId(item.id);
      scrollToNode(() => mainPriceRef.current);
      return;
    }
    clearActivationError(item.id);
    updateDraft(item.id, { is_active: true });
  };
  const handleExpandableToggle = (
    item: ServicePrice,
    checked: boolean,
    section: "addons" | "finalization",
  ) => {
    if (!checked) {
      clearActivationError(item.id);
      updateDraft(item.id, { is_active: false });
      return;
    }
    if (hasMissingRequiredPrice(item)) {
      setActivationError(item.id, t.products.builder?.errorPriceGreaterThanZero || "Define a price greater than zero to activate this product.");
      bounceToggleBack([item.id]);
      if (section === "addons") {
        setExpandedAddon(item.id);
      } else {
        setExpandedFinalization(item.id);
      }
      scrollToNode(() => productPriceRefs.current[item.id]);
      return;
    }
    clearActivationError(item.id);
    updateDraft(item.id, { is_active: true });
  };
  const handleInterviewToggle = (checked: boolean) => {
    if (!checked) {
      for (const interviewItem of interviewItems) {
        clearActivationError(interviewItem.id);
        updateDraft(interviewItem.id, { is_active: false });
      }
      return;
    }
    const firstMissingPrice = interviewItems.find((item) => hasMissingRequiredPrice(item));
    if (firstMissingPrice) {
      setActivationError(firstMissingPrice.id, t.products.builder?.errorPriceGreaterThanZero || "Define a price greater than zero to activate this product.");
      bounceToggleBack(interviewItems.map((item) => item.id));
      setExpandedAddon("interview-specialist");
      scrollToNode(() => interviewPriceRefs.current[firstMissingPrice.id]);
      return;
    }
    for (const interviewItem of interviewItems) {
      clearActivationError(interviewItem.id);
      updateDraft(interviewItem.id, { is_active: true });
    }
  };

  const renderProductDetails = (item: ServicePrice) => {
    const info = SLUG_PRODUCT_INFO[item.slug];
    const priceVal = draft[item.id]?.price ?? item.price.toFixed(2);
    const priceError = activationErrors[item.id];

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-text-muted">
            {info?.description || item.description || t.products.builder?.addonsDescription || "Complementary offer in this stage."}
          </p>
          {info && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/70">{t.products.builder?.appliedTo || "Applied to"}</span>
                <p className="mt-0.5 text-xs text-text-muted">{info.appliedTo}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/70">{t.products.builder?.whenPurchased || "When purchased"}</span>
                <p className="mt-0.5 text-xs text-text-muted">{info.onPurchase}</p>
              </div>
            </div>
          )}
        </div>
        {info?.priceWarning ? (
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs leading-relaxed text-amber-800">
              <strong>{t.products.builder?.priceNotConfigurable || "Price not configurable here."}</strong><br />
              {info.priceWarning}
            </p>
          </div>
        ) : (
          <div
            ref={(node) => {
              productPriceRefs.current[item.id] = node;
            }}
            className="max-w-[200px]"
          >
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text">{t.products.builder?.priceLabel || "Price (USD)"}</p>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={priceVal}
              onChange={(e) => updateDraftPrice(item.id, e.target.value)}
              error={priceError}
            />
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!expandedAddon) return;
    const node = addonRefs.current[expandedAddon];
    if (!node) return;
    const timeoutId = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [expandedAddon]);

  useEffect(() => {
    if (!expandedFinalization) return;
    const node = finalizationRefs.current[expandedFinalization];
    if (!node) return;
    const timeoutId = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [expandedFinalization]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 px-8 py-8 font-['Inter']">
      <div className="flex flex-col gap-5">
        <div className="text-left">
          <h1 className="text-[56px] font-semibold leading-[1.02] tracking-[-0.03em] text-text">
            {t.products.builder?.title || "Products & Offer Builder"}
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] font-[500] leading-6 text-text-muted">
            {t.products.builder?.subtitle || "Configure the services, prices and upsells your clients will see during each application flow."}
          </p>
        </div>
      </div>

      <div className="mb-10 mt-12 grid grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-2 md:grid-cols-3">
        {[
          { label: t.products.builder?.stats?.mainVisas || "Main Visas", value: mainServices.length, icon: RiPriceTag3Line, bg: "bg-info/10", color: "text-info" },
          { label: t.products.builder?.stats?.active || "Active", value: mainServices.filter((p) => getEffectiveActive(p.id, p.is_active)).length, icon: RiEyeLine, bg: "bg-success/10", color: "text-success" },
          { label: t.products.builder?.stats?.avgTicket || "Avg. Ticket", value: `$${avgTicket.toFixed(0)}`, icon: RiMoneyDollarCircleLine, bg: "bg-primary/10", color: "text-primary" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bg} shadow-inner`}>
                <Icon className={`text-2xl ${stat.color}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-normal uppercase tracking-widest text-text-muted">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold leading-none tracking-tight text-text">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {mainServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[32px] border border-border bg-card py-20">
          <RiPriceTag3Line className="text-6xl text-text-muted/20" />
          <p className="text-lg font-bold text-text-muted">{t.products.builder?.noMainVisas || "No main visas found."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 rounded-[32px] border border-border bg-card p-4 shadow-sm xl:grid-cols-[360px_minmax(0,1fr)] xl:p-5">
          <aside className="rounded-[28px] bg-bg-subtle/70 p-4 xl:sticky xl:top-18 xl:self-start">
            <div className="flex h-full flex-col">
            <div className="mb-4 space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{t.products.builder?.flowsTitle || "Application flows"}</p>
              <p className="text-sm font-normal text-text-muted">
                {t.products.builder?.flowsSubtitle || "Select the main visa flow to configure pricing, add-ons and finalization offers."}
              </p>
            </div>

            <div className="overflow-hidden rounded-[24px] bg-card ring-1 ring-border">
              {mainServices.map((main) => (
                <div
                  key={main.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectMainProduct(main.id)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    handleSelectMainProduct(main.id);
                  }}
                  className={cn(
                    "relative cursor-pointer px-4 py-4 text-left transition-all",
                    selectedMainId === main.id
                      ? "bg-primary/[0.07]"
                      : "bg-transparent hover:bg-bg-subtle",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={cn(
                        "truncate text-sm font-semibold",
                        selectedMainId === main.id ? "text-text" : "text-text",
                      )}>{main.name}</p>
                      <p className="mt-1 truncate text-[10px] font-normal uppercase tracking-widest text-text-muted">{main.slug}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                          getEffectiveActive(main.id, main.is_active)
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-border bg-card text-text-muted",
                        )}
                      >
                        {getEffectiveActive(main.id, main.is_active) 
                          ? (t.products.builder?.statusActive || "Active") 
                          : (t.products.builder?.statusInactive || "Inactive")}
                      </span>
                      <span
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="inline-flex"
                      >
                        <Switch
                          checked={getEffectiveActive(main.id, main.is_active)}
                          onCheckedChange={(checked) => handleMainToggle(main, checked)}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-primary">
                    {formatUsd(getEffectivePrice(main.id, main.price))}
                  </p>
                  {main !== mainServices[mainServices.length - 1] && (
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 pt-2 space-y-3 xl:mt-auto xl:pt-3">
              {hasUnsavedChanges && (
                <div className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-amber-800">
                  <RiInformationLine className="shrink-0 text-sm" />
                  {t.products.builder?.draftMode || "Draft Mode"}
                  <span className="whitespace-nowrap font-medium normal-case tracking-normal text-amber-700">
                    {t.products.builder?.unsavedChanges || "Unsaved changes on this page."}
                  </span>
                </div>
              )}
              <button
                onClick={() => void saveConfiguration()}
                disabled={isSaving || !selectedMain}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-[700] text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                {isSaving ? <RiLoader4Line className="animate-spin" /> : <RiSaveLine />}
                {isSaving ? (t.products.builder?.savingBtn || "Saving...") : (t.products.builder?.saveBtn || "Save Configuration")}
              </button>
            </div>
            </div>
          </aside>

          <div className="min-w-0">
            {selectedMain && (
              <div className="space-y-8 rounded-[28px] bg-bg-subtle/60 p-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-black text-white">1</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">{t.products.builder?.phases?.initial || "Initial Phase"}</p>
                  </div>
                  {(() => {
                    const priceVal = draft[selectedMain.id]?.price ?? selectedMain.price.toFixed(2);
                    const mainPriceError = activationErrors[selectedMain.id];
                    const productCheckoutUrl = directCheckoutUrl(selectedMain.slug);
                    const isSelectedActive = getEffectiveActive(selectedMain.id, selectedMain.is_active);

                    return (
                      <div className="rounded-xl bg-card p-4 text-left ring-1 ring-border/80">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-text">{selectedMain.name}</p>
                            <p className="mt-1 text-xs text-text-muted">
                              {t.products.builder?.phases?.initialDesc || "Main product price used by this checkout link."}
                            </p>
                          </div>
                          <div ref={mainPriceRef} className="w-full sm:w-[160px]">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text">
                              {t.products.builder?.priceLabel || "Price (USD)"}
                            </p>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={priceVal}
                              onChange={(e) => updateDraftPrice(selectedMain.id, e.target.value)}
                              error={mainPriceError}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-text">{t.products.builder?.checkoutLink || "Checkout link"}</p>
                            <button
                              type="button"
                              disabled={!productCheckoutUrl}
                              onClick={() => {
                                if (!productCheckoutUrl) {
                                  toast.error(t.products.messages.noSlug);
                                  return;
                                }
                                navigator.clipboard.writeText(productCheckoutUrl);
                                toast.success(t.products.messages.linkCopied);
                              }}
                              className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-subtle hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                              title={t.products.builder?.copyLinkTitle || "Copy checkout link"}
                            >
                              <RiFileCopyLine className="text-sm" />
                            </button>
                          </div>
                          {productCheckoutUrl ? (
                            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-text-muted">
                              {productCheckoutUrl}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs font-medium text-amber-700">
                              {t.products.builder?.setSlugWarning || "Set the office slug before sharing this product link."}
                            </p>
                          )}
                          {!isSelectedActive && productCheckoutUrl && (
                            <p className="mt-2 text-[11px] font-medium text-amber-700">
                              {t.products.builder?.inactiveWarning || "This product is inactive. Activate it before sharing the link."}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {(selectedFlowConfig?.initialItems ?? [{ title: selectedMain.name, description: t.products.builder?.includedDescription || "Core service selected for this flow." }]).map((item) => (
                    <div key={item.title} className="rounded-xl bg-card p-3 text-left ring-1 ring-border/70">
                      <p className="text-sm font-semibold text-text">
                        {item.title}
                        <span className="ml-2 rounded bg-bg-subtle px-2 py-0.5 text-[10px] text-text-muted">{t.products.builder?.includedBadge || "Included"}</span>
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-black text-white">2</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">{t.products.builder?.phases?.addons || "Add-ons & Upsells"}</p>
                  </div>
                  {addons.length === 0 ? (
                    <div className="rounded-xl bg-card p-3 text-left text-xs font-bold text-text-muted ring-1 ring-border/70">{t.products.builder?.phases?.addonsEmpty || "No add-ons mapped for this flow."}</div>
                  ) : (() => {
                    let interviewRendered = false;
                    return addons.map((item) => {
                      if (INTERVIEW_SPECIALIST_SLUGS.has(item.slug)) {
                        if (interviewRendered) return null;
                        interviewRendered = true;
                        return (
                          <Accordion
                            key="interview-specialist"
                            ref={(node) => {
                              addonRefs.current["interview-specialist"] = node;
                            }}
                            type="single"
                            collapsible
                            value={expandedAddon}
                            onValueChange={setExpandedAddon}
                            className="rounded-xl bg-card px-4 ring-1 ring-border/70"
                          >
                            <AccordionItem value="interview-specialist" className="border-none">
                              <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-semibold text-text">{t.products.builder?.interviewSpecialist?.title || "Interview Specialist"}</p>
                                  <p className="mt-0.5 text-xs text-text-muted">
                                    {t.products.builder?.interviewSpecialist?.subtitle || "Bronze, Silver & Gold coaching all tiers activate together."}
                                  </p>
                                  {(() => {
                                    const crossFlow = selectedFlowConfig?.key === "b1b2" ? "F1" : selectedFlowConfig?.key === "f1" ? "B1/B2" : null;
                                    return crossFlow ? (
                                        <div className="mt-2 rounded-xl bg-amber-50 p-3">
                                          <p className="text-xs text-amber-800">
                                          <strong>Important:</strong> {t.products.builder?.interviewSpecialist?.importantNote?.replace("{crossFlow}", crossFlow) || `Any changes to this product, including activation status or pricing, will be automatically applied to the ${crossFlow} product as well.`}
                                        </p>
                                      </div>
                                    ) : null;
                                  })()}
                                  {!interviewPricesDefined && (
                                    <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-500">
                                      <RiLockLine /> {t.products.builder?.interviewSpecialist?.lockWarning || "Define prices for all tiers before activating."}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center justify-end gap-2 sm:justify-start">
                                  <AccordionTrigger className="h-8 rounded-lg bg-bg-subtle px-3 py-0 text-xs font-semibold text-text-muted hover:bg-bg hover:text-primary">
                                    {t.products.builder?.configureBtn || "Configure"}
                                  </AccordionTrigger>
                                  <Switch
                                    checked={interviewGroupActive}
                                    onCheckedChange={handleInterviewToggle}
                                  />
                                </div>
                              </div>
                              <AccordionContent className="pb-4">
                                <div className="space-y-4 border-t border-border pt-4">
                                  {interviewItems.map((interviewItem) => {
                                    const tier = INTERVIEW_TIER_MAP[interviewItem.slug];
                                    const info = tier ? INTERVIEW_TIER_INFO[tier] : null;
                                    const priceVal = draft[interviewItem.id]?.price ?? interviewItem.price.toFixed(2);
                                    const priceError = activationErrors[interviewItem.id];

                                    return (
                                      <div key={interviewItem.id} className="rounded-xl bg-bg-subtle p-4 ring-1 ring-border/60">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="flex-1 space-y-3 text-left">
                                            <div className="flex items-center gap-2">
                                              {tier && (
                                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${info?.badgeClass}`}>
                                                  {tier}
                                                </span>
                                              )}
                                              <p className="text-sm font-semibold text-text">{interviewItem.name}</p>
                                            </div>
                                            {info && (
                                              <>
                                                <p className="text-xs leading-relaxed text-text-muted">{info.description}</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                  <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/70">{t.products.builder?.appliedTo || "Applied to"}</span>
                                                    <p className="mt-0.5 text-xs text-text-muted">{info.appliedTo}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/70">{t.products.builder?.whenPurchased || "When purchased"}</span>
                                                    <p className="mt-0.5 text-xs text-text-muted">{info.onPurchase}</p>
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          <div
                                            ref={(node) => {
                                              interviewPriceRefs.current[interviewItem.id] = node;
                                            }}
                                            className="w-full sm:w-[140px]"
                                          >
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text">{t.products.builder?.priceLabel || "Price (USD)"}</p>
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              placeholder="0.00"
                                              value={priceVal}
                                              onChange={(e) => updateDraftPrice(interviewItem.id, e.target.value)}
                                              error={priceError}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      }

                      return (
                        <Accordion
                          key={item.id}
                          ref={(node) => {
                            addonRefs.current[item.id] = node;
                          }}
                          type="single"
                          collapsible
                          value={expandedAddon}
                          onValueChange={setExpandedAddon}
                          className="rounded-xl bg-card px-4 ring-1 ring-border/70"
                        >
                          <AccordionItem value={item.id} className="border-none">
                            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1 text-left">
                                <p className="text-sm font-semibold text-text">{item.name}</p>
                                <p className="mt-0.5 text-xs text-text-muted">
                                  {item.description || SLUG_PRODUCT_INFO[item.slug]?.description || "Complementary offer in this stage."}
                                </p>
                              </div>
                              <div className="flex items-center justify-end gap-2 sm:justify-start">
                                <AccordionTrigger className="h-8 rounded-lg bg-bg-subtle px-3 py-0 text-xs font-semibold text-text-muted hover:bg-bg hover:text-primary">
                                  {t.products.builder?.configureBtn || "Configure"}
                                </AccordionTrigger>
                                <Switch
                                  checked={draft[item.id]?.is_active ?? item.is_active}
                                  onCheckedChange={(checked) => handleExpandableToggle(item, checked, "addons")}
                                />
                              </div>
                            </div>
                            <AccordionContent className="pb-4">
                              <div className="border-t border-border pt-4">
                                {renderProductDetails(item)}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    });
                  })()}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-black text-white">3</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">{t.products.builder?.phases?.finalization || "Finalization"}</p>
                  </div>
                  {finalization.length === 0 ? (
                    <div className="rounded-xl bg-card p-3 text-left text-xs font-bold text-text-muted ring-1 ring-border/70">{t.products.builder?.phases?.finalizationEmpty || "No finalization offers mapped for this flow."}</div>
                  ) : (
                    finalization.map((item) => (
                      <Accordion
                        key={item.id}
                        ref={(node) => {
                          finalizationRefs.current[item.id] = node;
                        }}
                        type="single"
                        collapsible
                        value={expandedFinalization}
                        onValueChange={setExpandedFinalization}
                        className="rounded-xl bg-card px-4 ring-1 ring-border/70"
                      >
                        <AccordionItem value={item.id} className="border-none">
                          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1 text-left">
                              <p className="text-sm font-semibold text-text">{item.name}</p>
                              <p className="mt-0.5 text-xs text-text-muted">
                                {item.description || SLUG_PRODUCT_INFO[item.slug]?.description || "Final stage cross-sell opportunity."}
                              </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 sm:justify-start">
                              <AccordionTrigger className="h-8 rounded-lg bg-bg-subtle px-3 py-0 text-xs font-semibold text-text-muted hover:bg-bg hover:text-primary">
                                {t.products.builder?.configureBtn || "Configure"}
                              </AccordionTrigger>
                              <Switch
                                  checked={draft[item.id]?.is_active ?? item.is_active}
                                  onCheckedChange={(checked) => handleExpandableToggle(item, checked, "finalization")}
                              />
                            </div>
                          </div>
                          <AccordionContent className="pb-4">
                            <div className="border-t border-border pt-4">
                              {renderProductDetails(item)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
