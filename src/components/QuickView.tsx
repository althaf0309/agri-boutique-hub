// src/components/QuickView.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Share2, ShoppingCart, Eye, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MEDIA_BASE } from "@/api/client";
import { addItem } from "@/lib/cart"; // ✅ add to cart

interface WeightVariant {
  id: number;
  weight: string;
  price: number;
  originalPrice?: number;
  stockCount: number;
  popular?: boolean;
}

interface Product {
  id: number;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  description?: string;
  features?: string[];
  inStock: boolean;
  weight?: string;
  organic?: boolean;
  reviews?: number;
  weightVariants?: WeightVariant[];
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ---------------- image helpers ---------------- */
const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='22'>No Image</text></svg>";

function normalizeImage(src?: string): string {
  if (!src) return PLACEHOLDER;
  if (/^https?:\/\//i.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${(MEDIA_BASE || "").replace(/\/+$/, "")}${path}`;
}

const QuickView = ({ product, isOpen, onClose }: QuickViewProps) => {
  // All hooks unconditionally
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<WeightVariant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setQuantity(1);
    setIsWishlisted(false);
  }, [product?.id]);

  useEffect(() => {
    if (product?.weightVariants?.length) {
      const def = product.weightVariants.find((v) => v.popular) || product.weightVariants[0];
      setSelectedVariant(def);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentWeight = selectedVariant ? selectedVariant.weight : product.weight;

  const imgSrc = normalizeImage(product.image);

  const handleAddToCart = () => {
    // ✅ push into localStorage cart (Header badge updates)
    addItem({
      id: Number(product.id),
      name: String(product.name),
      price: Number(currentPrice) || 0,
      originalPrice: currentOriginalPrice ? Number(currentOriginalPrice) : undefined,
      image: imgSrc || PLACEHOLDER,
      weight: selectedVariant?.weight || "",
      quantity: quantity || 1,
      inStock: product.inStock !== false,
    });

    const variantText = selectedVariant ? ` (${selectedVariant.weight})` : "";
    toast({
      title: "Added to Cart! 🛒",
      description: `${quantity}x ${product.name}${variantText} added to your cart`,
    });
    onClose();
  };

  const handleWishlist = () => {
    setIsWishlisted((v) => !v);
    toast({
      title: !isWishlisted ? "Added to Wishlist! ❤️" : "Removed from Wishlist",
      description: `${product.name} ${!isWishlisted ? "added to" : "removed from"} your wishlist`,
    });
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if ((navigator as any).share) {
      (navigator as any).share({
        title: product.name,
        text: `Check out this ${product.name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied!", description: "Product link copied to clipboard" });
    }
  };

  const discountPct =
    currentOriginalPrice && currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0;

  const detailsHref = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden p-0 m-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full max-h-[90vh]">
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 p-3 sm:p-6 flex items-center justify-center min-h-[200px] md:minh-[400px]">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full max-h-64 md:max-h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
              }}
            />
            <Badge variant="secondary" className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-primary-foreground text-xs">
              Quick View
            </Badge>
            {discountPct > 0 && (
              <Badge variant="destructive" className="absolute top-2 sm:top-4 right-2 sm:right-4 text-xs">
                {discountPct}% OFF
              </Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="p-3 sm:p-6 flex flex-col h-full overflow-y-auto max-h-[60vh] md:max-h-full">
            <DialogHeader className="mb-3 sm:mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-1 sm:mb-2 text-xs">
                    {product.category}
                  </Badge>
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                    {product.name}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews || product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">₹{currentPrice}</span>
              {currentOriginalPrice && <span className="text-sm sm:text-lg text-muted-foreground line-through">₹{currentOriginalPrice}</span>}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              <Badge variant={product.inStock ? "default" : "destructive"} className={product.inStock ? "bg-green-100 text-green-800" : ""}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Weight Selection */}
            {!!product.weightVariants?.length && (
              <div className="mb-3 sm:mb-4">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Select Weight:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.weightVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative p-2 sm:p-3 border-2 rounded-lg text-left transition-all text-sm ${
                        selectedVariant?.id === variant.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      {variant.popular && (
                        <div className="absolute -top-1 right-1">
                          <Badge className="bg-accent text-accent-foreground text-xs px-1 py-0">Popular</Badge>
                        </div>
                      )}
                      <div className="font-medium text-xs sm:text-sm">{variant.weight}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-bold text-primary text-xs sm:text-sm">₹{variant.price}</span>
                        {variant.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{variant.originalPrice}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Weight */}
            {currentWeight && (
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Weight: {currentWeight}</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            {!!product.features?.length && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-4" />

            {/* Quantity & Actions */}
            <div className="mt-auto space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between sm:gap-4">
                <span className="font-medium text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-10 sm:w-12 text-center text-sm font-medium">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => q + 1)} className="h-8 w-8 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <Button onClick={handleAddToCart} disabled={!product.inStock} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm sm:text-base">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWishlist}
                    className={`flex-1 sm:flex-none ${isWishlisted ? "text-red-500 border-red-200" : ""}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 sm:mr-2 ${isWishlisted ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Wishlist</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
                    <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>

                <Button variant="ghost" className="w-full text-sm" onClick={() => window.open(detailsHref, "_blank")}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
