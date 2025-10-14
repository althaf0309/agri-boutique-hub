// src/api/hooks/vendors.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";

export type Vendor = {
  id: number;
  display_name: string;
  user_id?: number | null;           // read-only (from serializer)
  store?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  store_id?: number | null;         // write via *_id field
  is_active: boolean;
  total_units_sold: number;         // read-only
  total_revenue: string;            // read-only (Decimal -> string)
};

type DRFList<T> = { count: number; results: T[] };

function unpack<T>(data: T[] | DRFList<T>): T[] {
  if (Array.isArray(data)) return data;
  // @ts-ignore
  if (data && typeof data === "object" && "results" in data) return (data as DRFList<T>).results ?? [];
  return [];
}

export async function listVendors(): Promise<Vendor[]> {
  const { data } = await api.get<Vendor[] | DRFList<Vendor>>("/vendors/");
  return unpack<Vendor>(data);
}

export async function createVendorRequest(payload: Partial<Vendor>): Promise<Vendor> {
  // backend attaches current user; do NOT send user_id
  const body = {
    display_name: payload.display_name,
    store_id: payload.store_id ?? null,
    is_active: payload.is_active ?? true,
  };
  const { data } = await api.post<Vendor>("/vendors/", body);
  return data;
}

export async function updateVendorRequest(id: number, payload: Partial<Vendor>): Promise<Vendor> {
  const body: Partial<Vendor> = {
    display_name: payload.display_name,
    store_id: payload.store_id ?? null,
    is_active: payload.is_active,
  };
  const { data } = await api.patch<Vendor>(`/vendors/${id}/`, body);
  return data;
}

export async function deleteVendorRequest(id: number): Promise<void> {
  await api.delete(`/vendors/${id}/`);
}

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: listVendors,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Vendor>) => createVendorRequest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Vendor> & { id: number }) =>
      updateVendorRequest(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteVendorRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}
