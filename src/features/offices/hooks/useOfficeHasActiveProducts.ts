import { useQuery } from "@tanstack/react-query";
import { listOfficeServicePrices } from "@features/admin/services/productsService";

export function useOfficeHasActiveProducts(officeId?: string | null) {
  return useQuery({
    queryKey: ["office", "hasActiveProducts", officeId],
    queryFn: async () => {
      const prices = await listOfficeServicePrices(officeId!);
      return prices.some((p) => p.is_active && p.price > 0);
    },
    enabled: !!officeId,
    staleTime: 2 * 60 * 1000,
  });
}
