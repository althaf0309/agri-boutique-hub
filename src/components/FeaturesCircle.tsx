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
  // Desktop/tablet geometry
  const DESKTOP_RADIUS = 360;
  const LINE_RADIUS = 260;

  // Extra downward nudge ONLY for the top badge (index 0)
  const TOP_BUMP = { base: 0, md: 16, lg: 24, xl: 32 }; // tweak if needed

  return (
    <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-60 lg:pb-40 xl:pt-72 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* soft background blobs omitted for brevity */}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Intro: heading + paragraph with larger bottom margin to create gap */}
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="text-gradient block">Why Choose Prakrithi Jaiva Kalavara?</span>
          </h2>

          {/* Your <p> description — leave copy as-is; we only add spacing */}
          <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Experience the difference with our commitment to quality, sustainability, and customer satisfaction
          </p>

          {/* Bigger margin-bottom here makes room above the top card */}
          <div className="mb-10 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24" />
        </div>

        <div className="relative max-w-7xl mx-auto flex items-center justify-center">
          {/* Mobile layout (unchanged) */}
          <div className="block lg:hidden w-full">
            {/* center brand + grid … (keep your existing mobile code) */}
          </div>

          {/* Desktop/tablet circle */}
          <div className="hidden lg:block relative w-full flex items-center justify-center min-h-[980px]">
            <div className="relative w-[500px] h-[500px] mx-auto">
              {/* rings + center logo … (keep your existing) */}

              {/* Badges around circle */}
              {features.map((f, index) => {
                const Icon = f.icon;
                const angle = (index * 60) * (Math.PI / 180);
                const x = Math.cos(angle - Math.PI / 2) * DESKTOP_RADIUS;

                // base y
                let y = Math.sin(angle - Math.PI / 2) * DESKTOP_RADIUS;

                // extra downward offset for ONLY the top badge (index 0)
                if (index === 0) {
                  // we’ll apply responsive nudge via CSS variables
                }

                return (
                  <div
                    key={f.id}
                    className={`absolute z-10 ${index === 0 ? "top-badge-offset" : ""}`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
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

            {/* connector lines resized to match radius */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800">
              {/* defs … */}
              {features.map((_, index) => {
                const angle = (index * 60) * (Math.PI / 180);
                const cx = 600, cy = 400;
                let x2 = cx + Math.cos(angle - Math.PI / 2) * LINE_RADIUS;
                let y2 = cy + Math.sin(angle - Math.PI / 2) * LINE_RADIUS;

                // mirror the top-badge small visual shift
                if (index === 0) y2 += 10;

                return (
                  <g key={index}>
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="url(#enhancedLineGradient)" strokeWidth="6" strokeDasharray="12,8" />
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="8,4" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* stats … (unchanged) */}
      </div>

      {/* Responsive CSS variables for the top-badge bump */}
      <style>{`
        .top-badge-offset { transform: translate(var(--tx, -50%), calc(var(--ty, -50%) + var(--top-bump, 0px))) !important; }
        @media (min-width: 768px) {
          .top-badge-offset { --top-bump: ${TOP_BUMP.md}px; }
        }
        @media (min-width: 1024px) {
          .top-badge-offset { --top-bump: ${TOP_BUMP.lg}px; }
        }
        @media (min-width: 1280px) {
          .top-badge-offset { --top-bump: ${TOP_BUMP.xl}px; }
        }
      `}</style>
    </section>
  );
}
