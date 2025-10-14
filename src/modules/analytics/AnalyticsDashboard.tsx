import { useMemo, useState } from "react";
import { Calendar, TrendingUp, Users, DollarSign, BarChart3, PieChart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie as RePie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useTopProducts,
  useSalesSeries,
  type SalesRange,
  type SalesGranularity,
} from "@/api/hooks/dashboard";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString()}`;

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<SalesRange>("30d");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week");

  // Week tab -> daily points; Month tab -> months for 1y, else weeks
  const granularity: SalesGranularity = useMemo(() => {
    if (selectedPeriod === "week") return "day";
    return dateRange === "1y" ? "month" : "week";
  }, [selectedPeriod, dateRange]);

  // Sales series (real backend)
  const { data: salesSeries = [], isLoading: salesLoading } = useSalesSeries({ range: dateRange, granularity });

  // Aggregate KPIs from the series (fallback-safe)
  const kpi = useMemo(() => {
    const totalRevenue = salesSeries.reduce((a: number, p: any) => a + Number(p.sales || 0), 0);
    const totalOrders  = salesSeries.reduce((a: number, p: any) => a + Number(p.orders || 0), 0);
    // If backend gives "customers" per bucket, sum (approx) else derive from orders
    const customers    = salesSeries.reduce((a: number, p: any) => a + Number(p.customers || 0), 0) || Math.round(totalOrders * 0.6);
    const aov          = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, customers, aov };
  }, [salesSeries]);

  // Top products
  const { data: topProducts = [], isLoading: topLoading } = useTopProducts();

  const topSellingProducts = useMemo(
    () =>
      topProducts.map((p: any) => ({
        name: p.name,
        sales: Number(p.sold_count ?? 0),
        revenue: Number(p.price_inr ?? 0) * Number(p.sold_count ?? 0),
        category: p.category?.name ?? "Others",
      })),
    [topProducts]
  );

  const categoryData = useMemo(() => {
    const m: Record<string, number> = {};
    topSellingProducts.forEach((t) => (m[t.category] = (m[t.category] || 0) + 1));
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [topSellingProducts]);

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your store performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(v: SalesRange) => setDateRange(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* KPIs (from real series) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", icon: <DollarSign className="h-4 w-4 text-green-600" />, value: inr(kpi.totalRevenue) },
          { label: "Total Orders",  icon: <BarChart3  className="h-4 w-4 text-blue-600" />,  value: kpi.totalOrders.toLocaleString() },
          { label: "Active Customers", icon: <Users className="h-4 w-4 text-purple-600" />,   value: kpi.customers.toLocaleString() },
          { label: "Avg. Order Value", icon: <TrendingUp className="h-4 w-4 text-orange-600" />, value: inr(kpi.aov) },
        ].map((c) => (
          <Card key={c.label} className="hover-scale animate-fade-in border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">{c.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesLoading ? <Skeleton className="h-7 w-24" /> : c.value}</div>
              <div className="text-xs text-muted-foreground">({dateRange.toUpperCase()}, {granularity})</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Analytics</TabsTrigger>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Sales Timeline
                  <span className="text-xs text-muted-foreground ml-2">
                    ({dateRange.toUpperCase()}, {granularity})
                  </span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={selectedPeriod === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod("month")}
                  >
                    Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <Skeleton className="h-72 w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "sales" ? inr(Number(value)) : value,
                          name === "sales" ? "Revenue" : name,
                        ]}
                      />
                      <Area type="monotone" dataKey="sales" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="orders" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <Skeleton className="h-64 w-full rounded-md" />
                ) : categoryData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <RePie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                          {categoryData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </RePie>
                        <Tooltip formatter={(value) => [`${value}`, "Items"]} />
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {categoryData.map((c, index) => (
                        <div key={c.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm text-muted-foreground">
                            {c.name} ({c.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <Skeleton className="h-80 w-full rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <ReBarChart data={topSellingProducts} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => [value, "Sales"]} />
                      <Bar dataKey="sales" fill="#10b981" />
                    </ReBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance Hologram</CardTitle>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <Skeleton className="h-80 w-full rounded-md" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadialBarChart innerRadius="30%" outerRadius="90%" data={topSellingProducts.slice(0, 5)}>
                        <RadialBar dataKey="sales" cornerRadius={10} fill="#8884d8" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {topSellingProducts.slice(0, 5).map((product) => (
                        <div key={product.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <span className="text-sm">{product.name}</span>
                          </div>
                          <Badge variant="secondary">{product.sales} units</Badge>
                        </div>
                      ))}
                      {topSellingProducts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No products found.</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Product Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {topLoading ? (
                <Skeleton className="h-40 w-full rounded-md" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Product Name</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-right py-2">Sales</th>
                        <th className="text-right py-2">Revenue</th>
                        <th className="text-right py-2">Avg. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSellingProducts.map((p) => (
                        <tr key={p.name} className="border-b">
                          <td className="py-3 font-medium">{p.name}</td>
                          <td className="py-3">
                            <Badge variant="outline">{p.category}</Badge>
                          </td>
                          <td className="py-3 text-right">{p.sales}</td>
                          <td className="py-3 text-right">{inr(p.revenue)}</td>
                          <td className="py-3 text-right">
                            {p.sales ? inr(Math.round(p.revenue / p.sales)) : "₹0"}
                          </td>
                        </tr>
                      ))}
                      {topSellingProducts.length === 0 && (
                        <tr>
                          <td className="py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                            No data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Trends
                <span className="text-xs text-muted-foreground ml-2">
                  ({dateRange.toUpperCase()}, {granularity})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-96 w-full rounded-md" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={salesSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="sales" />
                    <YAxis yAxisId="orders" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "sales" ? inr(Number(value)) : value,
                        name,
                      ]}
                    />
                    <Line yAxisId="sales" type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
