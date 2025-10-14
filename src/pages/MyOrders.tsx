// src/pages/MyOrders.tsx
import { useEffect, useMemo } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/api/hooks/orders";
import { useActiveCart } from "@/api/hooks/cart";

// money formatter
function Money({ value, currency = "INR" }: { value?: number | string; currency?: string }) {
  if (value == null || value === "") return <span>—</span>;
  const n = typeof value === "string" ? parseFloat(value) : value;
  try {
    return <span>{new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n)}</span>;
  } catch {
    return <span>{Number(n).toFixed(2)}</span>;
  }
}

// best-effort image fallback: product primary → variant primary → first in arrays
function getItemImageUrl(it: any): string | undefined {
  const p = it?.product || {};
  const v = it?.variant || {};
  return (
    p.primary_image_url ||
    v.primary_image_url ||
    p.image ||
    v.image ||
    p.images?.[0]?.image ||
    v.images?.[0]?.image ||
    undefined
  );
}

export default function MyOrders() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // 🔐 If not logged in, redirect to login and come back after
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, msg: "Please log in to see your orders." }}
      />
    );
  }

  // ✅ Only the current user's orders
  const { data: orders = [], isLoading: ordersLoading } = useOrders(user?.id);
  const { data: cart, isLoading: cartLoading } = useActiveCart();

  const loading = ordersLoading || cartLoading;
  const hasOrders = (orders?.length || 0) > 0;
  const cartItems = useMemo(() => cart?.items || [], [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">See your recent purchases and your current cart.</p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`ord-skel-${i}`} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Current Cart</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`cart-skel-${i}`} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasOrders && (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    You haven’t placed any orders yet.
                    <div className="mt-3">
                      <Link to="/shop">
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {orders.map((o: any, oIdx: number) => {
                  const orderKey = o?.id ?? `order-${oIdx}`;
                  const created = o?.created_at ? new Date(o.created_at) : null;
                  const displayDate = created ? created.toLocaleString() : "";
                  const amount = o?.payment?.amount ?? o?.totals?.grand_total ?? 0;
                  const currency = o?.payment?.currency ?? o?.currency ?? "INR";
                  const items = o?.cart?.items ?? o?.lines ?? [];

                  return (
                    <div key={orderKey} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">
                          Order #{o?.id ?? "—"}{" "}
                          <span className="text-muted-foreground">• {o?.status ?? "—"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{displayDate}</div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {items.slice(0, 3).map((it: any, i: number) => {
                          const img = getItemImageUrl(it);
                          const itemKey =
                            it?.id ??
                            `${orderKey}-item-${it?.product?.id ?? "p"}-${it?.variant?.id ?? "v"}-${i}`;
                          return (
                            <div key={itemKey} className="flex items-center gap-3">
                              {img ? (
                                <img
                                  src={img}
                                  alt={it?.product?.name || "Product"}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted" />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {it?.product?.name || it?.name || "Product"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Qty {it?.quantity ?? it?.qty ?? 1}
                                  {it?.variant?.attributes &&
                                    " • " +
                                      Object.entries(it.variant.attributes)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(", ")}
                                </div>
                              </div>
                              <div className="text-sm">
                                <Money value={it?.line_total ?? it?.unit_price ?? it?.price} currency={currency} />
                              </div>
                            </div>
                          );
                        })}

                        {items.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Payment: {o?.payment?.method || o?.payment_method || "—"} •{" "}
                          {o?.payment?.status || "—"}
                        </div>
                        <div className="text-base font-semibold">
                          <Money value={amount} currency={currency} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Current Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Current Cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!cartItems.length && (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Your cart is empty.
                    <div className="mt-3">
                      <Link to="/shop">
                        <Button variant="outline">Browse Products</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {cartItems.map((it: any, i: number) => {
                  const img = getItemImageUrl(it);
                  const itemKey =
                    it?.id ?? `cart-item-${it?.product?.id ?? "p"}-${it?.variant?.id ?? "v"}-${i}`;
                  return (
                    <div key={itemKey} className="flex items-center gap-3">
                      {img ? (
                        <img
                          src={img}
                          alt={it?.product?.name || "Product"}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{it?.product?.name || it?.name || "Product"}</div>
                        <div className="text-xs text-muted-foreground">
                          Qty {it?.quantity ?? 1}
                          {it?.variant?.attributes &&
                            " • " +
                              Object.entries(it.variant.attributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                        </div>
                      </div>
                      <div className="text-sm">
                        <Money value={it?.line_total ?? it?.unit_price} />
                      </div>
                    </div>
                  );
                })}

                {cartItems.length > 0 && (
                  <div className="pt-2">
                    <Link to="/checkout">
                      <Button className="w-full">Go to Checkout</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
