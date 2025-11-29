// src/api/hooks/categories.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Category, ID } from "@/types/index";

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const prune = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj || {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );

export type CategoryNode = Category & { children: CategoryNode[] };

/** Normalize any ID (string | number) to a string key. */
function toKey(id: unknown): string | null {
  if (id === null || id === undefined) return null;
  if (typeof id === "string" && id.trim() === "") return null;
  return String(id);
}

/** Extract parent id from whatever the backend sends (parent_id, parent, nested parent, etc.). */
function getRawParentId(c: Category): string | null {
  const anyC: any = c;

  // Prefer explicit parent_id if present
  let raw = anyC.parent_id ?? null;

  // Then check parent
  if (!raw && anyC.parent != null) {
    const p = anyC.parent;
    if (typeof p === "string" || typeof p === "number") {
      raw = p;
    } else if (typeof p === "object" && p.id != null) {
      raw = p.id;
    }
  }

  return toKey(raw);
}

function buildTree(flat: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // 1) create nodes keyed by normalized id
  for (const c of flat) {
    const key = toKey((c as any).id);
    if (!key) continue;
    map.set(key, { ...(c as any), children: [] });
  }

  // 2) wire parent/child relationships
  for (const c of flat) {
    const nodeKey = toKey((c as any).id);
    if (!nodeKey) continue;

    const node = map.get(nodeKey);
    if (!node) continue;

    const parentKey = getRawParentId(c);

    if (parentKey && map.has(parentKey)) {
      map.get(parentKey)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Always returns a consistent shape: { list: Category[], tree: CategoryNode[] }
 * - If API is paginated (DRF): fetch ALL pages by following `next`
 * - If API returns plain array: just use that
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: first } = await api.get<Paginated<Category> | Category[]>(
        "/categories/"
      );

      // Non-paginated: backend returns plain array
      if (Array.isArray(first)) {
        const list = first as Category[];
        const tree = buildTree(list);
        return { list, tree };
      }

      // Paginated (DRF style): fetch all pages
      let list: Category[] = first.results || [];
      let nextUrl: string | null = first.next;

      while (nextUrl) {
        const { data: page } = await api.get<Paginated<Category>>(nextUrl);
        list = list.concat(page.results || []);
        nextUrl = page.next;
      }

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
    // NOTE: use `parent` (id) here, not `parent_id`
    mutationFn: async (
      payload: Partial<Category> & { image?: File | null; parent?: ID | null }
    ) => {
      const hasFile = payload?.image instanceof File;

      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (k === "image" && v instanceof File) {
            fd.append("image", v);
          } else {
            fd.append(k, String(v));
          }
        });
        const { data } = await api.post<Category>("/categories/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
      }

      const { data } = await api.post<Category>(
        "/categories/",
        prune(payload as any)
      );
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
    }: {
      id: ID;
    } & Partial<Category> & { image?: File | null; parent?: ID | null }) => {
      const hasFile = payload?.image instanceof File;

      if (hasFile) {
        const fd = new FormData();
        Object.entries(prune(payload as any)).forEach(([k, v]) => {
          if (k === "image" && v instanceof File) {
            fd.append("image", v);
          } else {
            fd.append(k, String(v));
          }
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
