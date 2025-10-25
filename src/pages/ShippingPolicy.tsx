
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Package, Truck, Clock, MapPin, Phone, Mail } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Shipping Policy
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Fast and reliable delivery of fresh organic products to your doorstep
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Delivery Areas</h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                    <p>
                      We currently deliver organic products across all major cities and towns in Kerala.
                      Select pin codes in Karnataka, Tamil Nadu, and Andhra Pradesh are also covered.
                    </p>
                    <p>
                      Enter your pin code at checkout to verify if we deliver to your area. We're constantly
                      expanding our delivery network to serve more locations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Delivery Timeframes</h2>
                  <div className="space-y-4">
                    <div className="bg-background p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Standard Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-2">3-5 business days</p>
                      <p className="text-sm text-muted-foreground">
                        Available for most locations across Kerala and neighboring states
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Express Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-2">1-2 business days</p>
                      <p className="text-sm text-muted-foreground">
                        Available for select pin codes in major cities (additional charges apply)
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Same-Day Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-2">Within 6-8 hours</p>
                      <p className="text-sm text-muted-foreground">
                        Available for Kochi metro area for orders placed before 12 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Shipping Charges</h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                    <ul className="space-y-2 list-disc pl-5">
                      <li><strong>Free shipping</strong> on all orders above ₹500</li>
                      <li>Orders below ₹500: ₹40 standard shipping charges</li>
                      <li>Express delivery: Additional ₹80 (where available)</li>
                      <li>Same-day delivery: Additional ₹120 (Kochi metro only)</li>
                    </ul>
                    <p className="pt-2">
                      Shipping charges are calculated automatically at checkout based on your
                      delivery location and selected shipping method.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Order Processing</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                <p>Orders are typically processed within 1-2 business days.</p>
                <p><strong>Processing times may be extended during:</strong></p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Festival seasons and sale periods</li>
                  <li>Public holidays</li>
                  <li>Adverse weather conditions</li>
                </ul>
                <p>
                  Once your order is dispatched, you'll receive a tracking number via email and SMS
                  to monitor your delivery status.
                </p>
              </div>
            </section>

            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Eco-Friendly Packaging</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                <p>We use biodegradable and recyclable packaging materials.</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Recycled cardboard boxes</li>
                  <li>Biodegradable bubble wrap</li>
                  <li>Paper-based tapes</li>
                  <li>Reusable jute bags for certain products</li>
                </ul>
              </div>
            </section>

            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">Failed Delivery Attempts</h2>
              <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                <p>If delivery fails due to incorrect address or unavailability:</p>
                <ul className="space-y-2 list-disc pl-5">
                  <li>We attempt delivery up to 2 more times</li>
                  <li>You’ll be contacted via phone/email before each attempt</li>
                  <li>After 3 failed attempts, the order is returned to our warehouse</li>
                  <li>Return shipping charges may be deducted from any refund</li>
                </ul>
              </div>
            </section>

            <section className="bg-primary/5 p-6 sm:p-8 rounded-lg border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">Questions About Shipping?</h2>
              <p className="text-center text-muted-foreground mb-6">
                Our customer support team is here to help with any shipping-related queries
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="tel:+919876543210" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <Phone className="w-5 h-5" /><span className="font-medium">+91 9876543210</span>
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a href="mailto:hello@prakrithi.com" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <Mail className="w-5 h-5" /><span className="font-medium">hello@prakrithi.com</span>
                </a>
              </div>
              <div className="text-center mt-6">
                <Link to="/contact" className="text-primary hover:text-primary/80 underline transition-colors">
                  Visit our Contact Page
                </Link>
              </div>
            </section>
          </div>

          <div className="text-center mt-12 text-sm text-muted-foreground">
            Last updated: October 2025
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
