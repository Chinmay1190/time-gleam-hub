import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { ArrowRight, Zap, Shield, Battery, Bluetooth, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import heroWatch from "@/assets/hero-watch.png";
import watch1 from "@/assets/watch-1.png";
import watch2 from "@/assets/watch-2.png";
import watch3 from "@/assets/watch-3.png";
import { products, categories, brands } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";

const heroSlides = [
  {
    image: heroWatch,
    title: "Redefine Your",
    highlight: "Time.",
    subtitle: "Premium smart watches engineered for performance, designed for elegance.",
    badge: "New Collection 2025",
  },
  {
    image: watch1,
    title: "Track Your",
    highlight: "Fitness.",
    subtitle: "Advanced health monitoring with GPS, heart rate, and SpO₂ sensors.",
    badge: "Fitness Series",
  },
  {
    image: watch2,
    title: "Elevate Your",
    highlight: "Style.",
    subtitle: "Luxury smartwatches that blend fashion with cutting-edge technology.",
    badge: "Luxury Collection",
  },
  {
    image: watch3,
    title: "Conquer The",
    highlight: "Outdoors.",
    subtitle: "Rugged, GPS-enabled watches built for every adventure and extreme terrain.",
    badge: "Outdoor Edition",
  },
  {
    image: heroWatch,
    title: "Smart For",
    highlight: "Everyone.",
    subtitle: "From budget-friendly to ultra-premium — find the perfect watch for every wrist.",
    badge: "Best Sellers",
  },
];

const Index = () => {
  const trending = products.slice(0, 8);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smooth = (mv: MotionValue<number>) => useSpring(mv, { stiffness: 80, damping: 20, mass: 0.6 });

  // Parallax transforms — different layers move at different speeds
  const bgY = smooth(useTransform(scrollYProgress, [0, 1], [0, 200]));
  const blob1Y = smooth(useTransform(scrollYProgress, [0, 1], [0, 350]));
  const blob2Y = smooth(useTransform(scrollYProgress, [0, 1], [0, -250]));
  const textY = smooth(useTransform(scrollYProgress, [0, 1], [0, 150]));
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const imageY = smooth(useTransform(scrollYProgress, [0, 1], [0, -120]));
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const badge1Y = smooth(useTransform(scrollYProgress, [0, 1], [0, -180]));
  const badge2Y = smooth(useTransform(scrollYProgress, [0, 1], [0, -90]));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const slide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen">
      {/* Hero with Slider + Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: blob1Y }} className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none will-change-transform" />
        <motion.div style={{ y: blob2Y }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none will-change-transform" />
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 pointer-events-none opacity-[0.04] will-change-transform"
          aria-hidden
        >
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </motion.div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="container-main px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center pt-24 pb-16 relative z-10">
          <motion.div style={{ y: textY, opacity: textOpacity }} className="will-change-transform">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium"
            >
              <Zap className="w-4 h-4" /> {slide.badge}
            </motion.div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              {slide.title}
              <br />
              <span className="gold-gradient-text">{slide.highlight}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-secondary">
                Explore Features
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-4 pt-2">
              <button onClick={prevSlide} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? "w-8 bg-primary" : "w-3 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-2">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "200+", label: "Watch Models" },
                { value: "4.9★", label: "Avg Rating" },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="font-heading text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            key={`img-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px]" />
            <div className="relative">
              <img
                src={slide.image}
                alt="Premium Smart Watch"
                className="relative w-full max-w-lg animate-float drop-shadow-2xl"
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute top-1/4 -right-4 glass-card px-4 py-3 flex items-center gap-3 gold-glow-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Trending</p>
                  <p className="text-[10px] text-muted-foreground">#1 in India</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute bottom-1/4 -left-4 glass-card px-4 py-3 flex items-center gap-3"
              >
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card" />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold">50K+</p>
                  <p className="text-[10px] text-muted-foreground">Happy Users</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y border-border bg-card/40">
        <div className="container-main px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: "2 Year Warranty", sub: "Guaranteed" },
              { icon: Battery, label: "7-Day Battery", sub: "Long lasting" },
              { icon: Bluetooth, label: "Bluetooth 5.3", sub: "Fast pairing" },
              { icon: Zap, label: "Fast Charging", sub: "0-100% in 1hr" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium block">{f.label}</span>
                  <span className="text-[10px] text-muted-foreground">{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Explore</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Browse by <span className="gold-gradient-text">Category</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Find the perfect watch for your lifestyle</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to="/shop"
                  className="group glass-card-hover overflow-hidden flex flex-col hover:scale-[1.03] transition-transform duration-300"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="font-heading font-semibold text-sm block">{cat.name}</span>
                      <span className="text-[10px] text-muted-foreground">{cat.count} products</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="section-padding bg-card/30">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Popular</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
                Trending <span className="gold-gradient-text">Now</span>
              </h2>
              <p className="text-muted-foreground">Our most popular picks</p>
            </div>
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-12 border-y border-border overflow-hidden">
        <div className="flex marquee">
          {[...brands, ...brands, ...brands].map((b, i) => (
            <span
              key={i}
              className="text-2xl font-heading font-bold text-muted-foreground/20 whitespace-nowrap mx-10 hover:text-primary/30 transition-colors"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">Reviews</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="gold-gradient-text">Thousands</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Arjun K.", text: "Best smartwatch I've ever owned. The build quality is outstanding and the battery lasts forever!", rating: 5 },
              { name: "Priya S.", text: "ChronoHub made it so easy to find the perfect watch. Delivery was lightning fast!", rating: 5 },
              { name: "Rahul M.", text: "The Pulse Pro Ultra is a game-changer for my fitness routine. Highly recommend!", rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{review.text}"</p>
                <p className="text-sm font-heading font-semibold">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                Ready to upgrade your <span className="gold-gradient-text">wrist game?</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 50,000+ customers who trust ChronoHub for premium smart watches at the best prices.
              </p>
              <Link to="/shop" className="btn-primary">
                Shop the Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
