import { Camera, MapPin, Calendar, Users, Leaf, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const farmingGallery = [
  {
    image: "/placeholder.svg",
    title: "Organic Rice Farming",
    location: "Wayanad, Kerala",
    date: "March 2024",
    description: "Traditional organic rice cultivation using sustainable farming methods"
  },
  {
    image: "/placeholder.svg",
    title: "Spice Plantation",
    location: "Idukki, Kerala",
    date: "February 2024",
    description: "Organic cardamom and pepper cultivation in the Western Ghats"
  },
  {
    image: "/placeholder.svg",
    title: "Vegetable Gardens",
    location: "Kottayam, Kerala",
    date: "January 2024",
    description: "Fresh organic vegetables grown without chemical pesticides"
  },
  {
    image: "/placeholder.svg",
    title: "Coconut Groves",
    location: "Thrissur, Kerala",
    date: "December 2023",
    description: "Traditional coconut farming supporting our organic coconut oil production"
  },
  {
    image: "/placeholder.svg",
    title: "Turmeric Fields",
    location: "Salem, Tamil Nadu",
    date: "November 2023",
    description: "High-quality organic turmeric cultivation with natural farming techniques"
  },
  {
    image: "/placeholder.svg",
    title: "Fruit Orchards",
    location: "Ooty, Tamil Nadu",
    date: "October 2023",
    description: "Organic fruit orchards producing chemical-free seasonal fruits"
  }
];

const eventsGallery = [
  {
    image: "/placeholder.svg",
    title: "Organic Farmers Meet 2024",
    location: "Kochi, Kerala",
    date: "March 2024",
    description: "Annual gathering of 200+ organic farmers discussing sustainable practices",
    attendees: "200+ Farmers"
  },
  {
    image: "/placeholder.svg",
    title: "Health & Wellness Workshop",
    location: "Bangalore, Karnataka",
    date: "February 2024",
    description: "Educational workshop on organic nutrition and healthy living",
    attendees: "150+ Participants"
  },
  {
    image: "/placeholder.svg",
    title: "School Awareness Program",
    location: "Various Schools, Kerala",
    date: "January 2024",
    description: "Teaching children about organic farming and environmental conservation",
    attendees: "500+ Students"
  },
  {
    image: "/placeholder.svg",
    title: "Sustainable Agriculture Expo",
    location: "Chennai, Tamil Nadu",
    date: "December 2023",
    description: "Showcasing innovative organic farming techniques and products",
    attendees: "300+ Visitors"
  },
  {
    image: "/placeholder.svg",
    title: "Community Harvest Festival",
    location: "Wayanad, Kerala",
    date: "November 2023",
    description: "Celebrating successful harvest season with farming communities",
    attendees: "400+ Community Members"
  },
  {
    image: "/placeholder.svg",
    title: "Organic Product Launch",
    location: "Trivandrum, Kerala",
    date: "October 2023",
    description: "Launching new range of organic wellness products",
    attendees: "100+ Stakeholders"
  }
];

const certificationGallery = [
  {
    image: "/placeholder.svg",
    title: "NPOP Certification Ceremony",
    location: "New Delhi",
    date: "August 2023",
    description: "Receiving National Programme for Organic Production certification"
  },
  {
    image: "/placeholder.svg",
    title: "Quality Assurance Audit",
    location: "Processing Facility, Kerala",
    date: "July 2023",
    description: "Annual quality assurance audit by certification authorities"
  },
  {
    image: "/placeholder.svg",
    title: "Fair Trade Certification",
    location: "Kochi, Kerala",
    date: "June 2023",
    description: "Receiving Fair Trade certification for ethical farming practices"
  },
  {
    image: "/placeholder.svg",
    title: "ISO 22000 Certification",
    location: "Bangalore, Karnataka",
    date: "May 2023",
    description: "Food safety management system certification process"
  }
];

const categories = [
  { name: "Farming & Agriculture", count: 24, icon: Leaf },
  { name: "Events & Workshops", count: 18, icon: Users },
  { name: "Certifications", count: 12, icon: Award },
  { name: "Community Impact", count: 30, icon: Camera }
];

export default function Gallery() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Journey in Pictures
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our visual story of organic farming excellence, community impact, 
            and the journey towards sustainable agriculture across India.
          </p>
        </section>

        {/* Gallery Categories */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="card-farm text-center cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                  <Badge variant="secondary" className="feature-badge">
                    {category.count} Photos
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Farming & Agriculture Gallery */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center">
            <Leaf className="w-8 h-8 mr-3 text-primary" />
            Farming & Agriculture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmingGallery.map((item, index) => (
              <Card key={index} className="card-farm overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{item.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Events & Workshops Gallery */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary" />
            Events & Community Outreach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsGallery.map((item, index) => (
              <Card key={index} className="card-farm overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-accent text-white">
                    {item.attendees}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{item.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications Gallery */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center">
            <Award className="w-8 h-8 mr-3 text-primary" />
            Certifications & Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificationGallery.map((item, index) => (
              <Card key={index} className="card-farm overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{item.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Gallery Stats */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Visual Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">500+</div>
                <p className="text-muted-foreground">Photos Captured</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">50+</div>
                <p className="text-muted-foreground">Farm Visits</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">25+</div>
                <p className="text-muted-foreground">Events Documented</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gradient mb-2">5</div>
                <p className="text-muted-foreground">Years of Growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Visit Our Farms</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience organic farming firsthand by visiting our partner farms. 
              See where your food comes from and meet the farmers who grow it with love and care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-block">
                <button className="btn-farm">
                  Plan a Farm Visit
                </button>
              </a>
              <a href="/about" className="inline-block">
                <button className="btn-secondary-farm">
                  Learn About Our Story
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