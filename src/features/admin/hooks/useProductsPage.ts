import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listOfficeServicePrices,
  resolveProductsOffice,
  updateServicePriceRows,
  getFlowConfig,
  cleanPrice,
  INTERVIEW_SPECIALIST_SLUGS,
  type ServicePrice,
} from "@features/admin/services/productsService";
import { useAuth } from "@shared/hooks/useAuth";
import { encodeCheckoutToken } from "@shared/utils/checkoutToken";
import { useT } from "@app/app/i18n";

export interface DraftState {
  is_active: boolean;
  price: string;
}

export type DraftMap = Record<string, DraftState>;

export function useProductsPage() {
  const t = useT("admin");
  const { user } = useAuth();

  const [resolvedOfficeId, setResolvedOfficeId] = useState<string | null>(user?.officeId ?? null);
  const [officeSlug, setOfficeSlug] = useState<string | null>(null);
  const [products, setProducts] = useState<ServicePrice[]>([]);
  const [draft, setDraft] = useState<DraftMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [productInfoItem, setProductInfoItem] = useState<ServicePrice | null>(null);

  useEffect(() => {
    resolveProductsOffice({ userId: user?.id, officeId: user?.officeId }).then((office) => {
      setResolvedOfficeId(office.officeId);
      setOfficeSlug(office.officeSlug);
    });
  }, [user?.id, user?.officeId]);

  const load = useCallback(async () => {
    if (!resolvedOfficeId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let parsed: ServicePrice[];
    try {
      parsed = await listOfficeServicePrices(resolvedOfficeId);
    } catch {
      toast.error(t.cases.messages.errorAction);
      setIsLoading(false);
      return;
    }
    setProducts(parsed);
    setDraft(
      parsed.reduce((acc, item) => {
        acc[item.id] = { is_active: item.is_active, price: item.price.toFixed(2) };
        return acc;
      }, {} as DraftMap),
    );
    setIsLoading(false);
  }, [resolvedOfficeId, t.cases.messages.errorAction]);

  useEffect(() => { void load(); }, [load]);

  const mainServices = useMemo(() => products.filter((p) => p.category === "main_visa"), [products]);
  const subServices = useMemo(() => products.filter((p) => p.category !== "main_visa"), [products]);

  const avgTicket = useMemo(() => {
    const activeMain = mainServices.filter((p) => p.is_active);
    if (activeMain.length === 0) return 0;
    return activeMain.reduce((acc, p) => acc + p.price, 0) / activeMain.length;
  }, [mainServices]);

  useEffect(() => {
    if (!selectedMainId && mainServices.length > 0) setSelectedMainId(mainServices[0].id);
    if (selectedMainId && !mainServices.some((item) => item.id === selectedMainId)) {
      setSelectedMainId(mainServices[0]?.id ?? null);
    }
  }, [mainServices, selectedMainId]);

  const getRelatedSubProducts = useCallback((mainProduct: ServicePrice): ServicePrice[] => {
    const config = getFlowConfig(mainProduct.slug);
    if (!config) return [];
    const allSlugs = [...config.phaseMap.addons, ...config.phaseMap.finalization];
    const indexBySlug = new Map(allSlugs.map((slug, idx) => [slug, idx]));
    return subServices
      .filter((p) => indexBySlug.has(p.slug))
      .sort((a, b) => (indexBySlug.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (indexBySlug.get(b.slug) ?? Number.MAX_SAFE_INTEGER));
  }, [subServices]);

  const selectedMain = mainServices.find((p) => p.id === selectedMainId) ?? null;
  const selectedFlowConfig = selectedMain ? getFlowConfig(selectedMain.slug) : null;
  const relatedProducts = selectedMain ? getRelatedSubProducts(selectedMain) : [];
  const addons = relatedProducts.filter((item) => selectedFlowConfig?.phaseMap.addons.includes(item.slug));
  const finalization = relatedProducts.filter((item) => selectedFlowConfig?.phaseMap.finalization.includes(item.slug));

  const interviewItems = addons.filter((a) => INTERVIEW_SPECIALIST_SLUGS.has(a.slug));
  const interviewGroupActive =
    interviewItems.length > 0 && interviewItems.every((i) => draft[i.id]?.is_active ?? i.is_active);
  const interviewPricesDefined = interviewItems.every((i) => {
    const p = cleanPrice(draft[i.id]?.price ?? String(i.price));
    return Number.isFinite(p) && p > 0;
  });

  const loginUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? `${window.location.origin}/track-my-visa` : "/track-my-visa";
    return resolvedOfficeId ? `${base}?office_id=${resolvedOfficeId}` : base;
  }, [resolvedOfficeId]);

  const checkoutUrl = (slug: string): string => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    if (!officeSlug || !base) return "";
    const token = encodeCheckoutToken({ office: officeSlug, product: slug, ref: user?.id || "" });
    return `${base}/l/${token}`;
  };

  const updateDraft = (id: string, patch: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveConfiguration = async () => {
    if (!selectedMain) return;
    const rowsToSave = [selectedMain, ...relatedProducts];
    for (const row of rowsToSave) {
      const price = cleanPrice(draft[row.id]?.price ?? "");
      if (!Number.isFinite(price) || price < 0) {
        toast.error(`Invalid price for ${row.name}.`);
        return;
      }
    }
    setIsSaving(true);
    try {
      await updateServicePriceRows(rowsToSave.map((row) => ({
        id: row.id,
        is_active: draft[row.id].is_active,
        price: cleanPrice(draft[row.id].price),
      })));
      toast.success("Configuration saved successfully.");
      await load();
    } catch {
      toast.error("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isLoading,
    isSaving,
    draft,
    mainServices,
    subServices,
    avgTicket,
    selectedMainId, setSelectedMainId,
    selectedMain,
    selectedFlowConfig,
    relatedProducts,
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
  };
}
