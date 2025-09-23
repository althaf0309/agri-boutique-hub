import { Users, Leaf, Heart, Award, Target, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    name: "Ms Vani Vijith and Mr. Vijith V C",
    role: "Founder & CEO",
    bio: "From Soil to Soul - Organic Leadership at Work",
    image: "/placeholder.svg"
  },
  {
    name: "Vijith V C",
    role: "Head of Operations",
    bio: "Expert in supply chain and organic certification processes",
    image: "/placeholder.svg"
  },
  {
    name: "Vani Vijith",
    role: "Quality Assurance",
    bio: "Agricultural scientist with 15+years in sustainable framing ensuring the highest quality standards",
    image: "/placeholder.svg"
  },
  {
    name: "Vani Vijith",
    role: "Farmer Relations",
    bio: "Building partnerships with organic farmers across India",
    image: "/placeholder.svg"
  }
];

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Committed to environmental protection and sustainable farming practices"
  },
  {
    icon: Heart,
    title: "Health",
    description: "Promoting healthier lifestyles through organic, chemical-free products"
  },
  {
    icon: Users,
    title: "Community",
    description: "Supporting local farmers and building stronger rural communities"
  },
  {
    icon: Award,
    title: "Quality",
    description: "Maintaining the highest standards in organic product certification"
  }
];

const milestones = [
  { year: "2020", event: "Prakrithi Jaiva Kalavara founded with 5 partner farms" },
  { year: "2021", event: "Expanded to 50+ certified organic farms" },
  { year: "2022", event: "Launched online platform and delivery service" },
  { year: "2023", event: "Reached 10,000+ satisfied customers" },
  { year: "2024", event: "Expanded to 3 states with 200+ products" }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Prakrithi Jaiva Kalavara
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're passionate about connecting you with the finest organic products 
            while supporting sustainable farming practices across India.
          </p>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2010, Prakrithi Jaiva Kalavara began as a small initiative to bridge the gap 
                  between organic farmers and conscious consumers. The founders of Prakrithi Jaiva Kalavara are Ms Vani Vijith and Mr. Vijith Vc,
                  witnessed firsthand the challenges faced by small-scale organic farmers in 
                  reaching urban markets.
                </p>
                <p>
                  What started as a weekend farmers' market has grown into a comprehensive 
                  platform connecting over 200 certified organic farms with thousands of 
                  health-conscious families across Kerala, Tamil Nadu, and Karnataka.
                </p>
                <p>
                  Today, we're proud to be India's trusted source for premium organic products, 
                  from fresh produce to traditional wellness items, all while ensuring fair 
                  compensation for our farming partners.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/placeholder.svg" 
                alt="Organic farming"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-primary/10 rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To make organic, healthy food accessible to every household while 
                  empowering farmers through fair trade practices and sustainable 
                  agricultural methods that protect our environment for future generations.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                    <Eye className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  To create a sustainable ecosystem where organic farming thrives, 
                  communities prosper, and every family has access to pure, 
                  nutritious food that enhances their well-being and connects them to nature.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-0">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">{member.role}</Badge>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{milestone.year}</span>
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <p className="text-foreground font-medium">{milestone.event}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <div className="bg-primary/5 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Prakrithi Jaiva Kalavara by Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">200+</div>
                <p className="text-muted-foreground">Partner Farms</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Organic Products</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <p className="text-muted-foreground">States Covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Join Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the organic revolution. Choose Prakrithi Jaiva Kalavara for healthier living and a sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/shop" className="inline-block">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Shop Organic Products
              </button>
            </a>
            <a href="/contact" className="inline-block">
              <button className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors">
                Partner With Us
              </button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}