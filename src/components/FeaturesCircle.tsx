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
  // geometry (desktop/tablet)
  const R = 350;        // badge radius (balanced for md–xl)
  const LINE_R = 255;   // connector radius

  return (
    <section className="pt-28 sm:pt-36 lg:pt-56 xl:pt-64 pb-16 lg:pb-32 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Heading + copy with responsive bottom gap (prevents collision on tablet) */}
        <div className="text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-gradient block">Why Choose Prakrithi Jaiva Kalavara?</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Experience the difference with our commitment to quality, sustainability, and customer satisfaction
          </p>
          {/* bigger margin under intro on tablet/desktop */}
          <div className="mb-8 sm:mb-10 md:mb-14 lg:mb-20 xl:mb-24" />
        </div>

        <div className="relative max-w-7xl mx-auto flex items-center justify-center">
          {/* Mobile (unchanged full-width stack) */}
          <div className="block lg:hidden w-full">
            {/* … keep your existing mobile brand + 2/3 grid exactly as before … */}
          </div>

          {/* Tablet/Desktop */}
          <div
            className="
              hidden lg:block relative w-full flex items-center justify-center
              min-h-[900px] lg:min-h-[960px] xl:min-h-[1000px]
              md:scale-95 lg:scale-100 xl:scale-105 2xl:scale-110
            "
          >
            {/* Center brand circle (your existing rings/content) */}
            <div className="relative w-[500px] h-[500px] mx-auto">
              {/* … outer rings + inner circle as before … */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary via-accent to-highlight shadow-2xl">
                <div className="absolute inset-6 bg-white/98 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border-4 border-white/50">
                  <div className="text-center px-6">
                    <div className="text-7xl font-bold mb-4 text-gradient">PJK</div>
                    <div className="text-3xl font-bold text-primary mb-3 leading-tight">Prakrithi Jaiva Kalavara</div>
                    <div className="text-lg text-muted-foreground px-2 leading-tight">Premium Organic Excellence</div>
                    <div className="text-sm text-muted-foreground/80 mt-2">Farm to Table Quality</div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              {features.map((f, i) => {
                const Icon = f.icon;
                const ang = (i * 60) * (Math.PI / 180);
                const x = Math.cos(ang - Math.PI / 2) * R;
                let   y = Math.sin(ang - Math.PI / 2) * R;

                // responsive top-badge bump (index 0) only on md+
                const topBump = 0; // base
                if (i === 0) y += topBump;

                return (
                  <div
                    key={f.id}
                    className={`absolute z-10 ${i === 0 ? "top-badge" : ""}`}
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

            {/* Connectors resized to tablet/desktop */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800">
              <defs>
                <radialGradient id="lineG" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="hsl(var(--highlight))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              {features.map((_, i) => {
                const ang = (i * 60) * (Math.PI / 180);
                const cx = 600, cy = 400;
                let x2 = cx + Math.cos(ang - Math.PI / 2) * LINE_R;
                let y2 = cy + Math.sin(ang - Math.PI / 2) * LINE_R;
                if (i === 0) y2 += 10; // mirror small bump
                return (
                  <g key={i}>
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="url(#lineG)" strokeWidth="6" strokeDasharray="12,8" />
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="8,4" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* stats … keep as-is */}
      </div>

      {/* CSS-only responsive nudge for the top card on md/lg/xl (tablet/desktop) */}
      <style>{`
        @media (min-width: 768px) {  /* md */
          .top-badge { transform: translate(var(--tx,-50%), calc(var(--ty,-50%) + 14px)) !important; }
        }
        @media (min-width: 1024px) { /* lg */
          .top-badge { transform: translate(var(--tx,-50%), calc(var(--ty,-50%) + 22px)) !important; }
        }
        @media (min-width: 1280px) { /* xl */
          .top-badge { transform: translate(var(--tx,-50%), calc(var(--ty,-50%) + 28px)) !important; }
        }
      `}</style>
    </section>
  );
}
