import { useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/api/hooks/products";

const MEDIA_BASE =
  (import.meta as any)?.env?.VITE_MEDIA_URL ||
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  "";

export interface CardVariant {
  id: number;
  weight: string;          // e.g., "500G", "1KG"
  price: number;           // exact price for this variant
  originalPrice?: number;  // striked-through price if discounted
  stockCount: number;
  sku?: string;
}

export interface CardProduct {
  id: number;
  slug?: string;
  name: string;
  price: number;                 // fallback/base price
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  category: string;
  weight: string;
  organic: boolean;
  inStock: boolean;
  description: string;
  weightVariants?: CardVariant[]; // ✅ NEW
}

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

// map variants from backend product shape → CardVariant[]
function mapWeightVariants(p: any): CardVariant[] | undefined {
  const list = Array.isArray(p?.variants) ? p.variants : [];
  if (!list.length) return undefined;

  const productBase = Number(p?.price_inr ?? p?.price ?? 0) || 0;
  const productDisc = Number(p?.discount_percent ?? 0) || 0;

  return list.map((v: any, idx: number) => {
    // base price for variant: prefer override → else product base
    const vBase = v?.price_override != null ? Number(v.price_override) : productBase;
    // discount: prefer override → else product discount
    const vDisc = v?.discount_override != null ? Number(v.discount_override) : productDisc;
    const vPrice = vDisc > 0 ? Number((vBase * (1 - vDisc / 100)).toFixed(2)) : Number(vBase.toFixed(2));
    const original = vDisc > 0 ? Number(vBase.toFixed(2)) : undefined;

    const wv = v?.weight_value;
    const wu = (v?.weight_unit || "").toUpperCase();
    const wLabel = wv != null && wu ? `${String(wv).replace(/\.0+$/, "")}${wu}` : (v?.attributes?.Weight || "");

    return {
      id: Number(v.id ?? idx + 1),
      weight: String(wLabel || "").trim(),
      price: vPrice,
      originalPrice: original,
      stockCount: Number(v?.quantity ?? 0),
      sku: v?.sku,
    } as CardVariant;
  }).filter(v => v.weight);
}

function toCardProduct(p: any): CardProduct {
  const allImages = collectImages(p);
  const first = allImages[0] || "";

  // product base/discount (used when no variants)
  const productBase = Number(p?.price_inr ?? p?.price ?? 0) || 0;
  const productDisc = Number(p?.discount_percent ?? 0) || 0;
  const price = productDisc > 0 ? Number((productBase * (1 - productDisc / 100)).toFixed(2)) : productBase;
  const orig = productDisc > 0 ? productBase : undefined;

  // default pack label (fallback weight display if no variants)
  const weight =
    p?.default_pack_qty && (p?.default_uom || p?.uom)
      ? `${p.default_pack_qty}${p.default_uom || p.uom}`
      : p?.default_uom || p?.uom || "";

  // in stock: true if any variant has stock, else product.quantity
  const variants = mapWeightVariants(p);
  const inStock = Array.isArray(variants) && variants.length
    ? variants.some(v => v.stockCount > 0)
    : (typeof p?.in_stock === "boolean" ? p.in_stock : Number(p?.quantity ?? 0) > 0);

  return {
    id: p.id,
    slug: p.slug || p.seo_slug || undefined,
    name: p.name ?? "Product",
    price,
    originalPrice: orig,
    rating: Number(p?.avg_rating ?? p?.rating ?? 0) || 0,
    reviewCount: Number(p?.review_count ?? p?.reviews_count ?? 0) || 0,
    image: first,
    images: allImages,
    category: p?.category?.name ?? p?.category_name ?? "",
    weight,
    organic: Boolean(p?.is_organic),
    inStock,
    description: p?.description ?? "",
    weightVariants: variants, // ✅ provide to card
  };
}

interface ProductGridProps {
  title?: string;
  featuredOnly?: boolean;
  category?: number | string;
  ordering?: string;
  limit?: number;
  products?: any[];
}

export default function ProductGrid({
  title,
  featuredOnly,
  category,
  ordering,
  limit = 8,
  products,
}: ProductGridProps) {
  const shouldFeature = featuredOnly ?? Boolean(title && /featured/i.test(title));
  const params = useMemo(() => {
    const q: Record<string, any> = {
      page: 1,
      page_size: limit,
      ordering: ordering || "-created_at",
      include_images: true,
    };
    if (shouldFeature) q.featured = true;
    if (category != null) q.category = category;
    return q;
  }, [shouldFeature, category, ordering, limit]);

  const { data, isLoading, isError } = useProducts(products ? {} : params);
  const items: any[] = products ?? data?.items ?? [];

  const rawById = useMemo(() => {
    const map: Record<number, any> = {};
    items.forEach((p: any) => (map[p.id] = p));
    return map;
  }, [items]);

  const cards = useMemo(() => items.map(toCardProduct), [items]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    setCurrentIndex((i) => Math.max(0, i - 1));
  };
  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
  };

  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const handleAddToCart = (product: CardProduct, variant?: CardVariant) => {
    import("@/lib/cart").then(({ addItem }) => {
      addItem({
        id: product.id,
        name: product.name,
        price: variant ? variant.price : product.price,
        originalPrice: variant ? variant.originalPrice : product.originalPrice,
        image: product.image,
        weight: variant?.weight || product.weight || "",
        quantity: 1,
        inStock: variant ? variant.stockCount > 0 : product.inStock,
        // optional variant metadata for your cart line:
        variantId: variant?.id,
      });
      toast({
        title: "Added to Cart",
        description: `${product.name}${variant?.weight ? ` (${variant.weight})` : ""} added to your cart.`,
      });
    });
  };

  const handleQuickView = (product: CardProduct, variant?: CardVariant) => {
    // Prefer raw backend object (for images/specs) + inject precomputed variant list
    const raw = rawById[product.id];
    const withCardDefaults = {
      ...product,
      slug: product.slug,
      // merge backend variants (raw) if you need more details inside the modal; otherwise card variants are enough
      weightVariants: product.weightVariants,
      selectedVariantId: variant?.id,
    };
    setQuickViewProduct(withCardDefaults);
  };

  if (isError) {
    return (
      <section className="py-8 sm:py-10 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          {title && (
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:3xl md:4xl font-bold text-primary mb-3 sm:mb-4">{title}</h2>
            </div>
          )}
          <div className="text-center text-muted-foreground">Couldn’t load products. Please try again.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-10 lg:py-12 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        {title && (
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:3xl md:4xl font-bold text-primary mb-3 sm:mb-4">{title}</h2>
          </div>
        )}

        {isLoading && (
          <>
            <div className="block sm:hidden">
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[70%]">
                    <div className="animate-pulse bg-muted/50 rounded-lg aspect-square mb-3" />
                    <div className="animate-pulse h-4 bg-muted/50 rounded w-3/4 mb-2" />
                    <div className="animate-pulse h-3 bg-muted/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="card-farm p-3">
                  <div className="animate-pulse bg-muted/50 rounded-lg aspect-square mb-4" />
                  <div className="animate-pulse h-4 bg-muted/50 rounded w-3/4 mb-2" />
                  <div className="animate-pulse h-3 bg-muted/40 rounded w-1/2" />
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && cards.length === 0 && (
          <div className="text-center text-muted-foreground">No products found.</div>
        )}

        {!isLoading && cards.length > 0 && (
          <>
            {/* Mobile carousel */}
            <div className="block sm:hidden relative overflow-hidden max-w-full">
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
                disabled={currentIndex >= cards.length - 1}
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </Button>

              <div ref={carouselRef} className="product-carousel px-12 max-w-full" style={{ maxWidth: "100vw" }}>
                {cards.map((product) => (
                  <div key={product.id} className="product-carousel-item">
                    <ProductCard
                      product={product}
                      images={product.images}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))}
              </div>

              <div className="carousel-dots max-w-full">
                {cards.map((_, index) => (
                  <div
                    key={index}
                    className={`carousel-dot ${Math.floor(currentIndex / 2) === Math.floor(index / 2) ? "active" : "inactive"}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {cards.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  images={product.images}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <QuickView
        product={quickViewProduct as any}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
