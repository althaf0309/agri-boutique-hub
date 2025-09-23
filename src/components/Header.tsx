import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  "Organic Grocery",
  "Ruchira",
  "Personal Care", 
  "Plant Nursery",
  "Fruits & Vegetables"
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between min-h-[44px]">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">PJK</span>
              </div>
              <span className="font-bold text-sm sm:text-base lg:text-lg text-primary">
                <span className="hidden sm:inline">Prakrithi Jaiva Kalavara</span>
                <span className="sm:hidden">PJK</span>
              </span>
            </Link>

            {/* Right Links */}
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                <Link 
                  to="/" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/about') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/awards" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/awards') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Awards
                </Link>
                <Link 
                  to="/testimonials" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/testimonials') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Testimonials
                </Link>
                <Link 
                  to="/gallery" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/gallery') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Gallery
                </Link>
                <Link 
                  to="/blog" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/blog') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-sm hover:text-primary transition-colors ${
                    isActive('/contact') ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  Contact
                </Link>
              </div>

              {/* Mobile/Tablet Navigation */}
              <div className="flex lg:hidden items-center overflow-x-auto scrollbar-hide pb-1 max-w-[200px] sm:max-w-[300px]">
                <div className="flex items-center space-x-1 text-xs whitespace-nowrap">
                  <Link 
                    to="/about" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/about') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    About
                  </Link>
                  <Link 
                    to="/awards" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/awards') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    Awards
                  </Link>
                  <Link 
                    to="/testimonials" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/testimonials') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    Reviews
                  </Link>
                  <Link 
                    to="/gallery" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/gallery') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    Gallery
                  </Link>
                  <Link 
                    to="/blog" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/blog') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    Blog
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`hover:text-primary transition-colors px-2 py-1 rounded ${
                      isActive('/contact') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground'
                    }`}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              
              {/* Language Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-1 sm:px-2 h-8 sm:h-9">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">EN</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-card border border-border shadow-lg z-[60] min-w-[120px]"
                >
                  <DropdownMenuItem className="hover:bg-muted cursor-pointer">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-muted cursor-pointer">
                    Malayalam
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Category Pills - Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="pill-nav whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Search */}
            <div className="relative max-w-28 sm:max-w-sm hidden sm:block">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-10 bg-muted/50 text-xs sm:text-sm h-8 sm:h-10 border-border"
              />
            </div>

            {/* Mobile Search Icon */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="sm:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative p-2 flex-shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                  2
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-card/50 backdrop-blur-sm rounded-lg mx-2">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-1 mt-4 px-4">
              <Link 
                to="/" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link 
                to="/about" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/about') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ℹ️ About Us
              </Link>
              <Link 
                to="/awards" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/awards') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                🏆 Awards
              </Link>
              <Link 
                to="/testimonials" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/testimonials') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                💬 Testimonials
              </Link>
              <Link 
                to="/gallery" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/gallery') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                📸 Gallery
              </Link>
              <Link 
                to="/blog" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/blog') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                📝 Blog
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm py-3 px-2 rounded transition-colors ${
                  isActive('/contact') ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                📞 Contact
              </Link>
            </div>

            {/* Mobile Shop Button */}
            <div className="mt-4 px-4">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full h-10">
                  🛒 Shop All Products
                </Button>
              </Link>
            </div>
            
            {/* Mobile Categories */}
            <div className="px-4 mt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Categories</h3>
              <div className="flex flex-col space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Mobile Search */}
            <div className="relative mt-4 px-4">
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border h-10"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}