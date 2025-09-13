import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Trash2, RotateCcw, Info, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/api/hooks/products";

// Grocery-focused validation schema
const groceryProductSchema = z.object({
  // Basic Information
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.number().min(1, "Category is required"),
  
  // Grocery Classification
  vendor_id: z.number().optional().nullable(),
  store_id: z.number().optional().nullable(),
  origin_country: z.string().default("IN"),
  grade: z.string().optional(),
  
  // Inventory & Freshness
  quantity: z.number().min(0, "Quantity must be non-negative"),
  manufacture_date: z.string().optional().nullable(),
  is_perishable: z.boolean().default(false),
  is_organic: z.boolean().default(false),
  shelf_life_days: z.number().min(0).optional().nullable(),
  
  // Packaging & UOM
  default_uom: z.enum(["PCS", "G", "KG", "ML", "L", "BUNDLE"]),
  default_pack_qty: z.string().optional().nullable(),
  
  // Pricing (INR only)
  price_inr: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  discount_percent: z.number().min(0).max(90, "Discount must be between 0-90%"),
  
  // Tax & Cost
  hsn_sac: z.string().optional(),
  gst_rate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid GST rate"),
  mrp_price: z.string().optional(),
  cost_price: z.string().optional(),
  
  // Sales Flags
  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  hot_deal: z.boolean().default(false),
  hot_deal_ends_at: z.string().optional().nullable(),
  
  // Advanced (non-grocery fields)
  warranty_months: z.number().min(0).optional(),
});

type GroceryProductFormData = z.infer<typeof groceryProductSchema>;

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

