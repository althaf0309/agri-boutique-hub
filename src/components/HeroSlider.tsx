import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner1 from "@/assets/hero-banner-1.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

const slides = [
  {
    id: 1,
    title: "Fresh Organic Produce",
    subtitle: "Farm to Table Excellence",
    description: "Discover our premium collection of organic fruits, vegetables, and grains sourced directly from sustainable farms.",
    image: heroBanner1,
    ctaText: "Shop Now",
    ctaLink: "/shop"
  },
  {
    id: 2,
    title: "100% Natural Products",
    subtitle: "Pure & Pesticide-Free",
    description: "Experience the difference with our certified organic products that are good for you and the environment.",
    image: heroBanner2,
    ctaText: "Explore Collection",
    ctaLink: "/shop?category=Organic+Grocery"
  },
  {
    id: 3,
    title: "Plant Nursery & Seeds",
    subtitle: "Grow Your Own Garden",
    description: "Start your sustainable journey with our premium seeds, seedlings, and organic fertilizers.",
    image: heroBanner3,
    ctaText: "Start Growing",
    ctaLink: "/shop?category=Plant+Nursery"
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg sm:rounded-xl">
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative flex items-center justify-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/70"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-2 opacity-90">
                {slide.subtitle}
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-6 sm:mb-8 opacity-80 max-w-2xl mx-auto leading-relaxed">
                {slide.description}
              </p>
              <Link to={slide.ctaLink}>
                <Button 
                  size="default"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                >
                  {slide.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}