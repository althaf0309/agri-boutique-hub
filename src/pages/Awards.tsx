import { Award, Trophy, Medal, Star, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const awards = [
  {
    title: "Best Organic Retailer 2024",
    organization: "Kerala Organic Certification Board",
    year: "2024",
    description: "Recognized for excellence in organic product distribution and farmer support across Kerala state.",
    icon: Trophy,
    category: "Industry Recognition"
  },
  {
    title: "Sustainable Business Excellence Award",
    organization: "India Sustainability Forum",
    year: "2023",
    description: "Honored for innovative sustainable farming practices and environmental conservation efforts.",
    icon: Award,
    category: "Sustainability"
  },
  {
    title: "Rural Development Champion",
    organization: "Ministry of Agriculture, Government of India",
    year: "2023",
    description: "Awarded for significant contributions to rural farmer empowerment and economic development.",
    icon: Medal,
    category: "Social Impact"
  },
  {
    title: "Customer Choice Award",
    organization: "Indian E-commerce Association",
    year: "2022",
    description: "Voted as the most trusted organic products platform by over 10,000 customers nationwide.",
    icon: Star,
    category: "Customer Excellence"
  },
  {
    title: "Innovation in Agriculture Technology",
    organization: "AgriTech India Summit",
    year: "2022",
    description: "Recognized for implementing innovative technology solutions in organic farming and distribution.",
    icon: Crown,
    category: "Innovation"
  },
  {
    title: "Quality Assurance Excellence",
    organization: "National Organic Standards Board",
    year: "2021",
    description: "Certified for maintaining highest standards in organic product quality and certification.",
    icon: Award,
    category: "Quality"
  }
];

const certifications = [
  {
    name: "NPOP Organic Certification",
    authority: "Agricultural and Processed Food Products Export Development Authority",
    validUntil: "2025",
    description: "National Programme for Organic Production certification ensuring authentic organic standards."
  },
  {
    name: "FSSAI License",
    authority: "Food Safety and Standards Authority of India",
    validUntil: "2026",
    description: "Food safety license certifying compliance with national food safety standards."
  },
  {
    name: "ISO 22000:2018",
    authority: "International Organization for Standardization",
    validUntil: "2025",
    description: "Food safety management system certification for the entire supply chain."
  },
  {
    name: "Fair Trade Certified",
    authority: "Fair Trade Alliance Kerala",
    validUntil: "2024",
    description: "Certification ensuring fair wages and ethical treatment of farming partners."
  }
];

export default function Awards() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Awards & Recognition
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to excellence in organic farming, sustainability, and customer satisfaction 
            has been recognized by leading industry organizations across India.
          </p>
        </section>

        {/* Awards Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awards.map((award, index) => (
              <Card key={index} className="card-farm hover:glow-effect">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                      <award.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="feature-badge">
                      {award.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{award.title}</h3>
                  <p className="text-accent font-semibold mb-2">{award.organization}</p>
                  <p className="text-primary font-bold mb-3">{award.year}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{award.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Certifications & Licenses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certifications.map((cert, index) => (
              <Card key={index} className="card-farm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground">{cert.name}</h3>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                      Valid until {cert.validUntil}
                    </Badge>
                  </div>
                  <p className="text-accent font-semibold mb-3">{cert.authority}</p>
                  <p className="text-muted-foreground">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Recognition Milestones</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">15+</div>
                <p className="text-muted-foreground">Industry Awards</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">8</div>
                <p className="text-muted-foreground">Certifications</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">5</div>
                <p className="text-muted-foreground">Years of Excellence</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">100%</div>
                <p className="text-muted-foreground">Organic Certified</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Promise */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Quality Promise</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Every award and certification represents our unwavering commitment to delivering 
              the highest quality organic products while supporting sustainable farming practices 
              and rural communities across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop" className="inline-block">
                <button className="btn-farm">
                  Shop Certified Products
                </button>
              </a>
              <a href="/about" className="inline-block">
                <button className="btn-secondary-farm">
                  Learn More About Us
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}