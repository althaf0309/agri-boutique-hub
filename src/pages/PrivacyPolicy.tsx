import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">
            Privacy Policy
          </h1>
          
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-lg">
              Last updated: January 15, 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact us for support.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">Personal Information:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Name, email address, phone number</li>
                    <li>Shipping and billing addresses</li>
                    <li>Payment information (processed securely through our payment partners)</li>
                    <li>Account credentials and preferences</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and shipping updates</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Send you promotional communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">We may share your information with:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Service providers who help us operate our business</li>
                    <li>Payment processors to handle transactions</li>
                    <li>Shipping companies to deliver your orders</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security assessments</li>
                  <li>Limited access to personal information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to enhance your browsing experience 
                  and analyze website traffic.
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold">Types of cookies we use:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Essential cookies for website functionality</li>
                    <li>Analytics cookies to understand user behavior</li>
                    <li>Marketing cookies for personalized advertising</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Access and update your account information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Disable cookies through your browser settings</li>
                  <li>Request a copy of your personal data</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to provide our services 
                  and comply with legal obligations. Order information is typically retained for 7 years 
                  for accounting and legal purposes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our services are not intended for children under 13. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and 
                  believe your child has provided us with personal information, please contact us.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  material changes by posting the new policy on our website and updating the 
                  "Last updated" date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@prakrothijaivakalavara.com</p>
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