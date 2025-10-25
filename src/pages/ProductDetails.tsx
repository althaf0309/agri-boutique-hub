// src/pages/ProductDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateReview, useProductReviews } from "@/api/hooks/reviews";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProduct } from "@/api/hooks/products";
import ProductGrid from "@/components/ProductGrid";
import api, { MEDIA_BASE } from "@/api/client";
import { addItem } from "@/lib/cart";
import { beginCheckout } from "@/lib/checkout";

const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='22'>No Image</text></svg>";

/* ---------------------------- helpers ---------------------------- */
function joinBase(url?: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = MEDIA_BASE.replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
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
  const top = pickFromObj(p, ["primary_image_url", "image_url", "image", "thumbnail"]);
  if (top) urls.push(top);
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
  return Array.from(new Set(urls.map((u) => joinBase(u).trim()).filter(Boolean)));
}

/** normalize "100g/ml", "1kg/L" -> grams/ml */
function parseWeightLabel(label: string) {
  if (!label) return { family: "other" as const, value: NaN };
  const s = label.toLowerCase().replace(/\s+/g, "");
  if (/^\d+(\.\d+)?(g|kg)$/.test(s)) {
    const m = s.match(/^(\d+(?:\.\d+)?)(g|kg)$/)!;
    const n = parseFloat(m[1]);
    const valueInG = m[2] === "kg" ? n * 1000 : n;
    return { family: "mass" as const, value: valueInG };
  }
  if (/^\d+(\.\d+)?(ml|l|lt|liter)$/.test(s)) {
    const m = s.match(/^(\d+(?:\.\d+)?)(ml|l|lt|liter)$/)!;
    const n = parseFloat(m[1]);
    const valueInMl = m[2] === "ml" ? n : n * 1000;
    return { family: "volume" as const, value: valueInMl };
  }
  return { family: "other" as const, value: NaN };
}

/** choose default variant by preference: 100g/ml -> 1kg/L -> popular -> first */
function chooseDefaultVariant(variants: any[] | undefined) {
  if (!variants || variants.length === 0) return undefined;
  const scored = variants.map((v, idx) => {
    const w = String(v.weight || "");
    const { family, value } = parseWeightLabel(w);
    let score = 100;
    if ((family === "mass" && value === 100) || (family === "volume" && value === 100)) score = 0;
    else if ((family === "mass" && value === 1000) || (family === "volume" && value === 1000)) score = 1;
    else if (v.popular) score = 2;
    else score = 3;
    return { v, idx, score };
  });
  scored.sort((a, b) => a.score - b.score || a.idx - b.idx);
  return scored[0].v;
}

/** Convert nutrition_facts (object/array/string) -> array of {name,value} */
function normalizeNutritionFacts(facts: any): Array<{ name: string; value: string }> {
  if (!facts) return [];
  if (Array.isArray(facts)) {
    return facts
      .map((r) => (typeof r === "object" && r ? { name: String(r.name ?? ""), value: String(r.value ?? "") } : null))
      .filter((r): r is { name: string; value: string } => !!r && r.name.trim() && r.value.trim());
  }
  if (typeof facts === "object") {
    return Object.entries(facts)
      .map(([k, v]) => ({ name: String(k), value: String(v ?? "") }))
      .filter((r) => r.name.trim() && r.value.trim());
  }
  return [{ name: "Info", value: String(facts) }];
}

