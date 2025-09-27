// src/components/product/ProductForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft, Save, Eye, Trash2, RotateCcw, Info, Calendar, Images,
} from "lucide-react";

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

import { useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/api/hooks/products";
import { ProductOptions } from "@/components/product/ProductOptions";
import { VariantTable } from "@/components/product/VariantTable";
import { WeightVariantManager } from "@/components/product/WeightVariantManager";
import { ImageUpload } from "@/components/product/ImageUpload";
import { SpecificationsManager, SpecRow } from "@/components/product/SpecificationsManager";
import { API_BASE, uploadForm } from "@/api/http";

/* ---------------- helpers ---------------- */
const toNumberOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : Number(v));
const toStringOrUndefined = (v: unknown) => (v === "" || v == null ? undefined : String(v));
const prune = (obj: Record<string, any>) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
const baseSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(), // accepts HTML
  category_id: z.number().int().nullable().optional(),
  vendor_id: z.number().int().nullable().optional(),
  store_id: z.number().int().nullable().optional(),

  price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid INR price"),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid USD price").optional().nullable(),
  aed_pricing_mode: z.enum(["STATIC", "GOLD"]).default("STATIC"),
  price_aed_static: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid AED price").optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(90).default(0),

  quantity: z.coerce.number().min(0).default(0),

  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  hot_deal: z.boolean().default(false),
});

const groceryOnlySchema = z.object({
  origin_country: z.string().default("IN"),
  grade: z.string().optional(),
  is_perishable: z.boolean().default(false),
  is_organic: z.boolean().default(false),
  manufacture_date: z.string().nullable().optional(),
  shelf_life_days: z.number().min(0).nullable().optional(),
  default_uom: z.enum(["PCS", "G", "KG", "ML", "L", "BUNDLE"]).default("KG"),
  default_pack_qty: z.string().nullable().optional(),
  hsn_sac: z.string().optional(),
  gst_rate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid GST rate").default("0.00"),
  mrp_price: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0.00"),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0.00"),
  hot_deal_ends_at: z.string().nullable().optional(),
  warranty_months: z.number().min(0).optional(),
});

/** discriminated union by mode */
const formSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("standard") }).and(baseSchema),
  z.object({ mode: z.literal("grocery") }).and(baseSchema).and(groceryOnlySchema),
]);

type FormValues = z.infer<typeof formSchema>;

