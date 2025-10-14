import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Share2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

import { useBlogPostBySlug, useBlogPosts } from "@/api/hooks/blog";

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

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPostBySlug(slug);

  // Related posts: same category, exclude current
  const { data: relatedRaw = [] } = useBlogPosts(
    post?.category?.slug ? { category: post.category.slug, page_size: 6, exclude: post.id } : { page_size: 6 }
  );

  const related = useMemo(
    () =>
      relatedRaw
        .filter((p) => p.is_published && p.id !== post?.id)
        .slice(0, 2),
    [relatedRaw, post?.id]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {isLoading ? (
          <article className="max-w-4xl mx-auto">
            <Skeleton className="w-full h-64 md:h-96 rounded-lg mb-8" />
            <Skeleton className="h-9 w-3/4 mb-4" />
            <Skeleton className="h-4 w-56 mb-6" />
            <Skeleton className="h-5 w-full mb-3" />
            <Skeleton className="h-5 w-11/12 mb-3" />
            <Skeleton className="h-5 w-2/3 mb-8" />
            <Skeleton className="h-24 w-full mb-12" />
          </article>
        ) : isError || !post ? (
          <p className="text-muted-foreground">Post not found.</p>
        ) : (
          <article className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <div className="relative mb-8">
              <img
                src={post.cover_url || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-end">
                <div className="p-8 text-white">
                  {post.category?.name && (
                    <Badge variant="secondary" className="mb-4">
                      {post.category.name}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {post.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between mb-8 pb-8 border-b border-border">
              <div className="flex items-center space-x-6 text-muted-foreground mb-4 md:mb-0">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{post.author_name || "—"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{estimateReadTime(post.content_markdown)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigator.share?.({ title: post.title, url: location.href })}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              {/* Prefer server-rendered HTML for safety/consistency */}
              <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
            </div>

            {/* Tags */}
            {(post.tags?.length || post.tags_csv) && (
              <div className="flex items-center space-x-4 mb-12 pb-8 border-b border-border">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {(post.tags?.length ? post.tags : (post.tags_csv || "").split(",").map((t) => t.trim())).filter(Boolean).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio (simple) */}
            {post.author_name && (
              <Card className="mb-12">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">
                        {post.author_name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{post.author_name}</h3>
                      <p className="text-muted-foreground">
                        {/* Placeholder bio text; replace with real author bios if you add them to the API */}
                        Passionate about sustainable agriculture and organic living.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            {related.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {related.map((rp) => (
                    <Card key={rp.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {rp.category?.name && (
                          <Badge variant="secondary" className="mb-3">
                            {rp.category.name}
                          </Badge>
                        )}
                        <h3 className="text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors">
                          <Link to={`/blog/${rp.slug}`}>{rp.title}</Link>
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{estimateReadTime(rp.content_markdown)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
