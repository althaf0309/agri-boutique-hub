// src/components/hero/HeroSlider.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// 👉 backend
import { fetchPromoBanners } from "@/api/promoBanners";
import type { PromoBanner } from "@/types/promoBanner";

type Slide = {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
};

const isExternalUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  // fetch TOP promo banners from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPromoBanners();
        if (!mounted) return;

        // filter: only "top", active, within date range (if set)
        const now = new Date();
        const filtered = (data || [])
          .filter((b) => b.placement === "top")
          .filter((b) => !!b.is_active)
          .filter((b) => {
            const startsOk = !b.starts_at || new Date(b.starts_at) <= now;
            const endsOk = !b.ends_at || new Date(b.ends_at) >= now;
            return startsOk && endsOk;
          })
          .sort(
            (a, b) =>
              (a.sort ?? 0) - (b.sort ?? 0) || (a.id as number) - (b.id as number)
          );

        setBanners(filtered);
      } catch {
        setBanners([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const slides: Slide[] = useMemo(() => {
    if (!banners.length) return [];
    return banners.map((b) => ({
      id: b.id,
      title: b.title || b.main_offer || "—",
      subtitle: b.subtitle || b.badge || "",
      description: b.offer_text || b.coupon_text || "",
      image: b.image || b.image_url || "",
      ctaText: b.button_text || "Shop Now",
      ctaLink: b.cta_url || "/shop",
    }));
  }, [banners]);

  // autoplay
  useEffect(() => {
    // clear any previous timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!slides.length) return;

    timerRef.current = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000) as unknown as number;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const next = () => setCurrent((p) => (slides.length ? (p + 1) % slides.length : 0));
  const prev = () => setCurrent((p) => (slides.length ? (p - 1 + slides.length) % slides.length : 0));

  // fallback skeleton height
  const containerClasses = "relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg sm:rounded-xl";

  if (loading) {
    return (
      <section className={containerClasses}>
        <div className="absolute inset-0 animate-pulse bg-muted/60" />
      </section>
    );
  }

  // If no backend banners, quietly render nothing (or you can show a small placeholder)
  if (!slides.length) {
    return null;
  }

  return (
    <section className={containerClasses} aria-roledescription="carousel">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="w-full flex-shrink-0 relative flex items-center justify-center"
            style={{
              backgroundImage: s.image ? `url(${s.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            role="group"
            aria-label={s.title}
          >
            {/* dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50" />

            {/* Content */}
            <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                {s.title}
              </h2>
              {!!s.subtitle && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-2 opacity-90">
                  {s.subtitle}
                </p>
              )}
              {!!s.description && (
                <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-6 sm:mb-8 opacity-80 max-w-2xl mx-auto leading-relaxed">
                  {s.description}
                </p>
              )}

              {s.ctaText && s.ctaLink && (
                isExternalUrl(s.ctaLink) ? (
                  <a href={s.ctaLink} target="_blank" rel="noreferrer">
                    <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                      {s.ctaText}
                    </Button>
                  </a>
                ) : (
                  <Link to={s.ctaLink}>
                    <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                      {s.ctaText}
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current ? "bg-white" : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
