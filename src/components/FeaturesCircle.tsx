const features = [
  { id: 1, title: "100% Organic", icon: "🌱", position: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { id: 2, title: "Farm Fresh", icon: "🚜", position: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2" },
  { id: 3, title: "Pesticide Free", icon: "🚫", position: "bottom-0 right-0 translate-x-1/2 translate-y-1/2" },
  { id: 4, title: "Cold Chain", icon: "❄️", position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
  { id: 5, title: "Fast Delivery", icon: "🚚", position: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2" },
  { id: 6, title: "Easy Returns", icon: "↩️", position: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" }
];

export default function FeaturesCircle() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Main Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Why choose AgriFresh for your organic and sustainable lifestyle needs
          </p>
        </div>

        {/* Features Circle */}
        <div className="relative max-w-2xl mx-auto">
          {/* Center Brand Circle */}
          <div className="relative w-64 h-64 mx-auto">
            <div className="w-full h-full bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="text-center text-primary-foreground">
                <div className="text-4xl font-bold mb-2">AF</div>
                <div className="text-sm font-medium">AgriFresh</div>
                <div className="text-xs opacity-80">Organic Excellence</div>
              </div>
            </div>

            {/* Feature Badges */}
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`absolute ${feature.position} z-10`}
              >
                <div className="bg-white rounded-full p-4 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <div className="text-sm font-semibold text-primary whitespace-nowrap">
                      {feature.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
            <defs>
              <radialGradient id="lineGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(120 60% 12%)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(120 60% 12%)" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            {features.map((_, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const x1 = 200;
              const y1 = 200;
              const x2 = 200 + Math.cos(angle - Math.PI/2) * 120;
              const y2 = 200 + Math.sin(angle - Math.PI/2) * 120;
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}