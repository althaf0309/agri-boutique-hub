import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Order, ID } from "@/types";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<Order[] | { results: Order[] }>("/orders/");
      // if paginated
      return Array.isArray(data) ? data : (data.results ?? []);
    },
  });
}

export function useOrder(id?: ID) {
  return useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}/`);
      return data;
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
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", id] });
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
