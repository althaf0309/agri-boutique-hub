// src/components/layout/Header.tsx
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  UserCircle2,
  PackageSearch,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { useCategories } from "@/api/hooks/categories";
import { useCartCount } from "@/lib/cart";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

type NavCategory = { id: number; name: string; slug: string };

const toSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function toFlatCats(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const d: any = data;
    return d.list ?? d.results ?? d.items ?? [];
  }
  return [];
}

export default function Header() {
  const { t, i18n } = useTranslation("common");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useCartCount();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // keep <html lang> synced for a11y/SEO
  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language]);

  // categories → pills
  const { data: categoriesData, isLoading } = useCategories();
  const categories: NavCategory[] = useMemo(() => {
    const flat = toFlatCats(categoriesData);
    return flat.map((c: any) => ({
      id: Number(c.id),
      name: String(c.name ?? "Category"),
      slug: c.slug ? String(c.slug) : toSlug(c.name ?? String(c.id)),
    }));
  }, [categoriesData]);

  // unified search submit
  const submitSearch = () => {
    const q = (searchQuery || "").trim();
    if (!q) return;

    // optional: “smart” category match by name
    const match = categories.find(
      (c) => toSlug(c.name) === toSlug(q) || c.name.toLowerCase() === q.toLowerCase()
    );

    const params = new URLSearchParams();
    params.set("q", q);
    if (match) params.set("category", match.slug);

    navigate({ pathname: "/shop", search: params.toString() });
    setIsMenuOpen(false);
  };

  // form handlers
  const onSubmitDesktop: React.FormEventHandler = (e) => {
    e.preventDefault();
    submitSearch();
  };
  const onSubmitMobile: React.FormEventHandler = (e) => {
    e.preventDefault();
    submitSearch();
  };

  const initials =
    (user?.first_name?.[0] ||
      (user as any)?.name?.[0] ||
      user?.email?.[0] ||
      "U"
    ).toUpperCase();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between min-h-[44px]">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                  {t("brand.short")}
                </span>
              </div>
              <span className="font-bold text-sm sm:text-base lg:text-lg text-primary">
                <span className="hidden sm:inline">{t("brand.full")}</span>
                <span className="sm:hidden">{t("brand.short")}</span>
              </span>
            </Link>

            {/* Right cluster */}
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-4">
                <Link to="/" className={`text-sm hover:text-primary transition-colors ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.home")}
                </Link>
                <Link to="/about" className={`text-sm hover:text-primary transition-colors ${isActive("/about") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.about")}
                </Link>
                <Link to="/awards" className={`text-sm hover:text-primary transition-colors ${isActive("/awards") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.awards")}
                </Link>
                <Link to="/testimonials" className={`text-sm hover:text-primary transition-colors ${isActive("/testimonials") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.testimonials")}
                </Link>
                <Link to="/gallery" className={`text-sm hover:text-primary transition-colors ${isActive("/gallery") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.gallery")}
                </Link>
                <Link to="/blog" className={`text-sm hover:text-primary transition-colors ${isActive("/blog") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.blog")}
                </Link>
                <Link to="/contact" className={`text-sm hover:text-primary transition-colors ${isActive("/contact") ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {t("nav.contact")}
                </Link>
              </nav>

              {/* Auth area */}
              {!isAuthenticated ? (
                <Link to="/login" aria-label="Sign in">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
                    <span className="hidden sm:inline">{t("nav.sign_in")}</span>
                    <span className="sm:hidden">{t("nav.login")}</span>
                  </Button>
                </Link>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 sm:h-9 px-2 sm:px-3 gap-2"
                      aria-label="Account menu"
                      title="Account"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {initials}
                      </div>
                      <span className="hidden sm:block text-xs">
                        {user?.first_name || (user as any)?.name || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border shadow-lg z-[60] min-w-[190px]">
                    <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
                    <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => navigate("/profile")}>
                      <UserCircle2 className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="hover:bg-muted cursor-pointer" onClick={() => navigate("/my-orders")}>
                      <PackageSearch className="w-4 h-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem
                      className="hover:bg-muted text-red-600 cursor-pointer"
                      onClick={async () => {
                        await logout();
                        navigate("/login", { replace: true });
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[48px]">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 flex-shrink-0"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Category Pills - Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            {isLoading && <span className="text-xs text-muted-foreground">{t("generic.loading_categories")}</span>}
            {!isLoading &&
              categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${encodeURIComponent(c.slug)}`}
                  className="pill-nav whitespace-nowrap"
                >
                  {c.name}
                </Link>
              ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Desktop Search (form so Enter works) */}
            <form onSubmit={onSubmitDesktop} className="relative max-w-28 sm:max-w-sm hidden sm:block">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder={t("generic.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 bg-muted/50 text-xs sm:text-sm h-8 sm:h-10 border-border"
                aria-label="Search products"
              />
              {/* hidden submit allows Enter key to work on iOS too */}
              <button type="submit" className="hidden" aria-hidden="true" />
            </form>

            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden p-2"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Shop Button */}
            <Link to="/shop">
              <Button variant="outline" size="sm" className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10">
                Shop
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" aria-label="Open cart">
              <Button variant="ghost" size="sm" className="relative p-2 flex-shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-card/50 backdrop-blur-sm rounded-lg mx-2">
            {/* Mobile Search (own form + button) */}
            <form onSubmit={onSubmitMobile} className="px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("generic.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 text-sm h-10 border-border"
                  aria-label="Search products"
                />
              </div>
              <div className="mt-3">
                <Button type="submit" className="w-full h-10">Search</Button>
              </div>
            </form>

            {/* Links */}
            <div className="flex flex-col space-y-1 mt-4 px-4">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/about", label: t("nav.about") },
                { to: "/awards", label: t("nav.awards") },
                { to: "/testimonials", label: t("nav.testimonials") },
                { to: "/gallery", label: t("nav.gallery") },
                { to: "/blog", label: t("nav.blog") },
                { to: "/contact", label: t("nav.contact") }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm py-3 px-2 rounded transition-colors ${
                    isActive(item.to)
                      ? "text-primary font-medium bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Categories */}
            <div className="px-4 mt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t("generic.categories")}
              </h3>
              {isLoading ? (
                <div className="text-xs text-muted-foreground py-2">{t("generic.loading_categories")}</div>
              ) : (
                <div className="flex flex-col space-y-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${encodeURIComponent(c.slug)}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="mt-4 px-4 flex gap-2">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full h-10">
                  🛒 {t("nav.shop_all")}
                </Button>
              </Link>

              {!isAuthenticated ? (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full h-10">
                    {t("nav.sign_in")}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-10"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <UserCircle2 className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
