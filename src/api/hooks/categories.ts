import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Category, ID } from "@/types";

const prune = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined) out[k] = v;
  });
  return out;
};

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories/");
      return data;
    },
  });
}

export function useCategory(id?: ID) {
  return useQuery({
    queryKey: ["category", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Category>(`/categories/${id}/`);
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category> & { image?: File | null }) => {
      // If there is a File, send FormData for multipart upload
      const hasFile = payload?.image instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if (k === "image" && v instanceof File) fd.append("image", v);
            else fd.append(k, String(v));
          }
        });
        const { data } = await api.post<Category>("/categories/", fd);
        return data;
      } else {
        const body = prune(payload as any);
        const { data } = await api.post<Category>("/categories/", body);
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: ID } & Partial<Category> & { image?: File | null }) => {
      const hasFile = payload?.image instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if (k === "image" && v instanceof File) fd.append("image", v);
            else fd.append(k, String(v));
          }
        });
        const { data } = await api.patch<Category>(`/categories/${id}/`, fd);
        return data;
      } else {
        const body = prune(payload as any);
        const { data } = await api.patch<Category>(`/categories/${id}/`, body);
        return data;
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["category", vars.id] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: ID }) => {
      await api.delete(`/categories/${id}/`);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
