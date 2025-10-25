// src/modules/products/ProductsPage.tsx
import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Leaf, Snowflake } from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useProducts, useDeleteProduct, useCreateProduct } from "@/api/hooks/products";
import { useCategories } from "@/api/hooks/categories";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/api/client";

/* ---------------- utils ---------------- */
function formatCurrency(value: string | number | null | undefined, currency: string = "INR") {
  const num = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 })
    .format(Number.isFinite(num) ? num : 0);
}

function isGroceryCat(name: string = ""): boolean {
  const hay = name.toLowerCase();
  return [
    "grain","cereal","oil","spice","natural","honey","health","wellness",
    "vegetable","fruit","dairy","beverage","bakery","snack","staple","pulse",
    "grocery","fresh"
  ].some(k => hay.includes(k));
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded border px-2 py-0.5 text-xs";
  const map: Record<string, string> = {
    "In Stock": "border-green-200 bg-green-50 text-green-700",
    "Out of Stock": "border-red-200 bg-red-50 text-red-700",
    "Featured": "border-blue-200 bg-blue-50 text-blue-700",
    "New": "border-purple-200 bg-purple-50 text-purple-700",
    "Limited": "border-amber-200 bg-amber-50 text-amber-700",
  };
  return <span className={`${base} ${map[status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>{status}</span>;
}

/** Convert possible relative media paths to absolute URLs and pick the best available image field. */
function resolveImageUrl(p: any): string | null {
  const candidates: Array<string | undefined | null> = [
    p.primary_image_url,
    p.primary_image?.image,
    Array.isArray(p.images) ? p.images.find((im: any) => im?.is_primary)?.image : undefined,
    Array.isArray(p.images) ? p.images[0]?.image : undefined,
    p.image,
  ];
  const first = candidates.find(Boolean);
  if (!first) return null;
  const url = String(first);
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  const ORIGIN = API_BASE.replace(/\/api\/?$/i, "");
  return url.startsWith("/") ? `${ORIGIN}${url}` : `${ORIGIN}/${url}`;
}

/** Tiny debounce hook */
function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ---------------- page ---------------- */
export function ProductsPage() {
  // filters / state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [inStock, setInStock] = useState<string>("all");
  const [featured, setFeatured] = useState<string>("all");
  const [organic, setOrganic] = useState<string>("all");
  const [perishable, setPerishable] = useState<string>("all");
  const [uom, setUom] = useState<string>("all");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounced(search, 300);

  // Normalize categories to always be an array
  const { data: rawCategories } = useCategories();
  const categoriesArr: any[] = Array.isArray(rawCategories)
    ? (rawCategories as any[])
    : (rawCategories?.items ?? []);

  const groceryCategories = useMemo(
    () => (Array.isArray(categoriesArr) ? categoriesArr.filter((c: any) => isGroceryCat(c?.name)) : []),
    [categoriesArr]
  );
  const otherCategories = useMemo(
    () => (Array.isArray(categoriesArr) ? categoriesArr.filter((c: any) => !isGroceryCat(c?.name)) : []),
    [categoriesArr]
  );

  // Build API params (booleans as real booleans)
  const bool = (v: string) => v === "true" ? true : v === "false" ? false : undefined;
  const params: Record<string, any> = {
    page,
    search: debouncedSearch || undefined,
    // send both; backend can accept either depending on your API
    category: category !== "all" ? category : undefined,
    category_id: category !== "all" ? category : undefined,

    in_stock: bool(inStock),
    featured: bool(featured),
    is_organic: bool(organic),
    is_perishable: bool(perishable),
    default_uom: uom !== "all" ? uom : undefined,
    ordering,
  };

  const { data, isLoading } = useProducts(params);
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const { toast } = useToast();

  // unified shape from products list
  const items = data?.items ?? [];
  const count = data?.count ?? 0;
  const hasPrev = Boolean(data?.previous);
  const hasNext = Boolean(data?.next);

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    try {
      await deleteProduct.mutateAsync({ id });
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const onDuplicate = async (p: any) => {
    try {
      const payload: Record<string, any> = {
        name: `${p.name} (Copy)`,
        description: p.description ?? "",
        category_id: p.category?.id ?? p.category_id ?? null,
        vendor_id: p.vendor?.id ?? p.vendor_id ?? null,
        store_id: p.store?.id ?? p.store_id ?? null,

        // grocery / packaging
        origin_country: p.origin_country ?? "IN",
        grade: p.grade ?? "",
        default_uom: p.default_uom ?? "PCS",
        default_pack_qty: p.default_pack_qty ?? null,
        is_organic: p.is_organic ?? false,
        is_perishable: p.is_perishable ?? false,
        shelf_life_days: p.shelf_life_days ?? null,

        // prices
        price_inr: p.price_inr ?? "0.00",
        discount_percent: p.discount_percent ?? 0,

        // flags
        featured: p.featured ?? false,
        new_arrival: p.new_arrival ?? false,
        hot_deal: p.hot_deal ?? false,

        // stock
        quantity: 0,
      };

      await createProduct.mutateAsync(payload);
      toast({ title: "Product duplicated" });
    } catch {
      toast({ title: "Duplicate failed", variant: "destructive" });
    }
  };

  // Reset page when filters change (but not when page itself changes)
  useEffect(() => { setPage(1); }, [debouncedSearch, category, inStock, featured, organic, perishable, uom, ordering]);

  const clearAll = () => {
    setSearch("");
    setCategory("all");
    setInStock("all");
    setFeatured("all");
    setOrganic("all");
    setPerishable("all");
    setUom("all");
    setOrdering("-created_at");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product catalog</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={clearAll}>
            Reset Filters
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category (grocery-first, then others) */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {groceryCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground">Grocery</div>
                    {groceryCategories.map((cat: any) => (
                      <SelectItem key={`g-${cat.id}`} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </>
                )}

                {otherCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground">Other</div>
                    {otherCategories.map((cat: any) => (
                      <SelectItem key={`o-${cat.id}`} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </>
                )}
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

            {/* Featured */}
            <Select value={featured} onValueChange={setFeatured}>
              <SelectTrigger><SelectValue placeholder="Featured" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
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
            <Select value={ordering} onValueChange={setOrdering}>
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
                ) : items.length > 0 ? (
                  items.map((p: any) => {
                    const price = p.price_inr ?? p.price ?? "0.00";
                    const discount = Number(p.discount_percent ?? 0);
                    const discounted = discount > 0 ? (Number(price) * (1 - discount / 100)).toFixed(2) : price;

                    const image = resolveImageUrl(p);

                    const qty = p.quantity ?? (p.in_stock ? 1 : 0);
                    const inStockVal = (p.in_stock ?? qty > 0) as boolean;

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={p.name}
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded border bg-muted/30" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm sm:text-base truncate">{p.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                #{p.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          {p.category?.name ?? "-"}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            {discount > 0 && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(price, "INR")}
                              </span>
                            )}
                            <span className="font-medium text-sm">
                              {formatCurrency(discounted, "INR")}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${inStockVal ? "text-green-600" : "text-red-600"}`}>
                              {qty}
                            </span>
                            <StatusBadge status={inStockVal ? "In Stock" : "Out of Stock"} />
                          </div>
                        </TableCell>

                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-1 flex-wrap">
                            {p.featured && <StatusBadge status="Featured" />}
                            {p.new_arrival && <StatusBadge status="New" />}
                            {p.limited_stock && <StatusBadge status="Limited" />}
                            {p.is_organic && (
                              <span title="Organic" className="inline-flex items-center text-green-700 text-xs border rounded px-1">
                                <Leaf className="h-3 w-3 mr-1" /> Organic
                              </span>
                            )}
                            {p.is_perishable && (
                              <span title="Perishable" className="inline-flex items-center text-amber-700 text-xs border rounded px-1">
                                <Snowflake className="h-3 w-3 mr-1" /> Perishable
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="hidden xl:table-cell text-sm">
                          {p.created_at ? dayjs(p.created_at).format("MMM D, YYYY") : "-"}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link to={`/admin/products/${p.id}/edit`}>
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onDelete(p.id, p.name)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">No products found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {count} products
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
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

export default ProductsPage;
