import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { ProductsPage } from "./modules/products/ProductsPage";
import { GroceryProductForm } from "./modules/products/GroceryProductForm";
import { AnalyticsDashboard } from "./modules/analytics/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<GroceryProductForm />} />
            <Route path="products/:id/edit" element={<GroceryProductForm />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="categories" element={<div>Categories coming soon...</div>} />
            <Route path="orders" element={<div>Orders coming soon...</div>} />
            <Route path="reviews" element={<div>Reviews coming soon...</div>} />
            <Route path="contact" element={<div>Contact coming soon...</div>} />
            <Route path="*" element={<div>Admin page not found</div>} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
