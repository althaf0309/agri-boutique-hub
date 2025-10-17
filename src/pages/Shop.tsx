// src/pages/Shop.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Filter, Grid, List, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/api/hooks/products";
import { useCategories, type CategoryNode } from "@/api/hooks/categories";
import { addItem as cartAdd } from "@/lib/cart";

// types ProductCard expects
import type { CardProduct, CardVariant } from "@/components/ProductGrid";

/* ---------------- helpers ---------------- */
const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='22'>No Image</text></svg>";

const MEDIA_BASE =
  (import.meta as any)?.env?.VITE_MEDIA_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  "";

const slugify = (s: string) =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function normalizeUrl(raw?: string): string {
  if (!raw) return "";
  let u = String(raw).trim();
  const hasProto = /^https?:\/\//i.test(u);
  if (!hasProto && !u.startsWith("/")) u = `/${u}`;
  u = u.replace(/([^:]\/)\/+/g, "$1").replace(/ /g, "%20").replace(/"/g, "%22").replace(/'/g, "%27");
  if (/^https?:\/\//i.test(u)) {
    if (typeof window !== "undefined" && window.location.protocol === "https:" && u.startsWith("http://")) {
      u = "https://" + u.slice("http://".length);
    }
    return u;
  }
  const base = (MEDIA_BASE || "").replace(/\/+$/, "");
  const path = u.replace(/^\/+/, "");
  const full = base ? `${base}/${path}` : `/${path}`;
  if (typeof window !== "undefined" && window.location.protocol === "https:" && full.startsWith("http://")) {
    return "https://" + full.slice("http://".length);
  }
  return full;
}
function pickFromObj(obj: any, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v) return v;
    if (v && typeof v === "object") {
      const nested = pickFromObj(v, ["url", "image", "path", "src"]);
      if (nested) return nested;
    }
  }
  return undefined;
}
function collectImages(p: any): string[] {
  const urls: string[] = [];
  const topLevel = pickFromObj(p, ["primary_image_url", "image_url", "image", "thumbnail"]);
  if (topLevel) urls.push(topLevel);
  const primary = pickFromObj(p?.primary_image, ["url", "image", "path", "src"]);
  if (primary) urls.push(primary);
  const arrays = [p?.images, p?.gallery, p?.media, p?.image_paths].filter(Array.isArray) as any[][];
  for (const arr of arrays) {
    for (const item of arr) {
      if (typeof item === "string") urls.push(item);
      else if (item && typeof item === "object") {
        const u = pickFromObj(item, ["url", "image", "path", "src"]);
        if (u) urls.push(u);
      }
    }
  }
  const normalized = urls.map((x) => normalizeUrl(x)).filter(Boolean);
  return Array.from(new Set(normalized));
}

/* ---------------- variant mapping ---------------- */
function mapWeightVariants(p: any): CardVariant[] | undefined {
  const list = Array.isArray(p?.variants) ? p.variants : (Array.isArray(p?.weight_variants) ? p.weight_variants : []);
  if (!list.length) return undefined;

  const productBase = Number(p?.price_inr ?? p?.price ?? 0) || 0;
  const productDisc = Number(p?.discount_percent ?? 0) || 0;

  const variants: CardVariant[] = list
    .map((v: any, idx: number) => {
      const vBase =
        v?.price_override != null
          ? Number(v.price_override)
          : Number(v?.price_inr ?? v?.price ?? productBase) || 0;

      const vDisc =
        v?.discount_override != null
          ? Number(v.discount_override)
          : productDisc;

      const price = vDisc > 0 ? Number((vBase * (1 - vDisc / 100)).toFixed(2)) : Number(vBase.toFixed(2));
      const originalPrice = vDisc > 0 ? Number(vBase.toFixed(2)) : undefined;

      const wv = v?.weight_value ?? v?.pack_qty;
      const wu = (v?.weight_unit || v?.uom || "").toUpperCase();
      const weight =
        wv != null && wu
          ? `${String(wv).replace(/\.0+$/, "")}${wu}`
          : (v?.attributes?.Weight || v?.label || v?.weight || "");

      return {
        id: Number(v?.id ?? idx + 1),
        sku: v?.sku,
        stockCount: Number(v?.quantity ?? v?.stock ?? 0),
        price,
        originalPrice,
        weight: String(weight || "").trim(),
      } as CardVariant;
    })
    .filter((vv) => vv.weight);

  return variants.length ? variants : undefined;
}

