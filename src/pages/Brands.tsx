import { motion } from "framer-motion";
import { Star, ArrowRight, ShieldCheck, Truck, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { brandData, products } from "@/data/products";

// Brand identity map — gradient + monogram styling per brand
const brandStyles: Record<string, { from: string; to: string; ring: string }> = {
  Apple:        { from: "#3a3a3c", to: "#0a0a0c", ring: "#a1a1a6" },
  Samsung:      { from: "#1428a0", to: "#070d4a", ring: "#5b7fff" },
  Garmin:       { from: "#007cc3", to: "#003158", ring: "#4ab0ff" },
  Fossil:       { from: "#8b5a2b", to: "#2a1810", ring: "#d4a574" },
  Fitbit:       { from: "#00b0b9", to: "#003a44", ring: "#5be2ea" },
  Noise:        { from: "#ff3366", to: "#7a0e2c", ring: "#ff7a99" },
  "Fire-Boltt": { from: "#ff6b00", to: "#8a2e00", ring: "#ffa055" },
  boAt:         { from: "#c8102e", to: "#52071a", ring: "#ff5870" },
};

// Refined brand SVG marks — closer to actual brand identities
const BrandLogoMark = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  switch (name) {
    case "Apple":
      return (
        <svg viewBox="0 0 24 24" className={`${dim} fill-white drop-shadow-md`} aria-hidden>
          <path d="M17.05 12.04c-.03-3.05 2.49-4.51 2.6-4.58-1.41-2.07-3.62-2.35-4.41-2.39-1.88-.19-3.66 1.1-4.62 1.1-.95 0-2.42-1.07-3.97-1.04-2.04.03-3.93 1.19-4.98 3.02-2.12 3.68-.54 9.13 1.53 12.12 1.01 1.46 2.22 3.11 3.81 3.05 1.53-.06 2.11-.99 3.97-.99s2.38.99 4 .96c1.65-.03 2.7-1.49 3.71-2.96 1.17-1.7 1.65-3.35 1.68-3.44-.04-.02-3.22-1.24-3.32-4.85zM14.11 4.55c.85-1.03 1.42-2.46 1.27-3.88-1.22.05-2.71.81-3.59 1.83-.78.91-1.47 2.38-1.29 3.77 1.37.11 2.76-.69 3.61-1.72z"/>
        </svg>
      );
    case "Samsung":
      return (
        <svg viewBox="0 0 80 24" className={`${size === "lg" ? "w-20 h-6" : "w-16 h-5"}`} aria-hidden>
          <rect x="0" y="0" width="80" height="24" rx="12" className="fill-white/10" />
          <text x="40" y="16" textAnchor="middle" className="fill-white" fontSize="11" fontWeight="900" letterSpacing="1.8" fontFamily="Arial, sans-serif">SAMSUNG</text>
        </svg>
      );
    case "Garmin":
      return (
        <svg viewBox="0 0 24 24" className={`${dim} fill-white drop-shadow-md`} aria-hidden>
          <path d="M12 2L1.5 21.5h21L12 2zm0 4.8l7.2 13.5H4.8L12 6.8z"/>
          <circle cx="12" cy="15" r="1.5"/>
        </svg>
      );
    case "Fossil":
      return (
        <svg viewBox="0 0 70 24" className={`${size === "lg" ? "w-20 h-6" : "w-16 h-5"}`} aria-hidden>
          <text x="35" y="17" textAnchor="middle" className="fill-white" fontSize="13" fontWeight="900" letterSpacing="2.5" fontFamily="Georgia, serif">FOSSIL</text>
        </svg>
      );
    case "Fitbit":
      return (
        <svg viewBox="0 0 24 24" className={`${dim} fill-white drop-shadow-md`} aria-hidden>
          <circle cx="3" cy="12" r="1.5"/>
          <circle cx="8" cy="7" r="1.8"/><circle cx="8" cy="12" r="2"/><circle cx="8" cy="17" r="1.8"/>
          <circle cx="13" cy="4.5" r="2"/><circle cx="13" cy="12" r="2.5"/><circle cx="13" cy="19.5" r="2"/>
          <circle cx="18" cy="7" r="1.8"/><circle cx="18" cy="12" r="2"/><circle cx="18" cy="17" r="1.8"/>
          <circle cx="23" cy="12" r="1.5"/>
        </svg>
      );
    case "Noise":
      return (
        <svg viewBox="0 0 70 24" className={`${size === "lg" ? "w-20 h-6" : "w-16 h-5"}`} aria-hidden>
          <text x="35" y="17" textAnchor="middle" className="fill-white" fontSize="13" fontWeight="900" letterSpacing="1.5" fontFamily="Impact, sans-serif">NOISE</text>
        </svg>
      );
    case "Fire-Boltt":
      return (
        <svg viewBox="0 0 24 24" className={`${dim} fill-white drop-shadow-md`} aria-hidden>
          <path d="M13.5 1.5c-1 3 1 4 1 6.5C14.5 10 13 11 13 11s-.5-1.5-2-2c1 3-2 4-2 7 0 3.6 3 6.5 6.5 6.5S22 19.6 22 16c0-5-4-7.5-4-10.5 0-2-1.5-3.5-4.5-4z"/>
        </svg>
      );
    case "boAt":
      return (
        <svg viewBox="0 0 60 24" className={`${size === "lg" ? "w-16 h-6" : "w-12 h-5"}`} aria-hidden>
          <text x="30" y="18" textAnchor="middle" className="fill-white" fontSize="16" fontWeight="900" fontStyle="italic" fontFamily="Arial Black, sans-serif">boAt</text>
        </svg>
      );
    default:
      return null;
  }
};




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
    .slice(0, 12);

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
                  <BrandLogoMark name={b.name} size="md" />

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
                      <BrandLogoMark name={brand.name} size="lg" />
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

                  {/* Product image grid - 6 products */}
                  {brandProducts.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {brandProducts.slice(0, 6).map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.id}`}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted/40 to-muted/10 border border-border/40 hover:border-accent/60 transition-all"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0.5 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[8px] text-white font-semibold truncate">{p.name}</p>
                            <p className="text-[8px] text-accent font-bold">₹{(p.price/1000).toFixed(0)}k</p>
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