export function GroceryProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [productImages, setProductImages] = useState<any[]>([]);

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<GroceryProductFormData>({
    resolver: zodResolver(groceryProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: 0,
      vendor_id: null,
      store_id: null,
      origin_country: "IN",
      grade: "",
      quantity: 0,
      manufacture_date: null,
      is_perishable: false,
      is_organic: false,
      shelf_life_days: null,
      default_uom: "KG",
      default_pack_qty: null,
      price_inr: "0.00",
      discount_percent: 0,
      hsn_sac: "",
      gst_rate: "0.00",
      mrp_price: "0.00",
      cost_price: "0.00",
      featured: false,
      new_arrival: false,
      hot_deal: false,
      hot_deal_ends_at: null,
      warranty_months: 0,
    }
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: GroceryProductFormData) => {
    try {
      const payload = {
        ...data,
        // Convert string fields to proper types for API
        price_usd: "0.00", // Always 0 for grocery-only
        aed_pricing_mode: "STATIC" as const,
        price_aed_static: "0.00",
      };

      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(id), ...payload });
        toast({ title: "Grocery product updated successfully" });
      } else {
        await createProduct.mutateAsync(payload);
        toast({ title: "Grocery product created successfully" });
        navigate("/admin/products");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save grocery product",
        variant: "destructive" 
      });
    }
  };

  const watchedName = form.watch("name");
  const watchedManufactureDate = form.watch("manufacture_date");
  const watchedShelfLife = form.watch("shelf_life_days");
  const watchedPrice = form.watch("price_inr");
  const watchedDiscount = form.watch("discount_percent");
  const watchedIsPerishable = form.watch("is_perishable");
  const watchedCategory = form.watch("category_id");

  // Filter categories to grocery/food only
  const groceryCategories = Array.isArray(categories) 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes('food') || 
        cat.name.toLowerCase().includes('grocery') ||
        cat.name.toLowerCase().includes('agriculture') ||
        cat.name.toLowerCase().includes('vegetable') ||
        cat.name.toLowerCase().includes('fruit') ||
        cat.name.toLowerCase().includes('spice') ||
        cat.name.toLowerCase().includes('grain') ||
        cat.name.toLowerCase().includes('dairy') ||
        cat.name.toLowerCase().includes('beverage')
      )
    : [];

  // Calculate suggested best-before date
  const suggestedBestBefore = watchedManufactureDate && watchedShelfLife 
    ? new Date(new Date(watchedManufactureDate).getTime() + watchedShelfLife * 24 * 60 * 60 * 1000).toLocaleDateString()
    : null;

  // Calculate discounted price
  const basePrice = parseFloat(watchedPrice || "0");
  const discountedPrice = basePrice * (1 - watchedDiscount / 100);

  return (
    <TooltipProvider>
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
                  {isEditMode ? watchedName || "Edit Grocery Product" : "Add Grocery Product"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Agricultural & Food Products Management
                </p>
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
                Save Product
              </Button>
            </div>
          </div>
        </header>

        <Form {...form}>
          <form className="grid grid-cols-12 gap-6 p-6">
            {/* Main Content */}
            <div className="col-span-8 space-y-6">
              {/* Title & Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter the basic details about your grocery/agricultural product
                  </p>
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
                    <code className="bg-muted px-2 py-1 rounded">
                      {generateSlug(watchedName || "")}
                    </code>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
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
                            placeholder="Describe origin, grade, freshness, harvest details, nutritional benefits..."
                            rows={4}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Tip: Include origin, grade, freshness indicators, and harvest window
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Grocery Classification */}
              <Card>
                <CardHeader>
                  <CardTitle>Grocery Classification</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Categorize and classify your grocery product
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
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
                              <SelectValue placeholder="Select food/grocery category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Select a category</SelectItem>
                            {groceryCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {groceryCategories.length === 0 && (
                          <p className="text-xs text-amber-600">
                            Only food/grocery categories shown. Create grocery categories if none exist.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origin_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Country</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name}
                                </SelectItem>
                              ))}
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
                          <FormControl>
                            <Input {...field} placeholder="A, AA, AAA, Organic, Premium..." />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Quality grade or certification
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload high-quality images showing freshness and appeal
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="text-sm text-muted-foreground">
                      Image upload functionality will be available after product creation
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing (INR)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set pricing in Indian Rupees for your grocery product
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_inr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price (₹)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>

                  {/* Price Preview */}
                  {basePrice > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Price Preview</h4>
                      <div className="flex items-center gap-4">
                        {watchedDiscount > 0 ? (
                          <>
                            <span className="text-lg line-through text-muted-foreground">
                              ₹{basePrice.toFixed(2)}
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              ₹{discountedPrice.toFixed(2)}
                            </span>
                            <Badge variant="secondary">{watchedDiscount}% off</Badge>
                          </>
                        ) : (
                          <span className="text-lg font-semibold">₹{basePrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="mrp_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MRP (₹)</FormLabel>
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
                          <FormLabel>Cost Price (₹)</FormLabel>
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
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
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
                        <FormControl>
                          <Input {...field} placeholder="e.g., 0804 for mangoes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Inventory & Freshness */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Freshness</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage stock levels and freshness indicators
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Quantity</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Perishable Product</Label>
                        <p className="text-xs text-muted-foreground">
                          Requires special storage/handling
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="is_perishable"
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Organic Certified</Label>
                        <p className="text-xs text-muted-foreground">
                          Organic certification
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="is_organic"
                        render={({ field }) => (
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        )}
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
                          <FormControl>
                            <Input {...field} type="date" />
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

                  {watchedIsPerishable && !watchedShelfLife && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-900">
                          Consider adding shelf life for perishable products
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Packaging & UOM */}
              <Card>
                <CardHeader>
                  <CardTitle>Packaging & Unit of Measure</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Define how the product is packaged and sold
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="default_uom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Unit of Measure</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UOM_OPTIONS.map((uom) => (
                                <SelectItem key={uom.value} value={uom.value}>
                                  {uom.label}
                                </SelectItem>
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
                          <FormControl>
                            <Input {...field} placeholder="e.g., 500, 1.0, 750" />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Standard pack size (e.g., 500G, 1KG, 750ML)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-3 bg-info-50 rounded-lg border border-info-200">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-info-600" />
                      <span className="text-sm text-info-900">
                        Customers will see price per KG/L on variant listings
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Section (Collapsed) */}
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Advanced Settings
                            {isAdvancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Non-grocery fields (rarely used for food products)
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="warranty_months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Warranty (Months)
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-amber-600" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Usually not used for food products</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <p className="text-xs text-amber-600">
                              ⚠️ Usually not applicable for food products
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Visibility & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Visibility & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Published</Label>
                      <p className="text-xs text-muted-foreground">
                        Visible to customers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Sales Flags */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <div className="flex items-center justify-between">
                        <Label>Featured Product</Label>
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

                  <FormField
                    control={form.control}
                    name="hot_deal_ends_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hot Deal Ends</FormLabel>
                        <FormControl>
                          <Input {...field} type="datetime-local" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Organization */}
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
                        <FormLabel>Vendor/Supplier</FormLabel>
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
                        <FormLabel>Store/Location</FormLabel>
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

              {/* Stats (Read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Sold</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">0</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="text-lg font-semibold">—</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
                      <div>Created: —</div>
                      <div>Updated: —</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}