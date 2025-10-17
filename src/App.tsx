// src/App.tsx
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
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ShippingPolicy from "./pages/ShippingPolicy";
import Awards from "./pages/Awards";
import Testimonials from "./pages/Testimonials";
import Gallery from "./pages/Gallery";
import PaymentSuccess from "@/pages/PaymentSuccess";
import OrderSuccess from "@/pages/OrderSuccess";
import ProfilePage from "@/pages/Profile";
import MyOrders from "@/pages/MyOrders";
import { AdminLayout } from "./layout/AdminLayout";
import { DashboardPage } from "./modules/dashboard/DashboardPage";
import { ProductsPage } from "./modules/products/ProductsPage";
import { OrdersPage } from "./modules/orders/OrdersPage";
import { OrderDetailPage } from "./modules/orders/OrderDetailPage";
import { ReviewsPage } from "./modules/reviews/ReviewsPage";
import { ContactsPage } from "./modules/contacts/ContactsPage";
import { ProductForm } from "./modules/products/ProductFormSimple";
import { GroceryProductForm } from "./modules/products/GroceryProductForm";
import { AnalyticsDashboard } from "./modules/analytics/AnalyticsDashboard";
import { CategoriesPage } from "./modules/categories/CategoriesPage";
import { CategoryFormPage } from "./modules/categories/CategoryFormPage";

import PromoBannersPage from "@/pages/admin/PromoBannersPage";
import AdminStoresPage from "@/pages/admin/AdminStoresPage";
import AdminVendorsPage from "@/pages/admin/AdminVendorsPage";
import TestimonialsPage from "@/pages/admin/TestimonialsPage";
import VideoTestimonialsPage from "@/pages/admin/VideoTestimonialsPage";
import AwardsPage from "@/pages/admin/AwardsPage";
import CertificationsPage from "@/pages/admin/CertificationsPage";
import GalleryPage from "@/pages/admin/GalleryPage";
import BlogListPage from "@/pages/admin/BlogListPage";
import BlogFormPage from "@/pages/admin/BlogFormPage";

import { ProtectedRoute, AdminRoute, RoleRedirect } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/gallery" element={<Gallery />} />

          {/* /login: if already authed → role-based redirect */}
          <Route
            path="/login"
            element={
              <RoleRedirect>
                <Login />
              </RoleRedirect>
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route
  path="/my-orders"
  element={
    <ProtectedRoute>
      <MyOrders />
    </ProtectedRoute>
  }
/>
          {/* Example of a private non-admin page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          

          {/* Admin area: only superusers */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="products/new-grocery" element={<GroceryProductForm />} />
            <Route path="products/:id/edit-grocery" element={<GroceryProductForm />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/new" element={<CategoryFormPage />} />
            <Route path="categories/:id/edit" element={<CategoryFormPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="contact" element={<ContactsPage />} />
            <Route path="stores" element={<AdminStoresPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/new" element={<BlogFormPage />} />
            <Route path="blog/:id/edit" element={<BlogFormPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="video-testimonials" element={<VideoTestimonialsPage />} />
            <Route path="awards" element={<AwardsPage />} />
            <Route path="certifications" element={<CertificationsPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="promo-banners" element={<PromoBannersPage />} />
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
