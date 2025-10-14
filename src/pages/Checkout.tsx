import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Truck, Shield, Leaf, Wallet } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { getItems, setQuantity as setQty, removeItem as removeLine } from "@/lib/cart";
import { getCheckoutLines, clearCheckoutLines } from "@/lib/checkout";
import { useAuth } from "@/lib/auth"; // ⬅️ add this

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/** ========= API base + helper ========= */
const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const apiUrl = (path: string) => `${API_ROOT}${path.startsWith("/") ? "" : "/"}${path}`;

/** ——— Validation ——— */
const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a complete address"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z
    .string()
    .trim()
    .regex(/^([1-9]\d{5}|[A-Za-z0-9\- ]{3,12})$/, "Please enter a valid PIN/ZIP"),
  country: z.string().default("India"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  paymentMethod: z.enum(["razorpay", "cod"]),
  specialInstructions: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

/** Minimal fetch helpers that pass auth token if present */
async function apiPost<T = any>(url: string, body?: any): Promise<T> {
  const token = localStorage.getItem("auth_token") || localStorage.getItem("authToken");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const query = useQuery();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // ⬅️ auth state

  // ⬅️ Guard: if not logged in, show message and redirect to /login
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "Log in to complete your purchase.",
      });
      navigate("/login", { replace: true, state: { from: "/checkout" } });
    }
  }, [isAuthenticated, navigate, toast]);

  // Don’t render the page while we’re redirecting unauthenticated users
  if (!isAuthenticated) return null;

  // read any pre-staged lines from "beginCheckout"
  const checkoutLines = useMemo(getCheckoutLines, []);
  const cartItems = useMemo(getItems, []);
  const itemsToBuy = useMemo(() => {
    if (!checkoutLines.length) return cartItems; // fallback: buy everything in cart
    const selected: typeof cartItems = [];
    for (const line of checkoutLines) {
      const found = cartItems.find(
        (ci) => ci.id === line.product_id && ci.variantId === line.variant_id && ci.weight === (line.weight || ci.weight)
      );
      if (found) {
        selected.push({ ...found, quantity: line.quantity });
      }
    }
    return selected.length ? selected : cartItems;
  }, [checkoutLines, cartItems]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      phone: "",
      paymentMethod: "razorpay",
      specialInstructions: "",
    },
  });

  const subtotal = itemsToBuy.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    void query.get("order");
  }, []);

  const buildSnapshot = () => {
    const items = itemsToBuy.map((i) => ({
      id: i.id,
      variant_id: i.variantId ?? null,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
      weight: i.weight,
    }));
    const totals = {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      grand_total: Number(total.toFixed(2)),
    };
    return { items, totals };
  };

  const finalizeCart = () => {
    for (const item of itemsToBuy) {
      const current =
        cartItems.find((ci) => ci.id === item.id && ci.variantId === item.variantId && ci.weight === item.weight)?.quantity || 0;
      const newQty = current - item.quantity;
      if (newQty > 0) setQty(item.id, item.weight, newQty, item.variantId);
      else removeLine(item.id, item.weight, item.variantId);
    }
    clearCheckoutLines();
  };

  const payWithRazorpay = async (data: CheckoutFormData) => {
    const { order, key_id } = await apiPost(apiUrl("/payments/razorpay/create-order/"), {
      amount: total,
      currency: "INR",
      notes: { purpose: "ecommerce order" },
    });

    await new Promise<void>((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Your Store",
        description: "Order payment",
        order_id: order.id,
        prefill: {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          contact: data.phone,
        },
        theme: { color: "#10b981" },
        handler: async (response: any) => {
          try {
            await apiPost(apiUrl("/payments/razorpay/verify/"), {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const { items, totals } = buildSnapshot();
            await apiPost(apiUrl("/orders/razorpay_confirm/"), {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              amount: total,
              checkout: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                address2: data.address2,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
                phone: data.phone,
                notes: data.specialInstructions,
                lines: items.map((i) => ({
                  product_id: i.id,
                  variant_id: i.variant_id,
                  name: i.name,
                  qty: i.quantity,
                  price: i.price,
                  image: i.image,
                  weight: i.weight,
                })),
                totals: { subtotal: totals.subtotal, shipping: totals.shipping, tax: totals.tax, grand_total: totals.total },
              },
            });

            navigate("/order-success", {
              replace: true,
              state: {
                customer: {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  address: data.address,
                  city: data.city,
                  state: data.state,
                  zipCode: data.zipCode,
                  email: data.email,
                  phone: data.phone,
                  paymentStatus: "paid",
                },
                items,
                totals,
                gateway: {
                  provider: "razorpay",
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                },
              },
            });

            resolve();
          } catch (e) {
            reject(e);
          }
        },
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const placeCOD = async (data: CheckoutFormData) => {
    const { items, totals } = buildSnapshot();
    await apiPost(apiUrl("/orders/cod/"), {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      address2: data.address2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      notes: data.specialInstructions,
      lines: items.map((i) => ({
        product_id: i.id,
        variant_id: i.variant_id,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        image: i.image,
        weight: i.weight,
      })),
      totals: { subtotal: totals.subtotal, shipping: totals.shipping, tax: totals.tax, grand_total: totals.total },
    });

    navigate("/order-success", {
      replace: true,
      state: {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          email: data.email,
          phone: data.phone,
          paymentStatus: "cod",
        },
        items,
        totals,
        gateway: { provider: "cod" },
      },
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      if (data.paymentMethod === "razorpay") {
        await payWithRazorpay(data);
      } else {
        await placeCOD(data);
      }
      finalizeCart();
      toast({
        title: "Order Placed Successfully! 🌱",
        description:
          data.paymentMethod === "razorpay"
            ? "Payment received. You'll get a confirmation email shortly."
            : "COD order placed. You'll get a confirmation email shortly.",
      });
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Complete Your Order</h1>
            <p className="text-muted-foreground">Just a few more steps to get your organic products delivered</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Leaf className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Shipping Information */}
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Truck className="w-5 h-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2 (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PIN/ZIP</FormLabel>
                              <FormControl>
                                <Input placeholder="560001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="India" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <CreditCard className="w-5 h-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="razorpay" id="razorpay" />
                                  <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                                    Razorpay (Cards • UPI • Netbanking)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="cod" id="cod" />
                                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                    <span className="inline-flex items-center gap-2">
                                      <Wallet className="w-4 h-4" />
                                      Cash on Delivery
                                    </span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Special Instructions */}
                  <Card className="border-primary/10 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <CardTitle className="text-primary">Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special delivery instructions..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-primary/10 shadow-lg sticky top-4">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardTitle className="text-primary">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {itemsToBuy.map((item) => (
                      <div key={`${item.id}-${item.weight}-${item.variantId ?? "na"}`} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>₹{shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Your payment is secure and encrypted
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
