import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import FeaturesCircle from "@/components/FeaturesCircle";
import ProductGrid from "@/components/ProductGrid";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Slider */}
        <section className="container mx-auto px-4 py-8">
          <HeroSlider />
        </section>

        {/* Main Heading Section */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Premium Organic Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover the finest selection of organic groceries, natural personal care products, 
              and everything you need for a sustainable lifestyle. Farm-fresh quality delivered to your doorstep.
            </p>
          </div>
        </section>

        {/* Features Circle */}
        <FeaturesCircle />

        {/* First Product Grid */}
        <ProductGrid title="Featured Products" />

        {/* Listing Products Section */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Listing the Product
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore our complete range of certified organic products
            </p>
          </div>
        </section>

        {/* Second Product Grid */}
        <ProductGrid />

        {/* Best Seller Highlight */}
        <section className="py-16 bg-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Best Seller of the Month
              </h2>
              <div className="bg-card rounded-2xl p-8 card-farm">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                    <img 
                      src="/api/placeholder/400/400" 
                      alt="Organic Honey Bundle"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="text-left space-y-4">
                    <div className="feature-badge inline-block">Best Seller</div>
                    <h3 className="text-2xl font-bold text-primary">
                      Organic Honey Bundle Pack
                    </h3>
                    <p className="text-muted-foreground">
                      Premium collection of raw organic honey from different floral sources. 
                      Includes Wildflower, Acacia, and Eucalyptus honey varieties.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="price-tag">₹1,899</span>
                      <span className="text-muted-foreground line-through">₹2,299</span>
                      <span className="text-accent font-semibold">Save 17%</span>
                    </div>
                    <Link to="/product/bundle-honey">
                      <Button className="btn-accent-farm">
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
