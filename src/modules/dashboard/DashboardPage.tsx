import { useMemo, useState } from "react";
import {
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

import {
  useDashboardKpis,
  useTopProducts,
  useSalesSeries,
  type SalesRange,
  type SalesGranularity,
} from "@/api/hooks/dashboard";
import { useOrders } from "@/api/hooks/orders";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const up = (v?: string) => v?.startsWith("+");
const toNum = (v?: string | number) => (v == null ? 0 : Number(v));
const inr = (n: number) => `₹${Math.round(n).toLocaleString()}`;

/* ---------- helpers for client-side fallback series ---------- */
function startOfRange(range: SalesRange) {
  const now = new Date();
  const d = new Date(now);
  if (range === "7d") d.setDate(d.getDate() - 6);
  else if (range === "30d") d.setDate(d.getDate() - 29);
  else if (range === "90d") d.setDate(d.getDate() - 89);
  else if (range === "1y") d.setFullYear(d.getFullYear() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function formatBucketLabel(date: Date, gran: SalesGranularity) {
  if (gran === "month") return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  if (gran === "week") {
    const end = new Date(date); end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  // day
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun
  const diff = day === 0 ? 6 : day - 1; // Monday as start
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x; }

function buildBuckets(range: SalesRange, gran: SalesGranularity) {
  const start = startOfRange(range);
  const now = new Date();
  now.setHours(0,0,0,0);

  const buckets: { key: string; start: Date; end: Date; name: string; sales: number; orders: number; customers: number }[] = [];
  let cursor = new Date(start);

  if (gran === "month") {
    while (cursor <= now) {
      const s = startOfMonth(cursor);
      const e = addMonths(s, 1);
      buckets.push({ key: `${s.getFullYear()}-${s.getMonth()+1}`, start: s, end: e, name: formatBucketLabel(s, "month"), sales: 0, orders: 0, customers: 0 });
      cursor = e;
    }
  } else if (gran === "week") {
    cursor = startOfWeek(cursor);
    while (cursor <= now) {
      const s = new Date(cursor);
      const e = addDays(s, 7);
      buckets.push({ key: `w-${s.toISOString().slice(0,10)}`, start: s, end: e, name: formatBucketLabel(s, "week"), sales: 0, orders: 0, customers: 0 });
      cursor = e;
    }
  } else {
    // day
    while (cursor <= now) {
      const s = new Date(cursor);
      const e = addDays(s, 1);
      buckets.push({ key: s.toISOString().slice(0,10), start: s, end: e, name: formatBucketLabel(s, "day"), sales: 0, orders: 0, customers: 0 });
      cursor = e;
    }
  }
  return buckets;
}

function buildSeriesFromOrders(orders: any[], range: SalesRange, gran: SalesGranularity) {
  if (!Array.isArray(orders) || orders.length === 0) return [];
  const buckets = buildBuckets(range, gran);

  for (const o of orders) {
    const ts = o.created_at ? new Date(o.created_at) : null;
    if (!ts) continue;
    const amt = toNum(o?.totals?.grand_total);
    // find bucket
    const b = buckets.find(bk => ts >= bk.start && ts < bk.end);
    if (!b) continue;
    b.sales += amt;
    b.orders += 1;
    // customers: try email or customer id/name
    const custKey = (o.customer_id ?? o.email ?? o.customer_name ?? "").toString();
    // quick set per-bucket unique customers
    (b as any)._seen = (b as any)._seen || new Set<string>();
    (b as any)._seen.add(custKey);
  }

  return buckets.map(b => ({
    name: b.name,
    sales: Math.round(b.sales),
    orders: b.orders,
    customers: (b as any)._seen ? (b as any)._seen.size : 0,
  }));
}

/* ---------- component ---------- */
export function DashboardPage() {
  // Default: day-wise
  const [range, setRange] = useState<SalesRange>("7d");
  const [gran, setGran] = useState<SalesGranularity>("day");

  const { data: kpis, isLoading: kpiLoading } = useDashboardKpis();
  const { data: topProducts = [], isLoading: topLoading } = useTopProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  // Server series
  const { data: salesSeriesApi = [], isLoading: salesLoading } = useSalesSeries({ range, granularity: gran });

  // Fallback series from orders if API returns empty
  const salesSeriesFallback = useMemo(
    () => (salesSeriesApi && salesSeriesApi.length ? [] : buildSeriesFromOrders(orders, range, gran)),
    [salesSeriesApi, orders, range, gran]
  );

  // Final series to plot/use in KPIs
  const series = salesSeriesApi.length ? salesSeriesApi : salesSeriesFallback;

  // Aggregate from final series
  const agg = useMemo(() => {
    const revenue = series.reduce((a: number, p: any) => a + Number(p.sales || 0), 0);
    const ordersC = series.reduce((a: number, p: any) => a + Number(p.orders || 0), 0);
    const customers = series.reduce((a: number, p: any) => a + Number(p.customers || 0), 0);
    const aov = ordersC ? revenue / ordersC : 0;
    return { revenue, orders: ordersC, customers, aov };
  }, [series]);

  // KPI Cards (use series first, else fallbacks)
  const kCards = useMemo(
    () => [
      {
        title: "Revenue (selected range)",
        value: series.length ? inr(agg.revenue) : (kpis?.revenueThisMonth ?? "₹0"),
        change: "+0%",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: series.length ? `Range: ${range.toUpperCase()} · ${gran}` : "Revenue this month",
      },
      {
        title: "Orders (selected range)",
        value: series.length ? agg.orders.toLocaleString() : String(kpis?.ordersThisMonth ?? 0),
        change: "+0%",
        icon: ShoppingCart,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: series.length ? "Total orders in range" : "Orders this month",
      },
      {
        title: "Active Products",
        value: String(kpis?.inStock ?? 0),
        change: "+0%",
        icon: Package,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        description: "In-stock products",
      },
      {
        title: series.length ? "Avg. Order Value" : "Average Rating",
        value: series.length ? inr(agg.aov) : String(kpis?.averageRating ?? "0"),
        change: "+0%",
        icon: Users,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        description: series.length ? "Revenue / orders in range" : "Across approved reviews",
      },
    ],
    [kpis, series, agg, range, gran]
  );

  // Category share
  const categoryShare = useMemo(() => {
    const counts: Record<string, number> = {};
    topProducts.forEach((p: any) => {
      const c = (p.category?.name as string) || "Others";
      counts[c] = (counts[c] || 0) + 1;
    });
    const entries = Object.entries(counts);
    if (entries.length === 0) {
      return [
        { name: "Fruits", value: 35 },
        { name: "Vegetables", value: 28 },
        { name: "Grains", value: 20 },
        { name: "Others", value: 17 },
      ];
    }
    return entries.map(([name, value]) => ({ name, value }));
  }, [topProducts]);

  // Recent orders
  const recentOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const sorted = [...orders].sort((a: any, b: any) => {
      const ad = a.created_at || a.id || 0;
      const bd = b.created_at || b.id || 0;
      return String(bd).localeCompare(String(ad));
    });
    return sorted.slice(0, 5).map((o: any) => ({
      id: `#ORD-${o.id}`,
      customer: o.customer_name || o.email || "Customer",
      amount: o?.totals?.grand_total != null ? `₹${toNum(o.totals.grand_total).toLocaleString()}` : "—",
      status: o.status || "created",
      time: o.created_at ? new Date(o.created_at).toLocaleString() : "",
    }));
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Range selector */}
          <div className="flex rounded-md border overflow-hidden">
            {(["7d", "30d", "90d", "1y"] as SalesRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs sm:text-sm ${
                  range === r ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Granularity selector */}
          <div className="flex rounded-md border overflow-hidden">
            {(["day", "week", "month"] as SalesGranularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGran(g)}
                className={`px-3 py-1 text-xs sm:text-sm ${
                  gran === g ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                } capitalize`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiLoading && !series.length
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </Card>
            ))
          : kCards.map((kpi, index) => (
              <Card key={kpi.title} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {up(kpi.change) ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={up(kpi.change) ? "text-green-600" : "text-red-600"}>{kpi.change}</span>
                    <span>{series.length ? `(${range.toUpperCase()}, ${gran})` : "from last month"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Sales Overview
              <span className="text-xs text-muted-foreground ml-2">
                ({range.toUpperCase()}, {gran})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="revenue" className="text-xs sm:text-sm">Revenue</TabsTrigger>
                <TabsTrigger value="orders" className="text-xs sm:text-sm">Orders</TabsTrigger>
                <TabsTrigger value="customers" className="text-xs sm:text-sm">Customers</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                {(salesLoading && !series.length) ? (
                  <Skeleton className="h-72 w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [inr(Number(value)), "Revenue"]} />
                      <Area type="monotone" dataKey="sales" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {(salesLoading && !series.length) ? (
                  <Skeleton className="h-72 w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Orders"]} />
                      <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="customers" className="space-y-4">
                {(salesLoading && !series.length) ? (
                  <Skeleton className="h-72 w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Customers"]} />
                      <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Category Sales</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Share by product category</p>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <Skeleton className="h-48 w-full rounded-md" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryShare}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryShare.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, "Items"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryShare.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{category.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Orders
              <Badge variant="outline">{orders?.length ?? 0} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.id}</span>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.amount}</p>
                        <p className="text-xs text-muted-foreground">{order.time}</p>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent orders.</p>
                  )}
                </div>
                {/* FIX: Link to all orders */}
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/admin/orders">View All Orders</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best performing products</p>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {topProducts.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{p.sold_count ?? 0} sold</span>
                          {p.category?.name && <span>{p.category.name}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {p.price_inr != null ? `₹${Number(p.price_inr).toLocaleString()}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">Unit price</p>
                      </div>
                    </div>
                  ))}
                  {topProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No products found.</p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Products
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