/* ---------------------------- reviews schema ---------------------------- */
const reviewSchema = z.object({
  user_name: z.string().min(1, "Name is required"),
  user_email: z.string().email("Valid email required"),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(2, "Title is too short"),
  comment: z.string().min(5, "Please write a bit more"),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

/* ---------------------------- slug helpers ---------------------------- */
const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function useProductBySlug(slug?: string) {
  return useQuery({
    queryKey: ["product-slug", slug],
    enabled: !!slug && !/^\d+$/.test(slug),
    queryFn: async () => {
      const { data } = await api.get(`/products/by-slug/${encodeURIComponent(slug!)}/`);
      return data ?? null; // backend returns the exact product or 404
    },
  });
}

/* ---------------------------- component ---------------------------- */
export default function ProductDetails() {
  const navigate = useNavigate();
  const { id: idParam, slug: slugParam } = useParams();
  const slugOrId = (slugParam ?? idParam ?? "").trim();
  const isNumericId = /^\d+$/.test(slugOrId);

  const idForFetch = isNumericId ? Number(slugOrId) : undefined;
  const { data: productById, isLoading: isIdLoading, isError: isIdError } = useProduct(idForFetch);
  const {
    data: productBySlug,
    isLoading: isSlugLoading,
    isError: isSlugError,
  } = useProductBySlug(!isNumericId ? slugOrId : undefined);

  // Strictly choose the product that *matches* what was requested
  const product: any = isNumericId ? productById ?? null : productBySlug ?? null;

  // if backend returned different slug, redirect to canonical slug (avoid wrong details on screen)
  useEffect(() => {
    if (!isNumericId && product && product.slug && product.slug !== slugOrId) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [product, isNumericId, slugOrId, navigate]);

  const isLoading = isIdLoading || isSlugLoading;
  const isError = (isNumericId && isIdError) || (!isNumericId && (isSlugError || (!isLoading && !product)));

  const productId = Number(product?.id ?? (isNumericId ? idForFetch : 0)) || 0;

  const images = useMemo(() => (product ? collectImages(product) : []), [product]);
  const [selectedImage, setSelectedImage] = useState(0);
  useEffect(() => setSelectedImage(0), [slugOrId]);

  const { toast } = useToast();

  // price / discount
  const basePrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price_inr ?? product.price ?? 0) || 0;
  }, [product]);
  const discount = Number(product?.discount_percent ?? 0) || 0;
  const livePrice = discount > 0 ? Number((basePrice * (1 - discount / 100)).toFixed(2)) : basePrice;

  // variants
  const weightVariants = useMemo(() => {
    const arr = product?.variants || [];
    if (!Array.isArray(arr) || !arr.length) return undefined;
    return arr.map((v: any, idx: number) => {
      const vBase = Number(v?.price_override ?? basePrice) || 0;
      const vDiscount = Number(v?.discount_override ?? product?.discount_percent ?? 0) || 0;
      const vPrice = vDiscount > 0 ? Number((vBase * (1 - vDiscount / 100)).toFixed(2)) : vBase;

      const weight =
        (v?.weight_value ? String(v.weight_value).replace(/\.0+$/, "") : "") +
        (v?.weight_unit ? String(v.weight_unit).toUpperCase() : "");

      return {
        id: v.id ?? idx + 1,
        weight: weight || v?.attributes?.Weight || "",
        price: vPrice,
        originalPrice: vDiscount > 0 ? vBase : undefined,
        stockCount: Number(v?.quantity ?? 0),
        popular: Boolean(v?.is_active && v?.quantity > 0),
      };
    });
  }, [product, basePrice]);

  const [selectedVariant, setSelectedVariant] = useState<any>(undefined);
  useEffect(() => {
    setSelectedVariant(chooseDefaultVariant(weightVariants));
  }, [weightVariants]);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // reviews
  const { data: productReviews = [], isLoading: isReviewsLoading } = useProductReviews(productId || 0);
  const createReview = useCreateReview();

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { user_name: "", user_email: "", rating: 5, title: "", comment: "" },
    mode: "onBlur",
  });

  const avgRating = useMemo(() => {
    const serverAvg = Number(product?.rating_avg ?? 0);
    const serverCount = Number(product?.reviews_count ?? 0);
    if (serverCount > 0 && serverAvg > 0) return Math.round(serverAvg * 10) / 10;
    if (!productReviews.length) return serverAvg || 0;
    const avg = productReviews.reduce((acc: number, r: any) => acc + (r.rating ?? 0), 0) / productReviews.length;
    return Math.round(avg * 10) / 10;
  }, [product?.rating_avg, product?.reviews_count, productReviews]);

  // discount badge
  const currentPrice = selectedVariant?.price ?? livePrice;
  const currentOriginal = selectedVariant?.originalPrice ?? (discount > 0 ? basePrice : undefined);
  const discountPct =
    currentOriginal && currentOriginal > currentPrice
      ? Math.round(((currentOriginal - currentPrice) / currentOriginal) * 100)
      : 0;

  // nutrition/specifications (normalized)
  const nutritionRows = useMemo(() => normalizeNutritionFacts(product?.nutrition_facts), [product?.nutrition_facts]);
  const specsByGroup = useMemo(() => {
    const rows = Array.isArray(product?.specifications) ? product.specifications : [];
    const groups: Record<string, Array<any>> = {};
    rows.forEach((r: any) => {
      const g = (r.group || "General").trim();
      (groups[g] ||= []).push(r);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({
        group,
        items: items.sort(
          (a: any, b: any) =>
            (Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) ||
            String(a.name || "").localeCompare(String(b.name || ""))
        ),
      }));
  }, [product?.specifications]);

  // actions
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: Number(product.id),
      name: String(product.name),
      price: Number(currentPrice) || 0,
      originalPrice: currentOriginal ? Number(currentOriginal) : undefined,
      image: images[0] || PLACEHOLDER,
      weight: selectedVariant?.weight || "",
      quantity: quantity || 1,
      inStock: product.in_stock !== false,
      variantId: selectedVariant?.id,
    });
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name}${
        selectedVariant?.weight ? ` (${selectedVariant.weight})` : ""
      } added to your cart.`,
    });
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      addItem({
        id: Number(product.id),
        name: String(product.name),
        price: Number(currentPrice) || 0,
        originalPrice: currentOriginal ? Number(currentOriginal) : undefined,
        image: images[0] || PLACEHOLDER,
        weight: selectedVariant?.weight || "",
        quantity: quantity || 1,
        inStock: product.in_stock !== false,
        variantId: selectedVariant?.id,
      });

      const orderId = await beginCheckout({
        lines: [
          {
            product_id: Number(product.id),
            variant_id: selectedVariant?.id,
            weight: selectedVariant?.weight || "",
            quantity: quantity || 1,
          },
        ],
      });
      toast({ title: "Proceeding to Checkout", description: "Redirecting to checkout..." });
      navigate(`/checkout?order=${orderId}`);
    } catch (e: any) {
      toast({
        title: "Checkout failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    setIsWishlisted((w) => !w);
    toast({
      title: !isWishlisted ? "Added to Wishlist" : "Removed from Wishlist",
      description: `${product.name} ${!isWishlisted ? "added to" : "removed from"} your wishlist.`,
    });
  };

  const submitReview = async (values: ReviewFormValues) => {
    try {
      await createReview.mutateAsync({
        product: productId,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
        user_email: values.user_email,
        user_name: values.user_name,
      });
      reviewForm.reset({ user_name: "", user_email: "", rating: 5, title: "", comment: "" });
      toast({ title: "Review submitted", description: "Thanks! Your review will appear once approved." });
    } catch (e: any) {
      toast({
        title: "Couldn't submit review",
        description: e?.message ?? "Try again",
        variant: "destructive",
      });
    }
  };

  /* ---------------------------- render ---------------------------- */
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">Product not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/">Home</Link> <span className="mx-2">/</span>
          <Link to="/shop">Shop</Link> <span className="mx-2">/</span>
          <span className="text-primary">{product?.name || "Product"}</span>
        </nav>

        {/* Skeleton */}
        {isLoading && (
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <div className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted/50 rounded animate-pulse w-2/3" />
              <div className="h-5 bg-muted/40 rounded animate-pulse w-1/3" />
              <div className="h-24 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        )}

        {!isLoading && product && (
          <>
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Gallery */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/50 rounded-lg overflow-hidden">
                  <img
                    src={images[selectedImage] || PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(images.length ? images : [PLACEHOLDER]).slice(0, 8).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-muted/50 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-2">{product.category?.name ?? "—"}</p>
                  <h1 className="text-3xl font-bold text-primary mb-4 font-heading">{product.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {avgRating || 0} ({product.reviews_count ?? productReviews.length ?? 0} reviews)
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {product.is_organic && <Badge className="feature-badge">Organic</Badge>}
                    {discountPct > 0 && <Badge variant="destructive">-{discountPct}% OFF</Badge>}
                    <Badge variant={product.in_stock ? "default" : "secondary"}>
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>

                {/* Weight variants */}
                {!!weightVariants?.length && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Select Weight:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {weightVariants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                            selectedVariant?.id === variant.id ? "border-primary bg-primary/5" : "border-border bg-background"
                          }`}
                        >
                          {variant.popular && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                              <Badge className="bg-accent text-accent-foreground text-xs">Popular</Badge>
                            </div>
                          )}
                          <div className="font-medium text-foreground">{variant.weight}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-primary">₹{variant.price}</span>
                            {variant.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">₹{variant.originalPrice}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{variant.stockCount} in stock</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">₹{currentPrice}</span>
                    {currentOriginal && <span className="text-xl text-muted-foreground line-through">₹{currentOriginal}</span>}
                    {discountPct > 0 && (
                      <Badge variant="destructive" className="text-sm">
                        -{discountPct}% OFF
                      </Badge>
                    )}
                  </div>
                  {selectedVariant?.weight && <p className="text-muted-foreground">Weight: {selectedVariant.weight}</p>}
                  {product.in_stock && (
                    <p className="text-sm text-muted-foreground">
                      {selectedVariant?.stockCount ?? product.quantity ?? 0} items left in stock
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={selectedVariant ? quantity >= (selectedVariant.stockCount || 0) : false}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button onClick={handleAddToCart} disabled={!product.in_stock} className="flex-1 btn-accent-farm">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button onClick={handleBuyNow} disabled={!product.in_stock} className="flex-1 btn-farm">
                      Buy Now
                    </Button>
                    <Button variant="outline" onClick={handleWishlist} className="p-3">
                      <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                </div>

                {/* Highlights */}
                {product.description && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Key Features:</h3>
                    <ul className="space-y-2">
                      {(product.specifications || [])
                        .filter((s: any) => s.is_highlight)
                        .slice(0, 6)
                        .map((s: any) => (
                          <li key={s.id} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                            {s.name}: {s.value} {s.unit || ""}
                          </li>
                        ))}
                      {!(product.specifications || []).some((s: any) => s.is_highlight) && (
                        <li className="text-sm text-muted-foreground">Quality assured, sustainably sourced organic product.</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Info icons */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-top border-border">
                  <div className="text-center">
                    <Truck className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">Orders above ₹500</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">Quality Assured</p>
                    <p className="text-xs text-muted-foreground">100% Organic</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">7-day policy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Tabs */}
            <div className="mb-16">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4 pt-6">
                  <h3 className="text-xl font-semibold">Product Description</h3>
                  {product.description ? (
                    <div
                      className="prose max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">No description available.</p>
                  )}
                </TabsContent>

                <TabsContent value="nutrition" className="space-y-4 pt-6">
                  <h3 className="text-xl font-semibold">Nutrition & Benefits</h3>

                  {(product.ingredients || product.allergens) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.ingredients && (
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">Ingredients</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {product.ingredients}
                          </CardContent>
                        </Card>
                      )}
                      {product.allergens && (
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">Allergens</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground">{product.allergens}</CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {nutritionRows.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-left px-4 py-2">Nutrient</th>
                            <th className="text-left px-4 py-2">Per serving</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nutritionRows.map((row, i) => (
                            <tr key={`${row.name}-${i}`} className="border-t">
                              <td className="px-4 py-2 font-medium">{row.name}</td>
                              <td className="px-4 py-2 text-muted-foreground">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nutrition facts not provided.</p>
                  )}

                  {product.nutrition_notes && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.nutrition_notes}</p>
                  )}
                </TabsContent>

                <TabsContent value="specs" className="space-y-4 pt-6">
                  <h3 className="text-xl font-semibold">Specifications</h3>
                  {specsByGroup.length === 0 ? (
                    <p className="text-muted-foreground">No specifications available.</p>
                  ) : (
                    <div className="space-y-6">
                      {specsByGroup.map(({ group, items }) => (
                        <div key={group} className="space-y-2">
                          <h4 className="font-semibold">{group}</h4>
                          <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                              <tbody>
                                {items.map((s: any) => (
                                  <tr key={s.id} className="border-t">
                                    <td className="px-4 py-2 w-1/3 font-medium">{s.name}</td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                      {s.value} {s.unit || ""}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-semibold">Customer Reviews</div>
                      <div className="text-sm text-muted-foreground">
                        {isReviewsLoading ? "Loading…" : `${productReviews.length} review(s)`}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Average rating: </span>
                      <span>★ {avgRating || 0}</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Write a review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...reviewForm}>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={reviewForm.handleSubmit(submitReview)}>
                          <FormField
                            control={reviewForm.control}
                            name="user_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Your name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={reviewForm.control}
                            name="user_email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="you@example.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={reviewForm.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  >
                                    {[5, 4, 3, 2, 1].map((r) => (
                                      <option key={r} value={r}>
                                        {r} ★
                                      </option>
                                    ))}
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={reviewForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Great product!" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={reviewForm.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={4} placeholder="Share your experience…" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" disabled={createReview.isPending}>
                              {createReview.isPending ? "Submitting…" : "Submit Review"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviews may be moderated. Only approved reviews are displayed publicly.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {isReviewsLoading ? (
                      <div className="text-muted-foreground">Loading reviews…</div>
                    ) : productReviews.length === 0 ? (
                      <div className="text-muted-foreground">No reviews yet. Be the first to review!</div>
                    ) : (
                      productReviews.map((r: any) => (
                        <Card key={r.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{r.title ?? "Review"}</div>
                              <div className="text-sm">★ {r.rating}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.user_name ? `${r.user_name} · ` : ""}
                              {r.user_email || r.user?.email || "Anonymous"}
                              {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.comment ?? ""}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 pt-6">
                  <h3 className="text-xl font-semibold">Shipping Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Free delivery on orders above ₹500. Same-day delivery available in select areas.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Related Products */}
            <section className="pb-4">
              <h2 className="text-2xl font-bold text-primary mb-6">Related Products</h2>
              <ProductGrid ordering="-sold_count" limit={8} category={product.category?.id} />
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
