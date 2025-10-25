import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      {/* <div className="bg-primary/90 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
            <p className="mb-6 opacity-90">
              Subscribe to get updates on new organic products, farming tips, and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/70"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">PJK</span>
                </div>
                <span className="font-bold text-lg">Prakrithi Jaiva Kalavara</span>
              </div>
              <p className="text-primary-foreground/80 mb-4 leading-relaxed">
                Your trusted partner for premium organic products sourced directly from sustainable farms across India.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-accent">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "/" },
                  { name: "Shop", href: "/shop" },
                  { name: "Blog", href: "/blog" },
                  { name: "Contact", href: "/contact" },
                  { name: "About Us", href: "/about" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-primary-foreground/80 hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Categories</h4>
              <ul className="space-y-3">
                {[
                  "Organic Grocery",
                  "Ruchira",
                  "Personal Care",
                  "Plant Nursery",
                  "Fruits & Vegetables"
                ].map((category) => (
                  <li key={category}>
                    <Link 
                      to={`/shop?category=${encodeURIComponent(category)}`}
                      className="text-primary-foreground/80 hover:text-accent transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div className="text-primary-foreground/80">
                    <p>123 Organic Street</p>
                    <p>Green Valley, Kerala 682001</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-primary-foreground/80">+91 9876543210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-primary-foreground/80">hello@prakrithi.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/80 text-sm">
              © 2024 Prakrithi Jaiva Kalavara. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping-policy" className="text-primary-foreground/80 hover:text-accent transition-colors">
                Shipping Policy
              </Link>
              <Link to="/return-policy" className="text-primary-foreground/80 hover:text-accent transition-colors">
  Return Policy
</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}