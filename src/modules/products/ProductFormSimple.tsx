import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Save, Eye, Trash2, RotateCcw, Calendar, Images } from "lucide-react";

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

// Hooks
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useProduct } from "@/api/hooks/products";
import { useCategories } from "@/api/hooks/categories";
import { useVendors } from "@/api/hooks/vendors";
import { useStores } from "@/api/hooks/stores";

// Components
import { AddVendorDialog } from "@/components/pickers/AddVendorDialog";
import { AddStoreDialog } from "@/components/pickers/AddStoreDialog";
import { WeightVariantManager, WeightVariant } from "@/components/product/WeightVariantManager";
import { ImageUpload } from "@/components/product/ImageUpload";
import { SpecificationsManager, SpecRow } from "@/components/product/SpecificationsManager";

// API helpers
import { api, uploadForm } from "@/api/http";

/* ---------------- helpers ---------------- */
const toNumberOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : Number(v));
const toStringOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : String(v));
const prune = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function getNumericIdLoose(maybe: unknown): number | null {
  const tryNum = (x: any) => {
    const n = Number(x);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const direct = tryNum((maybe as any)?.id ?? maybe);
  if (direct) return direct;
  const nests = [
    (maybe as any)?.data?.id,
    (maybe as any)?.product?.id,
    (maybe as any)?.result?.id,
    (maybe as any)?.results?.[0]?.id,
  ];
  for (const c of nests) {
    const n = tryNum(c);
    if (n) return n;
  }
  return null;
}

/* ---------------- constants ---------------- */
const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "PH", name: "Philippines" },
];

const UOM_OPTIONS = [
  { value: "PCS", label: "Pieces (PCS)" },
  { value: "G", label: "Grams (G)" },
  { value: "KG", label: "Kilograms (KG)" },
  { value: "ML", label: "Milliliters (ML)" },
  { value: "L", label: "Liters (L)" },
  { value: "BUNDLE", label: "Bundle" },
];

/* ---------------- schema ---------------- */
const strToIntOrNull = z.preprocess((v) => {
  if (v === "" || v === "none" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().nullable());

// backend requires category_id → make it required positive int (validation happens on submit)
const requiredId = z.preprocess((v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().min(1, "Category is required"));

const emptyToNull = z.preprocess((v) => (v === "" ? null : v), z.string().nullable().optional());

const formSchema = z.object({
  mode: z.preprocess(
    (v) => (v === undefined || v === null || v === "" ? "grocery" : v),
    z.enum(["standard", "grocery"])
  ),

  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),

  category_id: requiredId, // <- REQUIRED ON SUBMIT
  vendor_id:   strToIntOrNull.optional(),
  store_id:    strToIntOrNull.optional(),

  price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid INR price"),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid USD price").optional().nullable(),
  aed_pricing_mode: z.enum(["STATIC", "GOLD"]).default("STATIC"),
  price_aed_static: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid AED price").optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(90).default(0),

  quantity: z.coerce.number().min(0).default(0),

  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  hot_deal: z.boolean().default(false),

  // grocery optionals
  origin_country: z.string().default("IN").optional(),
  grade: z.string().optional(),
  is_perishable: z.boolean().default(false).optional(),
  is_organic: z.boolean().default(false).optional(),

  manufacture_date: emptyToNull,
  shelf_life_days: z.preprocess((v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }, z.number().min(0).nullable()).optional(),

  default_uom: z.enum(["PCS", "G", "KG", "ML", "L", "BUNDLE"]).default("KG").optional(),
  default_pack_qty: emptyToNull,
  hsn_sac: z.string().optional(),
  gst_rate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid GST rate").default("0.00").optional(),
  mrp_price: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0.00").optional(),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0.00").optional(),
  hot_deal_ends_at: emptyToNull,
  warranty_months: z.preprocess((v) => (v === "" || v == null ? 0 : v), z.number().min(0)).optional(),

  is_published: z.boolean().default(true).optional(),

  // --- NEW: Nutrition fields ---
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  nutrition_notes: z.string().optional(),
  nutrition_facts: z.array(z.object({
    name: z.string().min(1),
    value: z.string().min(1),
  })).default([]).optional(),
});
type FormValues = z.infer<typeof formSchema>;

