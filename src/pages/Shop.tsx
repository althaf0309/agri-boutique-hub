import { useState, useRef } from "react";
import Header from "@/components/Header";
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

const sampleProducts = [
  {
    id: 1,
    name: "Organic Basmati Rice",
    price: 850,
    originalPrice: 950,
    rating: 4.5,
    reviewCount: 123,
    image: "/assets/product-rice.jpg",
    category: "Organic Grocery",
    weight: "5kg",
    organic: true,
    inStock: true,
    description: "Premium aged basmati rice grown without pesticides"
  },
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
    rating: 4.6,
    reviewCount: 92,
    image: "/assets/product-turmeric.jpg",
    category: "Ruchira",
    weight: "250g",
    organic: true,
    inStock: true,
    description: "Fresh ground turmeric powder with high curcumin content"
  },
  {
    id: 5,
    name: "Aloe Vera Gel",
    price: 320,
    rating: 4.4,
    reviewCount: 78,
    image: "/assets/product-aloe-gel.jpg",
    category: "Personal Care",
    weight: "200ml",
    organic: true,
    inStock: true,
    description: "Pure aloe vera gel for skin and hair care"
  },
  {
    id: 6,
    name: "Neem Oil",
    price: 180,
    rating: 4.3,
    reviewCount: 64,
    image: "/assets/product-neem-oil.jpg",
    category: "Personal Care",
    weight: "100ml",
    organic: true,
    inStock: true,
    description: "Cold pressed neem oil for natural skincare"
  },
  {
    id: 7,
    name: "Fresh Spinach",
    price: 40,
    rating: 4.8,
    reviewCount: 234,
    image: "/assets/product-spinach.jpg",
    category: "Fruits & Vegetables",
    weight: "500g",
    organic: true,
    inStock: true,
    description: "Fresh organic spinach leaves picked daily"
  },
  {
    id: 8,
    name: "Tomato Seeds",
    price: 120,
    rating: 4.5,
    reviewCount: 45,
    image: "/assets/product-tomato-seeds.jpg",
    category: "Plant Nursery",
    weight: "10g",
    organic: true,
    inStock: true,
    description: "Organic heirloom tomato seeds for home gardening"
  }
];

const categories = [
  "All Categories",
  "Organic Grocery",
  "Ruchira",
  "Personal Care",
  "Plant Nursery",
  "Fruits & Vegetables"
];

const tags = ["Organic", "Vegan", "Gluten-Free", "Non-GMO", "Fair Trade"];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<typeof sampleProducts[0] | null>(null);

  const handleAddToCart = (product: typeof sampleProducts[0]) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickView = (product: typeof sampleProducts[0]) => {
    // Add enhanced product data for quick view including weight variants
    const enhancedProduct = {
      ...product,
      reviews: product.reviewCount,
      features: [
        "100% Organic & Natural",
        "Farm Fresh Quality",
        "Sustainably Sourced", 
        "Rich in Nutrients"
      ],
      // Add sample weight variants for demonstration
      weightVariants: [
        {
          id: 1,
          weight: "250g",
          price: Math.round(product.price * 0.3),
          originalPrice: product.originalPrice ? Math.round(product.originalPrice * 0.3) : undefined,
          stockCount: 25,
          popular: false
        },
        {
          id: 2,
          weight: "500g",
          price: Math.round(product.price * 0.6), 
          originalPrice: product.originalPrice ? Math.round(product.originalPrice * 0.6) : undefined,
          stockCount: 18,
          popular: true
        },
        {
          id: 3,
          weight: "1kg",
          price: product.price,
          originalPrice: product.originalPrice,
          stockCount: 12,
          popular: false
        }
      ]
    };
    setQuickViewProduct(enhancedProduct);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.min(sampleProducts.length - 1, currentIndex + 1));
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-full">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> <span className="mx-2">/</span> <span className="text-primary">Shop</span>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Category</h4>
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox 
                      checked={selectedCategory === category}
                      onCheckedChange={() => setSelectedCategory(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={2000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Tags</h4>
                {tags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox 
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
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
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-muted-foreground mb-6">
              Showing {sampleProducts.length} products
            </p>

            {/* Mobile Carousel View */}
            <div className="block sm:hidden relative mb-8 overflow-hidden max-w-full">
              {/* Navigation Arrows */}
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
                disabled={currentIndex >= sampleProducts.length - 1}
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </Button>

              {/* Carousel Container */}
              <div 
                ref={carouselRef}
                className="product-carousel px-12 max-w-full"
                style={{ maxWidth: '100vw', boxSizing: 'border-box' }}
              >
                {sampleProducts.map((product) => (
                  <div key={product.id} className="product-carousel-item">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                    />
                  </div>
                ))}
              </div>
              
              {/* Enhanced Scroll Indicators */}
              <div className="carousel-dots max-w-full">
                {sampleProducts.map((_, index) => (
                  <div 
                    key={index} 
                    className={`carousel-dot ${
                      Math.floor(currentIndex / 2) === Math.floor(index / 2) ? 'active' : 'inactive'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid View */}
            <div className={`hidden sm:grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {sampleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}