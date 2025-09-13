import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Share2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const blogPost = {
  id: 1,
  title: "The Ultimate Guide to Organic Farming",
  excerpt: "Discover the principles and practices of organic farming that promote sustainable agriculture and healthier crops.",
  category: "Farming Tips",
  author: "Dr. Priya Sharma",
  date: "2024-01-15",
  readTime: "8 min read",
  image: "/placeholder.svg",
  content: `
    <h2>Introduction to Organic Farming</h2>
    <p>Organic farming is an agricultural approach that emphasizes the use of natural processes and materials to cultivate crops and raise livestock. This method avoids synthetic fertilizers, pesticides, and genetically modified organisms (GMOs), focusing instead on sustainable practices that enhance soil health and biodiversity.</p>
    
    <h3>Core Principles of Organic Farming</h3>
    <p>The foundation of organic farming rests on four key principles:</p>
    <ul>
      <li><strong>Health:</strong> Supporting the health of soil, plants, animals, humans, and the planet as one and indivisible.</li>
      <li><strong>Ecology:</strong> Working with ecological systems and cycles, emulating and sustaining them.</li>
      <li><strong>Fairness:</strong> Building relationships that ensure fairness with regard to the common environment and life opportunities.</li>
      <li><strong>Care:</strong> Managing in a precautionary and responsible manner to protect the health and well-being of current and future generations.</li>
    </ul>
    
    <h3>Soil Management in Organic Farming</h3>
    <p>Healthy soil is the cornerstone of organic agriculture. Organic farmers focus on:</p>
    <ul>
      <li>Composting organic matter to improve soil structure</li>
      <li>Crop rotation to maintain soil fertility</li>
      <li>Cover cropping to prevent erosion and add nutrients</li>
      <li>Minimal tillage to preserve soil organisms</li>
    </ul>
    
    <h3>Natural Pest Control Methods</h3>
    <p>Instead of chemical pesticides, organic farmers employ various natural methods:</p>
    <ul>
      <li>Beneficial insects and biological controls</li>
      <li>Companion planting to repel pests naturally</li>
      <li>Physical barriers and traps</li>
      <li>Organic approved sprays made from natural ingredients</li>
    </ul>
    
    <h3>Benefits of Organic Farming</h3>
    <p>Organic farming offers numerous advantages:</p>
    <ul>
      <li>Reduced environmental impact</li>
      <li>Improved soil health and biodiversity</li>
      <li>Healthier food products</li>
      <li>Better working conditions for farmers</li>
      <li>Long-term sustainability</li>
    </ul>
    
    <h3>Getting Started with Organic Farming</h3>
    <p>If you're interested in transitioning to organic farming, consider these steps:</p>
    <ol>
      <li>Start with soil testing to understand your current conditions</li>
      <li>Develop a transition plan (typically takes 3 years)</li>
      <li>Learn about organic certification requirements</li>
      <li>Connect with other organic farmers and organizations</li>
      <li>Begin with small plots to gain experience</li>
    </ol>
    
    <h3>Conclusion</h3>
    <p>Organic farming represents a holistic approach to agriculture that benefits not only the environment but also produces healthier food and supports sustainable communities. While the transition requires dedication and learning, the long-term benefits make it a worthwhile investment for our planet's future.</p>
  `,
  tags: ["organic", "farming", "sustainability", "agriculture", "environment"]
};

const relatedPosts = [
  {
    id: 2,
    title: "Benefits of Consuming Organic Honey",
    category: "Health & Nutrition",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Sustainable Packaging in Organic Products",
    category: "Sustainability", 
    readTime: "6 min read"
  }
];

export default function BlogDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <article className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative mb-8">
            <img 
              src={blogPost.image} 
              alt={blogPost.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-end">
              <div className="p-8 text-white">
                <Badge variant="secondary" className="mb-4">
                  {blogPost.category}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {blogPost.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center justify-between mb-8 pb-8 border-b border-border">
            <div className="flex items-center space-x-6 text-muted-foreground mb-4 md:mb-0">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{blogPost.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{blogPost.date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
          </div>

          {/* Tags */}
          <div className="flex items-center space-x-4 mb-12 pb-8 border-b border-border">
            <Tag className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {blogPost.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {blogPost.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{blogPost.author}</h3>
                  <p className="text-muted-foreground">
                    Dr. Priya Sharma is a leading expert in sustainable agriculture with over 15 years of experience 
                    in organic farming practices. She holds a PhD in Agricultural Sciences and has published numerous 
                    research papers on sustainable farming techniques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {post.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors">
                      <Link to={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}