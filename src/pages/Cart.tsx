// src/pages/Cart.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getItems, setQuantity as setQty, removeItem as removeLine, CartLine } from "@/lib/cart";
import { beginCheckout } from "@/lib/checkout";

/* image helpers */
const PLACEHOLDER =
  (import.meta as any)?.env?.VITE_PRODUCT_PLACEHOLDER ||
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='22'>No Image</text></svg>";

function normalizeImage(src?: string) {
  if (!src) return PLACEHOLDER;
  if (/^https?:\/\//i.test(src)) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

const rowKey = (i: CartLine) => `${i.id}-${i.weight}-${i.variantId ?? "na"}`;

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState("");

  // Live input values per-row (string so the user can type freely)
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  // Guards to avoid double-commit on Enter (Enter triggers blur)
  const skipNextBlurRef = useRef<Record<string, boolean>>({});
  // Cache last quantity we actually wrote to storage to prevent duplicate writes
  const lastCommittedRef = useRef<Record<string, number>>({});

  const sync = () => {
    const items = getItems();
    setCartItems(items);
    setQuantities(Object.fromEntries(items.map(i => [rowKey(i), String(i.quantity)])));
    lastCommittedRef.current = Object.fromEntries(items.map(i => [rowKey(i), i.quantity]));
  };

  useEffect(() => {
    sync();
  }, []);

  const updateQuantityButtons = (item: CartLine, delta: number) => {
    const key = rowKey(item);
    const next = Math.max(0, (lastCommittedRef.current[key] ?? item.quantity) + delta);
    if (next === 0) {
      removeItem(item.id, item.weight, item.variantId);
      return;
    }
    setQty(item.id, item.weight, next, item.variantId);
    lastCommittedRef.current[key] = next;
    setQuantities(prev => ({ ...prev, [key]: String(next) }));
    sync();
  };

  const removeItem = (id: number, weight: string, variantId?: number) => {
    removeLine(id, weight, variantId);
    sync();
    toast({ title: "Item Removed", description: "Item removed from your cart." });
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      toast({ title: "Coupon Applied", description: `Coupon "${couponCode}" applied.` });
    }
  };

  const handleQtyChange = (key: string, val: string) => {
    // Allow empty string and digits only while typing
    if (/^\d*$/.test(val)) {
      setQuantities(prev => ({ ...prev, [key]: val }));
    }
  };

  const commitQty = (item: CartLine) => {
    const key = rowKey(item);
    const raw = quantities[key];

    // If empty, reset to current cart quantity
    if (!raw?.length) {
      setQuantities(prev => ({ ...prev, [key]: String(item.quantity) }));
      return;
    }

    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n)) {
      toast({ title: "Invalid quantity", description: "Please enter a number.", variant: "destructive" });
      setQuantities(prev => ({ ...prev, [key]: String(item.quantity) }));
      return;
    }

    const clamped = Math.max(0, Math.min(9999, n));

    // Idempotency: if this equals the last committed value, do nothing
    if (lastCommittedRef.current[key] === clamped) return;

    if (clamped === 0) {
      removeItem(item.id, item.weight, item.variantId);
      return;
    }

    setQty(item.id, item.weight, clamped, item.variantId);
    lastCommittedRef.current[key] = clamped;
    sync();
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const discount = couponCode === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping + tax - discount;

  const proceedToCheckout = async () => {
    try {
      const orderId = await beginCheckout(); // collect all current cart lines
      navigate(`/checkout?order=${orderId}`);
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-primary mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/shop">
              <Button className="btn-accent-farm">Continue Shopping</Button>
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
        <nav className="text-sm text-muted-foreground mb-6">
          <span>Home</span> <span className="mx-2">/</span>
          <span className="text-primary">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const imgSrc = normalizeImage(item.image);
              const key = rowKey(item);
              const value = quantities[key] ?? String(item.quantity);

              return (
                <div key={key} className="bg-card p-3 sm:p-6 rounded-lg border border-border">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-40 sm:h-24 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.currentTarget as HTMLImageElement).src = PLACEHOLDER)}
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.weight}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id, item.weight, item.variantId)}
                          className="text-muted-foreground hover:text-destructive p-1 sm:p-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl font-bold text-primary">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">₹{item.originalPrice}</span>
                          )}
                          <span className="text-sm text-muted-foreground hidden sm:inline">per item</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center justify-between sm:justify-start">
                            <span className="text-sm text-muted-foreground sm:hidden">Quantity:</span>

                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantityButtons(item, -1)}
                                disabled={(lastCommittedRef.current[key] ?? item.quantity) <= 1}
                                className="h-8 w-8 p-0"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>

                              <Input
                                inputMode="numeric"
                                type="number"
                                min={0}
                                max={9999}
                                className="w-16 h-8 text-center border-0 focus-visible:ring-0"
                                value={value}
                                onChange={(e) => handleQtyChange(key, e.target.value)}
                                onBlur={() => {
                                  if (skipNextBlurRef.current[key]) {
                                    skipNextBlurRef.current[key] = false;
                                    return;
                                  }
                                  commitQty(item);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    skipNextBlurRef.current[key] = true;
                                    commitQty(item);
                                    (e.currentTarget as HTMLInputElement).blur();
                                  }
                                }}
                                aria-label="Quantity"
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantityButtons(item, +1)}
                                className="h-8 w-8 p-0"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between sm:justify-end">
                            <span className="text-sm text-muted-foreground sm:hidden">Total:</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Link to="/shop">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 order-first lg:order-last">
            {/* <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-4 text-base sm:text-lg">Apply Coupon</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={applyCoupon} variant="outline" className="w-full sm:w-auto">
                  Apply
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Try "WELCOME10" for 10% off</p>
            </div> */}

            <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-accent" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base"><span>Tax</span><span>₹{tax}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent text-sm sm:text-base">
                    <span>Discount</span><span>-₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                    <span>Total</span><span className="text-primary">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="block mt-6">
                <Button onClick={proceedToCheckout} className="w-full btn-accent-farm text-base sm:text-lg py-3">
                  Proceed to Checkout
                </Button>
              </div>

              {shipping > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3">
                  Add ₹{Math.max(0, 500 - subtotal)} more for free shipping
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
