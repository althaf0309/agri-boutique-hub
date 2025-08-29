import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Sample product data - in real app, this would come from API
const productData = {
  id: 1,
  name: "Organic Basmati Rice",
  price: 850,
  originalPrice: 950,
  rating: 4.5,
  reviewCount: 123,
  images: [
    "/api/placeholder/500/500",
    "/api/placeholder/500/500",
    "/api/placeholder/500/500",
    "/api/placeholder/500/500"
  ],
  category: "Organic Grocery",
  weight: "5kg",
  organic: true,
  inStock: true,
  stockCount: 24,
  description: "Premium aged basmati rice grown without pesticides in the foothills of Himalayas. Naturally aged for 2 years for enhanced aroma and taste.",
  highlights: [
    "100% Organic & Certified",
    "Aged for 2 years naturally",
    "No pesticides or chemicals",
    "Long grain premium quality",
    "Rich in nutrients"
  ],
  nutrition: "Rich in carbohydrates, protein, and essential minerals. Contains no artificial additives or preservatives.",
  benefits: "Supports healthy digestion, provides sustained energy, and is naturally gluten-free.",
  shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas."
};

const relatedProducts = [
  {
    id: 2,
    name: "Cold Pressed Coconut Oil",
    price: 450,
    rating: 4.8,
    reviewCount: 89,
    image: "/api/placeholder/300/300",
    category: "Organic Grocery",
    weight: "1L",
    organic: true,
    inStock: true,
    description: "Pure cold pressed coconut oil from Kerala"
  },
  {
    id: 3,
    name: "Organic Turmeric Powder",
    price: 280,
    originalPrice: 320,
    rating: 4.6,
    reviewCount: 156,
    image: "/api/placeholder/300/300",
    category: "Ruchira",
    weight: "500g",
    organic: true,
    inStock: true,
    description: "High curcumin organic turmeric powder"
  }
];

export default function ProductDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${productData.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    toast({
      title: "Proceeding to Checkout",
      description: "Redirecting to checkout page...",
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${productData.name} ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const discountPercentage = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> <span className="mx-2">/</span> 
          <span>Shop</span> <span className="mx-2">/</span> 
          <span className="text-primary">{productData.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted/50 rounded-lg overflow-hidden">
              <img
                src={productData.images[selectedImage]}
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-muted/50 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">{productData.category}</p>
              <h1 className="text-3xl font-bold text-primary mb-4">{productData.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(productData.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {productData.rating} ({productData.reviewCount} reviews)
                </span>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {productData.organic && (
                  <Badge className="feature-badge">Organic</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">-{discountPercentage}% OFF</Badge>
                )}
                <Badge variant={productData.inStock ? "default" : "secondary"}>
                  {productData.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₹{productData.price}</span>
                {productData.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{productData.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">Weight: {productData.weight}</p>
              {productData.inStock && (
                <p className="text-sm text-muted-foreground">
                  {productData.stockCount} items left in stock
                </p>
              )}
            </div>

            {/* Quantity Selector */}
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
                    disabled={quantity >= productData.stockCount}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!productData.inStock}
                  className="flex-1 btn-accent-farm"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!productData.inStock}
                  className="flex-1 btn-farm"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className="p-3"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="space-y-2">
                {productData.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
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

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">{productData.description}</p>
            </TabsContent>
            <TabsContent value="nutrition" className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold">Nutrition & Benefits</h3>
              <p className="text-muted-foreground leading-relaxed">{productData.nutrition}</p>
              <p className="text-muted-foreground leading-relaxed">{productData.benefits}</p>
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <p className="text-muted-foreground">Reviews coming soon...</p>
            </TabsContent>
            <TabsContent value="shipping" className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold">Shipping Information</h3>
              <p className="text-muted-foreground leading-relaxed">{productData.shipping}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold text-primary mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => toast({ title: "Added to Cart", description: `${product.name} added to cart` })}
                onQuickView={() => toast({ title: "Quick View", description: `Viewing ${product.name}` })}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}