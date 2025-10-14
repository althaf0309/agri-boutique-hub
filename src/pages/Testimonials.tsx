import { Star, Heart, Users, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { useTestimonials, useVideoTestimonials } from "@/api/hooks/cms";
import { Skeleton } from "@/components/ui/skeleton";

function AvgRating({ ratings }: { ratings: number[] }) {
  if (!ratings.length) return <span className="text-muted-foreground">No ratings yet</span>;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? "text-accent fill-current" : "text-muted-foreground"}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({avg.toFixed(1)} avg)</span>
    </div>
  );
}

export default function Testimonials() {
  const {
    data: testimonials = [],
    isLoading: loadingT,
    isError: errorT,
  } = useTestimonials();
  const {
    data: videos = [],
    isLoading: loadingV,
    isError: errorV,
  } = useVideoTestimonials();

  const activeTestimonials = testimonials.filter((t) => t.is_active !== false);
  const activeVideos = videos.filter((v) => v.is_active !== false);

  const ratings = activeTestimonials.map((t) => Number(t.rating || 0)).filter((n) => Number.isFinite(n));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-4 sm:mb-6">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Customer Testimonials
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Discover how Prakrithi Jaiva Kalavara has transformed the lives of families
            through authentic organic products and sustainable farming practices.
          </p>
        </section>

        {/* Simple Stats (derived) */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <Card className="card-farm text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">
                  {loadingT ? "…" : activeTestimonials.length}
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">Testimonials</p>
              </CardContent>
            </Card>

            <Card className="card-farm text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">
                  {loadingT ? "…" : (ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—")}
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">Average Rating</p>
              </CardContent>
            </Card>

            <Card className="card-farm text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">
                  {loadingV ? "…" : activeVideos.length}
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">Video Stories</p>
              </CardContent>
            </Card>

            <Card className="card-farm text-center">
              <CardContent className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">
                  {loadingT ? "…" : (ratings.filter((r) => r >= 5).length)}
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">5-Star Reviews</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            What Our Customers Say
          </h2>

          {errorT && (
            <p className="text-center text-muted-foreground mb-6">Couldn’t load testimonials. Please try again.</p>
          )}

          {loadingT ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="card-farm">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {activeTestimonials
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                .map((review) => (
                  <Card key={review.id} className="card-farm h-full">
                    <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <img
                            src={review.avatar_url || "/placeholder.svg"}
                            alt={review.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center">
                              {review.name}
                              {review.verified && (
                                <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs bg-accent/10 text-accent">
                                  ✓
                                </Badge>
                              )}
                            </h3>
                            {review.location && (
                              <p className="text-xs sm:text-sm text-muted-foreground">{review.location}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3 sm:mb-4">
                        {Array.from({ length: Number(review.rating || 0) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-current" />
                        ))}
                      </div>

                      {/* Testimonial */}
                      {review.testimonial && (
                        <div className="flex-1 mb-3 sm:mb-4">
                          <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/20 mb-2" />
                          <p className="text-muted-foreground italic leading-relaxed text-sm sm:text-base">
                            “{review.testimonial}”
                          </p>
                        </div>
                      )}

                      {/* Product Category */}
                      {review.product && (
                        <Badge variant="outline" className="self-start bg-primary/5 text-primary border-primary/20 text-xs">
                          {review.product}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>

        {/* Video Testimonials */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Video Stories
          </h2>

          {errorV && (
            <p className="text-center text-muted-foreground mb-6">Couldn’t load video testimonials. Please try again.</p>
          )}

          {loadingV ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="card-farm overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {activeVideos
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                .map((video) => (
                  <Card key={video.id} className="card-farm overflow-hidden">
                    <div className="relative">
                      <img
                        src={video.thumbnail_url || "/placeholder.svg"}
                        alt={video.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {video.duration && (
                        <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                          {video.duration}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{video.name}</h3>
                      {video.description && (
                        <p className="text-muted-foreground text-sm">{video.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Join Our Happy Customers</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the Prakrithi Jaiva Kalavara difference and become part of our growing
              community committed to organic living and sustainable farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop" className="inline-block">
                <button className="btn-farm">Start Your Organic Journey</button>
              </a>
              <a href="/contact" className="inline-block">
                <button className="btn-secondary-farm">Share Your Experience</button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
