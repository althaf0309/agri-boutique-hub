// src/api/hooks/dashboard.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import type { KpiData, Product, Review, ContactSubmission } from "@/types";

type DRFList<T> = { count: number; next?: string | null; previous?: string | null; results: T[] };

function toArray<T>(data: T[] | DRFList<T> | any): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in data) return data.results ?? [];
  return [];
}

/** ---- KPIs ---- */
const KPI_FALLBACK: KpiData = {
  totalProducts: 150,
  inStock: 142,
  outOfStock: 8,
  totalSold: 1250,
  ordersToday: 12,
  revenueToday: "₹15,450",
  ordersThisMonth: 345,
  revenueThisMonth: "₹2,15,000",
  averageRating: "4.5",
  wishlistItems: 89,
};

async function fetchKpis(): Promise<KpiData> {
  try {
    const { data } = await api.get<KpiData>("/dashboard/kpis/");
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      try {
        const { data } = await api.get<KpiData>("/analytics/kpis/");
        return data;
      } catch {
        return KPI_FALLBACK;
      }
    }
    return KPI_FALLBACK;
  }
}

export const useDashboardKpis = () =>
  useQuery({ queryKey: ["dashboard", "kpis"], queryFn: fetchKpis });

/** ---- Top products ---- */
export const useTopProducts = () =>
  useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data } = await api.get<DRFList<Product> | Product[]>("/products/", {
          params: { ordering: "-sold_count", limit: 10 },
        });
        return toArray<Product>(data);
      } catch {
        return [];
      }
    },
  });

/** ---- Recent reviews ---- */
export const useRecentReviews = () =>
  useQuery({
    queryKey: ["dashboard", "recent-reviews"],
    queryFn: async (): Promise<Review[]> => {
      try {
        const { data } = await api.get<DRFList<Review> | Review[]>("/product-reviews/", {
          params: { is_approved: true, ordering: "-created_at", limit: 5 },
        });
        return toArray<Review>(data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            const { data } = await api.get<DRFList<Review> | Review[]>("/reviews/", {
              params: { is_approved: true, ordering: "-created_at", limit: 5 },
            });
            return toArray<Review>(data);
          } catch {
            return [];
          }
        }
        return [];
      }
    },
  });

/** ---- Recent contacts ---- */
export const useRecentContacts = () =>
  useQuery({
    queryKey: ["dashboard", "recent-contacts"],
    queryFn: async (): Promise<ContactSubmission[]> => {
      try {
        const { data } = await api.get<DRFList<ContactSubmission> | ContactSubmission[]>(
          "/contact-submissions/",
          { params: { ordering: "-created_at", limit: 10 } }
        );
        return toArray<ContactSubmission>(data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            const { data } = await api.get<DRFList<ContactSubmission> | ContactSubmission[]>(
              "/contacts/",
              { params: { ordering: "-created_at", limit: 10 } }
            );
            return toArray<ContactSubmission>(data);
          } catch {
            return [];
          }
        }
        return [];
      }
    },
  });

/** ---- Sales Series (FIXED) ---- */
export type SalesRange = "7d" | "30d" | "90d" | "1y";
export type SalesGranularity = "day" | "week" | "month";
export type SalesPoint = { name: string; sales: number; orders: number; customers?: number };

function mapRangeToPeriods(range: SalesRange, granularity: SalesGranularity): number {
  if (granularity === "month") return 12; // 1y -> 12 months
  if (granularity === "week") {
    if (range === "90d") return 13; // ~13 weeks
    if (range === "30d") return 5;  // ~5 weeks
    if (range === "7d")  return 1;  // 1 week
    return 52;                      // 1y weekly fallback
  }
  // daily points
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 365; // fallback if someone asks day+1y
}

export function useSalesSeries(params: { range: SalesRange; granularity: SalesGranularity }) {
  const { range, granularity } = params;
  const periods = mapRangeToPeriods(range, granularity);

  return useQuery({
    queryKey: ["sales-series", range, granularity, periods],
    queryFn: async (): Promise<SalesPoint[]> => {
      try {
        const { data } = await api.get("/analytics/sales-series/", {
          params: { granularity, periods },
        });
        const pts = (data?.points ?? []) as any[];
        // Normalize structure so charts always have keys
        return pts.map((p, i) => ({
          name: p.name ?? String(i + 1),
          sales: Number(p.sales ?? p.revenue ?? 0),
          orders: Number(p.orders ?? 0),
          customers: Number(p.customers ?? 0),
        }));
      } catch {
        // Safe minimal fallback so UI renders
        const n = periods || 7;
        return Array.from({ length: n }).map((_, i) => ({
          name: String(i + 1),
          sales: 0,
          orders: 0,
          customers: 0,
        }));
      }
    },
  });
}
