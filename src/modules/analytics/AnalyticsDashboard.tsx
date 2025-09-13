import { useState } from "react";
import { Calendar, TrendingUp, Package, Users, DollarSign, BarChart3, PieChart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Mock data for demonstration
const topSellingProducts = [
  { name: "Organic Alphonso Mangoes", sales: 450, revenue: 31500, category: "Fruits" },
  { name: "Premium Basmati Rice", sales: 320, revenue: 25600, category: "Grains" },
  { name: "Fresh Spinach Bundle", sales: 280, revenue: 8400, category: "Vegetables" },
  { name: "Cold Pressed Coconut Oil", sales: 220, revenue: 17600, category: "Oils" },
  { name: "Organic Turmeric Powder", sales: 180, revenue: 10800, category: "Spices" },
  { name: "Farm Fresh Tomatoes", sales: 160, revenue: 6400, category: "Vegetables" },
  { name: "Pure Honey", sales: 140, revenue: 11200, category: "Natural" },
  { name: "Aloe Vera Gel", sales: 120, revenue: 9600, category: "Health" },
];

const weeklyData = [
  { day: "Mon", sales: 45, revenue: 3200, orders: 12 },
  { day: "Tue", sales: 52, revenue: 3800, orders: 15 },
  { day: "Wed", sales: 38, revenue: 2900, orders: 10 },
  { day: "Thu", sales: 61, revenue: 4200, orders: 18 },
  { day: "Fri", sales: 68, revenue: 4800, orders: 22 },
  { day: "Sat", sales: 79, revenue: 5600, orders: 25 },
  { day: "Sun", sales: 71, revenue: 5100, orders: 21 },
];

const monthlyData = [
  { month: "Jan", sales: 1200, revenue: 85000, customers: 320 },
  { month: "Feb", sales: 1450, revenue: 102000, customers: 380 },
  { month: "Mar", sales: 1680, revenue: 118000, customers: 420 },
  { month: "Apr", sales: 1520, revenue: 107000, customers: 390 },
  { month: "May", sales: 1890, revenue: 132000, customers: 450 },
  { month: "Jun", sales: 2100, revenue: 147000, customers: 480 },
];

const vendorData = [
  { name: "Green Valley Farms", sales: 850, revenue: 68000, products: 25, rating: 4.8 },
  { name: "Organic Harvest Co.", sales: 720, revenue: 57600, products: 18, rating: 4.6 },
  { name: "Fresh Fields Ltd.", sales: 650, revenue: 52000, products: 22, rating: 4.4 },
  { name: "Nature's Best", sales: 580, revenue: 46400, products: 15, rating: 4.7 },
  { name: "Farm Direct", sales: 520, revenue: 41600, products: 20, rating: 4.3 },
];

const categoryData = [
  { name: "Fruits", value: 35, color: "#10b981" },
  { name: "Vegetables", value: 28, color: "#f59e0b" },
  { name: "Grains", value: 15, color: "#ef4444" },
  { name: "Spices", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 10, color: "#6b7280" },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your grocery store performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
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

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale animate-fade-in border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,47,000</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale animate-fade-in border-l-4 border-l-blue-500" style={{ animationDelay: "100ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,100</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale animate-fade-in border-l-4 border-l-purple-500" style={{ animationDelay: "200ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">480</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium">+15.3%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale animate-fade-in border-l-4 border-l-orange-500" style={{ animationDelay: "300ms" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹700</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium">+4.1%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Analytics</TabsTrigger>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Sales Timeline
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
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedPeriod === "week" ? weeklyData : monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === "week" ? "day" : "month"} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "revenue" ? `₹${value}` : value,
                        name === "revenue" ? "Revenue" : "Sales"
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPie>
                    <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {category.name} ({category.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topSellingProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => [value, "Sales"]} />
                    <Bar dataKey="sales" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Performance Hologram */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance Hologram</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadialBarChart innerRadius="30%" outerRadius="90%" data={topSellingProducts.slice(0, 5)}>
                    <RadialBar
                      dataKey="sales"
                      cornerRadius={10}
                      fill="#8884d8"
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {topSellingProducts.slice(0, 5).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <Badge variant="secondary">{product.sales} units</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Product Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Product Analytics</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {topSellingProducts.map((product, index) => (
                      <tr key={product.name} className="border-b">
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="py-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="py-3 text-right">{product.sales}</td>
                        <td className="py-3 text-right">₹{product.revenue.toLocaleString()}</td>
                        <td className="py-3 text-right">₹{(product.revenue / product.sales).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Analytics Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vendor Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vendor Sales vs Products */}
            <Card>
              <CardHeader>
                <CardTitle>Sales vs Product Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis yAxisId="sales" />
                    <YAxis yAxisId="products" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="sales" 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10b981" 
                      strokeWidth={3}
                    />
                    <Line 
                      yAxisId="products" 
                      type="monotone" 
                      dataKey="products" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Vendor Name</th>
                      <th className="text-right py-2">Total Sales</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">Products</th>
                      <th className="text-right py-2">Rating</th>
                      <th className="text-right py-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.map((vendor, index) => (
                      <tr key={vendor.name} className="border-b">
                        <td className="py-3 font-medium">{vendor.name}</td>
                        <td className="py-3 text-right">{vendor.sales}</td>
                        <td className="py-3 text-right">₹{vendor.revenue.toLocaleString()}</td>
                        <td className="py-3 text-right">{vendor.products}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            ⭐ {vendor.rating}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <Badge 
                            variant={index < 2 ? "default" : index < 4 ? "secondary" : "outline"}
                          >
                            {index < 2 ? "Excellent" : index < 4 ? "Good" : "Average"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Sales Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="sales" />
                    <YAxis yAxisId="revenue" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "revenue" ? `₹${value}` : value,
                        name === "revenue" ? "Revenue" : name === "sales" ? "Sales" : "Customers"
                      ]}
                    />
                    <Line 
                      yAxisId="sales" 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      yAxisId="revenue" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      yAxisId="sales" 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Sales Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10b981" />
                    <Bar dataKey="sales" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}