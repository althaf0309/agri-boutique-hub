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

/**
 * Create vendor
 * - backend attaches current user; do NOT send user_id
 * - only send fields that are actually set
 */
export async function createVendorRequest(payload: Partial<Vendor>): Promise<Vendor> {
  const body: any = {
    display_name: payload.display_name?.trim() ?? "",
  };

  // Only send store_id if selected
  if (payload.store_id !== undefined && payload.store_id !== null) {
    body.store_id = payload.store_id;
  }

  // Default active to true if not explicitly provided
  if (typeof payload.is_active === "boolean") {
    body.is_active = payload.is_active;
  } else {
    body.is_active = true;
  }

  const { data } = await api.post<Vendor>("/vendors/", body);
  return data;
}

/**
 * Update vendor
 * - patch only the fields that changed
 */
export async function updateVendorRequest(id: number, payload: Partial<Vendor>): Promise<Vendor> {
  const body: any = {};

  if (payload.display_name !== undefined) {
    body.display_name = payload.display_name?.trim() ?? "";
  }

  // Only send store_id if user changed/selected it (including explicit "none")
  if (payload.store_id !== undefined) {
    body.store_id = payload.store_id; // can be null if you allow clearing
  }

  if (typeof payload.is_active === "boolean") {
    body.is_active = payload.is_active;
  }

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
