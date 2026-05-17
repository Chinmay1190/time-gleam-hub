import { motion } from "framer-motion";
import { Star, ArrowRight, ShieldCheck, Truck, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { brandData, products } from "@/data/products";

// Brand identity map — gradient + monogram styling per brand
const brandStyles: Record<string, { mark: string; from: string; to: string; ring: string; font: string }> = {
  Apple:       { mark: "",     from: "#3a3a3c", to: "#1d1d1f", ring: "#a1a1a6", font: "font-heading tracking-tight" },
  Samsung:     { mark: "SAMSUNG", from: "#1428a0", to: "#0a1670", ring: "#5b7fff", font: "font-heading tracking-[0.18em] text-[10px]" },
  Garmin:      { mark: "GARMIN",  from: "#007cc3", to: "#003a6b", ring: "#4ab0ff", font: "font-heading tracking-[0.22em] text-[10px]" },
  Fossil:      { mark: "FOSSIL",  from: "#8b5a2b", to: "#3d2817", ring: "#d4a574", font: "font-heading tracking-[0.28em] text-[10px]" },
  Fitbit:      { mark: "fitbit",  from: "#00b0b9", to: "#005f66", ring: "#5be2ea", font: "font-heading tracking-tight text-sm" },
  Noise:       { mark: "NOISE",   from: "#ff3366", to: "#a3163f", ring: "#ff7a99", font: "font-heading tracking-[0.25em] text-[10px]" },
  "Fire-Boltt":{ mark: "FIRE", from: "#ff6b00", to: "#b03c00", ring: "#ffa055", font: "font-heading tracking-[0.28em] text-[10px]" },
  boAt:        { mark: "boAt",    from: "#c8102e", to: "#6f0a1e", ring: "#ff5870", font: "font-heading tracking-tight text-base italic" },
};

// Lucide Apple-style logo for the Apple tile only
const AppleMark = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white/90" aria-hidden>
    <path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3-.79.85-2.07 1.5-3.1 1.42-.12-1.1.45-2.27 1.16-3 .8-.85 2.18-1.47 3.15-1.42zM20.86 17.4c-.5 1.16-.74 1.68-1.38 2.71-.9 1.45-2.16 3.25-3.73 3.26-1.4.01-1.76-.92-3.66-.91-1.9.01-2.29.93-3.69.92-1.56-.01-2.77-1.65-3.66-3.09C2.27 17.43 1.92 13 3.36 10.6c1.02-1.7 2.62-2.7 4.12-2.7 1.53 0 2.5.83 3.77.83 1.23 0 1.98-.84 3.76-.84 1.34 0 2.76.73 3.78 2-3.33 1.82-2.79 6.58.07 7.51z" />
  </svg>
);

const Brands = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  const totalProducts = products.length;
  const avgRating = (brandData.reduce((s, b) => s + b.rating, 0) / brandData.length).toFixed(1);
  const featuredProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl mb-10 p-10 md:p-14 border border-border/60">
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

        {/* Logo Marquee Strip */}
        <motion.div {...fadeUp} className="mb-14">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">Trusted by enthusiasts worldwide</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {brandData.map((b, i) => {
              const s = brandStyles[b.name];
              return (
                <Link
                  key={b.name}
                  to={`/shop?brand=${encodeURIComponent(b.name)}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border/60 flex items-center justify-center transition-all hover:scale-105 hover:border-accent/50"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ boxShadow: `inset 0 0 30px ${s.ring}40, 0 0 30px ${s.ring}30` }} />
                  {b.name === "Apple" ? (
                    <AppleMark />
                  ) : (
                    <span className={`text-white ${s.font} font-bold`}>{s.mark}</span>
                  )}
                  <span className="absolute bottom-1 right-2 text-[8px] text-white/60 font-semibold tracking-wider">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Brands Grid — large cards with logo header + product strip */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {brandData.map((brand, i) => {
            const brandProducts = products.filter((p) => p.brand === brand.name);
            const s = brandStyles[brand.name];
            return (
              <motion.div
                key={brand.name}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover overflow-hidden flex flex-col"
              >
                {/* Branded header strip */}
                <div
                  className="relative h-24 flex items-center justify-between px-6 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                >
                  <div className="absolute inset-0 opacity-30"
                       style={{ background: `radial-gradient(circle at 80% 50%, ${s.ring}60, transparent 60%)` }} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                      {brand.name === "Apple" ? (
                        <AppleMark />
                      ) : (
                        <span className={`text-white ${s.font} font-bold`}>{s.mark}</span>
                      )}
                    </div>
                    <div className="text-white">
                      <h2 className="font-heading text-xl font-bold leading-tight">{brand.name}</h2>
                      <p className="text-[11px] opacity-80 italic">{brand.tagline}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-1 px-3 py-1.5 bg-white/15 backdrop-blur rounded-full border border-white/20">
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                    <span className="text-sm font-bold text-white">{brand.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{brand.description}</p>

                  {/* Product image grid - 4 products */}
                  {brandProducts.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {brandProducts.slice(0, 4).map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.id}`}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted/40 to-muted/10 border border-border/40 hover:border-accent/60 transition-all"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] text-white font-semibold truncate">{p.name}</p>
                            <p className="text-[9px] text-accent font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      <span className="text-foreground font-semibold">{brand.products}</span> products available
                    </span>
                    <Link
                      to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                      className="inline-flex items-center gap-1 text-sm text-accent font-semibold hover:gap-2 transition-all"
                    >
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Featured Watches Showcase */}
        <motion.div {...fadeUp} className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] block">Showcase</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">
                Top-Rated <span className="gold-gradient-text">Across Brands</span>
              </h2>
            </div>
            <Link to="/shop" className="text-sm text-accent font-semibold hover:underline hidden sm:inline-flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((p, i) => (
              <motion.div
                key={p.id}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/product/${p.id}`}
                  className="group block glass-card-hover overflow-hidden"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/10 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {p.badge}
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-background/70 backdrop-blur">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="text-[10px] font-bold">{p.rating}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.brand}</p>
                    <p className="text-sm font-semibold truncate group-hover:text-accent transition-colors">{p.name}</p>
                    <p className="text-sm font-bold gold-gradient-text mt-1">₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: ShieldCheck, label: "100% Authentic", sub: "Direct from brands" },
            { icon: Award, label: "Brand Warranty", sub: "Full manufacturer cover" },
            { icon: Truck, label: "Fast Delivery", sub: "Free above ₹2,000" },
            { icon: Sparkles, label: "Premium Service", sub: "7-day easy returns" },
          ].map((t) => (
            <div key={t.label} className="glass-card p-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <t.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">{t.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} className="glass-card p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
          <h2 className="relative font-heading text-3xl font-bold mb-3">
            Can't decide? <span className="gold-gradient-text">We'll help.</span>
          </h2>
          <p className="relative text-muted-foreground mb-6 max-w-md mx-auto">
            Our experts can recommend the perfect smartwatch based on your lifestyle and budget.
          </p>
          <Link
            to="/contact"
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-heading font-semibold rounded-2xl hover:scale-105 transition-transform"
          >
            Get Expert Advice <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Brands;
