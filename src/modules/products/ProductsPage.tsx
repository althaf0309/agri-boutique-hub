import { useState } from "react";
import { Plus, Search, Eye, Edit, Copy, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts, useCategories, useDeleteProduct } from "@/api/hooks/products";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [inStock, setInStock] = useState<boolean | undefined>(undefined);
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-created_at");

  const { data: productsData, isLoading } = useProducts({
    page,
    search,
    category: category === "all" ? "" : category,
    in_stock: inStock,
    featured,
    ordering,
  });

  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const formatCurrency = (amount: string, currency: string) => {
    const symbols = { INR: "₹", USD: "$", AED: "د.إ" };
    return `${symbols[currency as keyof typeof symbols] || currency} ${amount}`;
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct.mutateAsync(id);
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product catalog</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative sm:col-span-2 md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) && categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={inStock?.toString() || "all"} onValueChange={(value) => 
              setInStock(value === "all" ? undefined : value === "true")
            }>
              <SelectTrigger>
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="true">In Stock</SelectItem>
                <SelectItem value="false">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featured?.toString() || "all"} onValueChange={(value) => 
              setFeatured(value === "all" ? undefined : value === "true")
            }>
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ordering} onValueChange={setOrdering}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="created_at">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="-name">Name Z-A</SelectItem>
                <SelectItem value="-price">Price High-Low</SelectItem>
                <SelectItem value="price">Price Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : productsData?.results ? (
                productsData.results.map((product) => (
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            SKU: {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{product.category.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.discount_percent > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.price, product.currency)}
                          </span>
                        )}
                        <span className="font-medium text-sm">
                          {formatCurrency(product.discounted_price, product.currency)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.quantity}
                        </span>
                        <StatusBadge 
                          status={product.in_stock ? "In Stock" : "Out of Stock"} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {product.featured && <StatusBadge status="Featured" />}
                        {product.new_arrival && <StatusBadge status="New" />}
                        {product.limited_stock && <StatusBadge status="Limited" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      {dayjs(product.created_at).format("MMM D, YYYY")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/admin/products/${product.id}`}>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex">
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {productsData && productsData.results && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {productsData.results.length} of {productsData.count} products
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!productsData.previous}
              onClick={() => setPage(page - 1)}
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!productsData.next}
              onClick={() => setPage(page + 1)}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}