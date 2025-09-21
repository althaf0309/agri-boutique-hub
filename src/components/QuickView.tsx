import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Share2, ShoppingCart, Eye, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  // Additional fields that might be added by the parent component
  reviews?: number;
  weightVariants?: WeightVariant[];
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickView = ({ product, isOpen, onClose }: QuickViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<WeightVariant | null>(null);
  const { toast } = useToast();

  // Set default variant on product change
  React.useEffect(() => {
    if (product?.weightVariants && product.weightVariants.length > 0) {
      // Select popular variant or first one
      const defaultVariant = product.weightVariants.find(v => v.popular) || product.weightVariants[0];
      setSelectedVariant(defaultVariant);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentWeight = selectedVariant ? selectedVariant.weight : product.weight;

  const handleAddToCart = () => {
    const variantText = selectedVariant ? ` (${selectedVariant.weight})` : '';
    toast({
      title: "Added to Cart! 🛒",
      description: `${quantity}x ${product.name}${variantText} added to your cart`,
    });
    onClose();
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist! ❤️",
      description: `${product.name} ${isWishlisted ? "removed from" : "added to"} your wishlist`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden p-0 m-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full max-h-[90vh]">
          {/* Product Image */}
          <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 p-3 sm:p-6 flex items-center justify-center min-h-[200px] md:min-h-[400px]">
            <img
              src={product.image.startsWith('/src/') ? product.image.replace('/src/', '/') : product.image}
              alt={product.name}
              className="w-full h-full max-h-64 md:max-h-96 object-cover rounded-lg shadow-lg"
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-primary-foreground text-xs"
            >
              Quick View
            </Badge>
            {currentOriginalPrice && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-accent text-accent-foreground text-xs"
              >
                {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF
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
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({(product.reviews || product.reviewCount || 0)} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                ₹{currentPrice}
              </span>
              {currentOriginalPrice && (
                <span className="text-sm sm:text-lg text-muted-foreground line-through">
                  ₹{currentOriginalPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              <Badge 
                variant={product.inStock ? "default" : "destructive"}
                className={product.inStock ? "bg-green-100 text-green-800" : ""}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Weight Selection */}
            {product.weightVariants && product.weightVariants.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Select Weight:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.weightVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative p-2 sm:p-3 border-2 rounded-lg text-left transition-all text-sm ${
                        selectedVariant?.id === variant.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      {variant.popular && (
                        <div className="absolute -top-1 right-1">
                          <Badge className="bg-accent text-accent-foreground text-xs px-1 py-0">
                            Popular
                          </Badge>
                        </div>
                      )}
                      <div className="font-medium text-xs sm:text-sm">{variant.weight}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-bold text-primary text-xs sm:text-sm">₹{variant.price}</span>
                        {variant.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{variant.originalPrice}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Weight Display */}
            {currentWeight && (
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">Weight: {currentWeight}</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            {product.features && (
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
              {/* Quantity Selector */}
              <div className="flex items-center justify-between sm:gap-4">
                <span className="font-medium text-sm sm:text-base">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-10 sm:w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm sm:text-base"
                >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 sm:flex-none"
                  >
                    <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>

                {/* View Full Details */}
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    window.open(`/product/${product.id}`, '_blank');
                  }}
                >
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