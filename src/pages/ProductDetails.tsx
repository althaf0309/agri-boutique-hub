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

// Complete product database with all product details
const allProducts = {
  1: {
    id: 1,
    name: "Organic Basmati Rice",
    basePrice: 850,
    rating: 4.5,
    reviewCount: 123,
    images: [
      "/assets/product-rice.jpg",
      "/assets/product-rice.jpg", 
      "/assets/product-rice.jpg",
      "/assets/product-rice.jpg"
    ],
    category: "Organic Grocery",
    organic: true,
    inStock: true,
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
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "1kg", price: 250, originalPrice: 280, stockCount: 45, popular: false },
      { id: 2, weight: "2kg", price: 450, originalPrice: 520, stockCount: 32, popular: false },
      { id: 3, weight: "5kg", price: 850, originalPrice: 950, stockCount: 24, popular: true },
      { id: 4, weight: "10kg", price: 1600, originalPrice: 1800, stockCount: 15, popular: false }
    ]
  },
  2: {
    id: 2,
    name: "Cold Pressed Coconut Oil",
    basePrice: 450,
    rating: 4.8,
    reviewCount: 89,
    images: [
      "/assets/product-coconut-oil.jpg",
      "/assets/product-coconut-oil.jpg",
      "/assets/product-coconut-oil.jpg",
      "/assets/product-coconut-oil.jpg"
    ],
    category: "Organic Grocery",
    organic: true,
    inStock: true,
    description: "Pure cold pressed coconut oil from Kerala. Extracted using traditional methods without heat or chemicals to preserve natural nutrients and flavor.",
    highlights: [
      "100% Pure & Natural",
      "Cold Pressed Method",
      "Rich in MCT", 
      "No Chemicals Added",
      "Traditional Processing"
    ],
    nutrition: "High in medium-chain triglycerides (MCTs), vitamin E, and natural antioxidants.",
    benefits: "Supports heart health, boosts metabolism, and excellent for cooking and skincare.",
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "500ml", price: 280, originalPrice: 320, stockCount: 35, popular: false },
      { id: 2, weight: "1L", price: 450, originalPrice: 500, stockCount: 28, popular: true },
      { id: 3, weight: "2L", price: 850, originalPrice: 950, stockCount: 18, popular: false }
    ]
  },
  3: {
    id: 3,
    name: "Pure Honey",
    basePrice: 650,
    rating: 4.7,
    reviewCount: 156,
    images: [
      "/assets/product-honey.jpg",
      "/assets/product-honey.jpg",
      "/assets/product-honey.jpg",
      "/assets/product-honey.jpg"
    ],
    category: "Organic Grocery",
    organic: true,
    inStock: true,
    description: "Raw unprocessed honey from organic bee farms. Collected from wildflower meadows without any artificial processing or additives.",
    highlights: [
      "100% Raw & Unprocessed",
      "Wildflower Source",
      "No Artificial Additives", 
      "Rich in Enzymes",
      "Natural Antibacterial Properties"
    ],
    nutrition: "Rich in natural enzymes, antioxidants, vitamins, and minerals. Contains natural prebiotics.",
    benefits: "Boosts immunity, aids digestion, provides natural energy, and has antimicrobial properties.",
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "250g", price: 280, originalPrice: 320, stockCount: 42, popular: false },
      { id: 2, weight: "500g", price: 650, originalPrice: 750, stockCount: 30, popular: true },
      { id: 3, weight: "1kg", price: 1200, originalPrice: 1400, stockCount: 20, popular: false }
    ]
  },
  4: {
    id: 4,
    name: "Organic Turmeric Powder",
    basePrice: 280,
    rating: 4.6,
    reviewCount: 92,
    images: [
      "/assets/product-turmeric.jpg",
      "/assets/product-turmeric.jpg",
      "/assets/product-turmeric.jpg",
      "/assets/product-turmeric.jpg"
    ],
    category: "Ruchira",
    organic: true,
    inStock: true,
    description: "Fresh ground turmeric powder with high curcumin content. Sourced from organic farms and ground fresh to preserve maximum potency.",
    highlights: [
      "High Curcumin Content",
      "Fresh Ground",
      "100% Organic", 
      "No Artificial Colors",
      "Traditional Processing"
    ],
    nutrition: "Rich in curcumin, antioxidants, and essential oils. High anti-inflammatory properties.",
    benefits: "Natural anti-inflammatory, supports immune system, aids digestion, and promotes overall wellness.",
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "100g", price: 120, originalPrice: 140, stockCount: 50, popular: false },
      { id: 2, weight: "250g", price: 280, originalPrice: 320, stockCount: 35, popular: true },
      { id: 3, weight: "500g", price: 520, originalPrice: 600, stockCount: 25, popular: false }
    ]
  },
  5: {
    id: 5,
    name: "Aloe Vera Gel",
    basePrice: 320,
    rating: 4.4,
    reviewCount: 78,
    images: [
      "/assets/product-aloe-gel.jpg",
      "/assets/product-aloe-gel.jpg",
      "/assets/product-aloe-gel.jpg",
      "/assets/product-aloe-gel.jpg"
    ],
    category: "Personal Care",
    organic: true,
    inStock: true,
    description: "Pure aloe vera gel for skin and hair care. Extracted from fresh aloe leaves without any artificial additives or preservatives.",
    highlights: [
      "100% Pure Aloe",
      "No Artificial Additives",
      "Skin & Hair Care", 
      "Natural Moisturizer",
      "Soothing Properties"
    ],
    nutrition: "Rich in vitamins A, C, E, and natural amino acids. Contains natural enzymes and minerals.",
    benefits: "Moisturizes skin, soothes irritation, promotes healing, and nourishes hair naturally.",
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "100ml", price: 180, originalPrice: 220, stockCount: 40, popular: false },
      { id: 2, weight: "200ml", price: 320, originalPrice: 380, stockCount: 32, popular: true },
      { id: 3, weight: "500ml", price: 720, originalPrice: 850, stockCount: 20, popular: false }
    ]
  },
  6: {
    id: 6,
    name: "Neem Oil",
    basePrice: 180,
    rating: 4.3,
    reviewCount: 64,
    images: [
      "/assets/product-neem-oil.jpg",
      "/assets/product-neem-oil.jpg",
      "/assets/product-neem-oil.jpg",
      "/assets/product-neem-oil.jpg"
    ],
    category: "Personal Care",
    organic: true,
    inStock: true,
    description: "Cold pressed neem oil for natural skincare and plant protection. Pure and unrefined with all natural properties intact.",
    highlights: [
      "Cold Pressed",
      "100% Pure",
      "Natural Pesticide", 
      "Skin Care Benefits",
      "Antibacterial Properties"
    ],
    nutrition: "Rich in fatty acids, vitamin E, and natural compounds like azadirachtin.",
    benefits: "Natural antibacterial, antifungal properties, excellent for skin care and organic gardening.",
    shipping: "Free delivery on orders above ₹500. Same-day delivery available in select areas.",
    weightVariants: [
      { id: 1, weight: "50ml", price: 120, originalPrice: 140, stockCount: 45, popular: false },
      { id: 2, weight: "100ml", price: 180, originalPrice: 220, stockCount: 38, popular: true },
      { id: 3, weight: "250ml", price: 420, originalPrice: 480, stockCount: 25, popular: false }
    ]
  },
  7: {
    id: 7,
    name: "Fresh Spinach",
    basePrice: 40,
    rating: 4.8,
    reviewCount: 234,
    images: [
      "/assets/product-spinach.jpg",
      "/assets/product-spinach.jpg",
      "/assets/product-spinach.jpg",
      "/assets/product-spinach.jpg"
    ],
    category: "Fruits & Vegetables",
    organic: true,
    inStock: true,
    description: "Fresh organic spinach leaves picked daily from our farms. Rich in iron, vitamins, and minerals for a healthy diet.",
    highlights: [
      "Daily Fresh Harvest",
      "100% Organic",
      "Rich in Iron", 
      "High in Vitamins",
      "Pesticide Free"
    ],
    nutrition: "Excellent source of iron, vitamin K, vitamin A, folate, and antioxidants.",
    benefits: "Supports bone health, boosts energy, improves eye health, and provides essential nutrients.",
    shipping: "Same-day delivery for fresh produce. Free delivery on orders above ₹500.",
    weightVariants: [
      { id: 1, weight: "250g", price: 25, originalPrice: 30, stockCount: 60, popular: false },
      { id: 2, weight: "500g", price: 40, originalPrice: 45, stockCount: 45, popular: true },
      { id: 3, weight: "1kg", price: 75, originalPrice: 85, stockCount: 30, popular: false }
    ]
  },
  8: {
    id: 8,
    name: "Tomato Seeds",
    basePrice: 120,
    rating: 4.5,
    reviewCount: 45,
    images: [
      "/assets/product-tomato-seeds.jpg",
      "/assets/product-tomato-seeds.jpg",
      "/assets/product-tomato-seeds.jpg",
      "/assets/product-tomato-seeds.jpg"
    ],
    category: "Plant Nursery",
    organic: true,
    inStock: true,
    description: "Organic heirloom tomato seeds for home gardening. High germination rate with excellent yield potential.",
    highlights: [
      "Heirloom Variety",
      "High Germination Rate",
      "Organic Seeds", 
      "Home Garden Perfect",
      "High Yield Potential"
    ],
    nutrition: "Seeds are treated naturally without chemicals. Rich in genetic diversity for healthy plants.",
    benefits: "Easy to grow, disease resistant, produces flavorful tomatoes, perfect for beginners.",
    shipping: "Free delivery on orders above ₹500. Seeds shipped in protective packaging.",
    weightVariants: [
      { id: 1, weight: "5g (50 seeds)", price: 80, originalPrice: 90, stockCount: 100, popular: false },
      { id: 2, weight: "10g (100 seeds)", price: 120, originalPrice: 140, stockCount: 75, popular: true },
      { id: 3, weight: "25g (250 seeds)", price: 280, originalPrice: 320, stockCount: 40, popular: false }
    ]
  }
};

