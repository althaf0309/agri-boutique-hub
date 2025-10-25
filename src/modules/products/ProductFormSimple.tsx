import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Save, RotateCcw, Calendar, Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// API hooks
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useProduct } from "@/api/hooks/products";
import { useCategories } from "@/api/hooks/categories";
import { useVendors } from "@/api/hooks/vendors";
import { useStores } from "@/api/hooks/stores";

// Components
import { WeightVariantManager, WeightVariant } from "@/components/product/WeightVariantManager";
import { ImageUpload } from "@/components/product/ImageUpload";
import { SpecificationsManager, SpecRow } from "@/components/product/SpecificationsManager";

// API client (axios with auth auto-injected)
import api, { postMultipart } from "@/api/client";

/* ---------------- helpers ---------------- */
const toNumberOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : Number(v));
const toStringOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : String(v));
const prune = (obj: Record<string, any>) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const toIdNumber = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const vKey = (w?: string, u?: string) => `${String(w ?? "").trim()}|${String(u ?? "").trim().toUpperCase()}`;

/* ---------------- schema ---------------- */
const emptyToNull = z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional());
const requiredNumber = z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number());

const formSchema = z
  .object({
    mode: z.preprocess((v) => (v == null || v === "" ? "grocery" : v), z.enum(["standard", "grocery"])),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    category_id: requiredNumber,

    vendor_id: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nullable().optional()),
    store_id: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nullable().optional()),

    price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format (use up to 2 decimals)"),
    price_usd: z.string().nullable().optional(),
    aed_pricing_mode: z.enum(["STATIC", "GOLD"]).default("STATIC"),
    price_aed_static: z.string().nullable().optional(),
    discount_percent: z.coerce.number().min(0).max(90).default(0),
    quantity: z.coerce.number().min(0).default(0),

    featured: z.boolean().default(false),

    origin_country: z.string().default("IN").optional(),
    grade: z.string().optional(),
    is_perishable: z.boolean().default(false).optional(),
    is_organic: z.boolean().default(false).optional(),

    manufacture_date: emptyToNull,
    shelf_life_days: z.preprocess((v) => {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    }, z.number().min(0).nullable().optional()),

    default_uom: z.enum(["PCS", "G", "KG", "ML", "L", "BUNDLE"]).default("KG").optional(),
    default_pack_qty: emptyToNull,
    hsn_sac: z.string().optional(),
    gst_rate: z.string().default("0.00").optional(),
    mrp_price: z.string().default("0.00").optional(),
    cost_price: z.string().default("0.00").optional(),

    warranty_months: z.preprocess((v) => {
      const n = Number(v);
      return !Number.isFinite(n) || n <= 0 ? 12 : Math.floor(n);
    }, z.number().int().min(1)).optional(),

    is_published: z.boolean().default(true).optional(),

    ingredients: z.string().optional(),
    allergens: z.string().optional(),
    nutrition_notes: z.string().optional(),
    nutrition_facts: z.array(z.object({ name: z.string().min(1), value: z.string().min(1) })).default([]).optional(),
  })
  .superRefine((data, ctx) => {
    const inr = parseFloat(String(data.price_inr || "0"));
    if (!(inr > 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["price_inr"], message: "Price must be greater than 0" });
    }
  });

type FormValues = z.infer<typeof formSchema>;

