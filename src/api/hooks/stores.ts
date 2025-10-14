// src/api/hooks/stores.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

export type Store = {
  id: number;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  is_active: boolean;
  logo?: string; // url
};

type DRFList<T> = { count: number; results: T[] };

function unpack<T>(data: T[] | DRFList<T>): T[] {
  // Supports both paginated and non-paginated DRF results
  if (Array.isArray(data)) return data;
  // @ts-ignore
  if (data && typeof data === "object" && "results" in data) return (data as DRFList<T>).results ?? [];
  return [];
}

export async function listStores(): Promise<Store[]> {
  const { data } = await api.get<Store[] | DRFList<Store>>("/stores/");
  return unpack<Store>(data);
}

export async function createStoreRequest(payload: Partial<Store>): Promise<Store> {
  const { data } = await api.post<Store>("/stores/", payload);
  return data;
}

export async function updateStoreRequest(id: number, payload: Partial<Store>): Promise<Store> {
  const { data } = await api.patch<Store>(`/stores/${id}/`, payload);
  return data;
}

export async function deleteStoreRequest(id: number): Promise<void> {
  await api.delete(`/stores/${id}/`);
}

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: listStores,
  });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Store>) => createStoreRequest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Store> & { id: number }) =>
      updateStoreRequest(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useDeleteStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteStoreRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}
