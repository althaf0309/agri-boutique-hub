import { useState, useEffect } from "react";
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
import { useCategories, useCreateProduct, useUpdateProduct } from "@/api/hooks/products";

// Simple validation schema for now
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.number().min(1, "Category is required"),
  vendor_id: z.number().optional().nullable(),
  store_id: z.number().optional().nullable(),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  aed_pricing_mode: z.enum(["STATIC", "GOLD"]),
  price_aed_static: z.string().optional().nullable(),
  discount_percent: z.number().min(0).max(90, "Discount must be between 0-90%"),
  featured: z.boolean(),
  new_arrival: z.boolean(),
  hot_deal: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: 0,
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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(id), ...data });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync(data);
        toast({ title: "Product created successfully" });
        navigate("/admin/products");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save product",
        variant: "destructive" 
      });
    }
  };

  const watchedName = form.watch("name");
  const watchedAedMode = form.watch("aed_pricing_mode");

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
                {isEditMode ? "Edit Product" : "Add Product"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isEditMode && (
              <>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Eye className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => form.reset()}>
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
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
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
                        <Input {...field} placeholder="Enter product name" />
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
                          placeholder="Product description..."
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
                        value={field.value > 0 ? field.value.toString() : "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? 0 : Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Select a category</SelectItem>
                          {Array.isArray(categories) && categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
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
                          <Input {...field} type="number" step="0.01" />
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
                          <Input {...field} type="number" step="0.01" />
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
                      <Select value={field.value} onValueChange={field.onChange}>
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
                          <Input {...field} type="number" step="0.01" />
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="new_arrival"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>New Arrival</Label>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hot_deal"
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <Label>Hot Deal</Label>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                        value={field.value ? field.value.toString() : "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
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
                        value={field.value ? field.value.toString() : "none"} 
                        onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
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