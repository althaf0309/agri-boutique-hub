import ProductCard from "./ProductCard";
import { toast } from "@/hooks/use-toast";
import productRice from "@/assets/product-rice.jpg";
import productCoconutOil from "@/assets/product-coconut-oil.jpg";
import productTurmeric from "@/assets/product-turmeric.jpg";
import productAloeGel from "@/assets/product-aloe-gel.jpg";
import productTomatoSeeds from "@/assets/product-tomato-seeds.jpg";
import productSpinach from "@/assets/product-spinach.jpg";
import productHoney from "@/assets/product-honey.jpg";
import productNeemOil from "@/assets/product-neem-oil.jpg";

// Sample product data with real images
const sampleProducts = [
  {
    id: 1,
    name: "Organic Basmati Rice",
    price: 850,
    originalPrice: 950,
    rating: 4.5,
    reviewCount: 123,
    image: productRice,
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
    image: productCoconutOil,
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
    image: productTurmeric,
    category: "Ruchira",
    weight: "500g",
    organic: true,
    inStock: true,
    description: "High curcumin organic turmeric powder"
  },
  {
    id: 4,
    name: "Aloe Vera Face Gel",
    price: 320,
    rating: 4.3,
    reviewCount: 67,
    image: productAloeGel,
    category: "Personal Care",
    weight: "100ml",
    organic: true,
    inStock: false,
    description: "Natural aloe vera gel for skincare"
  },
  {
    id: 5,
    name: "Tomato Seeds Pack",
    price: 120,
    rating: 4.7,
    reviewCount: 234,
    image: productTomatoSeeds,
    category: "Plant Nursery",
    weight: "50 seeds",
    organic: true,
    inStock: true,
    description: "High yield hybrid tomato seeds"
  },
  {
    id: 6,
    name: "Fresh Organic Spinach",
    price: 45,
    rating: 4.4,
    reviewCount: 78,
    image: productSpinach,
    category: "Fruits & Vegetables",
    weight: "250g",
    organic: true,
    inStock: true,
    description: "Fresh organic spinach leaves"
  },
  {
    id: 7,
    name: "Organic Honey",
    price: 680,
    originalPrice: 750,
    rating: 4.9,
    reviewCount: 192,
    image: productHoney,
    category: "Organic Grocery",
    weight: "1kg",
    organic: true,
    inStock: true,
    description: "Pure raw organic honey from wildflowers"
  },
  {
    id: 8,
    name: "Neem Oil Spray",
    price: 180,
    rating: 4.2,
    reviewCount: 45,
    image: productNeemOil,
    category: "Plant Nursery",
    weight: "250ml",
    organic: true,
    inStock: true,
    description: "Natural neem oil for plant protection"
  }
];

interface ProductGridProps {
  title?: string;
  products?: typeof sampleProducts;
  showAll?: boolean;
}

export default function ProductGrid({ 
  title, 
  products = sampleProducts, 
  showAll = false 
}: ProductGridProps) {
  const displayProducts = showAll ? products : products.slice(0, 8);

  const handleAddToCart = (product: typeof sampleProducts[0]) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleQuickView = (product: typeof sampleProducts[0]) => {
    toast({
      title: "Quick View",
      description: `Opening quick view for ${product.name}`,
    });
  };

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {title && (
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              {title}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}