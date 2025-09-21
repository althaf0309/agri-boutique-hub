import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import FeaturesCircle from "@/components/FeaturesCircle";
import ProductGrid from "@/components/ProductGrid";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import honeyBundle from "@/assets/honey-bundle.jpg";
import organicCenterHero from "@/assets/organic-center-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="overflow-x-hidden">
        {/* Hero Slider */}
        <section className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
          <HeroSlider />
        </section>

        {/* Main Heading Section */}
        <section className="py-8 sm:py-12 lg:py-16 text-center overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-full">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 sm:mb-6 leading-tight break-words">
              Premium Organic Products
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 break-words">
              Discover the finest selection of organic groceries, natural personal care products, 
              and everything you need for a sustainable lifestyle. Farm-fresh quality delivered to your doorstep.
            </p>
          </div>
        </section>

        {/* Center Hero Image Section */}
        <section className="py-8 sm:py-12 lg:py-16 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-full">
            <div className="max-w-6xl mx-auto text-center">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl max-w-full">
                <img 
                  src={organicCenterHero} 
                  alt="Fresh Organic Vegetables and Fruits"
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover max-w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                  <div className="p-6 sm:p-8 lg:p-12 text-white w-full max-w-full">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4 break-words">
                      Farm Fresh Organic Goodness
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl mb-6 opacity-90 max-w-3xl mx-auto break-words">
                      Straight from certified organic farms to your table
                    </p>
                    <Link to="/shop">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
                        Explore Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Circle */}
        <FeaturesCircle />

        {/* First Product Grid */}
        <ProductGrid title="Featured Products" />

        {/* Listing Products Section */}
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

        {/* Second Product Grid */}
        <ProductGrid />

        {/* Best Seller Highlight */}
        <section className="py-8 sm:py-12 lg:py-16 bg-accent/10 overflow-x-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-full">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-4 sm:mb-6 break-words">
                Best Seller of the Month
              </h2>
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 card-farm max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div className="aspect-square bg-muted/50 rounded-lg overflow-hidden order-1 md:order-none max-w-full">
                    <img 
                      src={honeyBundle} 
                      alt="Organic Honey Bundle"
                      className="w-full h-full object-cover rounded-lg max-w-full"
                    />
                  </div>
                  <div className="text-center md:text-left space-y-3 sm:space-y-4 order-2 md:order-none max-w-full">
                    <div className="feature-badge inline-block">Best Seller</div>
                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-primary break-words">
                      Organic Honey Bundle Pack
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                      Premium collection of raw organic honey from different floral sources. 
                      Includes Wildflower, Acacia, and Eucalyptus honey varieties.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 flex-wrap">
                      <span className="text-xl sm:text-2xl font-bold text-primary">₹1,899</span>
                      <span className="text-base sm:text-lg text-muted-foreground line-through">₹2,299</span>
                      <span className="text-sm sm:text-base text-accent font-semibold">Save 17%</span>
                    </div>
                    <Link to="/product/bundle-honey" className="block">
                      <Button className="btn-accent-farm w-full sm:w-auto">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
