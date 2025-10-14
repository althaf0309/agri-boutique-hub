// src/api/hooks/products.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import type { Product } from "@/types";

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

const toArray = <T,>(d: any): T[] => (Array.isArray(d) ? d : d?.results ?? []);
const totalOf = (d: any, arrLen: number) => (typeof d?.count === "number" ? d.count : arrLen);

// helpers to normalize values the backend expects
const isBlank = (v: any) => v === "" || v === undefined;
const emptyToNull = <T = any>(v: T) => (v === "" ? null : v);

// allow nulls & zeros, but drop explicit undefined so PATCH stays partial
const prune = (o: Record<string, any>) =>
  Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== undefined));

/** Map form payload to the exact shape ProductCreateUpdateSerializer (V2) accepts. */
function toWritable(payload: Partial<Product> & Record<string, any>) {
  const p = payload as any;

  const manufacture_date = emptyToNull(p.manufacture_date);
  const hot_deal_ends_at = emptyToNull(p.hot_deal_ends_at);

  const shelf_life_days  = isBlank(p.shelf_life_days) ? null : p.shelf_life_days;
  const warranty_months  = isBlank(p.warranty_months) ? null : p.warranty_months;
  const price_inr        = isBlank(p.price_inr) ? null : String(p.price_inr);
  const gst_rate         = isBlank(p.gst_rate) ? null : String(p.gst_rate);
  const mrp_price        = isBlank(p.mrp_price) ? null : String(p.mrp_price);
  const cost_price       = isBlank(p.cost_price) ? null : String(p.cost_price);
  const default_pack_qty = isBlank(p.default_pack_qty) ? null : p.default_pack_qty;

  const out = prune({
    // required FK
    category_id: p.category_id,
    // optional FKs
    vendor_id: p.vendor_id,
    store_id: p.store_id,

    // basics
    name: p.name,
    description: p.description,
    origin_country: p.origin_country,
    grade: p.grade,

    // inventory/freshness
    quantity: p.quantity,
    manufacture_date,
    is_perishable: p.is_perishable,
    is_organic: p.is_organic,
    shelf_life_days,
    default_uom: p.default_uom,
    default_pack_qty,

    // pricing (INR + taxes)
    price_inr,
    discount_percent: p.discount_percent,
    hsn_sac: p.hsn_sac,
    gst_rate,
    mrp_price,
    cost_price,

    // flags
    featured: p.featured,
    new_arrival: p.new_arrival,
    hot_deal: p.hot_deal,
    hot_deal_ends_at,

    // other
    warranty_months,
    is_published: p.is_published,

    // nutrition
    ingredients: p.ingredients,
    allergens: p.allergens,
    nutrition_facts: p.nutrition_facts,
    nutrition_notes: p.nutrition_notes,

    // inline helpers (JSON)
    variants: p.variants,
    images_meta: p.images_meta,
  });

  return out;
}

export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product> | Product[]>("/products/", { params });
      const items = toArray<Product>(data);
      return {
        items,
        count: totalOf(data, items.length),
        next: (data as any)?.next ?? null,
        previous: (data as any)?.previous ?? null,
      };
    },
  });
}

export function useProduct(id?: number) {
  return useQuery({
    queryKey: ["product-id", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}/`);
      return data;
    },
  });
}

export function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ["product-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/by-slug/${encodeURIComponent(slug!)}/`);
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product> & Record<string, any>) => {
      const { data } = await api.post<Product>("/products/", toWritable(payload));
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
    mutationFn: async ({ id, ...payload }: { id: number } & (Partial<Product> & Record<string, any>)) => {
      const { data } = await api.patch<Product>(`/products/${id}/`, toWritable(payload));
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-id", variables.id] });
    },
    onError: (err: any) => {
      // Better console to see DRF validation details
      // eslint-disable-next-line no-console
      console.error("PATCH /products error", err?.response?.status, err?.response?.data || err?.message);
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