/* ---------------- map backend product -> CardProduct ---------------- */
function toCardProduct(p: any): CardProduct {
  const images = collectImages(p);
  const image = images[0] || PLACEHOLDER;

  const productBase = Number(p?.price_inr ?? p?.price ?? 0) || 0;
  const productDisc = Number(p?.discount_percent ?? 0) || 0;
  const price = productDisc > 0 ? Number((productBase * (1 - productDisc / 100)).toFixed(2)) : productBase;
  const originalPrice = productDisc > 0 ? productBase : undefined;

  const weight =
    p?.default_pack_qty && (p?.default_uom || p?.uom)
      ? `${p.default_pack_qty}${p.default_uom || p.uom}`
      : p?.default_uom || p?.uom || "";

  const weightVariants = mapWeightVariants(p);
  const inStock = Array.isArray(weightVariants) && weightVariants.length
    ? weightVariants.some((v) => v.stockCount > 0)
    : (typeof p?.in_stock === "boolean" ? p.in_stock : Number(p?.quantity ?? 0) > 0);

  const categoryName = p?.category?.name ?? p?.category_name ?? "";
  const categorySlug = p?.category?.slug ?? (categoryName ? slugify(categoryName) : undefined);

  return {
    id: p.id,
    slug: p.slug || p.seo_slug || undefined,
    name: p.name ?? "Product",
    price,
    originalPrice,
    rating: Number(p?.avg_rating ?? p?.rating ?? 0) || 0,
    reviewCount: Number(p?.review_count ?? p?.reviews_count ?? 0) || 0,
    image,
    images,
    category: categoryName,
    categorySlug,
    weight,
    organic: Boolean(p?.is_organic),
    inStock,
    description: p?.description ?? "",
    weightVariants,
    created_at: p?.created_at,
  } as CardProduct;
}

/* ---------------- fallback static categories (if API not ready) ---------------- */
const fallbackSidebar = [
  { label: "All Categories", slug: "all", depth: 0 },
  { label: "Organic Grocery", slug: "organic-grocery", depth: 0 },
  { label: "Ruchira", slug: "ruchira", depth: 0 },
  { label: "Personal Care", slug: "personal-care", depth: 0 },
  { label: "Plant Nursery", slug: "plant-nursery", depth: 0 },
  { label: "Fruits & Vegetables", slug: "fruits-vegetables", depth: 0 },
];

const tags = ["Organic", "Vegan", "Gluten-Free", "Non-GMO", "Fair Trade"];

/* ---------------- helpers for filtering/sorting ---------------- */
function effectivePrice(cp: CardProduct): number {
  const vs = (cp as any).weightVariants as CardVariant[] | undefined;
  if (vs?.length) {
    const prices = vs.map(v => Number(v.price)).filter(n => Number.isFinite(n));
    if (prices.length) return Math.min(...prices);
  }
  return Number(cp.price) || 0;
}
function matchesTags(cp: CardProduct, selectedTags: string[]) {
  if (!selectedTags.length) return true;
  const hay = `${cp.name} ${cp.description}`.toLowerCase();
  return selectedTags.every(tag => hay.includes(tag.toLowerCase()));
}
function localSearchMatch(cp: CardProduct, q: string) {
  if (!q.trim()) return true;
  const hay = `${cp.name} ${cp.description} ${cp.category}`.toLowerCase();
  return hay.includes(q.trim().toLowerCase());
}
function sortCards(cards: CardProduct[], sortBy: string) {
  const copy = [...cards];
  switch (sortBy) {
    case "price-low":
      copy.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price-high":
      copy.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case "popular":
      copy.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      break;
    case "rating":
      copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default: // newest
      copy.sort((a: any, b: any) => {
        const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bd - ad;
      });
  }
  return copy;
}

