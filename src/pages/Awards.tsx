import { Award as AwardIcon, Trophy, Medal, Star, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { useAwards, useCertifications } from "@/api/hooks/cms";
import { Skeleton } from "@/components/ui/skeleton";

function categoryIcon(cat?: string) {
  switch (cat) {
    case "Industry Recognition":
      return Trophy;
    case "Sustainability":
      return AwardIcon;
    case "Social Impact":
      return Medal;
    case "Customer Excellence":
      return Star;
    case "Innovation":
      return Crown;
    case "Quality":
      return AwardIcon;
    default:
      return AwardIcon;
  }
}

export default function Awards() {
  const {
    data: awards = [],
    isLoading: loadingAwards,
    isError: errorAwards,
  } = useAwards();
  const {
    data: certs = [],
    isLoading: loadingCerts,
    isError: errorCerts,
  } = useCertifications();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-4 sm:mb-6">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Awards & Recognition
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Our commitment to excellence in organic farming, sustainability, and customer satisfaction
            has been recognized by leading industry organizations across India.
          </p>
        </section>

        {/* Awards Grid */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">Our Achievements</h2>

          {errorAwards && (
            <p className="text-center text-muted-foreground">Couldn’t load awards. Please try again.</p>
          )}

          {loadingAwards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="card-farm">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {awards
                .filter((a) => a.is_active !== false)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                .map((award) => {
                  const Icon = categoryIcon(award.category as string);
                  return (
                    <Card key={award.id} className="card-farm hover:glow-effect">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center overflow-hidden">
                            {award.emblem_url ? (
                              <img src={award.emblem_url} alt={award.title} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            )}
                          </div>
                          {award.category && (
                            <Badge variant="secondary" className="feature-badge text-xs">
                              {award.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{award.title}</h3>
                        {award.organization && (
                          <p className="text-accent font-semibold mb-2 text-sm sm:text-base">
                            {award.organization}
                          </p>
                        )}
                        {award.year && (
                          <p className="text-primary font-bold mb-2 sm:mb-3 text-sm sm:text-base">
                            {award.year}
                          </p>
                        )}
                        {award.description && (
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                            {award.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </section>

        {/* Certifications */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Certifications & Licenses
          </h2>

          {errorCerts && (
            <p className="text-center text-muted-foreground">Couldn’t load certifications. Please try again.</p>
          )}

          {loadingCerts ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="card-farm">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {certs
                .filter((c) => c.is_active !== false)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                .map((cert) => (
                  <Card key={cert.id} className="card-farm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-0">
                          {cert.name}
                        </h3>
                        {cert.valid_until && (
                          <Badge
                            variant="outline"
                            className="bg-accent/10 text-accent border-accent/20 self-start text-xs"
                          >
                            Valid until {cert.valid_until}
                          </Badge>
                        )}
                      </div>
                      {cert.authority && (
                        <p className="text-accent font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                          {cert.authority}
                        </p>
                      )}
                      {cert.description && (
                        <p className="text-muted-foreground text-sm">
                          {cert.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>

        {/* Quality Promise */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-center">Our Quality Promise</h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 text-center">
              Every award and certification represents our unwavering commitment to delivering
              the highest quality organic products while supporting sustainable farming practices
              and rural communities across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a href="/shop" className="inline-block">
                <button className="btn-farm">Shop Certified Products</button>
              </a>
              <a href="/about" className="inline-block">
                <button className="btn-secondary-farm">Learn More About Us</button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
