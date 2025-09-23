import { Leaf, Truck, Shield, Snowflake, Clock, RotateCcw } from "lucide-react";

const features = [
  { id: 1, title: "100% Organic", description: "Certified organic products for healthy living", icon: Leaf,  color: "text-accent" },
  { id: 2, title: "Farm Fresh",  description: "Direct from sustainable farms",                   icon: Truck, color: "text-primary" },
  { id: 3, title: "Pesticide Free", description: "Natural & chemical-free",                       icon: Shield, color: "text-accent" },
  { id: 4, title: "Better Food Brighter Future", description: "Eat well Live well. Leave well ",  icon: Snowflake, color: "text-primary" },
  { id: 5, title: "Freash. Local. Organic ", description: "Closer. Fresher. Better",              icon: Clock, color: "text-highlight" },
  { id: 6, title: "Eat clean, Live Green", description: "Wholesome organic choices for a healthier you", icon: RotateCcw, color: "text-secondary" }
];

export default function FeaturesCircle() {
  // desktop geometry (unchanged card placement)
  const DESKTOP_RADIUS = 360;
  const LINE_RADIUS = 260;

  return (
    <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-60 lg:pb-40 xl:pt-72 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-80 h-48 sm:h-80 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/4 w-24 sm:w-48 h-24 sm:h-48 bg-highlight rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/3 w-28 sm:w-56 h-28 sm:h-56 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Intro with larger bottom margin on desktop to clear the top card */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-44 xl:mb-56 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 lg:mb-12 leading-tight">
            <span className="text-gradient block">Why Choose Prakrithi Jaiva Kalavara?</span>
          </h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Experience the difference with our commitment to quality, sustainability, and customer satisfaction
            </p>
          </div>
        </div>

        {/* Circle block */}
        <div className="relative max-w-7xl mx-auto flex items-center justify-center">
          {/* Mobile layout */}
          <div className="block lg:hidden w-full">
            {/* Mobile brand circle */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-12 relative">
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-accent via-primary to-highlight animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-2 bg-gradient-to-br from-primary via-accent to-highlight rounded-full shadow-xl">
                <div className="absolute inset-3 bg-white/98 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold mb-2 text-gradient">PJK</div>
                    <div className="text-sm sm:text-base font-bold text-primary mb-1">Prakrithi Jaiva Kalavara</div>
                    <div className="text-xs sm:text-sm text-muted-foreground px-2">Premium Organic</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="text-center px-2">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center ${f.color} shadow-md`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-xs sm:text-sm md:text-base font-bold text-primary mb-2 leading-tight">{f.title}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{f.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop circle (card positions unchanged) */}
          <div className="hidden lg:block relative w-full flex items-center justify-center" style={{ minHeight: "980px" }}>
            {/* Center brand circle */}
            <div className="relative w-[500px] h-[500px] mx-auto">
              <div className="absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-r from-accent via-primary to-highlight animate-spin" style={{ animationDuration: "30s" }} />
              <div className="absolute inset-4 rounded-full border-6 border-transparent bg-gradient-to-r from-highlight via-secondary to-accent animate-spin" style={{ animationDuration: "40s", animationDirection: "reverse" }} />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary via-accent to-highlight shadow-2xl">
                <div className="absolute inset-6 bg-white/98 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border-4 border-white/50">
                  <div className="text-center px-6">
                    <div className="text-7xl font-bold mb-4 text-gradient animate-pulse">PJK</div>
                    <div className="text-3xl font-bold text-primary mb-3 leading-tight">Prakrithi Jaiva Kalavara</div>
                    <div className="text-lg text-muted-foreground px-2 leading-tight">Premium Organic Excellence</div>
                    <div className="text-sm text-muted-foreground/80 mt-2">Farm to Table Quality</div>
                  </div>
                </div>
              </div>

              {/* Badges at perfect 60° intervals (no bump applied) */}
              {features.map((f, index) => {
                const Icon = f.icon;
                const angle = (index * 60) * (Math.PI / 180);
                const x = Math.cos(angle - Math.PI / 2) * DESKTOP_RADIUS;
                const y = Math.sin(angle - Math.PI / 2) * DESKTOP_RADIUS;

                return (
                  <div
                    key={f.id}
                    className="absolute z-10"
                    style={{ left: "50%", top: "50%", transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    <div className="bg-white/95 rounded-3xl p-6 shadow-2xl border border-border/50 hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 backdrop-blur-sm w-[220px] h-[180px] flex flex-col items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center ${f.color} shadow-lg`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="text-lg font-bold text-primary mb-2 leading-tight">{f.title}</div>
                        <div className="text-sm text-muted-foreground leading-tight">{f.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connecting lines (no bump) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800">
              <defs>
                <radialGradient id="enhancedLineGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="hsl(var(--highlight))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                </radialGradient>
                <filter id="enhancedGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {features.map((_, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const cx = 600, cy = 400; // svg center
                const x2 = cx + Math.cos(angle - Math.PI / 2) * LINE_RADIUS;
                const y2 = cy + Math.sin(angle - Math.PI / 2) * LINE_RADIUS;

                return (
                  <g key={index}>
                    <line
                      x1={cx} y1={cy} x2={x2} y2={y2}
                      stroke="url(#enhancedLineGradient)" strokeWidth="6" strokeDasharray="12,8"
                      filter="url(#enhancedGlow)" className="animate-pulse" style={{ animationDuration: "4s" }}
                    />
                    <line
                      x1={cx} y1={cy} x2={x2} y2={y2}
                      stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="8,4"
                      className="animate-pulse" style={{ animationDuration: "3s" }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-12 mt-12 sm:mt-16 lg:mt-32 max-w-6xl mx-auto">
          {[
            { number: "10K+", label: "Happy Customers", icon: "👥" },
            { number: "500+", label: "Organic Products", icon: "🌱" },
            { number: "50+", label: "Partner Farms", icon: "🚜" },
            { number: "24/7", label: "Customer Support", icon: "📞" }
          ].map((s, i) => (
            <div key={i} className="text-center bg-white/50 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4">{s.icon}</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-1 sm:mb-2 lg:mb-3">{s.number}</div>
              <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-muted-foreground font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
