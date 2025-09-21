import { useState, useMemo } from "react";
import { Plus, Search, Eye, Edit, Copy, Trash2, Leaf, Refrigerator } from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useProducts, useCategories, useDeleteProduct, useCreateProduct } from "@/api/hooks/products";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

// Dummy product data
const dummyProducts = [
  {
    id: 1,
    name: "Premium Basmati Rice",
    slug: "premium-basmati-rice",
    price: "899.00",
    discounted_price: "799.00",
    discount_percent: 11,
    currency: "INR",
    quantity: 50,
    in_stock: true,
    featured: true,
    new_arrival: false,
    limited_stock: false,
    created_at: "2024-01-15T10:30:00Z",
    category: { id: 1, name: "Grains & Cereals" },
    images: [{ image: "/src/assets/product-rice.jpg" }]
  },
  {
    id: 2,
    name: "Organic Coconut Oil",
    slug: "organic-coconut-oil",
    price: "1299.00",
    discounted_price: "1099.00",
    discount_percent: 15,
    currency: "INR",
    quantity: 25,
    in_stock: true,
    featured: true,
    new_arrival: true,
    limited_stock: false,
    created_at: "2024-01-10T14:20:00Z",
    category: { id: 2, name: "Oils & Spices" },
    images: [{ image: "/src/assets/product-coconut-oil.jpg" }]
  },
  {
    id: 3,
    name: "Pure Natural Honey",
    slug: "pure-natural-honey",
    price: "899.00",
    discounted_price: "799.00",
    discount_percent: 11,
    currency: "INR",
    quantity: 0,
    in_stock: false,
    featured: false,
    new_arrival: false,
    limited_stock: true,
    created_at: "2024-01-08T09:15:00Z",
    category: { id: 3, name: "Natural Products" },
    images: [{ image: "/src/assets/product-honey.jpg" }]
  },
  {
    id: 4,
    name: "Organic Turmeric Powder",
    slug: "organic-turmeric-powder",
    price: "299.00",
    discounted_price: "249.00",
    discount_percent: 17,
    currency: "INR",
    quantity: 75,
    in_stock: true,
    featured: false,
    new_arrival: true,
    limited_stock: false,
    created_at: "2024-01-05T16:45:00Z",
    category: { id: 2, name: "Oils & Spices" },
    images: [{ image: "/src/assets/product-turmeric.jpg" }]
  },
  {
    id: 5,
    name: "Fresh Aloe Vera Gel",
    slug: "fresh-aloe-vera-gel",
    price: "599.00",
    discounted_price: "549.00",
    discount_percent: 8,
    currency: "INR",
    quantity: 30,
    in_stock: true,
    featured: true,
    new_arrival: false,
    limited_stock: true,
    created_at: "2024-01-03T11:30:00Z",
    category: { id: 4, name: "Health & Wellness" },
    images: [{ image: "/src/assets/product-aloe-gel.jpg" }]
  },
  {
    id: 6,
    name: "Organic Neem Oil",
    slug: "organic-neem-oil",
    price: "449.00",
    discounted_price: "399.00",
    discount_percent: 11,
    currency: "INR",
    quantity: 15,
    in_stock: true,
    featured: false,
    new_arrival: false,
    limited_stock: false,
    created_at: "2024-01-01T08:00:00Z",
    category: { id: 2, name: "Oils & Spices" },
    images: [{ image: "/src/assets/product-neem-oil.jpg" }]
  }
];

