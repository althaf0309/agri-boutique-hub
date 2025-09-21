import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../client";
import type { Product, Category } from "@/types";

// small helper to remove undefined
const prune = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.entries(o || {}).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  return out;
};

// ------- Categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories/");
      return data;
    },
  });
}

// ------- Products
export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get("/products/", { params });
      // DRF pagination or list — return as-is
      return data;
    },
  });
}

export function useProduct(id?: number) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}/`);
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const body = prune(payload as Record<string, any>);
      const { data } = await api.post<Product>("/products/", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & Partial<Product>) => {
      const body = prune(payload as Record<string, any>);
      const { data } = await api.patch<Product>(`/products/${id}/`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await api.delete(`/products/${id}/`);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
