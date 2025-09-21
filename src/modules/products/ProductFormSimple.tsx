import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/api/hooks/products";

// ---------- helpers ----------
const toNumberOrUndefined = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const toStringOrUndefined = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return undefined;
  return String(v);
};
const prune = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined) return;
    out[k] = v;
  });
  return out;
};

// ---------- schema (all optional) ----------
const productSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category_id: z.number().int().optional().nullable(),
  vendor_id: z.number().int().optional().nullable(),
  store_id: z.number().int().optional().nullable(),

  quantity: z.number().int().optional(),
  price_inr: z.string().optional().nullable(),
  price_usd: z.string().optional().nullable(),
  aed_pricing_mode: z.enum(["STATIC", "GOLD"]).optional(),
  price_aed_static: z.string().optional().nullable(),
  discount_percent: z.number().int().optional(),

  featured: z.boolean().optional(),
  new_arrival: z.boolean().optional(),
  hot_deal: z.boolean().optional(),
}).partial();

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct?.(); // if you have it

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: null,
      vendor_id: null,
      store_id: null,
      quantity: 0,
      price_inr: "0.00",
      price_usd: "0.00",
      aed_pricing_mode: "STATIC",
      price_aed_static: "0.00",
      discount_percent: 0,
      featured: false,
      new_arrival: false,
      hot_deal: false,
    }
  });

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const onSubmit = async (raw: ProductFormData) => {
    try {
      const payload = prune({
        // simple scalars
        name: toStringOrUndefined(raw.name),
        description: toStringOrUndefined(raw.description),

        // ids
        category_id: raw.category_id ?? undefined,
        vendor_id: raw.vendor_id ?? undefined,
        store_id: raw.store_id ?? undefined,

        // numbers / strings (backend normalizes Decimals)
        quantity: toNumberOrUndefined(raw.quantity),
        price_inr: toStringOrUndefined(raw.price_inr),
        price_usd: toStringOrUndefined(raw.price_usd),
        aed_pricing_mode: raw.aed_pricing_mode ?? "STATIC",
        price_aed_static: toStringOrUndefined(raw.price_aed_static),
        discount_percent: toNumberOrUndefined(raw.discount_percent),

        // flags
        featured: raw.featured ?? false,
        new_arrival: raw.new_arrival ?? false,
        hot_deal: raw.hot_deal ?? false,
      });

      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(id), ...payload });
        toast({ title: "Product updated" });
      } else {
        await createProduct.mutateAsync(payload as any);
        toast({ title: "Product created" });
        navigate("/admin/products");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const onDelete = async () => {
    if (!isEditMode || !deleteProduct) return;
    try {
      await deleteProduct.mutateAsync({ id: Number(id) });
      toast({ title: "Product deleted" });
      navigate("/admin/products");
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const watchedName = form.watch("name");
  const watchedAedMode = form.watch("aed_pricing_mode");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => form.reset()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <Form {...form}>
        <form className="grid grid-cols-12 gap-6 p-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* General Information */}
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
                        <Input {...field} placeholder="Enter product name (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Label>URL Slug:</Label>
                  <code className="bg-muted px-2 py-1 rounded">
                    {generateSlug(watchedName || "")}
                  </code>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Product description (optional)"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={
                          field.value === null || field.value === undefined
                            ? "none"
                            : String(field.value)
                        }
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : Number(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {Array.isArray(categories) &&
                            categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
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
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_usd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aed_pricing_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AED Pricing Mode</FormLabel>
                      <Select value={field.value ?? "STATIC"} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STATIC">Static Price</SelectItem>
                          <SelectItem value="GOLD">Gold Based</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedAedMode === "STATIC" && (
                  <FormField
                    control={form.control}
                    name="price_aed_static"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AED Price (Static)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
                          placeholder="0"
                          onChange={(e) => field.onChange(toNumberOrUndefined(e.target.value) ?? 0)}
                        />
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
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e) => field.onChange(toNumberOrUndefined(e.target.value) ?? 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>Featured</Label>
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
              </CardContent>
            </Card>

            {/* Organization Card */}
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
                      <FormLabel>Vendor</FormLabel>
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
                          {/* TODO: Load vendors */}
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
                      <FormLabel>Store</FormLabel>
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
                          <SelectItem value="none">No store</SelectItem>
                          {/* TODO: Load stores */}
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