export function ProductsPage() {
  // filters / state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [inStock, setInStock] = useState<string>("all");        // "all" | "true" | "false"
  const [featured, setFeatured] = useState<string>("all");       // "all" | "true" | "false"
  const [organic, setOrganic] = useState<string>("all");         // "all" | "true" | "false"
  const [perishable, setPerishable] = useState<string>("all");   // "all" | "true" | "false"
  const [uom, setUom] = useState<string>("all");                 // "all" | PCS | G | KG | ML | L | BUNDLE
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useCategories();
  const groceryCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter(c => isGroceryCat(c.name)) : []),
    [categories]
  );

  // assemble params for DRF; it’s fine if backend ignores some
  const params: Record<string, any> = {
    page,
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    in_stock: inStock !== "all" ? inStock : undefined,
    featured: featured !== "all" ? featured : undefined,
    is_organic: organic !== "all" ? organic : undefined,
    is_perishable: perishable !== "all" ? perishable : undefined,
    default_uom: uom !== "all" ? uom : undefined,
    ordering,
  });

  // Use dummy data if no real data is available
  const displayProducts = productsData?.results?.length > 0 ? productsData.results : dummyProducts;
  const hasRealData = productsData?.results?.length > 0;

  const { data: productsData, isLoading } = useProducts(params);
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  const list: Product[] = productsData?.results ?? productsData ?? [];

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    try {
      await deleteProduct.mutateAsync({ id });
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const onDuplicate = async (p: Product) => {
    try {
      // copy only simple editable fields; slug will be regenerated by backend
      const payload: Partial<Product> = {
        name: `${p.name} (Copy)`,
        description: p.description ?? "",
        category_id: p.category_id ?? p.category?.id,
        vendor_id: p.vendor_id ?? null,
        store_id: p.store_id ?? null,

        // grocery bits
        origin_country: (p as any).origin_country ?? "IN",
        grade: (p as any).grade ?? "",
        default_uom: (p as any).default_uom ?? "PCS",
        default_pack_qty: (p as any).default_pack_qty ?? null,
        is_organic: (p as any).is_organic ?? false,
        is_perishable: (p as any).is_perishable ?? false,
        shelf_life_days: (p as any).shelf_life_days ?? null,

        // prices
        price_inr: p.price_inr ?? "0.00",
        price_usd: p.price_usd ?? "0.00",
        aed_pricing_mode: p.aed_pricing_mode ?? "STATIC",
        price_aed_static: p.price_aed_static ?? "0.00",
        discount_percent: p.discount_percent ?? 0,

        // flags
        featured: p.featured ?? false,
        new_arrival: p.new_arrival ?? false,
        hot_deal: p.hot_deal ?? false,

        // stock
        quantity: 0, // duplicate starts with 0 so you can adjust deliberately
      };

      await createProduct.mutateAsync(payload);
      toast({ title: "Product duplicated" });
    } catch (e) {
      toast({ title: "Duplicate failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product catalog</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative sm:col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category (grocery-first) */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {groceryCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground">Grocery</div>
                    {groceryCategories.map((cat) => (
                      <SelectItem key={`g-${cat.id}`} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs text-muted-foreground">Other</div>
                  </>
                )}
                {(categories || []).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* UOM */}
            <Select value={uom} onValueChange={setUom}>
              <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All UOM</SelectItem>
                <SelectItem value="PCS">PCS</SelectItem>
                <SelectItem value="G">G</SelectItem>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="ML">ML</SelectItem>
                <SelectItem value="L">L</SelectItem>
                <SelectItem value="BUNDLE">BUNDLE</SelectItem>
              </SelectContent>
            </Select>

            {/* Stock */}
            <Select value={inStock} onValueChange={setInStock}>
              <SelectTrigger><SelectValue placeholder="Stock" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="true">In Stock</SelectItem>
                <SelectItem value="false">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Organic */}
            <Select value={organic} onValueChange={setOrganic}>
              <SelectTrigger><SelectValue placeholder="Organic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Organic</SelectItem>
                <SelectItem value="false">Non-Organic</SelectItem>
              </SelectContent>
            </Select>

            {/* Perishable */}
            <Select value={perishable} onValueChange={setPerishable}>
              <SelectTrigger><SelectValue placeholder="Perishable" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Perishable</SelectItem>
                <SelectItem value="false">Non-Perishable</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordering */}
            <Select value={ordering} onValueChange={(v) => { setOrdering(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
                <SelectItem value="-name">Name Z–A</SelectItem>
                <SelectItem value="-price_inr">Price High–Low</SelectItem>
                <SelectItem value="price_inr">Price Low–High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            SKU: {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{product.category.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {p.discount_percent > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(p.price, p.currency)}
                          </span>
                        )}
                        <span className="font-medium text-sm">
                          {formatCurrency(product.discounted_price, product.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.quantity}
                        </span>
                        <StatusBadge status={p.in_stock ? "In Stock" : "Out of Stock"} />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {p.featured && <StatusBadge status="Featured" />}
                        {p.new_arrival && <StatusBadge status="New" />}
                        {p.limited_stock && <StatusBadge status="Limited" />}
                        {(p as any).is_organic && (
                          <span title="Organic" className="inline-flex items-center text-green-700 text-xs border rounded px-1">
                            <Leaf className="h-3 w-3 mr-1" /> Organic
                          </span>
                        )}
                        {(p as any).is_perishable && (
                          <span title="Perishable" className="inline-flex items-center text-amber-700 text-xs border rounded px-1">
                            <Refrigerator className="h-3 w-3 mr-1" /> Perishable
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {dayjs(product.created_at).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/admin/products/${product.id}`}>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={9} className="text-center py-8">No products found</TableCell></TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {displayProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {displayProducts.length} of {hasRealData ? productsData?.count || 0 : dummyProducts.length} products
            {!hasRealData && <span className="ml-2 text-primary">(Demo Data)</span>}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasRealData || !productsData?.previous}
              onClick={() => setPage(page - 1)}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasRealData || !productsData?.next}
              onClick={() => setPage(page + 1)}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
