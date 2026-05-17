import { motion } from "framer-motion";
import { Star, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { brandData, products } from "@/data/products";

const Brands = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  const totalProducts = products.length;
  const avgRating = (brandData.reduce((s, b) => s + b.rating, 0) / brandData.length).toFixed(1);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl mb-12 p-10 md:p-14 border border-border/60">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background to-accent/20" />
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-accent/25 blur-[120px]" />
          <div className="absolute -bottom-24 -left-16 w-96 h-96 rounded-full bg-primary/25 blur-[120px]" />
          <div className="relative text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] mb-3 block">Authorised Partners</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
              Our <span className="gold-gradient-text">Partner Brands</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We curate the finest smart watches from the world's most trusted brands.
              Every product is 100% authentic with manufacturer warranty.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
              {[
                { label: "Brands", value: brandData.length + "+" },
                { label: "Products", value: totalProducts + "+" },
                { label: "Avg Rating", value: avgRating + "★" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-3">
                  <div className="font-heading text-2xl font-bold gold-gradient-text">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Brands Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {brandData.map((brand, i) => {
            const brandProducts = products.filter((p) => p.brand === brand.name);
            return (
              <motion.div
                key={brand.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6 sm:p-8 flex flex-col gap-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-bold">{brand.name}</h2>
                    <p className="text-sm text-primary font-medium mt-0.5">{brand.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm font-bold text-primary">{brand.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{brand.description}</p>

                {/* Sample products */}
                {brandProducts.length > 0 && (
                  <div className="flex gap-3 overflow-hidden">
                    {brandProducts.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 hover:ring-2 ring-primary transition-all"
                      >
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{brand.products} products available</span>
                  <Link
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
                  >
                    Shop {brand.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div {...fadeUp} className="glass-card p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <h2 className="font-heading text-3xl font-bold mb-3">
            Can't decide? <span className="gold-gradient-text">We'll help.</span>
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our experts can recommend the perfect smartwatch based on your lifestyle and budget.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-heading font-semibold rounded-2xl hover:scale-105 transition-transform"
          >
            Get Expert Advice <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Brands;
