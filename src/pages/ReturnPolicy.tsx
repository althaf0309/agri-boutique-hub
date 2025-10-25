import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import {
  RotateCcw,
  ShieldCheck,
  CreditCard,
  PackageOpen,
  AlertTriangle,
  ClipboardCheck,
  Truck,
  Phone,
  Mail,
} from "lucide-react";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Return & Refund Policy
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Hassle-free returns and quick refunds—because your satisfaction matters
            </p>
          </div>

          <div className="space-y-8">
            {/* Eligibility */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Return Eligibility
                  </h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                    <p>
                      We accept returns for most products within the return window
                      if they are unused, unopened, and in their original packaging.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Include the original invoice/receipt</li>
                      <li>Keep all tags, labels, and accessories intact</li>
                      <li>
                        Ensure the product is in resalable condition (no signs of use or damage)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Window */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Return Window
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-background p-4 rounded-lg">
                      <h3 className="font-semibold mb-1">Grocery & Packaged Goods</h3>
                      <p className="text-sm text-muted-foreground">
                        Return within <strong>7 days</strong> of delivery
                      </p>
                    </div>
                    <div className="bg-background p-4 rounded-lg">
                      <h3 className="font-semibold mb-1">Fresh Produce</h3>
                      <p className="text-sm text-muted-foreground">
                        Eligible only for quality issues reported within{" "}
                        <strong>24 hours</strong> of delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Not eligible */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Non-Returnable Items
                  </h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Opened or partially used food products</li>
                      <li>Items without original packaging or labels</li>
                      <li>Products damaged due to misuse or improper storage</li>
                      <li>Items marked “Final Sale” or “Non-returnable” on the product page</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How to start a return */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <PackageOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    How to Initiate a Return
                  </h2>
                  <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                    <li>
                      Go to{" "}
                      <Link to="/my-orders" className="underline text-primary hover:text-primary/80">
                        My Orders
                      </Link>{" "}
                      and choose the order/item you want to return.
                    </li>
                    <li>Select a reason and add clear photos (for quality issues).</li>
                    <li>Choose pickup or drop-off (where available).</li>
                    <li>
                      Pack the item securely; include the invoice and all accessories.
                    </li>
                  </ol>
                  <p className="mt-3 text-sm text-muted-foreground">
                    For fresh-produce quality issues, contact us within 24 hours so we can help promptly.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund timelines */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Refunds & Timelines
                  </h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-3">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Prepaid (Card/UPI):</strong> Refund to original payment method within
                        5–7 business days after quality check.
                      </li>
                      <li>
                        <strong>Cash on Delivery:</strong> Refund via bank transfer or store credit
                        within 5–7 business days after quality check.
                      </li>
                      <li>
                        <strong>Shipping Fees:</strong> Non-refundable except for damaged/incorrect items.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Exchanges */}
            <section className="bg-card p-6 sm:p-8 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Exchanges</h2>
                  <p className="text-muted-foreground">
                    Exchanges are subject to stock availability. If the requested replacement
                    is unavailable, we’ll process a refund as per the policy above.
                  </p>
                </div>
              </div>
            </section>

            {/* Help */}
            <section className="bg-primary/5 p-6 sm:p-8 rounded-lg border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
                Need help with a return?
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Our support team will guide you through the process
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">+91 9876543210</span>
                </a>
                <span className="hidden sm:inline text-muted-foreground">|</span>
                <a
                  href="mailto:hello@prakrithi.com"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">hello@prakrithi.com</span>
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
