import { useEffect, useMemo, useState } from "react";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { CardProduct, CardVariant } from "./ProductGrid";

const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='20'>No Image</text></svg>";

interface ProductCardProps {
  product: CardProduct;
  images?: string[];
  onAddToCart?: (product: CardProduct, variant?: CardVariant) => void;
  onQuickView?: (product: CardProduct, variant?: CardVariant) => void;
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // derived variants list (stable)
  const variants = useMemo<CardVariant[]>(
    () => product.weightVariants?.filter(v => v?.weight)?.map(v => ({
      ...v,
      price: Number(v.price || 0),
      originalPrice: v.originalPrice != null ? Number(v.originalPrice) : undefined,
      stockCount: Number(v.stockCount ?? 0),
    })) ?? [],
    [product.weightVariants]
  );

  // pick initial selected variant:
  // 1) prefer the first variant with stock, else first variant, else undefined
  const initialVariant = useMemo(() => {
    if (variants.length === 0) return undefined;
    const inStock = variants.find(v => v.stockCount > 0);
    return inStock || variants[0];
  }, [variants]);

  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(initialVariant?.id);
  useEffect(() => {
    setSelectedVariantId(initialVariant?.id);
  }, [product.id, initialVariant?.id]);

  const selectedVariant = useMemo(
    () => variants.find(v => v.id === selectedVariantId) || initialVariant,
    [variants, selectedVariantId, initialVariant]
  );

  // price to display = variant price (if exists) else product price
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginal = selectedVariant?.originalPrice ?? product.originalPrice;

  const [src, setSrc] = useState(product.image || PLACEHOLDER);
  useEffect(() => {
    setSrc(product.image || PLACEHOLDER);
  }, [product.id, product.image]);

  const productHref = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product, selectedVariant);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickView?.(product, selectedVariant);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(v => !v);
  };

  const discountPercentage =
    displayOriginal && displayOriginal > displayPrice
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  // If any variant is selected and out of stock, reflect it; else use product’s inStock
  const inStock = selectedVariant ? selectedVariant.stockCount > 0 : product.inStock;

  return (
    <Link to={productHref} className="group block">
      <div className="card-farm relative overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square mb-3 sm:mb-4 overflow-hidden rounded-lg bg-muted/50">
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              if (src !== PLACEHOLDER) setSrc(PLACEHOLDER);
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {product.organic && (
              <Badge variant="secondary" className="feature-badge text-xs">
                Organic
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="text-xs">-{discountPercentage}%</Badge>
            )}
            {!inStock && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-md"
              onClick={handleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-md"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Quick Add (desktop) */}
          <div className="hidden sm:block absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button onClick={handleAddToCart} disabled={!inStock} className="w-full btn-accent-farm text-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Quick Add (mobile) */}
          <div className="sm:hidden absolute bottom-2 left-2 right-2">
            <Button onClick={handleAddToCart} disabled={!inStock} size="sm" className="w-full btn-accent-farm text-xs">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1 sm:space-y-2">
          <div className="text-xs sm:text-sm text-muted-foreground">{product.category}</div>

          <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Variant selector (weight + price per variant) */}
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-2 py-1">
              {variants.map((v) => {
                const active = v.id === selectedVariant?.id;
                const oos = v.stockCount <= 0;
                return (
                  <button
                    key={v.id}
                    className={`px-2 py-1 rounded border text-xs sm:text-[13px] ${
                      active
                        ? "border-primary text-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-primary/60"
                    } ${oos ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!oos) setSelectedVariantId(v.id);
                    }}
                    title={oos ? "Out of stock" : `${v.weight} – ₹${v.price.toFixed(2)}`}
                    aria-pressed={active}
                    aria-disabled={oos}
                  >
                    <span className="font-medium">{v.weight}</span>
                    <span className="ml-1">₹{v.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price (from selected variant) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">₹{displayPrice.toFixed(2)}</span>
            {displayOriginal && displayOriginal > displayPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">₹{displayOriginal.toFixed(2)}</span>
            )}
          </div>

          {/* Show selected variant weight below name when present */}
          {selectedVariant?.weight && (
            <div className="text-xs sm:text-sm text-muted-foreground">{selectedVariant.weight}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
