// src/pages/Contact.tsx
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useCreateContact } from "@/api/hooks/contacts";

export default function Contact() {
  const { toast } = useToast();
  const createContact = useCreateContact();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    // simple honeypot for bots (kept hidden in the form)
    website: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // basic frontend guard
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    // honeypot — if filled, silently skip
    if (formData.website) return;

    setSubmitting(true);
    try {
      await createContact.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      toast({ title: "Thanks! We got your message." });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (e: any) {
      toast({
        title: "Could not send message",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        123 Organic Street<br />
                        Green Valley, Kerala 682001<br />
                        India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                      <p className="text-muted-foreground">
                        +91 9876543210<br />
                        +91 8765432109
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Email</h3>
                      <p className="text-muted-foreground">
                        hello@prakrthijaivakalavara.com<br />
                        support@prakrthijaivakalavara.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* honeypot (hidden) */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@example.com"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What is this about?"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px]"
                      disabled={submitting}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Find Us</h2>
          <Card>
            <CardContent className="p-0">
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4" />
                  <p>Interactive Map Coming Soon</p>
                  <p className="text-sm">123 Organic Street, Green Valley, Kerala 682001</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">What are your delivery areas?</h3>
                <p className="text-muted-foreground">
                  We currently deliver across Kerala and select cities in Tamil Nadu and Karnataka.
                  Check our delivery page for the complete list of serviceable areas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How do you ensure product quality?</h3>
                <p className="text-muted-foreground">
                  All our products are sourced directly from certified organic farms and undergo
                  rigorous quality checks before being packaged and shipped to you.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">What is your return policy?</h3>
                <p className="text-muted-foreground">
                  We offer a 7-day return policy for non-perishable items. For fresh produce,
                  please contact us within 24 hours of delivery if there are any quality issues.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Do you offer bulk orders?</h3>
                <p className="text-muted-foreground">
                  Yes, we provide special pricing for bulk orders. Please contact our sales team
                  for customized quotes and wholesale pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
