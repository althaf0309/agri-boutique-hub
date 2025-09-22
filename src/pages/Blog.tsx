import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Organic Farming",
    excerpt: "Discover the principles and practices of organic farming that promote sustainable agriculture and healthier crops.",
    content: "Learn about soil management, natural pest control, and sustainable farming techniques...",
    category: "Farming Tips",
    author: "Dr. Priya Sharma",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "/placeholder.svg",
    featured: true
  },
  {
    id: 2,
    title: "Benefits of Consuming Organic Honey",
    excerpt: "Explore the nutritional benefits and healing properties of pure organic honey.",
    content: "Organic honey contains natural enzymes, antioxidants, and minerals that support health...",
    category: "Health & Nutrition",
    author: "Rahul Nair",
    date: "2024-01-12",
    readTime: "5 min read",
    image: "/placeholder.svg",
    featured: false
  },
  {
    id: 3,
    title: "Sustainable Packaging in Organic Products",
    excerpt: "How eco-friendly packaging is revolutionizing the organic product industry.",
    content: "The importance of sustainable packaging in reducing environmental impact...",
    category: "Sustainability",
    author: "Maya Patel",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "/placeholder.svg",
    featured: false
  },
  {
    id: 4,
    title: "Growing Your Own Organic Vegetables",
    excerpt: "A beginner's guide to starting your own organic vegetable garden at home.",
    content: "Step-by-step instructions for creating a thriving organic garden...",
    category: "Gardening",
    author: "Arjun Menon",
    date: "2024-01-08",
    readTime: "10 min read",
    image: "/placeholder.svg",
    featured: false
  }
];

const categories = ["All", "Farming Tips", "Health & Nutrition", "Sustainability", "Gardening"];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Prakrithi Jaiva Kalavara Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover insights about organic farming, sustainable living, and healthy nutrition from our experts.
          </p>
        </section>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="transition-all hover:scale-105"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {blogPosts.find(post => post.featured) && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Article</h2>
            {(() => {
              const featuredPost = blogPosts.find(post => post.featured);
              return (
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img 
                        src={featuredPost?.image} 
                        alt={featuredPost?.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <Badge variant="secondary" className="mb-4">
                        {featuredPost?.category}
                      </Badge>
                      <h3 className="text-3xl font-bold text-foreground mb-4">
                        {featuredPost?.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 text-lg">
                        {featuredPost?.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground mb-6">
                        <User className="w-4 h-4 mr-2" />
                        <span className="mr-4">{featuredPost?.author}</span>
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="mr-4">{featuredPost?.date}</span>
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{featuredPost?.readTime}</span>
                      </div>
                      <Link to={`/blog/${featuredPost?.id}`}>
                        <Button className="group">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </section>
        )}

        {/* Blog Grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader className="p-0">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link to={`/blog/${post.id}`} className="w-full">
                    <Button variant="outline" className="w-full group">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}