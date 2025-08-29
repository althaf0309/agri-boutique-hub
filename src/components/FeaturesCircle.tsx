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
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-highlight rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Why Choose AgriFresh?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the difference with our commitment to quality, sustainability, and customer satisfaction
          </p>
        </div>

        {/* Enhanced Features Circle */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center Brand Circle with enhanced design */}
          <div className="feature-circle glow-effect">
            {/* Inner content */}
            <div className="absolute inset-4 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="text-5xl font-bold mb-3 text-gradient">AF</div>
                <div className="text-lg font-bold text-primary mb-1">AgriFresh</div>
                <div className="text-sm text-muted-foreground px-4 leading-tight">
                  Premium Organic Excellence
                </div>
                <div className="flex justify-center mt-3 space-x-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-highlight rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Rotating border effect */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-accent via-primary to-highlight bg-clip-border animate-spin" style={{animationDuration: '20s'}}></div>
          </div>

          {/* Enhanced Feature Badges with better positioning */}
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const angle = (index * 60) * (Math.PI / 180);
            const radius = 200; // Distance from center
            const x = Math.cos(angle - Math.PI/2) * radius;
            const y = Math.sin(angle - Math.PI/2) * radius;
            
            return (
              <div
                key={feature.id}
                className="feature-badge-floating"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
              >
                <div className="text-center min-w-[140px]">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-muted to-background flex items-center justify-center ${feature.color} shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-primary mb-1">
                    {feature.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {feature.description}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Animated connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
            <defs>
              <radialGradient id="enhancedLineGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--highlight))" stopOpacity="0.1" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {features.map((_, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const x1 = 400;
              const y1 = 300;
              const x2 = 400 + Math.cos(angle - Math.PI/2) * 180;
              const y2 = 300 + Math.sin(angle - Math.PI/2) * 180;
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#enhancedLineGradient)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  filter="url(#glow)"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: '3s'
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "500+", label: "Organic Products" },
            { number: "50+", label: "Partner Farms" },
            { number: "24/7", label: "Customer Support" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}