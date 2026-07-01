import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listOfficeServicePrices,
  resolveProductsOffice,
  updateServicePriceRows,
  getFlowConfig,
  cleanPrice,
  INTERVIEW_SPECIALIST_SLUGS,
} from "@features/admin/services/productsService";
import type { ServicePrice } from "@features/admin/services/productsService";
import { useAuth } from "@shared/hooks/useAuth";
import { encodeCheckoutToken } from "@shared/utils/checkoutToken";
import { useT } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";

export interface DraftState {
  is_active: boolean;
  price: string;
}

export type DraftMap = Record<string, DraftState>;

export function useProductsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<DraftMap>({});
  const draftInitialized = useRef(false);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);

  const { data: office } = useQuery({
    queryKey: adminQueryKeys.officeProductsResolved(user?.id, user?.officeId ?? undefined),
    queryFn: () => resolveProductsOffice({ userId: user?.id, officeId: user?.officeId ?? undefined }),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const resolvedOfficeId = office?.officeId ?? null;
  const officeSlug = office?.officeSlug ?? null;

  const { data: products = [], isLoading } = useQuery({
    queryKey: adminQueryKeys.officeProducts(resolvedOfficeId ?? undefined),
    queryFn: () => listOfficeServicePrices(resolvedOfficeId!),
    enabled: !!resolvedOfficeId,
  });

  useEffect(() => {
    if (draftInitialized.current || products.length === 0) return;
    setDraft(products.reduce((acc, item) => {
      acc[item.id] = { is_active: item.is_active, price: item.price.toFixed(2) };
      return acc;
    }, {} as DraftMap));
    draftInitialized.current = true;
  }, [products]);

  const mainServices = useMemo(() => products.filter((p) => p.category === "main_visa"), [products]);
  const subServices = useMemo(() => products.filter((p) => p.category !== "main_visa"), [products]);

  const avgTicket = useMemo(() => {
    const activeMain = mainServices.filter((p) => draft[p.id]?.is_active ?? p.is_active);
    if (activeMain.length === 0) return 0;
    return activeMain.reduce((acc, p) => {
      const price = cleanPrice(draft[p.id]?.price ?? p.price.toFixed(2));
      return acc + (Number.isFinite(price) ? price : p.price);
    }, 0) / activeMain.length;
  }, [draft, mainServices]);

  const hasUnsavedChanges = useMemo(() => {
    if (products.length === 0) return false;
    return products.some((product) => {
      const draftRow = draft[product.id];
      if (!draftRow) return false;
      const draftPrice = cleanPrice(draftRow.price);
      return draftRow.is_active !== product.is_active || draftPrice !== product.price;
    });
  }, [draft, products]);

  useEffect(() => {
    if (!selectedMainId && mainServices.length > 0) setSelectedMainId(mainServices[0].id);
    if (selectedMainId && !mainServices.some((item) => item.id === selectedMainId)) {
      setSelectedMainId(mainServices[0]?.id ?? null);
    }
  }, [mainServices, selectedMainId]);

  const getRelatedSubProducts = (mainProduct: ServicePrice): ServicePrice[] => {
    const config = getFlowConfig(mainProduct.slug);
    if (!config) return [];
    const allSlugs = [...config.phaseMap.addons, ...config.phaseMap.finalization];
    const indexBySlug = new Map(allSlugs.map((slug, idx) => [slug, idx]));
    return subServices
      .filter((p) => indexBySlug.has(p.slug))
      .sort((a, b) => (indexBySlug.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (indexBySlug.get(b.slug) ?? Number.MAX_SAFE_INTEGER));
  };

  const selectedMain = mainServices.find((p) => p.id === selectedMainId) ?? null;
  const selectedFlowConfig = selectedMain ? getFlowConfig(selectedMain.slug) : null;
  const relatedProducts = selectedMain ? getRelatedSubProducts(selectedMain) : [];
  const addons = relatedProducts.filter((item) => selectedFlowConfig?.phaseMap.addons.includes(item.slug));
  const finalization = relatedProducts.filter((item) => selectedFlowConfig?.phaseMap.finalization.includes(item.slug));

  const interviewItems = addons.filter((a) => INTERVIEW_SPECIALIST_SLUGS.has(a.slug));
  const interviewGroupActive = interviewItems.length > 0 && interviewItems.every((i) => draft[i.id]?.is_active ?? i.is_active);
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

  const directCheckoutUrl = (slug: string): string => {
    if (!officeSlug || typeof window === "undefined") return "";
    const url = new URL("/checkout", window.location.origin);
    url.searchParams.set("office", officeSlug);
    url.searchParams.set("product", slug);
    return url.toString();
  };

  const updateDraft = (id: string, patch: Partial<DraftState>) => {
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const saveMutation = useMutation({
    mutationFn: (rows: Array<{ id: string; is_active: boolean; price: number }>) =>
      updateServicePriceRows(rows),
    onSuccess: () => {
      draftInitialized.current = false;
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officeProducts(resolvedOfficeId ?? undefined) });
      toast.success(t.products.messages.configSaved);
    },
    onError: () => toast.error(t.products.messages.configError),
  });

  const saveConfiguration = async () => {
    if (!selectedMain) return;
    const rowsToSave = [selectedMain, ...relatedProducts];
    for (const row of rowsToSave) {
      const price = cleanPrice(draft[row.id]?.price ?? "");
      if (!Number.isFinite(price) || price < 0) {
        toast.error(t.products.messages.invalidPrice.replace("{{name}}", row.name));
        return;
      }
    }
    saveMutation.mutate(rowsToSave.map((row) => {
      const rowDraft = draft[row.id] ?? { is_active: row.is_active, price: row.price.toFixed(2) };
      return {
        id: row.id,
        is_active: rowDraft.is_active,
        price: cleanPrice(rowDraft.price),
      };
    }));
  };

  return {
    isLoading,
    isSaving: saveMutation.isPending,
    draft,
    hasUnsavedChanges,
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
    directCheckoutUrl,
    updateDraft,
    saveConfiguration,
  };
}
