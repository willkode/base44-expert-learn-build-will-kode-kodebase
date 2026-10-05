import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const MIGRATION_REGULAR_PRICE = 199;
export const MIGRATION_SALE_LABEL = "the first 10 customers";
export default function useMigrationPrice() {
  const query = useQuery({
    queryKey: ["migration-promotion", "first10-oct2026"],
    queryFn: async () => {
      const response = await base44.functions.invoke("migrationPromotionStatus", {});
      const data = response.data;
      if (!Number.isInteger(data?.remaining) || !Number.isInteger(data?.claimed) || data.total !== 10) throw new Error("Availability unavailable");
      return data;
    },
    refetchInterval: 15000,
    staleTime: 10000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const data = query.data;
  return {
    price: data ? data.price : "…",
    saleActive: Boolean(data?.saleActive),
    remaining: data?.remaining,
    claimed: data?.claimed,
    held: data?.held,
    soldOut: Boolean(data?.soldOut),
    loading: query.isPending,
    unavailable: query.isError,
    checkoutDisabled: !data || query.isError || (!data.soldOut && data.remaining === 0),
    refresh: query.refetch,
  };
}

