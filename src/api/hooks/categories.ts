import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Category, ID } from "@/types";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

const prune = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

export type CategoryNode = Category & { children: CategoryNode[] };

function toArray<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function buildTree(flat: Category[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];
  for (const c of flat) map.set(c.id as number, { ...(c as any), children: [] });

  for (const c of flat) {
    const node = map.get(c.id as number)!;
    const parentId = (c as any).parent_id ?? (c as any).parent?.id ?? null;
    if (parentId && map.has(parentId)) map.get(parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/** Always returns a consistent shape: { list: Category[], tree: CategoryNode[] } */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await api.get<Paginated<Category> | Category[]>("/categories/");
      const list = toArray<Category>(data);
      const tree = buildTree(list);
      return { list, tree };
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
    mutationFn: async (payload: Partial<Category> & { image?: File | null; parent_id?: ID | null }) => {
      const hasFile = payload?.image instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (k === "image" && v instanceof File) fd.append("image", v);
          else fd.append(k, String(v));
        });
        const { data } = await api.post<Category>("/categories/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
      }
      const { data } = await api.post<Category>("/categories/", prune(payload as any));
      return data;
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
    }: { id: ID } & Partial<Category> & { image?: File | null; parent_id?: ID | null }) => {
      const hasFile = payload?.image instanceof File;
      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (k === "image" && v instanceof File) fd.append("image", v);
          else fd.append(k, String(v));
        });
        const { data } = await api.patch<Category>(`/categories/${id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
      }
      const body = prune(payload as any);
      const { data } = await api.patch<Category>(`/categories/${id}/`, body);
      return data;
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
