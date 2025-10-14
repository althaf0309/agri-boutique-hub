import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

import { useBlogCategories, useBlogPosts, BlogPost } from "@/api/hooks/blog";

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function estimateReadTime(md?: string) {
  if (!md) return "—";
  const words = md.replace(/\s+/g, " ").trim().split(" ").length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default function Blog() {
  const { data: categories = [], isLoading: loadingCats, isError: errorCats } = useBlogCategories();
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  // We fetch all (or a high page size) and paginate client-side to keep hooks simple
  const { data: posts = [], isLoading, isError } = useBlogPosts(
    activeCat === "all" ? { page_size: 60, ordering: "-published_at" } : { category: activeCat, page_size: 60, ordering: "-published_at" }
  );

  const [visible, setVisible] = useState(6);

  // Reset visible when category changes or when new posts load
  const onCatClick = (slugOrAll: string | "all") => {
    setActiveCat(slugOrAll);
    setVisible(6);
  };

  const publishedPosts = useMemo(
    () => posts.filter((p) => p.is_published),
    [posts]
  );

  const featured = useMemo<BlogPost | undefined>(() => {
    const f = publishedPosts.find((p) => p.featured);
    if (f) return f;
    return publishedPosts[0]; // fallback to newest
  }, [publishedPosts]);

  const gridPosts = useMemo(
    () => publishedPosts.filter((p) => p.id !== featured?.id),
    [publishedPosts, featured]
  );

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
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            onClick={() => onCatClick("all")}
            variant={activeCat === "all" ? "default" : "outline"}
            className="transition-all hover:scale-105"
          >
            All
          </Button>

          {loadingCats && (
            <>
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </>
          )}

          {!loadingCats && !errorCats && categories.map((c) => (
            <Button
              key={c.id}
              onClick={() => onCatClick(c.slug)}
              variant={activeCat === c.slug ? "default" : "outline"}
              className="transition-all hover:scale-105"
            >
              {c.name}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Featured Article</h2>

          {isLoading ? (
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Skeleton className="w-full h-64 md:h-full" />
                </div>
                <div className="md:w-1/2 p-8 space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-8 w-4/5" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </Card>
          ) : isError || !featured ? (
            <p className="text-muted-foreground">No posts yet.</p>
          ) : (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featured.cover_url || "/placeholder.svg"}
                    alt={featured.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  {featured.category?.name && (
                    <Badge variant="secondary" className="mb-4">{featured.category.name}</Badge>
                  )}
                  <h3 className="text-3xl font-bold text-foreground mb-4">
                    {featured.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-6">
                    <User className="w-4 h-4 mr-2" />
                    <span className="mr-4">{featured.author_name || "—"}</span>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="mr-4">{formatDate(featured.published_at)}</span>
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{estimateReadTime(featured.content_markdown)}</span>
                  </div>
                  <Link to={`/blog/${featured.slug}`}>
                    <Button className="group">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Blog Grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="group">
                  <CardHeader className="p-0">
                    <Skeleton className="w-full h-48 rounded-t-lg" />
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <p className="text-muted-foreground">Couldn’t load posts. Please try again.</p>
          ) : gridPosts.length === 0 ? (
            <p className="text-muted-foreground">No more articles.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.slice(0, visible).map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <img
                        src={post.cover_url || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      {post.category?.name && (
                        <Badge variant="secondary" className="mb-3">
                          {post.category.name}
                        </Badge>
                      )}
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-4">{post.author_name || "—"}</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{estimateReadTime(post.content_markdown)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Link to={`/blog/${post.slug}`} className="w-full">
                        <Button variant="outline" className="w-full group">
                          Read Article
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Load More (client-side) */}
              {visible < gridPosts.length && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + 6)}>
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
