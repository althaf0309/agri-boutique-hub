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

const money = (x: unknown, fallback = "0.00") => {
  const n = Number(x);
  if (!Number.isFinite(n)) return fallback;
  return n.toFixed(2);
};

// ---- error presentation (exported) ----
export function extractAxiosError(err: any): string {
  const http = err?.response;
  if (!http) return err?.message || "Network error";
  const status = http.status;
  const data = http.data;

  if (typeof data === "string") return `${status}: ${data}`;
  if (data && typeof data === "object") {
    // DRF-style detail
    if (data.detail) return `${status}: ${data.detail}`;
    // Field errors: { field: ["msg1","msg2"] }
    const entries = Object.entries(data as Record<string, any>);
    if (entries.length) {
      const [k, v] = entries[0];
      if (Array.isArray(v)) return `${status}: ${k} – ${v.join(", ")}`;
      if (typeof v === "string") return `${status}: ${k} – ${v}`;
    }
  }
  return `${status}: ${http.statusText || "Request failed"}`;
}

/** Map form payload to the exact shape ProductCreateUpdateSerializer accepts. */
function toWritable(payload: Partial<Product> & Record<string, any>) {
  const p = payload as any;

  const manufacture_date = emptyToNull(p.manufacture_date);
  const hot_deal_ends_at = emptyToNull(p.hot_deal_ends_at);

  const shelf_life_days  = isBlank(p.shelf_life_days) ? null : p.shelf_life_days;
  const warranty_months  = isBlank(p.warranty_months) ? null : p.warranty_months;

  // Always send decimals as strings (safer with DRF DecimalField)
  const price_inr        = isBlank(p.price_inr) ? null : String(p.price_inr);
  const price_usd        = isBlank(p.price_usd) ? null : String(p.price_usd);
  const price_aed_static = isBlank(p.price_aed_static) ? null : String(p.price_aed_static);
  const gst_rate         = isBlank(p.gst_rate) ? null : String(p.gst_rate);
  const mrp_price        = isBlank(p.mrp_price) ? null : String(p.mrp_price);
  const cost_price       = isBlank(p.cost_price) ? null : String(p.cost_price);
  const default_pack_qty = isBlank(p.default_pack_qty) ? null : p.default_pack_qty;

  const out = prune({
    // required FK
    category_id: p.category_id,
    // optional FKs
    vendor_id: p.vendor_id ?? null,
    store_id: p.store_id ?? null,

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

    // pricing (INR + taxes / DRF DecimalField as strings)
    price_inr,
    price_usd,
    aed_pricing_mode: p.aed_pricing_mode,
    price_aed_static,
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

    // IMPORTANT: omit inline variants/images here on create to avoid 500s
    // variants: p.variants,
    // images_meta: p.images_meta,
  });

  // Normalize money-like strings to 2dp if present
  ["price_inr", "price_usd", "price_aed_static", "gst_rate", "mrp_price", "cost_price"].forEach((k) => {
    if (out[k] != null) out[k] = money(out[k], "0.00");
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
      // minimal payload – server often 500s if nested variants/images are posted here
      const { data } = await api.post<Product>("/products/", toWritable(payload));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      // Useful for local dev – see exactly what serializer complained about
      console.error("[Create product] error:", err?.response?.status, err?.response?.data || err?.message);
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number } & (Partial<Product> & Record<string, any>)) => {
      const body = toWritable(payload);
      const { data } = await api.patch<Product>(`/products/${id}/`, body);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-id", variables.id] });
    },
    onError: (err: any) => {
      console.error("[Update product] error:", err?.response?.status, err?.response?.data || err?.message);
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
