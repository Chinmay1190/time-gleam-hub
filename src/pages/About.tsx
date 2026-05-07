import { motion } from "framer-motion";
import { Award, Target, Lightbulb, Shield, Users, Globe, Truck, HeartHandshake, Sparkles, ArrowRight, Star, Zap, Clock, CheckCircle, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import CountUp from "@/components/CountUp";

const About = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container-main px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" /> Established 2020
            </motion.div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Crafting the Future of
              <br />
              <span className="gold-gradient-text">Wearable Excellence</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              India's most trusted destination for premium smart watches. We curate the finest wearable technology
              from global brands, delivering innovation right to your wrist.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
                Explore Collection <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border bg-card/50 text-sm font-semibold hover:bg-muted transition-colors">
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <motion.div {...fadeUp} className="glass-card p-10 sm:p-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: "50K+", label: "Happy Customers", icon: Users },
              { value: "200+", label: "Watch Models", icon: Globe },
              { value: "500+", label: "Cities Served", icon: Truck },
              { value: "4.9★", label: "Average Rating", icon: Award },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="font-heading text-3xl sm:text-4xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div {...fadeUp} className="mb-24">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">Our Core Values</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              What We <span className="gold-gradient-text">Stand For</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Building trust through quality, innovation, and unwavering commitment to our customers.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Target, title: "Our Mission", desc: "Make premium smartwatch technology accessible to every Indian, breaking barriers of price and availability.", color: "from-blue-500/20 to-blue-500/5", iconBg: "bg-blue-500/10" },
              { icon: Lightbulb, title: "Innovation First", desc: "We partner with brands pushing the boundaries of wearable tech, bringing the latest innovations to you first.", color: "from-amber-500/20 to-amber-500/5", iconBg: "bg-amber-500/10" },
              { icon: Shield, title: "100% Authentic", desc: "Every product is sourced directly from manufacturers with full warranty. Zero tolerance for counterfeits.", color: "from-green-500/20 to-green-500/5", iconBg: "bg-green-500/10" },
              { icon: HeartHandshake, title: "Customer Love", desc: "Our dedicated support team ensures every customer feels valued. 24/7 assistance, hassle-free returns.", color: "from-pink-500/20 to-pink-500/5", iconBg: "bg-pink-500/10" },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 sm:p-10 relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${v.color} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl ${v.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <v.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">{v.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Promises */}
        <motion.div {...fadeUp} className="mb-24">
          <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">
                Our <span className="gold-gradient-text">Promises</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: CheckCircle, label: "Genuine Products", desc: "100% authentic watches" },
                { icon: Truck, label: "Free Shipping", desc: "On orders above Rs. 999" },
                { icon: Clock, label: "Fast Delivery", desc: "2-5 business days" },
                { icon: Zap, label: "Easy Returns", desc: "7-day hassle-free returns" },
              ].map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <p.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-heading font-bold mb-1">{p.label}</h4>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div {...fadeUp} className="max-w-3xl mx-auto mb-24">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">Milestones</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Our <span className="gold-gradient-text">Journey</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { year: "2020", event: "ChronoHub founded in Mumbai with a vision to democratize wearable tech.", highlight: "The Beginning" },
              { year: "2021", event: "Partnered with 15+ global brands. Crossed 10,000 happy customers.", highlight: "Rapid Growth" },
              { year: "2022", event: "Launched express delivery across 500+ Indian cities.", highlight: "Pan-India Reach" },
              { year: "2023", event: "Reached 50,000 customers. Introduced exclusive watch collections.", highlight: "Major Milestone" },
              { year: "2024", event: "Expanded to 200+ watch models. Launched premium membership program.", highlight: "New Era" },
            ].map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl flex items-center justify-center font-heading font-bold text-sm shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
                    '{t.year.slice(2)}
                  </div>
                  {i < 4 && <div className="w-px flex-1 bg-gradient-to-b from-primary/30 to-border min-h-[40px]" />}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t.highlight}</span>
                  <h3 className="font-heading font-bold text-lg mt-0.5">{t.year}</h3>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div {...fadeUp} className="mb-24">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3 block">Why Us</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              The ChronoHub <span className="gold-gradient-text">Difference</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Curated Selection", desc: "Every watch is hand-picked by our team of experts. We only list products that meet our quality standards.", icon: Star },
              { num: "02", title: "Best Price Guarantee", desc: "We match prices across all platforms. Found it cheaper elsewhere? We'll beat the price by 5%.", icon: Award },
              { num: "03", title: "Expert Support", desc: "Our watch specialists are available to help you choose the perfect timepiece for your needs.", icon: Users },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 sm:p-10 text-center group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <span className="font-heading text-6xl font-bold text-primary/10 group-hover:text-primary/25 transition-colors">{item.num}</span>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mt-2 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp} className="glass-card p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Ready to find your <span className="gold-gradient-text">perfect watch?</span>
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
              Explore our collection of 200+ premium watches from the world's best brands.
            </p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