/* ---------------- component ---------------- */
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // local state
  const [mode, setMode] = useState<"standard" | "grocery">("grocery");
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [weightVariants, setWeightVariants] = useState<any[]>([]);
  const [images, setImages] = useState<{ id?: number; image: string; is_primary: boolean; file?: File }[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [showDescPreview, setShowDescPreview] = useState(false);

  // derive grocery categories
  const groceryCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter((c: any) => {
        const n = (c?.name || "").toLowerCase();
        return (
          n.includes("food") ||
          n.includes("grocery") ||
          n.includes("agriculture") ||
          n.includes("vegetable") ||
          n.includes("fruit") ||
          n.includes("spice") ||
          n.includes("grain") ||
          n.includes("dairy") ||
          n.includes("beverage")
        );
      }),
    [categories]
  );

  // form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      mode,
      name: "",
      description: "",
      category_id: null,
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
      // grocery
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
    } as any,
  });

  const handleModeChange = (m: "standard" | "grocery") => {
    setMode(m);
    form.setValue("mode", m);
  };

  // watches & derived
  const watchedName = form.watch("name");
  const watchedAedMode = form.watch("aed_pricing_mode");
  const basePrice = parseFloat(form.watch("price_inr") || "0");
  const watchedDiscount = form.watch("discount_percent");
  const discountedPrice =
    basePrice && Number(watchedDiscount) > 0 ? basePrice * (1 - Number(watchedDiscount) / 100) : basePrice;

  const watchedManufactureDate = form.watch("manufacture_date" as any);
  const watchedShelfLife = form.watch("shelf_life_days" as any);
  const suggestedBestBefore =
    watchedManufactureDate && (watchedShelfLife ?? null) !== null
      ? new Date(new Date(watchedManufactureDate as any).getTime() + Number(watchedShelfLife || 0) * 86400000).toLocaleDateString()
      : null;

  /* ---------------- load product (edit mode) ---------------- */
  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${id}/`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const p = await res.json();

        // fill form
        form.reset({
          ...(p?.origin_country ? { mode: "grocery" } : { mode: "standard" }),
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
          // grocery
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
        } as any);

        setMode((p?.origin_country ? "grocery" : "standard") as any);

        // images from product detail
        const ims = Array.isArray(p.images)
          ? p.images.map((im: any) => ({
              id: im.id,
              image: im.image, // absolute URL from DRF storage
              is_primary: !!im.is_primary,
            }))
          : [];
        setImages(ims);

        // (optional) load specs if your endpoint is available
        try {
          const sres = await fetch(`${API_BASE}/product-specifications/?product=${id}`, { credentials: "include" });
          if (sres.ok) {
            const sdata = await sres.json();
            const rows = Array.isArray(sdata?.results ?? sdata)
              ? (sdata.results ?? sdata).map((r: any) => ({
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
          }
        } catch {
          /* ignore if endpoint missing */
        }
      } catch (e) {
        toast({ title: "Failed to load product", variant: "destructive" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  /* ---------------- uploads & specs posting ---------------- */
  async function uploadProductImages(productId: number) {
    const toCreate = images.filter((im) => im.file instanceof File);
    for (const im of toCreate) {
      const fd = new FormData();
      fd.append("product", String(productId));
      fd.append("image", im.file as File);
      fd.append("is_primary", im.is_primary ? "true" : "false");
      await uploadForm("/product-images/", fd);
    }
  }

  async function createProductSpecs(productId: number) {
    for (const s of specs) {
      // skip existing ones if they already have an id (basic create-only flow)
      if (s.id) continue;
      const payload = {
        product: productId,
        group: s.group || "",
        name: s.name,
        value: s.value,
        unit: s.unit || "",
        is_highlight: !!s.is_highlight,
        sort_order: Number(s.sort_order || 0),
      };
      const r = await fetch(`${API_BASE}/product-specifications/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("spec create failed");
    }
  }

  /* ---------------- submit ---------------- */
  const onSubmit = async (raw: FormValues) => {
    try {
      const commonPayload = prune({
        name: toStringOrUndefined(raw.name),
        description: toStringOrUndefined(raw.description),
        category_id: raw.category_id ?? undefined,
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
      });

      const groceryPayload =
        raw.mode === "grocery"
          ? prune({
              origin_country: raw.origin_country ?? "IN",
              grade: toStringOrUndefined(raw.grade),
              is_perishable: !!(raw as any).is_perishable,
              is_organic: !!(raw as any).is_organic,
              manufacture_date: (raw as any).manufacture_date || null,
              shelf_life_days: (raw as any).shelf_life_days ?? null,
              default_uom: (raw as any).default_uom ?? "KG",
              default_pack_qty: (raw as any).default_pack_qty ?? null,
              hsn_sac: toStringOrUndefined((raw as any).hsn_sac),
              gst_rate: toStringOrUndefined((raw as any).gst_rate) ?? "0.00",
              mrp_price: toStringOrUndefined((raw as any).mrp_price) ?? "0.00",
              cost_price: toStringOrUndefined((raw as any).cost_price) ?? "0.00",
              hot_deal_ends_at: (raw as any).hot_deal_ends_at ?? null,
              warranty_months: toNumberOrUndefined((raw as any).warranty_months),
              // lock others for grocery
              price_usd: "0.00",
              aed_pricing_mode: "STATIC",
              price_aed_static: "0.00",
            })
          : {};

      const payload = { ...commonPayload, ...groceryPayload };

      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(id), ...payload });
        if (images.some((im) => im.file)) await uploadProductImages(Number(id));
        if (specs.some((s) => !s.id)) await createProductSpecs(Number(id));
        toast({ title: "Product updated" });
      } else {
        const created: any = await createProduct.mutateAsync(payload as any);
        const pid = created?.id ?? created?.data?.id ?? created;
        if (images.length) await uploadProductImages(pid);
        if (specs.length) await createProductSpecs(pid);
        toast({ title: raw.mode === "grocery" ? "Grocery product created" : "Product created" });
        navigate("/admin/products");
      }
    } catch (e) {
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

  /* ---------------- variants generator ---------------- */
  const generateVariants = () => {
    if (productOptions.length === 0) return;

    const combos = productOptions.reduce((acc: any[], opt: any) => {
      if (!opt.values?.length) return acc;
      if (!acc.length) return opt.values.map((v: string) => ({ [opt.name]: v }));
      const out: any[] = [];
      acc.forEach((c) => opt.values.forEach((v: string) => out.push({ ...c, [opt.name]: v })));
      return out;
    }, []);

    const newVariants = combos.map((attributes: any, i: number) => {
      const attrValues = Object.values(attributes);
      const skuBase = slugify(form.watch("name") || "product");
      const sku = skuBase + "-" + (attrValues.length ? attrValues.join("-").toLowerCase() : `var-${i + 1}`);

      const joined = attrValues.join(" ");
      const m = joined.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b/i);
      const weight_value = m ? m[1] : null;
      const weight_unit = m ? m[2].toUpperCase() : null;

      return {
        id: Date.now() + i,
        sku,
        attributes,
        quantity: 0,
        price_override: null,
        discount_override: null,
        is_active: true,
        weight_value,
        weight_unit,
        color_id: null,
        mrp: form.getValues("mrp_price" as any) || "0.00",
        barcode: "",
        min_order_qty: 1,
        step_qty: 1,
      };
    });

    setProductVariants(newVariants);
    toast({ title: "Variants generated", description: `${newVariants.length} product variants created` });
  };

  /* ---------------- render ---------------- */
  const desc = form.watch("description") || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-3 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
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
              <Button variant={mode === "standard" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("standard")}>Standard</Button>
              <Button variant={mode === "grocery" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("grocery")}>Grocery</Button>
            </div>

            {isEditMode && (
              <>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Eye className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => form.reset({ ...form.getValues(), mode })}>
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </header>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6">
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
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Organic Alphonso Mangoes - Premium Grade" />
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
                    <Button variant="outline" size="sm" onClick={() => setShowDescPreview((v) => !v)}>
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
                    // previews only; real upload after save (need product id)
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
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value == null ? "none" : String(field.value)}
                        onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={mode === "grocery" ? "Select food/grocery category" : "Select category (optional)"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{mode === "grocery" ? "Select a category" : "No category"}</SelectItem>
                          {(mode === "grocery" ? groceryCategories : (categories as any[])).map((cat: any) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mode === "grocery" && groceryCategories.length === 0 && (
                        <p className="text-xs text-amber-600">Only food/grocery categories shown. Create grocery categories if none exist.</p>
                      )}
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
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
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
                          <FormControl><Input {...field} placeholder="A, AA, AAA, Organic, Premium..." /></FormControl>
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
              <>
                <WeightVariantManager
                  variants={weightVariants as any}
                  onVariantsChange={setWeightVariants}
                  productName={watchedName || "Product"}
                />

                <ProductOptions
                  options={productOptions}
                  onOptionsChange={setProductOptions}
                  onGenerateVariants={generateVariants}
                />

                {productVariants.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Variants</CardTitle>
                      <p className="text-sm text-muted-foreground">Manage inventory and pricing for each variant</p>
                    </CardHeader>
                    <CardContent>
                      <VariantTable
                        control={form.control}
                        variants={productVariants}
                        onVariantChange={(i, field, value) => {
                          const updated = [...productVariants];
                          updated[i] = { ...updated[i], [field]: value };
                          setProductVariants(updated);
                        }}
                        onRemoveVariant={(i) => setProductVariants((arr) => arr.filter((_, idx) => idx !== i))}
                        onBulkEdit={() => {}}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
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
                        <FormControl><Input {...field} type="number" step="0.01" placeholder="0.00" /></FormControl>
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
                          <FormControl><Input {...field} type="number" step="0.01" placeholder="0.00" /></FormControl>
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
                      <Select value={field.value ?? "STATIC"} onValueChange={field.onChange} disabled={mode === "grocery"}>
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
                          <Input {...field} type="number" step="0.01" placeholder="0.00" disabled={mode === "grocery"} />
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
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
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
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
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
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
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
                          <FormControl><Input {...field} placeholder="e.g., 0804 for mangoes" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
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
                          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
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
                          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
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
                            <FormControl><Input {...field} type="date" /></FormControl>
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

            {/* Packaging (grocery only) */}
            {mode === "grocery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Packaging & Unit of Measure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="default_uom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Unit of Measure</FormLabel>
                          <Select value={field.value as any} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {UOM_OPTIONS.map((u) => (
                                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="default_pack_qty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Pack Quantity</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., 500, 1.0, 750" /></FormControl>
                          <p className="text-xs text-muted-foreground">Standard pack size (e.g., 500G, 1KG, 750ML)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">
                        Customers will see price per KG/L on variant listings
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <Switch defaultChecked />
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
                        <FormControl><Input {...field} type="datetime-local" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                      <Select
                        value={field.value ? String(field.value) : "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select vendor (optional)" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">No vendor</SelectItem>
                          {/* TODO: wire vendors list */}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="store_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{mode === "grocery" ? "Store/Location" : "Store"}</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select store (optional)" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">No store</SelectItem>
                          {/* TODO: wire stores list */}
                        </SelectContent>
                      </Select>
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