const relatedProducts = [
  {
    id: 2,
    name: "Cold Pressed Coconut Oil",
    price: 450,
    rating: 4.8,
    reviewCount: 89,
    image: "/assets/product-coconut-oil.jpg",
    category: "Organic Grocery",
    weight: "1L",
    organic: true,
    inStock: true,
    description: "Pure cold pressed coconut oil from Kerala"
  },
  {
    id: 3,
    name: "Pure Honey",
    price: 650,
    originalPrice: 750,
    rating: 4.7,
    reviewCount: 156,
    image: "/assets/product-honey.jpg",
    category: "Organic Grocery",
    weight: "500g",
    organic: true,
    inStock: true,
    description: "Raw unprocessed honey from organic bee farms"
  },
  {
    id: 4,
    name: "Organic Turmeric Powder",
    price: 280,
    originalPrice: 320,
    rating: 4.6,
    reviewCount: 92,
    image: "/assets/product-turmeric.jpg",
    category: "Organic Grocery",
    weight: "250g",
    organic: true,
    inStock: true,
    description: "Fresh ground turmeric powder with high curcumin content"
  }
];

export default function ProductDetails() {
  const { id } = useParams();
  const productId = parseInt(id || "1");
  const productData = allProducts[productId as keyof typeof allProducts] || allProducts[1];
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(productData.weightVariants[productData.weightVariants.findIndex(v => v.popular) || 0]);

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${productData.name} (${selectedVariant.weight}) added to your cart.`,
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

  const discountPercentage = selectedVariant.originalPrice ? 
    Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100) : 0;

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
                src={productData.images[selectedImage].startsWith('/src/') ? 
                     productData.images[selectedImage].replace('/src/', '/') : 
                     productData.images[selectedImage]}
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
                    src={image.startsWith('/src/') ? image.replace('/src/', '/') : image}
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
              <h1 className="text-3xl font-bold text-primary mb-4 font-heading">{productData.name}</h1>
              
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

            {/* Weight Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold">Select Weight:</h3>
              <div className="grid grid-cols-2 gap-3">
                {productData.weightVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50 ${
                      selectedVariant.id === variant.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-background'
                    }`}
                  >
                    {variant.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-accent text-accent-foreground text-xs">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <div className="font-medium text-foreground">{variant.weight}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-primary">₹{variant.price}</span>
                      {variant.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{variant.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {variant.stockCount} in stock
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">₹{selectedVariant.price}</span>
                {selectedVariant.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{selectedVariant.originalPrice}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Weight: {selectedVariant.weight}</p>
              {productData.inStock && (
                <p className="text-sm text-muted-foreground">
                  {selectedVariant.stockCount} items left in stock
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
                    disabled={quantity >= selectedVariant.stockCount}
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