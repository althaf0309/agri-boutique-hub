// src/api/hooks/orders.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Order, ID, OrderLine, OrderTotals } from "@/types";

/** Ensure numbers are numeric for UI arithmetic */
function toNum(v: string | number | undefined | null): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Extract array from common API list shapes */
function toList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  return (data?.results ?? data?.items ?? []) as T[];
}

/** Normalize a single order: turn string numbers into numbers */
function normalizeOrder(order: Order): Order {
  const lines = (order.lines ?? []).map((l: OrderLine) => ({
    ...l,
    // map quantity/qty variations → qty
    qty: toNum((l as any).qty ?? (l as any).quantity),
    price: toNum((l as any).price), // unit price
  }));

  const totals: OrderTotals | undefined = order.totals
    ? {
        subtotal: toNum(order.totals.subtotal),
        shipping: toNum(order.totals.shipping),
        tax: toNum(order.totals.tax),
        grand_total: toNum(order.totals.grand_total ?? (order as any).total),
      }
    : undefined;

  return { ...order, lines, totals };
}

/**
 * Fetch only the current user's orders when supported.
 * If the backend doesn't support `?mine=1`, we fall back to `/orders/`.
 * Optionally pass `currentUserId` to defensively filter client-side.
 */
export function useOrders(currentUserId?: number) {
  return useQuery({
    queryKey: ["orders", currentUserId],
    queryFn: async () => {
      let list: Order[] = [];
      try {
        // Preferred: server filters to the logged-in user's orders
        const mine = await api.get<Order[] | { results: Order[]; items?: Order[] }>("/orders/", {
          params: { mine: 1 },
        });
        list = toList<Order>(mine.data);
      } catch {
        // Fallback: get everything and let server auth/permissions decide
        const res = await api.get<Order[] | { results: Order[]; items?: Order[] }>("/orders/");
        list = toList<Order>(res.data);
      }

      const normalized = list.map(normalizeOrder);

      // Extra safety: if we know the user id, only keep their orders client-side
      if (currentUserId != null) {
        return normalized.filter((o: any) => {
          const uid = o?.user?.id ?? o?.user_id;
          return uid == null ? true : String(uid) === String(currentUserId);
        });
      }
      return normalized;
    },
  });
}

export function useOrder(id?: ID) {
  return useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}/`);
      return normalizeOrder(data);
    },
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      const { data } = await api.post<{ status: string }>(`/orders/${id}/confirm/`, {});
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: ID } & Partial<Order>) => {
      const { data } = await api.patch<Order>(`/orders/${id}/`, payload);
      return normalizeOrder(data);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      if (data?.id != null) {
        qc.setQueryData(["order", data.id], data);
      }
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/orders/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
