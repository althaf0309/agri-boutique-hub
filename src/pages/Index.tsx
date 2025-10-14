import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Header from "@/components/layout/Header";
import HeroSlider from "@/components/HeroSlider";
import FeaturesCircle from "@/components/FeaturesCircle";
import ProductGrid from "@/components/ProductGrid";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

import organicCenterHero from "@/assets/organic-center-hero.jpg";
import type { PromoBanner } from "@/types/promoBanner";
import { fetchPromoBanners } from "@/api/promoBanners";

// --- helpers ---
const isActiveNow = (b: PromoBanner) => {
  const now = new Date();
  const startsOk = !b.starts_at || new Date(b.starts_at) <= now;
  const endsOk = !b.ends_at || new Date(b.ends_at) >= now;
  return !!b.is_active && startsOk && endsOk;
};
const bannerImage = (b?: PromoBanner) => (b?.image || b?.image_url || "").trim();

function BottomPromoCarousel() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPromoBanners();
        if (!mounted) return;
        const filtered = (data || [])
          .filter((b) => b.placement === "bottom")
          .filter(isActiveNow)
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.id as number) - (b.id as number));
        setBanners(filtered);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // pick up to 3 images; fallback to default hero if none
  const slides = useMemo(() => {
    const imgs = (banners.map(bannerImage).filter(Boolean) as string[]).slice(0, 3);
    if (imgs.length === 0) return [organicCenterHero]; // fallback single
    return imgs;
  }, [banners]);

  // autoplay
  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (slides.length < 2) return;
    timerRef.current = window.setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  return (
    <section className="py-8 sm:py-12 lg:py-16 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl max-w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
          {/* Slider track */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((url, idx) => (
              <div
                key={idx}
                className="w-full h-full flex-shrink-0 relative"
                style={{
                  backgroundImage: `url(${url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12 text-white text-center">
                  <h2 className="text-2xl sm:3xl md:4xl lg:5xl font-bold font-heading mb-3 sm:mb-4">
                    Farm Fresh Organic Goodness
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl mb-6 opacity-90">
                    Straight from certified organic farms to your table
                  </p>
                  <Link to="/shop">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          {slides.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/35 text-white rounded-full p-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                aria-label="Next"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/25 hover:bg-white/35 text-white rounded-full p-2"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === current ? "bg-white" : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Skeleton while loading */}
          {loading && <div className="absolute inset-0 animate-pulse bg-muted/60" />}
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="overflow-x-hidden">
        {/* Hero Slider (top banners handled inside the component) */}
        <section className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
          <HeroSlider />
        </section>

        {/* Intro */}
        <section className="py-8 sm:py-12 lg:py-16 text-center overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-full">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 sm:mb-6 leading-tight">
              Premium Organic Products
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Discover the finest selection of organic groceries, natural personal care products, and everything you need
              for a sustainable lifestyle. Farm-fresh quality delivered to your doorstep.
            </p>
          </div>
        </section>

        {/* Bottom promo banners from backend (with fallback) */}
        <BottomPromoCarousel />

        {/* Features */}
        <FeaturesCircle />

        {/* Featured products from backend */}
        <ProductGrid title="Featured Products" featuredOnly />

        {/* Listing heading */}
        <section className="py-6 sm:py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-3 sm:mb-4">
              Listing the Product
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              Explore our complete range of certified organic products
            </p>
          </div>
        </section>

        {/* Latest products from backend */}
        <ProductGrid title="Latest Products" ordering="-created_at" />

        {/* FAQ */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
