import { Camera, MapPin, Calendar, Users, Leaf, Award as AwardIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { useGalleryItems } from "@/api/hooks/cms";
import { Skeleton } from "@/components/ui/skeleton";

type Cat = "Farming & Agriculture" | "Events & Workshops" | "Certifications" | "Community Impact";
const cats: { name: Cat; icon: any }[] = [
  { name: "Farming & Agriculture", icon: Leaf },
  { name: "Events & Workshops", icon: Users },
  { name: "Certifications", icon: AwardIcon },
  { name: "Community Impact", icon: Camera },
];

export default function Gallery() {
  const { data: all = [], isLoading, isError } = useGalleryItems();

  const byCat = (c: Cat) => all.filter((g) => g.category === c && g.is_active !== false).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-accent rounded-full mb-4 sm:mb-6">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            Our Journey in Pictures
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Explore our visual story of organic farming excellence, community impact,
            and the journey towards sustainable agriculture across India.
          </p>
        </section>

        {/* Gallery Categories */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {cats.map(({ name, icon: Icon }) => (
              <Card key={name} className="card-farm text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-2">{name}</h3>
                  <Badge variant="secondary" className="feature-badge text-xs">
                    {isLoading ? "…" : byCat(name).length} Photos
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {isError && (
          <p className="text-center text-muted-foreground mb-12">Couldn’t load gallery. Please try again.</p>
        )}

        {isLoading ? (
          <>
            {cats.map((c) => (
              <section key={c.name} className="mb-12 sm:mb-16">
                <div className="h-8 w-60 mb-6 bg-muted rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="card-farm overflow-hidden">
                      <Skeleton className="w-full h-48" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : (
          <>
            {/* Farming & Agriculture */}
            <section className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 flex items-center">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary" />
                Farming & Agriculture
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {byCat("Farming & Agriculture").map((item) => (
                  <Card key={item.id} className="card-farm overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      {item.location && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.date_label && (
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{item.date_label}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Events & Workshops */}
            <section className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary" />
                Events & Community Outreach
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {byCat("Events & Workshops").map((item) => (
                  <Card key={item.id} className="card-farm overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      {item.attendees && (
                        <Badge className="absolute top-4 left-4 bg-accent text-white">
                          {item.attendees}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      {item.location && (
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.date_label && (
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{item.date_label}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 flex items-center">
                <AwardIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary" />
                Certifications & Achievements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {byCat("Certifications").map((item) => (
                  <Card key={item.id} className="card-farm overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-28 sm:h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      {item.location && (
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {item.date_label && (
                        <div className="flex items-center text-xs text-muted-foreground mb-1 sm:mb-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{item.date_label}</span>
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Community Impact */}
            <section className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 flex items-center">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-primary" />
                Community Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {byCat("Community Impact").map((item) => (
                  <Card key={item.id} className="card-farm overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