/* ---------------- types ---------------- */
type Cat = { id: number; name: string; slug?: string; parent_id?: number | null; parent?: number | { id: number } | null };
function dedupeBy<T>(rows: T[], keyFn: (r: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = keyFn(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

/* ---------------- component ---------------- */
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  // refs to force focus/scroll on required elements
  const nameRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);
  const parentSelectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const categoryCardRef = useRef<HTMLDivElement | null>(null);

  const { data: vendors = [] } = useVendors();
  const { data: stores = [] } = useStores();

  const { data: categoriesData } = useCategories();
  const flatCats: Cat[] = useMemo(() => {
    const d: any = categoriesData || {};
    const raw: any[] = Array.isArray(d) ? d : d.list ?? d.results ?? d.items ?? [];
    return (raw || []).map((c: any) => ({
      id: Number(c.id),
      name: String(c.name ?? `#${c.id}`),
      slug: c.slug,
      parent_id:
        typeof c.parent_id === "number"
          ? c.parent_id
          : typeof c.parent === "number"
          ? c.parent
          : (c.parent && typeof c.parent === "object" && typeof c.parent.id === "number")
          ? c.parent.id
          : null,
    })) as Cat[];
  }, [categoriesData]);

  const parents = useMemo(() => flatCats.filter((c) => !c.parent_id), [flatCats]);
  const childrenByParent = useMemo(() => {
    const m = new Map<number, Cat[]>();
    flatCats.forEach((c) => {
      if (!c.parent_id) return;
      if (!m.has(c.parent_id)) m.set(c.parent_id, []);
      m.get(c.parent_id)!.push(c);
    });
    m.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return m;
  }, [flatCats]);

  const byId = useMemo(() => {
    const m = new Map<number, Cat>();
    flatCats.forEach((c) => m.set(c.id, c));
    return m;
  }, [flatCats]);

  const productQ = useProduct(isEditMode ? Number(id) : undefined);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [mode, setMode] = useState<"standard" | "grocery">("grocery");
  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>([]);
  const [images, setImages] = useState<{ id?: number; image: string; is_primary: boolean; file?: File; __preview?: boolean }[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [showDescPreview, setShowDescPreview] = useState(false);

  const [parentCatId, setParentCatId] = useState<number | null>(null);
  const [childCatId, setChildCatId] = useState<number | null>(null);

  const userEditedInrRef = useRef(false);
  const lastAutoInrRef = useRef<string | null>(null);

  // Remember server's original variants (key <-> id) to turn inserts into updates
  const originalKeyToIdRef = useRef<Map<string, number>>(new Map());
  const originalIdToKeyRef = useRef<Map<number, string>>(new Map());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      mode,
      name: "",
      description: "",
      category_id: 0 as any,
      vendor_id: null,
      store_id: null,
      price_inr: "0.00",
      price_usd: "0.00",
      aed_pricing_mode: "STATIC",
      price_aed_static: "0.00",
      discount_percent: 0,
      quantity: 0,
      featured: false,
      origin_country: "IN",
      grade: "",
      is_perishable: false,
      is_organic: false,
      manufacture_date: null,
      shelf_life_days: null,
      default_uom: "KG",
      default_pack_qty: null,
      hsn_sac: "",
      gst_rate: "0.00",
      mrp_price: "0.00",
      cost_price: "0.00",
      warranty_months: 12,
      is_published: true,
      ingredients: "",
      allergens: "",
      nutrition_notes: "",
      nutrition_facts: [],
    } as any,
  });

  // Better UX: focus/scroll to the exact control that failed
  const focusRequired = (field: "name" | "category" | "price") => {
    if (field === "name" && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (field === "price" && priceRef.current) {
      priceRef.current.focus();
      priceRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (field === "category") {
      if (categoryCardRef.current) categoryCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      if (parentSelectTriggerRef.current) parentSelectTriggerRef.current.focus();
    }
  };

  const handleModeChange = (m: "standard" | "grocery") => {
    setMode(m);
    form.setValue("mode", m, { shouldDirty: true, shouldValidate: false });
  };

  // watches
  const watchedName = form.watch("name");
  const basePrice = parseFloat(form.watch("price_inr") || "0");
  const watchedDiscount = form.watch("discount_percent");
  const watchedManufactureDate = form.watch("manufacture_date" as any);
  const watchedShelfLife = form.watch("shelf_life_days" as any);
  const suggestedBestBefore =
    watchedManufactureDate && (watchedShelfLife ?? null) !== null
      ? new Date(new Date(watchedManufactureDate as any).getTime() + Number(watchedShelfLife || 0) * 86400000).toLocaleDateString()
      : null;

  // Auto-calc INR from variants
  useEffect(() => {
    if (userEditedInrRef.current) return;
    const nums: number[] = [];
    for (const v of weightVariants) {
      const n = Number((v as any).price);
      if (Number.isFinite(n)) nums.push(n);
    }
    if (nums.length === 0) {
      const current = form.getValues("price_inr") || "0.00";
      if (!current || current === "0" || current === "0.00" || current === lastAutoInrRef.current) {
        form.setValue("price_inr", "0.00", { shouldDirty: true, shouldValidate: false });
        lastAutoInrRef.current = "0.00";
      }
      return;
    }
    const picked = Math.max(...nums);
    const next = picked.toFixed(2);
    const current = form.getValues("price_inr") || "0.00";
    if (current !== next) {
      form.setValue("price_inr", next, { shouldDirty: true, shouldValidate: false });
      lastAutoInrRef.current = next;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightVariants]);

  // Auto-sum total qty
  useEffect(() => {
    const totalStock = (weightVariants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    form.setValue("quantity", totalStock, { shouldDirty: true, shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightVariants]);

  /* ---------- load product (edit) ---------- */
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isEditMode || !productQ.data || hydratedRef.current) return;
    const p: any = productQ.data;

    // Preselect categories
    const currentCatId: number | null = p?.category?.id ?? null;
    let nextParent: number | null = null;
    let nextChild: number | null = null;
    if (currentCatId && byId.size) {
      const current = byId.get(currentCatId);
      if (current?.parent_id) {
        nextParent = current.parent_id;
        nextChild = current.id;
      } else {
        nextParent = current?.id ?? null;
        nextChild = null;
      }
    }
    setParentCatId(nextParent);
    setChildCatId(nextChild);

    form.reset(
      {
        mode: p?.origin_country ? "grocery" : "standard",
        name: p.name ?? "",
        description: p.description ?? "",
        category_id: (nextChild ?? nextParent) as any,
        vendor_id: p.vendor?.id ?? null,
        store_id: p.store?.id ?? null,
        price_inr: String(p.price_inr ?? "0.00"),
        price_usd: String(p.price_usd ?? "0.00"),
        aed_pricing_mode: p.aed_pricing_mode ?? "STATIC",
        price_aed_static: String(p.price_aed_static ?? "0.00"),
        discount_percent: Number(p.discount_percent ?? 0),
        quantity: Number(p.quantity ?? 0),
        featured: !!p.featured,
        origin_country: p.origin_country ?? "IN",
        grade: p.grade ?? "",
        is_perishable: !!p.is_perishable,
        is_organic: !!p.is_organic,
        manufacture_date: p.manufacture_date ?? null,
        shelf_life_days: p.shelf_life_days ?? null,
        default_uom: p.default_uom ?? "KG",
        default_pack_qty: p.default_pack_qty != null ? String(p.default_pack_qty) : null,
        hsn_sac: p.hsn_sac ?? "",
        gst_rate: p.gst_rate != null ? String(p.gst_rate) : "0.00",
        mrp_price: p.mrp_price != null ? String(p.mrp_price) : "0.00",
        cost_price: p.cost_price != null ? String(p.cost_price) : "0.00",
        warranty_months: (() => {
          const n = Number(p.warranty_months);
          return !Number.isFinite(n) || n <= 0 ? 12 : Math.floor(n);
        })(),
        is_published: !!p.is_published,
        ingredients: p.ingredients ?? "",
        allergens: p.allergens ?? "",
        nutrition_notes: p.nutrition_notes ?? "",
        nutrition_facts: Array.isArray(p.nutrition_facts)
          ? p.nutrition_facts
          : (p.nutrition_facts && typeof p.nutrition_facts === "object"
              ? Object.entries(p.nutrition_facts).map(([name, value]) => ({ name, value: String(value) }))
              : []),
      } as any,
      { keepErrors: false, keepDirty: false }
    );

    setMode(p?.origin_country ? "grocery" : "standard");

    // Images
    const ims = Array.isArray(p.images)
      ? p.images.map((im: any) => ({ id: im.id, image: im.image, is_primary: !!im.is_primary }))
      : [];
    setImages(ims);

    // Variants — snapshot original (key <-> id)
    originalKeyToIdRef.current.clear();
    originalIdToKeyRef.current.clear();

    if (Array.isArray(p.variants)) {
      const mapped: WeightVariant[] = p.variants.map((v: any) => {
        const key = vKey(v.weight_value, v.weight_unit);
        const vid = Number(v.id);
        if (Number.isFinite(vid)) {
          originalKeyToIdRef.current.set(key, vid);
          originalIdToKeyRef.current.set(vid, key);
        }
        return {
          id: String(v.id ?? ""),
          weight: v.weight_value ? String(v.weight_value) : "",
          unit: v.weight_unit || "KG",
          price: v.price_override != null ? String(v.price_override) : String(p.price_inr ?? "0.00"),
          stock: Number(v.quantity ?? 0),
          sku: v.sku,
          isActive: !!v.is_active,
        };
      });
      setWeightVariants(dedupeBy(mapped, (r) => vKey(r.weight, r.unit)));
    } else {
      setWeightVariants([]);
    }

    // Specs
    const rows = Array.isArray(p.specifications)
      ? p.specifications.map((r: any) => ({
          id: r.id,
          group: r.group || "",
          name: r.name,
          value: r.value,
          unit: r.unit || "",
          is_highlight: !!r.is_highlight,
          sort_order: r.sort_order ?? 0,
        }))
      : [];
    setSpecs(rows);

    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, productQ.data, byId.size]);

  // keep hidden category_id synced
  useEffect(() => {
    const effective = childCatId ?? parentCatId ?? undefined;
    if (effective != null) {
      form.setValue("category_id", effective as any, { shouldDirty: true, shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentCatId, childCatId]);

  /* ---------- uploads & specs ---------- */
  async function uploadProductImages(productId: number) {
    if (!Number.isFinite(productId)) return;
    const toCreate = images.filter((im) => im.file instanceof File);
    for (const im of toCreate) {
      const fd = new FormData();
      fd.append("product", String(productId));
      fd.append("image", im.file as File);
      fd.append("is_primary", im.is_primary ? "true" : "false");
      await postMultipart("/product-images/", fd); // axios (uses Token from localStorage)
    }
  }

  async function replaceSpecs(productId: number) {
    const cleaned = dedupeBy(
      (specs || []).map((s, idx) => ({
        product: productId,
        group: s.group || "",
        name: s.name,
        value: s.value,
        unit: s.unit || "",
        is_highlight: !!s.is_highlight,
        sort_order: Number.isFinite(s.sort_order as any) ? Number(s.sort_order) : idx,
      })),
      (r) => `${(r.group || "").trim().toLowerCase()}|${r.name.trim().toLowerCase()}`
    );
    if (!cleaned.length) return;
    await api.put(`/products/${productId}/replace_specifications/`, cleaned);
  }

  // Build variants payload (EDIT) with strong duplicate-prevention
  // Build variants payload (EDIT) with strong duplicate-prevention
function buildUpsertPayloadFromCurrent(): any[] {
  const baseInr = String(form.getValues("price_inr") || "0.00");

  // 1) make UI list unique by key
  const uiUnique = dedupeBy(weightVariants, (v) => vKey(v.weight, v.unit));

  // 2) map to server payload and inject original id when possible
  const raw = uiUnique.map((v) => {
    const priceStr = (() => {
      const n = Number((v as any).price); // ← fixed (removed "the")
      if (Number.isFinite(n)) return n.toFixed(2);
      const b = Number(baseInr);
      return Number.isFinite(b) ? b.toFixed(2) : "0.00";
    })();
    const key = vKey(v.weight, v.unit);
    const injectedId = toIdNumber(v.id) ?? originalKeyToIdRef.current.get(key);
    return {
      id: injectedId,
      sku:
        v.sku ||
        `${slugify(form.getValues("name") || "product")}-${String(v.weight).trim()}${(v.unit || "KG").toLowerCase()}`,
      weight_value: String(v.weight ?? "").trim(),
      weight_unit: String(v.unit ?? "KG").toUpperCase(),
      price: priceStr,
      stock: Number.isFinite((v as any).stock) ? Number(v.stock) : 0,
      is_active: !!v.isActive,
      mrp: String((form.getValues("mrp_price" as any)) ?? ""),
      min_order_qty: 1,
      step_qty: 1,
      attributes: { Weight: `${String(v.weight ?? "").trim()}${String(v.unit ?? "KG").toUpperCase()}` },
    };
  });

  // 3) If any duplicate keys still slipped in, reduce → prefer the row bound to the original id
  const bestOf = new Map<string, any>();
  for (const it of raw) {
    const key = vKey(it.weight_value, it.weight_unit);
    const existing = bestOf.get(key);

    if (!existing) {
      bestOf.set(key, it);
      continue;
    }

    const originalId = originalKeyToIdRef.current.get(key);
    // Prefer row with original server id, else any with id, else first
    const score = (x: any) => (toIdNumber(x?.id) === originalId ? 2 : toIdNumber(x?.id) ? 1 : 0);
    bestOf.set(key, score(it) >= score(existing) ? it : existing);
  }

  return Array.from(bestOf.values());
}
gi

  async function syncWeightVariants(productId: number) {
    const variants = buildUpsertPayloadFromCurrent();
    if (variants.length === 0 || !Number.isFinite(productId)) return;
    await api.post(`/products/${productId}/upsert_variants/`, { variants });
  }

  /* ---------- submit ---------- */
  const onSubmit = async (raw: FormValues) => {
    try {
      // Required checks with focus/scroll & friendly text
      if (!raw.name?.trim()) {
        toast({ title: "Product name is required", variant: "destructive" });
        focusRequired("name");
        return;
      }
      const effCat = childCatId ?? parentCatId;
      if (!Number.isFinite(effCat as any) || (effCat as any) <= 0) {
        form.setError("category_id", { message: "Category is required" });
        toast({ title: "Please choose a parent and/or subcategory", variant: "destructive" });
        focusRequired("category");
        return;
      }
      const inrOk = Number(raw.price_inr) > 0;
      if (!inrOk) {
        toast({ title: "Price must be greater than 0", variant: "destructive" });
        focusRequired("price");
        return;
      }

      const wm = (() => {
        const n = Number(raw.warranty_months);
        return !Number.isFinite(n) || n <= 0 ? 12 : Math.floor(n);
      })();

      const commonPayload = prune({
        category_id: effCat!,
        name: toStringOrUndefined(raw.name),
        description: toStringOrUndefined(raw.description),
        vendor_id: raw.vendor_id ?? undefined,
        store_id: raw.store_id ?? undefined,
        quantity: toNumberOrUndefined(raw.quantity),
        price_inr: toStringOrUndefined(raw.price_inr),
        price_usd: raw.mode === "grocery" ? "0.00" : toStringOrUndefined(raw.price_usd),
        aed_pricing_mode: raw.aed_pricing_mode ?? "STATIC",
        price_aed_static: raw.aed_pricing_mode === "STATIC" ? toStringOrUndefined(raw.price_aed_static) : "0.00",
        discount_percent: toNumberOrUndefined(raw.discount_percent),
        featured: !!raw.featured,
        is_published: !!raw.is_published,
        warranty_months: wm,
        ingredients: toStringOrUndefined(raw.ingredients),
        allergens: toStringOrUndefined(raw.allergens),
        nutrition_notes: toStringOrUndefined(raw.nutrition_notes),
        nutrition_facts: Array.isArray(raw.nutrition_facts)
          ? Object.fromEntries(
              raw.nutrition_facts
                .filter((r) => (r?.name || "").trim() && (r?.value || "").trim())
                .map((r) => [r.name.trim(), r.value.trim()])
            )
          : {},
      });

      const groceryPayload =
        raw.mode === "grocery"
          ? prune({
              origin_country: raw.origin_country ?? "IN",
              grade: toStringOrUndefined(raw.grade),
              is_perishable: !!raw.is_perishable,
              is_organic: !!raw.is_organic,
              manufacture_date: raw.manufacture_date || null,
              shelf_life_days: raw.shelf_life_days ?? null,
              default_uom: raw.default_uom ?? "KG",
              default_pack_qty: raw.default_pack_qty ?? null,
              hsn_sac: toStringOrUndefined(raw.hsn_sac),
              gst_rate: toStringOrUndefined(raw.gst_rate) ?? "0.00",
              mrp_price: toStringOrUndefined(raw.mrp_price) ?? "0.00",
              cost_price: toStringOrUndefined(raw.cost_price) ?? "0.00",
              price_usd: "0.00",
              aed_pricing_mode: "STATIC",
              price_aed_static: "0.00",
            })
          : {};

      const payloadBase: any = prune({ ...commonPayload, ...groceryPayload });

      if (isEditMode) {
        const updated = await updateProduct.mutateAsync({ id: Number(id), ...payloadBase });
        const pid = Number(id) || Number((updated as any)?.id) || Number((updated as any)?.data?.id);

        try {
          if (images.some((im) => im.file)) await uploadProductImages(pid);
          try {
            await replaceSpecs(pid);
          } catch {
            toast({ title: "Saved (specs skipped)", description: "Duplicate spec rows were skipped.", variant: "secondary" });
          }
          // 🔒 strong no-duplicate upsert
          await syncWeightVariants(pid);

          toast({ title: "Product updated" });
        } catch (err: any) {
          console.error("[Product save] error:", err?.response?.data || err?.message || err);
          toast({
            title: "Update error",
            description: err?.response?.data?.detail || err.message || "Please check your permissions.",
            variant: "destructive",
          });
        }
      } else {
        // CREATE → send unique inline variants (OK), then also persist via upsert to guarantee save
        const inlineVariants = dedupeBy(weightVariants, (v) => vKey(v.weight, v.unit)).map((v) => ({
          sku:
            v.sku ||
            `${slugify(raw.name || "product")}-${String(v.weight).trim()}${(v.unit || "KG").toLowerCase()}`,
          weight_value: String(v.weight ?? "").trim(),
          weight_unit: String(v.unit ?? "KG").toUpperCase(),
          price: (() => {
            const n = Number(v.price);
            const b = Number(raw.price_inr || "0");
            if (Number.isFinite(n)) return n.toFixed(2);
            return Number.isFinite(b) ? b.toFixed(2) : "0.00";
          })(),
          stock: Number.isFinite(v.stock as any) ? Number(v.stock) : 0,
          is_active: !!v.isActive,
          mrp: String(raw.mrp_price ?? ""),
          min_order_qty: 1,
          step_qty: 1,
          attributes: { Weight: `${String(v.weight ?? "").trim()}${String(v.unit ?? "KG").toUpperCase()}` },
        }));

        const created: any = await createProduct.mutateAsync({
          ...payloadBase,
          variants: inlineVariants.length ? inlineVariants : undefined,
          images_meta: images.map((im) => ({ filename: (im.file as File | undefined)?.name ?? "", is_primary: !!im.is_primary })),
        });

        const pid = Number((created as any)?.id) || Number((created as any)?.data?.id);
        if (pid) {
          try {
            if (images.length) await uploadProductImages(pid);
            try {
              if (specs.length) await replaceSpecs(pid);
            } catch {
              toast({ title: "Created (specs skipped)", description: "Duplicate spec rows were skipped.", variant: "secondary" });
            }

            // ✅ ensure variants are saved & deduped after create as well
            await syncWeightVariants(pid);

            toast({ title: raw.mode === "grocery" ? "Grocery product created" : "Product created" });
          } catch (err: any) {
            console.error("[Product save] error:", err?.response?.data || err?.message || err);
            toast({
              title: "Post-create error",
              description: err?.response?.data?.detail || err.message || "Please check your permissions.",
              variant: "destructive",
            });
          }
          navigate("/admin/products");
        } else {
          toast({
            title: "Product created",
            description: "Couldn’t read the new product ID from server response. Open it later to add images/specs.",
          });
        }
      }
    } catch (e: any) {
      console.error("[Product save] error:", e?.response?.data || e?.message || e);
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Please check the highlighted fields.";
      toast({ title: "Error", description: msg, variant: "destructive" });

      // put the caret where it helps most
      if (form.formState.errors?.name) focusRequired("name");
      else if (form.formState.errors?.category_id) focusRequired("category");
      else if (form.formState.errors?.price_inr) focusRequired("price");
    }
  };

  const onDelete = async () => {
    if (!isEditMode) return;
    if (!confirm("Delete this product permanently?")) return;
    try {
      await deleteProduct.mutateAsync({ id: Number(id) });
      toast({ title: "Product deleted" });
      navigate("/admin/products");
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  const basePriceNum = Number.isFinite(basePrice) ? basePrice : 0;
  const desc = form.watch("description") || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-3 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {isEditMode ? (mode === "grocery" ? "Edit Grocery Product" : "Edit Product") : mode === "grocery" ? "Add Grocery Product" : "Add Product"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Button type="button" variant={mode === "grocery" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("grocery")}>
                Grocery
              </Button>
            </div>

            {isEditMode && (
              <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onDelete} title="Delete">
                🗑️ <span className="hidden sm:inline ml-1">Delete</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset({ ...form.getValues(), mode }, { keepErrors: false });
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={async () => {
                const ok = await form.trigger();
                if (!ok) {
                  const errs = form.formState.errors;
                  const first = Object.keys(errs)[0] as keyof typeof errs | undefined;
                  let m = "Please fix the highlighted fields";
                  if (first === "name") { m = "Product name is required"; focusRequired("name"); }
                  else if (first === "category_id") { m = "Please choose a parent and/or subcategory"; focusRequired("category"); }
                  else if (first === "price_inr") { m = "Price must be greater than 0"; focusRequired("price"); }
                  toast({ title: "Validation failed", description: m, variant: "destructive" });
                  return;
                }
                await form.handleSubmit(onSubmit)();
              }}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </header>

      <Form {...form}>
        <FormField control={form.control} name="mode" render={({ field }) => <input type="hidden" {...field} value={mode} />} />

        <form id="product-form" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6" onSubmit={(e) => e.preventDefault()}>
          {/* Main */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Product Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={nameRef}
                          name="name"
                          value={field.value ?? ""}
                          placeholder="e.g., Organic Alphonso Mangoes - Premium Grade"
                          aria-invalid={!!form.formState.errors.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Label>URL Slug:</Label>
                  <code className="bg-muted px-2 py-1 rounded">{slugify(watchedName || "")}</code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Description (HTML supported)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowDescPreview((v) => !v)}>
                      {showDescPreview ? "Edit HTML" : "Preview"}
                    </Button>
                  </div>
                  {!showDescPreview ? (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              placeholder={`Paste HTML:\n<h1>Premium Alphonso Mangoes</h1>\n<h2>From Ratnagiri</h2>\n<p>Sweet, aromatic, hand-picked...</p>`}
                              rows={8}
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Supports &lt;h1&gt;, &lt;h2&gt;, lists, etc.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="prose max-w-none border rounded-md p-4">
                      <div dangerouslySetInnerHTML={{ __html: desc }} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Images className="h-5 w-5" /> Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  onUpload={async (files) => {
                    const previews = files.map((f, idx) => ({
                      image: URL.createObjectURL(f),
                      is_primary: images.length === 0 && idx === 0,
                      file: f,
                      __preview: true,
                    }));
                    const next = [...images, ...previews];
                    if (!next.some((n) => n.is_primary) && next.length) next[0].is_primary = true;
                    let seen = false;
                    for (const im of next) {
                      if (im.is_primary && !seen) { seen = true; }
                      else { im.is_primary = false; }
                    }
                    setImages(next);
                  }}
                  maxSizeMB={10}
                />
              </CardContent>
            </Card>

            {/* Category */}
            <Card ref={categoryCardRef}>
              <CardHeader>
                <CardTitle>{mode === "grocery" ? "Grocery Classification" : "Category"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>
                      Parent Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      value={parentCatId ? String(parentCatId) : "0"}
                      onValueChange={(v) => {
                        const pid = Number(v);
                        setParentCatId(pid > 0 ? pid : null);
                        setChildCatId(null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger ref={parentSelectTriggerRef}>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Select…</SelectItem>
                        {parents.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!parentCatId && <p className="text-xs text-muted-foreground mt-1">Pick a parent category first.</p>}
                  </FormItem>

                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      value={childCatId ? String(childCatId) : "none"}
                      onValueChange={(v) => {
                        if (v === "none") setChildCatId(null);
                        else setChildCatId(Number(v));
                      }}
                      disabled={!parentCatId || (childrenByParent.get(parentCatId!) ?? []).length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              parentCatId
                                ? (childrenByParent.get(parentCatId!) ?? []).length
                                  ? "Select a subcategory"
                                  : "No subcategories"
                                : "Select parent first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(childrenByParent.get(parentCatId!) ?? []).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">If you don’t pick a subcategory, the product will be assigned to the parent.</p>
                  </FormItem>
                </div>

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <input type="hidden" {...field} name="category_id" value={childCatId ?? parentCatId ?? ""} />
                  )}
                />
              </CardContent>
            </Card>

            {/* Grocery variants */}
            {mode === "grocery" && (
              <WeightVariantManager
                variants={weightVariants}
                onVariantsChange={(rows) => setWeightVariants(dedupeBy(rows, (r) => vKey(r.weight, r.unit)))}
                productName={watchedName || "Product"}
              />
            )}

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_inr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Price (₹) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            ref={priceRef}
                            name="price_inr"
                            value={field.value ?? ""}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            aria-invalid={!!form.formState.errors.price_inr}
                            onChange={(e) => {
                              userEditedInrRef.current = true;
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {mode === "standard" && (
                    <FormField
                      control={form.control}
                      name="price_usd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0.00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="discount_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={Number.isFinite(field.value as any) ? field.value : 0}
                          type="number"
                          min="0"
                          max="90"
                          onChange={(e) => field.onChange(Number(e.target.value || 0))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {Number.isFinite(basePriceNum) && basePriceNum > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Price Preview</h4>
                    <div className="flex items-center gap-4">
                      {Number(watchedDiscount) > 0 ? (
                        <>
                          <span className="text-lg line-through text-muted-foreground">₹{basePriceNum.toFixed(2)}</span>
                          <span className="text-lg font-semibold text-green-600">
                            ₹{(basePriceNum * (1 - Number(watchedDiscount) / 100)).toFixed(2)}
                          </span>
                          <Badge variant="secondary">{watchedDiscount}% off</Badge>
                        </>
                      ) : (
                        <span className="text-lg font-semibold">₹{basePriceNum.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrition & Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Nutrition & Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} rows={3} placeholder="e.g., Mango, Sugar, Citric Acid" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergens</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="e.g., Contains peanuts, soy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Nutrition Facts</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rows = form.getValues("nutrition_facts") || [];
                        form.setValue("nutrition_facts", [...rows, { name: "", value: "" }], { shouldDirty: true });
                      }}
                    >
                      Add Row
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="nutrition_facts"
                    render={() => {
                      const rows = form.watch("nutrition_facts") || [];
                      return (
                        <div className="space-y-2">
                          {rows.length === 0 && (
                            <p className="text-sm text-muted-foreground">No nutrition facts yet. Add a few (e.g., Calories, Protein…)</p>
                          )}
                          {rows.map((row: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                              <Input
                                placeholder="Name (e.g., Calories)"
                                value={row?.name ?? ""}
                                onChange={(e) => {
                                  const next = [...rows];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  form.setValue("nutrition_facts", next, { shouldDirty: true });
                                }}
                                className="sm:col-span-2"
                              />
                              <Input
                                placeholder="Value (e.g., 120 kcal)"
                                value={row?.value ?? ""}
                                onChange={(e) => {
                                  const next = [...rows];
                                  next[idx] = { ...next[idx], value: e.target.value };
                                  form.setValue("nutrition_facts", next, { shouldDirty: true });
                                }}
                                className="sm:col-span-2"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  const next = rows.filter((_: any, i: number) => i !== idx);
                                  form.setValue("nutrition_facts", next, { shouldDirty: true });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nutrition_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} rows={3} placeholder="Any additional notes or claims" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>{mode === "grocery" ? "Inventory & Freshness" : "Inventory"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Quantity (auto)</FormLabel>
                      <FormControl>
                        <Input {...field} value={Number.isFinite(field.value as any) ? field.value : 0} type="number" min="0" disabled />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Auto-summed from all weight variant stocks.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === "grocery" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <Label>Perishable Product</Label>
                          <p className="text-xs text-muted-foreground">Requires special storage/handling</p>
                        </div>
                        <FormField control={form.control} name="is_perishable" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <Label>Organic Certified</Label>
                          <p className="text-xs text-muted-foreground">Organic certification</p>
                        </div>
                        <FormField control={form.control} name="is_organic" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="manufacture_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacture/Pack Date</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shelf_life_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shelf Life (Days)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {suggestedBestBefore && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Suggested Best Before: {suggestedBestBefore}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <SpecificationsManager specs={specs} onChange={setSpecs} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{mode === "grocery" ? "Visibility & Status" : "Status & Flags"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === "grocery" && (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <Label>Published</Label>
                      <p className="text-xs text-muted-foreground">Visible to customers</p>
                    </div>
                    <FormField control={form.control} name="is_published" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>Featured{mode === "grocery" ? " Product" : ""}</Label>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{mode === "grocery" ? "Vendor/Supplier" : "Vendor"}</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Select
                          value={field.value ? String(field.value) : "none"}
                          onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vendor (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No vendor</SelectItem>
                            {vendors.map((v: any) => (
                              <SelectItem key={v.id} value={String(v.id)}>
                                {v.name || v.display_name || `Vendor #${v.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="store_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{mode === "grocery" ? "Store/Location" : "Store"}</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Select
                          value={field.value ? String(field.value) : "none"}
                          onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select store (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.length === 0 && <SelectItem value="none">No store</SelectItem>}
                            {stores.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ProductForm;
