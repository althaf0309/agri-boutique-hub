import { RefreshCw, Package, CheckCircle, XCircle, TrendingUp, ShoppingCart, DollarSign, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/admin/KpiCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RatingStars } from "@/components/admin/RatingStars";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardKpis, useTopProducts, useRecentReviews, useRecentContacts } from "@/api/hooks/dashboard";
import dayjs from "dayjs";

export function DashboardPage() {
  const { data: kpis, refetch: refetchKpis } = useDashboardKpis();
  const { data: topProducts, refetch: refetchProducts } = useTopProducts();
  const { data: recentReviews, refetch: refetchReviews } = useRecentReviews();
  const { data: recentContacts, refetch: refetchContacts } = useRecentContacts();

  const handleRefresh = () => {
    refetchKpis();
    refetchProducts();
    refetchReviews();
    refetchContacts();
  };

  const formatCurrency = (amount: string, currency: string) => {
    const symbols = { INR: "₹", USD: "$", AED: "د.إ" };
    return `${symbols[currency as keyof typeof symbols] || currency} ${amount}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Products"
          value={kpis?.totalProducts ?? 0}
          icon={Package}
        />
        <KpiCard
          title="In Stock"
          value={kpis?.inStock ?? 0}
          icon={CheckCircle}
        />
        <KpiCard
          title="Out of Stock"
          value={kpis?.outOfStock ?? 0}
          icon={XCircle}
        />
        <KpiCard
          title="Total Sold"
          value={kpis?.totalSold ?? 0}
          icon={TrendingUp}
        />
        <KpiCard
          title="Orders Today"
          value={kpis?.ordersToday ?? 0}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Revenue Today"
          value={kpis?.revenueToday ?? "0"}
          icon={DollarSign}
        />
        <KpiCard
          title="Orders This Month"
          value={kpis?.ordersThisMonth ?? 0}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Revenue This Month"
          value={kpis?.revenueThisMonth ?? "0"}
          icon={DollarSign}
        />
        <KpiCard
          title="Average Rating"
          value={kpis?.averageRating ?? "0.0"}
          icon={Star}
        />
        <KpiCard
          title="Wishlist Items"
          value={kpis?.wishlistItems ?? 0}
          icon={Heart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts?.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.discount_percent > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.price, product.currency)}
                          </span>
                        )}
                        <span className="font-medium">
                          {formatCurrency(product.discounted_price, product.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.sold_count.toString()} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.featured && <StatusBadge status="Featured" />}
                        {product.new_arrival && <StatusBadge status="New" />}
                        {product.limited_stock && <StatusBadge status="Limited" />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviews?.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <RatingStars rating={review.rating} size="sm" />
                    <p className="font-medium text-sm mt-1">{review.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(review.created_at).format("MMM D")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {review.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {review.user_email || "Anonymous"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Contact Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contact Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContacts?.map((contact) => (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.subject}</TableCell>
                  <TableCell>
                    {dayjs(contact.created_at).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={contact.handled ? "Handled" : "Pending"} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}