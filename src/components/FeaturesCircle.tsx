import { Leaf, Truck, Shield, Snowflake, Clock, RotateCcw } from "lucide-react";

const features = [
  { 
    id: 1, 
    title: "100% Organic", 
    description: "Certified organic products",
    icon: Leaf, 
    position: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    color: "text-accent"
  },
  { 
    id: 2, 
    title: "Farm Fresh", 
    description: "Direct from sustainable farms",
    icon: Truck, 
    position: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
    color: "text-primary"
  },
  { 
    id: 3, 
    title: "Pesticide Free", 
    description: "Natural & chemical-free",
    icon: Shield, 
    position: "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    color: "text-accent"
  },
  { 
    id: 4, 
    title: "Cold Chain", 
    description: "Temperature controlled delivery",
    icon: Snowflake, 
    position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    color: "text-primary"
  },
  { 
    id: 5, 
    title: "Fast Delivery", 
    description: "Same-day delivery available",
    icon: Clock, 
    position: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    color: "text-highlight"
  },
  { 
    id: 6, 
    title: "Easy Returns", 
    description: "Hassle-free return policy",
    icon: RotateCcw, 
    position: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
    color: "text-secondary"
  }
];

export default function FeaturesCircle() {
  return (
    <section className="py-32 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-highlight rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-56 h-56 bg-secondary rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="text-gradient">Why Choose AgriFresh?</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Experience the difference with our commitment to quality, sustainability, and customer satisfaction
          </p>
        </div>

        {/* Massive Enhanced Features Circle */}
        <div className="relative max-w-7xl mx-auto min-h-[800px] flex items-center justify-center">
          {/* Center Brand Circle - Much Larger */}
          <div className="relative w-96 h-96 md:w-[500px] md:h-[500px] mx-auto">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-r from-accent via-primary to-highlight animate-spin" style={{animationDuration: '30s'}}></div>
            
            {/* Middle rotating ring - opposite direction */}
            <div className="absolute inset-4 rounded-full border-6 border-transparent bg-gradient-to-r from-highlight via-secondary to-accent animate-spin" style={{animationDuration: '40s', animationDirection: 'reverse'}}></div>
            
            {/* Main circle with enhanced gradient */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary via-accent to-highlight shadow-2xl glow-effect">
              {/* Inner content circle */}
              <div className="absolute inset-6 bg-white/98 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border-4 border-white/50">
                <div className="text-center">
                  <div className="text-6xl md:text-8xl font-bold mb-4 text-gradient animate-pulse">AF</div>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">AgriFresh</div>
                  <div className="text-base md:text-lg text-muted-foreground px-6 leading-tight">
                    Premium Organic Excellence
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground/80 mt-2">
                    Farm to Table Quality
                  </div>
                  <div className="flex justify-center mt-6 space-x-2">
                    <div className="w-4 h-4 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="w-4 h-4 bg-highlight rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Feature Badges - Larger and more spaced */}
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const angle = (index * 60) * (Math.PI / 180);
              const radius = 320; // Much larger radius
              const x = Math.cos(angle - Math.PI/2) * radius;
              const y = Math.sin(angle - Math.PI/2) * radius;
              
              return (
                <div
                  key={feature.id}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                  }}
                >
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-border/50 hover:shadow-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 backdrop-blur-sm bg-white/95 min-w-[200px]">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center ${feature.color} shadow-lg hover:shadow-xl transition-all duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="text-lg font-bold text-primary mb-2">
                        {feature.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-tight">
                        {feature.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced animated connecting lines with multiple layers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800">
            <defs>
              <radialGradient id="enhancedLineGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="70%" stopColor="hsl(var(--highlight))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
              </radialGradient>
              <filter id="enhancedGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {features.map((_, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const x1 = 600;
              const y1 = 400;
              const x2 = 600 + Math.cos(angle - Math.PI/2) * 280;
              const y2 = 400 + Math.sin(angle - Math.PI/2) * 280;
              
              return (
                <g key={index}>
                  {/* Outer glow line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#enhancedLineGradient)"
                    strokeWidth="6"
                    strokeDasharray="12,8"
                    filter="url(#enhancedGlow)"
                    className="animate-pulse"
                    style={{
                      animationDelay: `${index * 0.3}s`,
                      animationDuration: '4s'
                    }}
                  />
                  {/* Inner solid line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                    style={{
                      animationDelay: `${index * 0.3 + 0.5}s`,
                      animationDuration: '3s'
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Enhanced trust indicators with better spacing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 max-w-6xl mx-auto">
          {[
            { number: "10K+", label: "Happy Customers", icon: "👥" },
            { number: "500+", label: "Organic Products", icon: "🌱" },
            { number: "50+", label: "Partner Farms", icon: "🚜" },
            { number: "24/7", label: "Customer Support", icon: "📞" }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3">{stat.number}</div>
              <div className="text-base md:text-lg text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}