import { Star, Heart, Users, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const testimonials = [
  {
    name: "Priya Nair",
    location: "Kochi, Kerala",
    rating: 5,
    testimonial: "Prakrithi Jaiva Kalavara has completely transformed how our family eats. The freshness and quality of their organic produce is unmatched. My children's health has improved significantly since we started buying from them.",
    product: "Organic Vegetables & Fruits",
    avatar: "/placeholder.svg",
    verified: true
  },
  {
    name: "Rajesh Kumar",
    location: "Bangalore, Karnataka",
    rating: 5,
    testimonial: "As a farmer myself, I appreciate PJK's commitment to supporting organic farming. Their fair trade practices have helped our community prosper while delivering authentic organic products to customers.",
    product: "Partnership Program",
    avatar: "/placeholder.svg",
    verified: true
  },
  {
    name: "Dr. Meera Shankar",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    testimonial: "I recommend PJK to all my patients seeking organic nutrition. Their products are genuinely organic, properly certified, and have helped many of my patients improve their health naturally.",
    product: "Organic Health Products",
    avatar: "/placeholder.svg",
    verified: true
  },
  {
    name: "Arjun Menon",
    location: "Trivandrum, Kerala",
    rating: 5,
    testimonial: "The convenience of ordering organic products online with guaranteed freshness is amazing. PJK's customer service is exceptional, and they truly care about customer satisfaction.",
    product: "Online Shopping Experience",
    avatar: "/placeholder.svg",
    verified: true
  },
  {
    name: "Lakshmi Devi",
    location: "Coimbatore, Tamil Nadu",
    rating: 5,
    testimonial: "Their organic spices and traditional products remind me of my grandmother's cooking. The authenticity and purity in every product is evident. My entire family has switched to PJK.",
    product: "Organic Spices & Traditional Items",
    avatar: "/placeholder.svg",
    verified: true
  },
  {
    name: "Vineeth Thomas",
    location: "Kottayam, Kerala",
    rating: 5,
    testimonial: "PJK's commitment to sustainability inspired me to start my own organic garden. Their educational content and quality products have made organic living accessible to urban families like ours.",
    product: "Organic Seeds & Gardening",
    avatar: "/placeholder.svg",
    verified: true
  }
];

const stats = [
  {
    number: "15,000+",
    label: "Happy Customers",
    icon: Users
  },
  {
    number: "4.9/5",
    label: "Average Rating",
    icon: Star
  },
  {
    number: "98%",
    label: "Customer Retention",
    icon: Heart
  },
  {
    number: "1,200+",
    label: "5-Star Reviews",
    icon: Quote
  }
];

const videoTestimonials = [
  {
    name: "Farming Community - Wayanad",
    description: "Local farmers share their experience with PJK's fair trade program",
    thumbnail: "/placeholder.svg",
    duration: "2:34"
  },
  {
    name: "Customer Success Stories",
    description: "Real customers share how organic living changed their families",
    thumbnail: "/placeholder.svg",
    duration: "4:12"
  },
  {
    name: "Health Transformation",
    description: "Families discuss health improvements from organic nutrition",
    thumbnail: "/placeholder.svg",
    duration: "3:45"
  }
];

export default function Testimonials() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Customer Testimonials
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how Prakrithi Jaiva Kalavara has transformed the lives of thousands of families 
            through authentic organic products and sustainable farming practices.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-farm text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((review, index) => (
              <Card key={index} className="card-farm h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center">
                          {review.name}
                          {review.verified && (
                            <Badge variant="secondary" className="ml-2 text-xs bg-accent/10 text-accent">
                              Verified
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{review.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-current" />
                    ))}
                  </div>

                  {/* Testimonial */}
                  <div className="flex-1 mb-4">
                    <Quote className="w-8 h-8 text-primary/20 mb-2" />
                    <p className="text-muted-foreground italic leading-relaxed">
                      "{review.testimonial}"
                    </p>
                  </div>

                  {/* Product Category */}
                  <Badge variant="outline" className="self-start bg-primary/5 text-primary border-primary/20">
                    {review.product}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Video Testimonials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Video Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoTestimonials.map((video, index) => (
              <Card key={index} className="card-farm overflow-hidden">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                    {video.duration}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{video.name}</h3>
                  <p className="text-muted-foreground text-sm">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customer Success Metrics */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Impact on Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">200+</div>
                <p className="text-muted-foreground mb-2">Partner Farmers Empowered</p>
                <p className="text-sm text-muted-foreground">Supporting sustainable livelihoods</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">₹2Cr+</div>
                <p className="text-muted-foreground mb-2">Fair Trade Revenue to Farmers</p>
                <p className="text-sm text-muted-foreground">Direct economic impact</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">50,000+</div>
                <p className="text-muted-foreground mb-2">Families Choosing Organic</p>
                <p className="text-sm text-muted-foreground">Healthier lifestyle adoption</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Join Our Happy Customers</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the Prakrithi Jaiva Kalavara difference and become part of our growing 
              community committed to organic living and sustainable farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop" className="inline-block">
                <button className="btn-farm">
                  Start Your Organic Journey
                </button>
              </a>
              <a href="/contact" className="inline-block">
                <button className="btn-secondary-farm">
                  Share Your Experience
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