/* ---------------- Category tree flattening ---------------- */
type FlatCategory = { label: string; slug: string; depth: number };

function flattenTree(nodes: CategoryNode[], depth = 0): FlatCategory[] {
  const out: FlatCategory[] = [];
  for (const n of nodes) {
    const slug = (n as any).slug || slugify(n.name);
    out.push({ label: n.name, slug, depth });
    if (n.children?.length) out.push(...flattenTree(n.children, depth + 1));
  }
  return out;
}

/* ---------------- Component ---------------- */
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // categories API
  const { data: catData, isLoading: catsLoading } = useCategories();
  const flatCats: FlatCategory[] = useMemo(() => {
    if (!catData?.tree?.length) return fallbackSidebar;
    return [{ label: "All Categories", slug: "all", depth: 0 }, ...flattenTree(catData.tree)];
  }, [catData]);

  // state that mirrors URL
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // sync initial from URL (?q, ?category)
  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    const cat = (searchParams.get("category") || "").trim().toLowerCase();
    if (q) setSearchQuery(q);
    setSelectedCategorySlug(cat || "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // keep URL updated when search/category changes
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (searchQuery) next.set("q", searchQuery);
    else next.delete("q");
    if (selectedCategorySlug && selectedCategorySlug !== "all") next.set("category", selectedCategorySlug);
    else next.delete("category");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategorySlug]);

  // API params (server category filter via category__slug)
  const params = useMemo(() => {
    const serverOrdering =
      sortBy === "price-low"
        ? "price_inr"
        : sortBy === "price-high"
        ? "-price_inr"
        : sortBy === "newest"
        ? "-created_at"
        : undefined;

    const q: Record<string, any> = {
      page: 1,
      page_size: 12,
      include_images: true,
    };

    if (serverOrdering) q.ordering = serverOrdering;

    if (searchQuery.trim()) {
      q.search = searchQuery.trim();
      q.q = searchQuery.trim();
    }

    if (selectedCategorySlug && selectedCategorySlug !== "all") {
      q["category__slug"] = selectedCategorySlug; // ✅ server-side category filter
    }

    // client-side filters
    q.min_price = priceRange[0];
    q.max_price = priceRange[1];
    if (selectedTags.length) q.tags = selectedTags.join(",");

    return q;
  }, [sortBy, searchQuery, selectedCategorySlug, priceRange, selectedTags]);

  // Fetch
  const { data, isLoading, isError } = useProducts(params);
  const rawItems: any[] = data?.items ?? [];

  // Map to cards
  const allCards: CardProduct[] = useMemo(() => rawItems.map(toCardProduct), [rawItems]);

  // Client-side filtering + sorting
  const filteredSortedCards = useMemo(() => {
    const minP = priceRange[0] ?? 0;
    const maxP = priceRange[1] ?? Number.MAX_SAFE_INTEGER;

    const filtered = allCards.filter((cp: any) => {
      if (!localSearchMatch(cp, searchQuery)) return false;
      if (!matchesTags(cp, selectedTags)) return false;

      const p = effectivePrice(cp);
      if (p < minP || p > maxP) return false;

      return true;
    });

    return sortCards(filtered, sortBy);
  }, [allCards, searchQuery, selectedTags, priceRange, sortBy]);

  // For QuickView
  const rawById = useMemo(() => {
    const m: Record<number, any> = {};
    rawItems.forEach((p: any) => (m[p.id] = p));
    return m;
  }, [rawItems]);

  // Carousel + QuickView
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<(CardProduct & { selectedVariantId?: number }) | null>(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    setCurrentIndex((i) => Math.max(0, i - 1));
  };
  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    setCurrentIndex((i) => Math.min(filteredSortedCards.length - 1, i + 1));
  };

  // Add to cart respects variant
  const handleAddToCart = (product: CardProduct, variant?: CardVariant) => {
    cartAdd({
      id: product.id,
      name: product.name,
      price: variant ? variant.price : product.price,
      originalPrice: variant ? variant.originalPrice : product.originalPrice,
      image: product.image,
      weight: variant?.weight || product.weight || "",
      quantity: 1,
      inStock: variant ? variant.stockCount > 0 : product.inStock,
      variantId: variant?.id,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name}${variant?.weight ? ` (${variant.weight})` : ""} added to your cart.`,
    });
  };

  const handleQuickView = (product: CardProduct, variant?: CardVariant) => {
    setQuickViewProduct({
      ...product,
      selectedVariantId: variant?.id,
    });
  };

  // Tag handling
  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) setSelectedTags((t) => [...t, tag]);
    else setSelectedTags((t) => t.filter((x) => x !== tag));
  };

  /* ----------- FIXED CATEGORY ITEM (single-select) ----------- */
  const CategoryItem = ({ c }: { c: FlatCategory }) => {
    const isChecked = selectedCategorySlug === c.slug;
    return (
      <button
        type="button"
        onClick={() => setSelectedCategorySlug(isChecked ? "all" : c.slug)}
        className="w-full flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1 hover:bg-accent/50"
        title={c.label}
        aria-pressed={isChecked}
      >
        {/* Controlled checkbox purely for visuals */}
        <Checkbox checked={isChecked} onCheckedChange={() => {}} />
        <span className="text-sm" style={{ paddingLeft: c.depth * 12 }}>{c.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-full">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> <span className="mx-2">/</span> <span className="text-primary">Shop</span>
          {selectedCategorySlug !== "all" && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary capitalize">{selectedCategorySlug.replace(/-/g, " ")}</span>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${showFilters ? "block" : "hidden"} space-y-6`}>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>

              {/* Category (API-driven tree with fallback) */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Category</h4>
                  {catsLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
                </div>
                {flatCats.map((c) => (
                  <CategoryItem key={c.slug} c={c} />
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Price Range</h4>
                <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <h4 className="font-medium">Tags</h4>
                {tags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => handleTagChange(tag, !!checked)}
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results status */}
            {isError && <p className="text-muted-foreground mb-6">Couldn’t load products. Please try again.</p>}
            {isLoading && <p className="text-muted-foreground mb-6">Loading products…</p>}
            {!isLoading && !isError && (
              <p className="text-muted-foreground mb-6">
                Showing {filteredSortedCards.length} product(s)
                {typeof (data as any)?.count === "number" ? ` (of ${(data as any).count})` : ""}
                {selectedCategorySlug !== "all" ? ` in “${selectedCategorySlug.replace(/-/g, " ")}”` : ""}
              </p>
            )}

            {/* Mobile Carousel */}
            {!isLoading && filteredSortedCards.length > 0 && (
              <div className="block sm:hidden relative mb-8 overflow-hidden max-w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white border-0 rounded-full w-10 h-10 p-0"
                  onClick={scrollLeft}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white border-0 rounded-full w-10 h-10 p-0"
                  onClick={scrollRight}
                  disabled={currentIndex >= filteredSortedCards.length - 1}
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </Button>

                <div ref={carouselRef} className="product-carousel px-12 max-w-full" style={{ maxWidth: "100vw" }}>
                  {filteredSortedCards.map((product) => (
                    <div key={product.id} className="product-carousel-item">
                      <ProductCard
                        product={product}
                        images={product.images}
                        onAddToCart={(p, v) => handleAddToCart(p, v)}
                        onQuickView={(p, v) => handleQuickView(p, v)}
                      />
                    </div>
                  ))}
                </div>

                <div className="carousel-dots max-w-full">
                  {filteredSortedCards.map((_, index) => (
                    <div
                      key={index}
                      className={`carousel-dot ${Math.floor(currentIndex / 2) === Math.floor(index / 2) ? "active" : "inactive"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Grid/List */}
            {!isLoading && filteredSortedCards.length > 0 && (
              <div className={`hidden sm:grid gap-6 ${viewMode === "grid" ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filteredSortedCards.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    images={product.images}
                    onAddToCart={(p, v) => handleAddToCart(p, v)}
                    onQuickView={(p, v) => handleQuickView(p, v)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <QuickView
        product={quickViewProduct as any}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      <Footer />
    </div>
  );
}
