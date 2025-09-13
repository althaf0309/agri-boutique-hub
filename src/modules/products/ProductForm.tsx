import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Trash2, RotateCcw, Upload, X, Star, Image as ImageIcon, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useProduct, useCategories, useCreateProduct, useUpdateProduct } from "@/api/hooks/products";
import dayjs from "dayjs";

// Validation Schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  category_id: z.number().min(1, "Category is required"),
  vendor_id: z.number().optional().nullable(),
  store_id: z.number().optional().nullable(),
  quantity: z.number().min(0, "Quantity must be non-negative"),
  price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  aed_pricing_mode: z.enum(["STATIC", "GOLD"]),
  price_aed_static: z.string().optional().nullable(),
  gold_weight_g: z.string().optional().nullable(),
  gold_making_charge: z.string().optional().nullable(),
  gold_markup_percent: z.string().optional().nullable(),
  discount_percent: z.number().min(0).max(90, "Discount must be between 0-90%"),
  grade: z.string().optional(),
  manufacture_date: z.string().optional().nullable(),
  origin_country: z.string().optional(),
  warranty_months: z.number().min(0, "Warranty must be non-negative"),
  default_uom: z.enum(["PCS", "G", "KG", "ML", "L", "BUNDLE"]),
  default_pack_qty: z.number().optional().nullable(),
  is_organic: z.boolean(),
  is_perishable: z.boolean(),
  shelf_life_days: z.number().min(0).optional().nullable(),
  hsn_sac: z.string().optional(),
  gst_rate: z.number().min(0).max(100, "GST rate must be between 0-100%"),
  mrp_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  featured: z.boolean(),
  new_arrival: z.boolean(),
  hot_deal: z.boolean(),
  hot_deal_ends_at: z.string().optional().nullable(),
  // Options and variants will be handled separately
  options: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })),
  variants: z.array(z.object({
    id: z.number().optional(),
    product: z.number().optional(),
    sku: z.string(),
    attributes: z.record(z.string()),
    price_override: z.string().optional().nullable(),
    discount_override: z.number().optional().nullable(),
    quantity: z.number().min(0),
    is_active: z.boolean(),
    weight_value: z.string().optional().nullable(),
    weight_unit: z.enum(["G", "KG", "ML", "L"]).optional().nullable(),
    weight_label: z.string().optional().nullable(),
    color_id: z.number().optional().nullable(),
    mrp: z.string().optional().nullable(),
    barcode: z.string().optional(),
    min_order_qty: z.number().min(1),
    step_qty: z.number().min(1),
    unit_price: z.string().optional(),
    images: z.array(z.any()).optional(),
    created_at: z.string().optional()
  }))
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  const productId = id ? Number(id) : 0;
  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [currentTab, setCurrentTab] = useState("general");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      price_inr: "0.00",
      price_usd: "0.00",
      aed_pricing_mode: "STATIC",
      price_aed_static: "0.00",
      discount_percent: 0,
      origin_country: "",
      warranty_months: 0,
      default_uom: "PCS",
      is_organic: false,
      is_perishable: false,
      gst_rate: 0,
      mrp_price: "0.00",
      cost_price: "0.00",
      featured: false,
      new_arrival: false,
      hot_deal: false,
      options: [],
      variants: []
    }
  });

  const { fields: optionFields, append: addOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  // Load product data for edit mode
  useEffect(() => {
    if (product && isEditMode) {
      const formData = {
        ...product,
        category_id: product.category?.id || 0,
        vendor_id: product.vendor?.id || null,
        store_id: product.store?.id || null,
        options: [], // TODO: Load from product options
        variants: product.variants || []
      };
      form.reset(formData as any);
      setProductImages(product.images || []);
    }
  }, [product, isEditMode, form]);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const generateVariants = () => {
    const options = form.getValues("options");
    if (options.length === 0) return;

    const combinations: any[] = [];
    const generateCombinations = (index: number, current: any) => {
      if (index === options.length) {
        combinations.push({ ...current });
        return;
      }
      
      const option = options[index];
      option.values.forEach(value => {
        generateCombinations(index + 1, { ...current, [option.name]: value });
      });
    };

    generateCombinations(0, {});
    
    const variants = combinations.map((attrs, i) => ({
      sku: `${generateSlug(form.getValues("name"))}-${Object.values(attrs).join('-').toLowerCase()}`,
      attributes: attrs,
      quantity: 0,
      is_active: true,
      min_order_qty: 1,
      step_qty: 1,
      unit_price: "0.00",
      images: [],
      created_at: new Date().toISOString()
    }));

    form.setValue("variants", variants);
    toast({ title: "Variants generated", description: `Generated ${variants.length} variants` });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Remove variants and options from the main product data for API call
      const { variants, options, ...productData } = data;
      
      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(id), ...productData });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync(productData);
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

  if (productLoading) {
    return <div className="p-6">Loading...</div>;
  }

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
                {isEditMode ? (product?.name || "Edit Product") : "Add Product"}
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
                <Button variant="outline" size="sm">
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
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general">
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
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="h-3 w-3" />
                      </Button>
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
                            value={field.value?.toString()} 
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag and drop images here, or click to browse
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Add Images
                        </Button>
                      </div>
                      
                      {productImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                          {productImages.map((img, index) => (
                            <div key={img.id || index} className="relative group">
                              <img 
                                src={img.image} 
                                alt="" 
                                className="w-full h-32 object-cover rounded border"
                              />
                              {img.is_primary && (
                                <Badge className="absolute top-2 left-2">Primary</Badge>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing">
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

                    {watchedAedMode === "GOLD" && (
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="gold_weight_g"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gold Weight (g)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gold_making_charge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Making Charge</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gold_markup_percent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Markup (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="mrp_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MRP Price</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cost_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" />
                            </FormControl>
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
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="100"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory & Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
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

                      <FormField
                        control={form.control}
                        name="default_uom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit of Measure</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PCS">Pieces</SelectItem>
                                <SelectItem value="G">Grams</SelectItem>
                                <SelectItem value="KG">Kilograms</SelectItem>
                                <SelectItem value="ML">Milliliters</SelectItem>
                                <SelectItem value="L">Liters</SelectItem>
                                <SelectItem value="BUNDLE">Bundle</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="A, B, Premium..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="origin_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin Country</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="IN, CN, US..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="warranty_months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty (months)</FormLabel>
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
                    </div>

                    <div className="flex items-center space-x-6">
                      <FormField
                        control={form.control}
                        name="is_organic"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Organic</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_perishable"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Perishable</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shelf_life_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shelf Life (days)</FormLabel>
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Options Tab */}
              <TabsContent value="options">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Product Options
                      <Button size="sm" onClick={() => addOption({ name: "", values: [] })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {optionFields.map((field, index) => (
                      <div key={field.id} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <FormField
                            control={form.control}
                            name={`options.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1 mr-4">
                                <FormLabel>Option Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Size, Color, etc." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Values</Label>
                          <div className="flex flex-wrap gap-2">
                            {/* TODO: Implement option values management */}
                            <Button variant="outline" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Value
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {optionFields.length > 0 && (
                      <div className="pt-4">
                        <Button onClick={generateVariants}>
                          Generate Variants from Options
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Variants Tab */}
              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Product Variants
                      <Button size="sm" onClick={() => addVariant({
                        sku: "",
                        attributes: {},
                        quantity: 0,
                        is_active: true,
                        min_order_qty: 1,
                        step_qty: 1,
                        unit_price: "0.00",
                        images: [],
                        created_at: new Date().toISOString()
                      })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {variantFields.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Attributes</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price Override</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variantFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.sku`}
                                  render={({ field }) => (
                                    <Input {...field} className="w-32" />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {/* TODO: Display attributes as badges */}
                                  <Badge variant="secondary">No attributes</Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.quantity`}
                                  render={({ field }) => (
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      className="w-20"
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.price_override`}
                                  render={({ field }) => (
                                    <Input {...field} className="w-24" />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.is_active`}
                                  render={({ field }) => (
                                    <Switch 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange} 
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No variants yet. Add options first, then generate variants.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Product Status</Label>
                  <Switch />
                </div>
                <Separator />
                
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
                        value={field.value?.toString() || ""} 
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No vendor</SelectItem>
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
                        value={field.value?.toString() || ""} 
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No store</SelectItem>
                          {/* TODO: Load stores */}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Stats Card (Edit Mode) */}
            {isEditMode && product && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Views:</span>
                    <Badge variant="secondary">{product.views_count}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>In Carts:</span>
                    <Badge variant="secondary">{product.carts_count}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sold:</span>
                    <Badge variant="secondary">{product.sold_count}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating_avg}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <div>Created: {dayjs(product.created_at).format("MMM D, YYYY")}</div>
                    <div>Updated: {dayjs(product.updated_at).format("MMM D, YYYY")}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}