/* ---------------- component ---------------- */
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const { data: vendors = [] } = useVendors();
  const { data: stores = [] } = useStores();

  // Categories (normalized)
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.list ?? [];

  const productQ = useProduct(isEditMode ? Number(id) : undefined);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [mode, setMode] = useState<"standard" | "grocery">("grocery");
  const [weightVariants, setWeightVariants] = useState<WeightVariant[]>([]);
  const [images, setImages] = useState<{ id?: number; image: string; is_primary: boolean; file?: File; __preview?: boolean }[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [showDescPreview, setShowDescPreview] = useState(false);

  const userEditedInrRef = useRef(false);
  const lastAutoInrRef = useRef<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      mode,
      name: "",
      description: "",
      category_id: null as any, // force user to pick
      vendor_id: null,
      store_id: null,
      price_inr: "0.00",
      price_usd: "0.00",
      aed_pricing_mode: "STATIC",
      price_aed_static: "0.00",
      discount_percent: 0,
      quantity: 0,
      featured: false,
      new_arrival: false,
      hot_deal: false,
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
      hot_deal_ends_at: null,
      warranty_months: 0,
      is_published: true,
      ingredients: "",
      allergens: "",
      nutrition_notes: "",
      nutrition_facts: [],
    } as any,
  });

  const handleModeChange = (m: "standard" | "grocery") => {
    setMode(m);
    form.setValue("mode", m, { shouldDirty: true, shouldValidate: true });
  };

  // watches
  const watchedName = form.watch("name");
  const watchedAedMode = form.watch("aed_pricing_mode");
  const basePrice = parseFloat(form.watch("price_inr") || "0");
  const watchedDiscount = form.watch("discount_percent");

  const watchedManufactureDate = form.watch("manufacture_date" as any);
  const watchedShelfLife = form.watch("shelf_life_days" as any);
  const suggestedBestBefore =
    watchedManufactureDate && (watchedShelfLife ?? null) !== null
      ? new Date(new Date(watchedManufactureDate as any).getTime() + Number(watchedShelfLife || 0) * 86400000).toLocaleDateString()
      : null;

  // auto INR from variants
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
        form.setValue("price_inr", "0.00", { shouldDirty: true, shouldValidate: true });
        lastAutoInrRef.current = "0.00";
      }
      return;
    }
    const picked = Math.max(...nums);
    const next = picked.toFixed(2);
    const current = form.getValues("price_inr") || "0.00";
    if (current !== next) {
      form.setValue("price_inr", next, { shouldDirty: true, shouldValidate: true });
      lastAutoInrRef.current = next;
    }
  }, [weightVariants]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- load product (edit) ---------- */
  useEffect(() => {
    if (!isEditMode || !productQ.data) return;
    const p: any = productQ.data;

    form.reset({
      mode: p?.origin_country ? "grocery" : "standard",
      name: p.name ?? "",
      description: p.description ?? "",
      category_id: p.category?.id ?? null,
      vendor_id: p.vendor?.id ?? null,
      store_id: p.store?.id ?? null,
      price_inr: String(p.price_inr ?? "0.00"),
      price_usd: String(p.price_usd ?? "0.00"),
      aed_pricing_mode: p.aed_pricing_mode ?? "STATIC",
      price_aed_static: String(p.price_aed_static ?? "0.00"),
      discount_percent: Number(p.discount_percent ?? 0),
      quantity: Number(p.quantity ?? 0),
      featured: !!p.featured,
      new_arrival: !!p.new_arrival,
      hot_deal: !!p.hot_deal,
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
      hot_deal_ends_at: p.hot_deal_ends_at ?? null,
      warranty_months: p.warranty_months ?? 0,
      is_published: !!p.is_published,
      ingredients: p.ingredients ?? "",
      allergens: p.allergens ?? "",
      nutrition_notes: p.nutrition_notes ?? "",
      nutrition_facts: Array.isArray(p.nutrition_facts)
        ? p.nutrition_facts
        : (p.nutrition_facts && typeof p.nutrition_facts === "object"
            ? Object.entries(p.nutrition_facts).map(([name, value]) => ({ name, value: String(value) }))
            : []),
    } as any);

    setMode(p?.origin_country ? "grocery" : "standard");

    const ims = Array.isArray(p.images)
      ? p.images.map((im: any) => ({ id: im.id, image: im.image, is_primary: !!im.is_primary }))
      : [];
    setImages(ims);

    if (Array.isArray(p.variants)) {
      const mapped: WeightVariant[] = p.variants.map((v: any) => ({
        id: String(v.id),
        weight: v.weight_value ? String(v.weight_value) : "",
        unit: v.weight_unit || "KG",
        price: v.price_override != null ? String(v.price_override) : String(p.price_inr ?? "0.00"),
        stock: Number(v.quantity ?? 0),
        sku: v.sku,
        isActive: !!v.is_active,
      }));
      setWeightVariants(mapped);
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, productQ.data]);

  /* ---------- uploads & specs ---------- */
  async function uploadProductImages(productId: number) {
    if (!Number.isFinite(productId)) return;
    const toCreate = images.filter((im) => im.file instanceof File);
    for (const im of toCreate) {
      const fd = new FormData();
      fd.append("product", String(productId));
      fd.append("image", im.file as File);
      fd.append("is_primary", im.is_primary ? "true" : "false");
      await uploadForm("/product-images/", fd);
    }
  }

  async function replaceSpecs(productId: number) {
    const payload = (specs || []).map((s, idx) => ({
      group: s.group || "",
      name: s.name,
      value: s.value,
      unit: s.unit || "",
      is_highlight: !!s.is_highlight,
      sort_order: Number.isFinite(s.sort_order as any) ? Number(s.sort_order) : idx,
    }));
    await api(`/products/${productId}/replace_specifications/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // map variants for both inline create and upsert endpoint
  function mapVariantsForWrite(usingInline: boolean) {
    const baseInr = String(form.getValues("price_inr") || "0.00");
    const rows = weightVariants
      .filter((v) => String(v.weight || "").trim())
      .map((v) => {
        const priceStr = (() => {
          const n = Number((v as any).price);
          if (Number.isFinite(n)) return n.toFixed(2);
          const b = Number(baseInr);
          return Number.isFinite(b) ? b.toFixed(2) : "0.00";
        })();

        return {
          sku: v.sku || `${slugify(form.getValues("name") || "product")}-${String(v.weight).trim()}${(v.unit || "KG").toLowerCase()}`,
          weight_value: String(v.weight ?? ""),
          weight_unit: String(v.unit ?? "KG").toUpperCase(),
          price: priceStr,
          stock: Number.isFinite(v.stock as any) ? Number(v.stock) : 0,
          is_active: !!v.isActive,
          mrp: String((form.getValues("mrp_price" as any)) ?? ""),
          min_order_qty: 1,
          step_qty: 1,
          ...(usingInline ? {} : { attributes: { Weight: `${v.weight}${(v.unit || "KG").toUpperCase()}` } }),
        };
      });

    return rows;
  }

  async function syncWeightVariants(productId: number) {
    const items = mapVariantsForWrite(false);
    if (items.length === 0 || !Number.isFinite(productId)) return;
    await api(`/products/${productId}/upsert_variants/`, {
      method: "POST",
      body: JSON.stringify({ variants: items }),
    });
  }

  /* ---------- submit ---------- */
  const onSubmit = async (raw: FormValues) => {
    try {
      const category_id = Number(raw.category_id);
      if (!Number.isFinite(category_id) || category_id <= 0) {
        form.setError("category_id", { message: "Category is required" });
        return;
      }

      const commonPayload = prune({
        category_id,
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
        new_arrival: !!raw.new_arrival,
        hot_deal: !!raw.hot_deal,
        is_published: !!raw.is_published,

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
              hot_deal_ends_at: raw.hot_deal_ends_at ?? null,
              warranty_months: toNumberOrUndefined(raw.warranty_months),
              price_usd: "0.00",
              aed_pricing_mode: "STATIC",
              price_aed_static: "0.00",
            })
          : {};

      // include inline variants when creating/updating too (the serializer supports it)
      const inlineVariants = mapVariantsForWrite(true);
      const imagesMeta = images.map(im => ({ filename: (im.file as File | undefined)?.name ?? "", is_primary: !!im.is_primary }));

      const payload: any = prune({
        ...commonPayload,
        ...groceryPayload,
        variants: inlineVariants.length ? inlineVariants : undefined,
        images_meta: imagesMeta.length ? imagesMeta : undefined,
      });

      if (isEditMode) {
        const updated = await updateProduct.mutateAsync({ id: Number(id), ...payload });
        const pid = getNumericIdLoose(updated) ?? Number(id);

        if (Number.isFinite(pid)) {
          if (images.some((im) => im.file)) await uploadProductImages(Number(pid));
          await replaceSpecs(Number(pid));
          await syncWeightVariants(Number(pid));
          toast({ title: "Product updated" });
        } else {
          toast({
            title: "Product updated",
            description: "Couldn’t confirm product id for follow-ups. Re-open product to add images/specs.",
          });
        }
      } else {
        const created: any = await createProduct.mutateAsync(payload);
        const pid = getNumericIdLoose(created);

        if (pid != null) {
          if (images.length) await uploadProductImages(pid);
          if (specs.length) await replaceSpecs(pid);
          await syncWeightVariants(Number(pid));
          toast({ title: raw.mode === "grocery" ? "Grocery product created" : "Product created" });
        } else {
          toast({
            title: "Product created",
            description: "Couldn’t read the new product ID from server response. Open it later to add images/specs.",
          });
        }
        navigate("/admin/products");
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
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

  const discountedPrice =
    basePrice && Number(watchedDiscount) > 0 ? basePrice * (1 - Number(watchedDiscount) / 100) : basePrice;

  /* ---------------- render ---------------- */
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
                {isEditMode ? (mode === "grocery" ? "Edit Grocery Product" : "Edit Product") : (mode === "grocery" ? "Add Grocery Product" : "Add Product")}
              </h1>
            </div>
          </div>

          {/* mode switcher & actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Button type="button" variant={mode === "standard" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("standard")}>Standard</Button>
              <Button type="button" variant={mode === "grocery" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("grocery")}>Grocery</Button>
            </div>

            {isEditMode && (
              <>
                <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                userEditedInrRef.current = false;
                lastAutoInrRef.current = null;
                form.reset({ ...form.getValues(), mode });
              }}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </Button>

            {/* Guard submit so we never throw ZodError elsewhere */}
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                const ok = await form.trigger(); // runs zodResolver
                if (!ok) {
                  toast({ title: "Please fix the highlighted fields", variant: "destructive" });
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
        {/* keep the discriminator-like field mounted */}
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => <input type="hidden" {...field} value={mode} />}
        />

        <form
          id="product-form"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6"
          // prevent default submit (we use guarded "Save" button above)
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
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
                        <Input {...field} value={field.value ?? ""} placeholder="e.g., Organic Alphonso Mangoes - Premium Grade" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Label>URL Slug:</Label>
                  <code className="bg-muted px-2 py-1 rounded">{slugify(watchedName || "")}</code>
                </div>

                {/* HTML Description + Preview */}
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
                    setImages(next);
                  }}
                  maxSizeMB={10}
                />
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>{mode === "grocery" ? "Grocery Classification" : "Category"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value ? String(field.value) : "0"}
                        onValueChange={(v) => field.onChange(Number(v) > 0 ? Number(v) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Select…</SelectItem>
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === "grocery" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origin_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Country</FormLabel>
                          <Select value={(field.value as any) ?? "IN"} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ""} placeholder="A, AA, AAA, Organic, Premium..." /></FormControl>
                          <p className="text-xs text-muted-foreground">Quality grade or certification</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grocery extras */}
            {mode === "grocery" && (
              <WeightVariantManager
                variants={weightVariants}
                onVariantsChange={setWeightVariants}
                productName={watchedName || "Product"}
              />
            )}

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>{mode === "grocery" ? "Pricing (INR)" : "Pricing"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_inr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (INR)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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
                          <FormControl><Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0.00" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="aed_pricing_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AED Pricing Mode</FormLabel>
                      <Select value={(field.value as any) ?? "STATIC"} onValueChange={field.onChange} disabled={mode === "grocery"}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="STATIC">Static Price</SelectItem>
                          <SelectItem value="GOLD">Gold Based</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(mode === "standard" || watchedAedMode === "STATIC") && (
                  <FormField
                    control={form.control}
                    name="price_aed_static"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AED Price (Static)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} type="number" step="0.01" placeholder="0.00" disabled={mode === "grocery"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                {basePrice > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Price Preview</h4>
                    <div className="flex items-center gap-4">
                      {Number(watchedDiscount) > 0 ? (
                        <>
                          <span className="text-lg line-through text-muted-foreground">₹{basePrice.toFixed(2)}</span>
                          <span className="text-lg font-semibold text-green-600">₹{discountedPrice.toFixed(2)}</span>
                          <Badge variant="secondary">{watchedDiscount}% off</Badge>
                        </>
                      ) : (
                        <span className="text-lg font-semibold">₹{basePrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                )}

                {mode === "grocery" && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="mrp_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MRP (₹)</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cost_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price (₹)</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gst_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Rate (%)</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="hsn_sac"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HSN/SAC Code</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g., 0804 for mangoes" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* NEW: Nutrition & Ingredients */}
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

                {/* Nutrition Facts (rows) */}
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
                            <div key={idx} className="grid grid-cols-5 gap-2">
                              <Input
                                placeholder="Name (e.g., Calories)"
                                value={row?.name ?? ""}
                                onChange={(e) => {
                                  const next = [...rows];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  form.setValue("nutrition_facts", next, { shouldDirty: true });
                                }}
                                className="col-span-2"
                              />
                              <Input
                                placeholder="Value (e.g., 120 kcal)"
                                value={row?.value ?? ""}
                                onChange={(e) => {
                                  const next = [...rows];
                                  next[idx] = { ...next[idx], value: e.target.value };
                                  form.setValue("nutrition_facts", next, { shouldDirty: true });
                                }}
                                className="col-span-2"
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

            {/* Inventory & freshness */}
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
                      <FormLabel>{mode === "grocery" ? "Available Quantity" : "Quantity"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={Number.isFinite(field.value as any) ? field.value : 0}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(Number(e.target.value || 0))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === "grocery" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Perishable Product</Label>
                          <p className="text-xs text-muted-foreground">Requires special storage/handling</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="is_perishable"
                          render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Organic Certified</Label>
                          <p className="text-xs text-muted-foreground">Organic certification</p>
                        </div>
                        <FormField
                          control={form.control}
                          name="is_organic"
                          render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="manufacture_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manufacture/Pack Date</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} type="date" /></FormControl>
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
                          <span className="text-sm font-medium text-blue-900">
                            Suggested Best Before: {suggestedBestBefore}
                          </span>
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
                    <div>
                      <Label>Published</Label>
                      <p className="text-xs text-muted-foreground">Visible to customers</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="is_published"
                      render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />}
                    />
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
                <FormField
                  control={form.control}
                  name="new_arrival"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>New Arrival</Label>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hot_deal"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>Hot Deal</Label>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />
                {mode === "grocery" && (
                  <FormField
                    control={form.control}
                    name="hot_deal_ends_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hot Deal Ends</FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ""} type="datetime-local" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vendor */}
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
                          <FormControl><SelectTrigger><SelectValue placeholder="Select vendor (optional)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">No vendor</SelectItem>
                            {vendors.map((v: any) => (
                              <SelectItem key={v.id} value={String(v.id)}>
                                {v.name || v.display_name || `Vendor #${v.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <AddVendorDialog
                          onCreated={(newId: number) => form.setValue("vendor_id", newId, { shouldDirty: true })}
                        />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Store */}
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
                          <FormControl><SelectTrigger><SelectValue placeholder="Select store (optional)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">No store</SelectItem>
                            {stores.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <AddStoreDialog
                          onCreated={(newId: number) => form.setValue("store_id", newId, { shouldDirty: true })}
                        />
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
