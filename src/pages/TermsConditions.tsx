import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            Terms and Conditions
          </h1>
          
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-lg">
              Last updated: January 15, 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using Prakrithi Jaiva Kalavara's website and services, you accept and agree to be 
                  bound by the terms and provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Permission is granted to temporarily download one copy of the materials on Prakrithi Jaiva Kalavara's 
                  website for personal, non-commercial transitory viewing only.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">This license shall not allow you to:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for commercial purposes or public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or proprietary notations from the materials</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Product Information and Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We strive to provide accurate product information, but we do not warrant that product 
                  descriptions or other content is accurate, complete, reliable, current, or error-free.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Product images may not reflect the actual product</li>
                  <li>Products are subject to availability</li>
                  <li>We reserve the right to discontinue products at any time</li>
                  <li>Prices are subject to change without notice</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Ordering and Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When you place an order, you represent that the information you provide is accurate 
                  and complete.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">Order Processing:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Orders are subject to acceptance and availability</li>
                    <li>We reserve the right to refuse or cancel orders</li>
                    <li>Payment must be received before order processing</li>
                    <li>All prices are in Indian Rupees (INR) unless stated otherwise</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Shipping and Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We make every effort to deliver products within the estimated timeframe, but delivery 
                  dates are not guaranteed.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Delivery times are estimates and may vary</li>
                  <li>Risk of loss passes to you upon delivery</li>
                  <li>You must inspect products upon delivery</li>
                  <li>Additional charges may apply for remote locations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Returns and Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We want you to be satisfied with your purchase. Our return policy allows for returns 
                  under specific conditions.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">Return Conditions:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Non-perishable items: 7 days from delivery</li>
                    <li>Fresh produce: 24 hours from delivery for quality issues</li>
                    <li>Items must be unused and in original packaging</li>
                    <li>Return shipping costs may apply</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>We reserve the right to suspend or terminate accounts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You may not use our service for any unlawful purpose or to solicit others to perform 
                  unlawful acts.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">Prohibited activities include:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Violating any laws or regulations</li>
                    <li>Transmitting harmful or malicious code</li>
                    <li>Collecting user information without consent</li>
                    <li>Engaging in fraudulent activities</li>
                    <li>Interfering with the proper functioning of the website</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  In no event shall Prakrithi Jaiva Kalavara or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business interruption)
                  arising out of the use or inability to use the materials on our website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  These terms and conditions are governed by and construed in accordance with the laws 
                  of India, and you irrevocably submit to the exclusive jurisdiction of the courts in 
                  Kerala, India.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Prakrithi Jaiva Kalavara may revise these terms of service at any time without notice. By using this 
                  website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@prakrothijaivakalavara.com</p>
                  <p><strong>Phone:</strong> +91 9876543210</p>
                  <p><strong>Address:</strong> 123 Organic Street, Green Valley, Kerala 682001, India</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}