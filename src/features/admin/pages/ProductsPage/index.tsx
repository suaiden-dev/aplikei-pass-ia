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
import { cn } from "@shared/utils/cn";
import { motion } from "framer-motion";
import { Switch } from "@shared/components/atoms/switch";
import { Input } from "@shared/components/atoms/input";
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
} from "@features/admin/services/productsService";
import { useProductsPage } from "@features/admin/hooks/useProductsPage";

export default function ProductsPage() {
  const {
    isLoading,
    isSaving,
    draft,
    mainServices,
    avgTicket,
    selectedMainId, setSelectedMainId,
    selectedMain,
    selectedFlowConfig,
    addons,
    finalization,
    interviewItems,
    interviewGroupActive,
    interviewPricesDefined,
    loginUrl,
    checkoutUrl,
    updateDraft,
    saveConfiguration,
    isInterviewModalOpen, setIsInterviewModalOpen,
    productInfoItem, setProductInfoItem,
  } = useProductsPage();

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
          onClick={() => { navigator.clipboard.writeText(loginUrl); toast.success("Login URL copied!"); }}
          className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
        >
          <RiFileCopyLine className="text-sm" />
          Copy
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
                <p className="text-3xl font-semibold text-text leading-none tracking-tight">{s.value}</p>
                <p className="text-sm font-normal text-text-muted mt-1 uppercase tracking-widest">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {mainServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card rounded-[32px] border border-border">
          <RiPriceTag3Line className="text-6xl text-text-muted/20" />
          <p className="text-lg font-bold text-text-muted">No main visas found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm xl:sticky xl:top-6 xl:self-start">
            <div className="mb-4 space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Application flows
              </p>
              <p className="text-sm font-normal text-text-muted">
                Select the main visa flow to configure pricing, add-ons and finalization offers.
              </p>
              {selectedMain?.is_active && (
                <button
                  onClick={() => {
                    const url = checkoutUrl(selectedMain.slug);
                    if (!url) { toast.error("Unable to generate link. Set office slug first."); return; }
                    navigator.clipboard.writeText(url);
                    toast.success("Product link copied!");
                  }}
                  className="mt-2 h-10 rounded-xl bg-primary/10 px-4 text-xs font-semibold uppercase tracking-widest text-primary transition-all hover:bg-primary/20 inline-flex items-center gap-2"
                >
                  <RiFileCopyLine className="text-sm" />
                  Copy selected link
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {mainServices.map((main) => (
                <button
                  key={main.id}
                  type="button"
                  onClick={() => setSelectedMainId(main.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all",
                    selectedMainId === main.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border bg-bg-subtle hover:border-primary/30 hover:bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{main.name}</p>
                      <p className="mt-1 truncate text-[10px] font-normal uppercase tracking-widest text-text-muted">{main.slug}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                      main.is_active ? "border-success/20 bg-success/10 text-success" : "border-border bg-card text-text-muted",
                    )}>
                      {main.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-primary">{formatUsd(main.price)}</p>
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            {selectedMain && (
              <div className="px-6 py-5 space-y-8 bg-card rounded-3xl border border-border p-6 shadow-sm">
                {/* Phase 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">1</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Initial Phase</p>
                  </div>
                  {(selectedFlowConfig?.initialItems ?? [{ title: selectedMain.name, description: "Core service selected for this flow." }]).map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600">Included</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>

                {/* Phase 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">2</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Add-ons & Upsells</p>
                  </div>
                  {addons.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500 text-left">No add-ons mapped for this flow.</div>
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
                                  <button type="button" onClick={() => setIsInterviewModalOpen(true)} className="text-primary font-bold hover:underline leading-none">more info</button>
                                </p>
                                {(() => {
                                  const crossFlow = selectedFlowConfig?.key === "b1b2" ? "F1" : selectedFlowConfig?.key === "f1" ? "B1/B2" : null;
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
                                    <RiLockLine /> Define prices for all tiers before activating.
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setIsInterviewModalOpen(true)}
                                  className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                                  title="Configure Interview Specialist">
                                  <RiSettings3Line className="text-sm" />
                                </button>
                                <Switch
                                  checked={interviewGroupActive}
                                  disabled={!interviewPricesDefined}
                                  onCheckedChange={(checked) => { for (const gi of interviewItems) updateDraft(gi.id, { is_active: checked }); }}
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
                                  <>{" "}<button type="button" onClick={() => setProductInfoItem(item)} className="text-primary font-bold hover:underline leading-none">more info</button></>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => setProductInfoItem(item)}
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                                title="View product details">
                                <RiSettings3Line className="text-sm" />
                              </button>
                              <Switch
                                checked={draft[item.id]?.is_active ?? item.is_active}
                                onCheckedChange={(checked) => updateDraft(item.id, { is_active: checked })}
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
                        <p className="text-sm text-slate-500 mt-1">Configure prices for each coaching tier. All tiers activate and deactivate together.</p>
                      </DialogHeader>
                      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        {interviewItems.map((item) => {
                          const tier = INTERVIEW_TIER_MAP[item.slug];
                          const info = tier ? INTERVIEW_TIER_INFO[tier] : null;
                          const priceVal = draft[item.id]?.price ?? item.price.toFixed(2);
                          const parsedPrice = cleanPrice(priceVal);
                          const missingPrice = !Number.isFinite(parsedPrice) || parsedPrice <= 0;
                          return (
                            <div key={item.id} className={`rounded-xl border p-4 ${info?.borderClass ?? "border-slate-200"}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    {tier && <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${info?.badgeClass}`}>{tier}</span>}
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
                                    type="number" min="0" step="0.01" placeholder="0.00"
                                    value={priceVal}
                                    onChange={(e) => updateDraft(item.id, { price: e.target.value })}
                                    className={missingPrice ? "border-red-300 focus:border-red-400" : ""}
                                  />
                                  {missingPrice && (
                                    <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                                      <RiLockLine className="shrink-0" /> Required to activate
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                        <button type="button" onClick={() => setIsInterviewModalOpen(false)}
                          className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                          Done
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Phase 3 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-black">3</span>
                    <p className="text-sm font-semibold uppercase tracking-widest">Finalization</p>
                  </div>
                  {finalization.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500 text-left">No finalization offers mapped for this flow.</div>
                  ) : (
                    finalization.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.description || SLUG_PRODUCT_INFO[item.slug]?.description || "Final stage cross-sell opportunity."}
                              {SLUG_PRODUCT_INFO[item.slug] && (
                                <>{" "}<button type="button" onClick={() => setProductInfoItem(item)} className="text-primary font-bold hover:underline leading-none">more info</button></>
                              )}
                            </p>
                            {SLUG_PRODUCT_INFO[item.slug]?.priceWarning && (
                              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2 leading-relaxed">
                                ⚠ {SLUG_PRODUCT_INFO[item.slug]!.priceWarning}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setProductInfoItem(item)}
                              className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors"
                              title="View product details">
                              <RiSettings3Line className="text-sm" />
                            </button>
                            <Switch
                              checked={draft[item.id]?.is_active ?? item.is_active}
                              onCheckedChange={(checked) => updateDraft(item.id, { is_active: checked })}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
            <DialogTitle className="text-[20px] font-semibold text-slate-900 tracking-[-0.02em]">{productInfoItem?.name}</DialogTitle>
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
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={priceVal}
                          onChange={(e) => updateDraft(productInfoItem.id, { price: e.target.value })}
                          className={missingPrice ? "border-red-300 focus:border-red-400" : ""}
                        />
                      </div>
                      {missingPrice && (
                        <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <RiLockLine className="shrink-0" /> Define a price to enable activation.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
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
