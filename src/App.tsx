import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

// Admin pages
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { ProductsPage } from "./modules/products/ProductsPage";
import { OrdersPage } from "./modules/orders/OrdersPage";
import { OrderDetailPage } from "./modules/orders/OrderDetailPage";
import { ReviewsPage } from "./modules/reviews/ReviewsPage";
import { ContactsPage } from "./modules/contacts/ContactsPage";

// Forms
// Simple (general) product form
import { ProductForm } from "./modules/products/ProductFormSimple";
// Grocery-focused product form (make sure this file exports the component;
// named export is fine; if you also add `export default`, you can import it either way)
import { GroceryProductForm } from "./modules/products/GroceryProductForm";

// Analytics & Categories
import { AnalyticsDashboard } from "./modules/analytics/AnalyticsDashboard";
import { CategoriesPage } from "./modules/categories/CategoriesPage";
import { CategoryFormPage } from "./modules/categories/CategoryFormPage";

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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Catalog */}
            <Route path="products" element={<ProductsPage />} />
            {/* General products */}
           <Route path="products/new" element={<ProductForm />} />
<Route path="products/:id/edit" element={<ProductForm />} />
<Route path="products/new-grocery" element={<GroceryProductForm />} />
<Route path="products/:id/edit-grocery" element={<GroceryProductForm />} />
            {/* Grocery products (now visible) */}
            <Route path="products/new-grocery" element={<GroceryProductForm />} />
            <Route path="products/:id/edit-grocery" element={<GroceryProductForm />} />

            {/* Analytics */}
            <Route path="analytics" element={<AnalyticsDashboard />} />

            {/* Categories */}
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/new" element={<CategoryFormPage />} />
            <Route path="categories/:id/edit" element={<CategoryFormPage />} />

            {/* Orders */}
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />

            {/* Reviews & Contacts */}
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="contact" element={<ContactsPage />} />

            {/* Fallback inside Admin */}
            <Route path="*" element={<div>Admin page not found</div>} />
          </Route>

          {/* Global 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
