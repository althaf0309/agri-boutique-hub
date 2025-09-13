import { useState } from "react";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Eye, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3
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

// Mock data for dashboard
const kpiData = [
  {
    title: "Total Revenue",
    value: "₹2,47,500",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Total sales this month"
  },
  {
    title: "Total Orders",
    value: "1,247",
    change: "+8.2%", 
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Orders completed"
  },
  {
    title: "Active Products",
    value: "156",
    change: "+3.1%",
    trend: "up", 
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Products in stock"
  },
  {
    title: "Customer Growth",
    value: "892",
    change: "-2.4%",
    trend: "down",
    icon: Users,
    color: "text-orange-600", 
    bgColor: "bg-orange-50",
    description: "Active customers"
  }
];

const salesData = [
  { name: "Jan", sales: 45000, orders: 120, customers: 89 },
  { name: "Feb", sales: 52000, orders: 145, customers: 102 },
  { name: "Mar", sales: 48000, orders: 130, customers: 95 },
  { name: "Apr", sales: 61000, orders: 170, customers: 125 },
  { name: "May", sales: 68000, orders: 185, customers: 140 },
  { name: "Jun", sales: 71000, orders: 195, customers: 156 },
];

const recentOrders = [
  { id: "#ORD-001", customer: "John Doe", amount: "₹1,299", status: "completed", time: "2 mins ago" },
  { id: "#ORD-002", customer: "Sarah Smith", amount: "₹899", status: "pending", time: "5 mins ago" },
  { id: "#ORD-003", customer: "Mike Johnson", amount: "₹2,150", status: "processing", time: "12 mins ago" },
  { id: "#ORD-004", customer: "Emma Wilson", amount: "₹750", status: "completed", time: "1 hour ago" },
  { id: "#ORD-005", customer: "David Brown", amount: "₹1,850", status: "shipped", time: "2 hours ago" },
];

const topProducts = [
  { name: "Organic Alphonso Mangoes", sales: 450, revenue: "₹31,500", trend: "+15%" },
  { name: "Premium Basmati Rice", sales: 320, revenue: "₹25,600", trend: "+8%" },
  { name: "Fresh Spinach Bundle", sales: 280, revenue: "₹8,400", trend: "+12%" },
  { name: "Cold Pressed Coconut Oil", sales: 220, revenue: "₹17,600", trend: "+5%" },
];

const categoryData = [
  { name: "Fruits", value: 35, color: "#10b981" },
  { name: "Vegetables", value: 28, color: "#f59e0b" },
  { name: "Grains", value: 20, color: "#ef4444" },
  { name: "Others", value: 17, color: "#8b5cf6" },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 7 days
          </Button>
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={kpi.title} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {kpi.change}
                </span>
                <span>from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                      labelStyle={{ color: "#000" }}
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, "Orders"]}
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="customers" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, "Customers"]}
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>Category Sales</CardTitle>
            <p className="text-sm text-muted-foreground">Sales by product category</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
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
              <Badge variant="outline">{recentOrders.length} new</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
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
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best performing products</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{product.sales} sold</span>
                      <span className="text-green-600">{product.trend}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.revenue}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Products
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-fade-in" style={{ animationDelay: "800ms" }}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
              <Package className="h-5 w-5" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
              <Users className="h-5 w-5" />
              <span>View Customers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
              <ShoppingCart className="h-5 w-5" />
              <span>Manage Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover-scale">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}