import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  weight: string;
  quantity: number;
  inStock: boolean;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Organic Basmati Rice",
    price: 850,
    originalPrice: 950,
    image: "/src/assets/product-rice.jpg",
    weight: "5kg",
    quantity: 2,
    inStock: true
  },
  {
    id: 2,
    name: "Cold Pressed Coconut Oil",
    price: 450,
    image: "/src/assets/product-coconut-oil.jpg",
    weight: "1L",
    quantity: 1,
    inStock: true
  },
  {
    id: 3,
    name: "Pure Honey",
    price: 650,
    originalPrice: 750,
    image: "/src/assets/product-honey.jpg",
    weight: "500g",
    quantity: 1,
    inStock: true
  }
];

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      toast({
        title: "Coupon Applied",
        description: `Coupon "${couponCode}" has been applied successfully.`,
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const discount = couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping + tax - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-primary mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/shop">
              <Button className="btn-accent-farm">
                Continue Shopping
              </Button>
            </Link>
          </div>
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
          <span>Home</span> <span className="mx-2">/</span> 
          <span className="text-primary">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-card p-6 rounded-lg border border-border">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.weight}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">per item</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-lg font-bold text-primary">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link to="/shop">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Coupon Code */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-4">Apply Coupon</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button onClick={applyCoupon} variant="outline">
                  Apply
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Try "WELCOME10" for 10% off
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-accent" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block mt-6">
                <Button className="w-full btn-accent-farm text-lg py-3">
                  Proceed to Checkout
                </Button>
              </Link>

              {shipping > 0 && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Add ₹{500 - subtotal} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}