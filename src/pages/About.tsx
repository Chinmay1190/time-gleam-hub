import { motion } from "framer-motion";
import { Award, Target, Lightbulb, Shield } from "lucide-react";

const About = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">
            About <span className="gold-gradient-text">ChronoHub</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            India's most trusted destination for premium smart watches. We curate the finest wearable technology
            from global brands, delivering innovation to your wrist.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Target, title: "Our Mission", desc: "Make premium smartwatch technology accessible to every Indian." },
            { icon: Lightbulb, title: "Innovation", desc: "We partner with brands pushing the boundaries of wearable tech." },
            { icon: Shield, title: "Trust", desc: "100% authentic products with manufacturer warranty guaranteed." },
            { icon: Award, title: "Quality", desc: "Every product undergoes rigorous quality checks before delivery." },
          ].map((v, i) => (
            <motion.div key={v.title} {...fadeUp} transition={{ delay: i * 0.1 }} className="glass-card-hover p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div {...fadeUp} className="max-w-2xl mx-auto mb-20">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">
            Our <span className="gold-gradient-text">Journey</span>
          </h2>
          <div className="space-y-8">
            {[
              { year: "2020", event: "ChronoHub founded in Mumbai with a vision to democratize wearable tech." },
              { year: "2021", event: "Partnered with 15+ global brands. Crossed 10,000 happy customers." },
              { year: "2022", event: "Launched express delivery across 500+ Indian cities." },
              { year: "2023", event: "Reached 50,000 customers. Introduced exclusive watch collections." },
              { year: "2024", event: "Expanded to 200+ watch models. Launched premium membership program." },
            ].map((t, i) => (
              <motion.div key={t.year} {...fadeUp} transition={{ delay: i * 0.1 }} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-heading font-bold text-xs">
                    {t.year.slice(2)}
                  </div>
                  {i < 4 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6">
                  <span className="font-heading font-bold text-primary">{t.year}</span>
                  <p className="text-sm text-muted-foreground mt-1">{t.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust */}
        <motion.div {...fadeUp} className="glass-card p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl font-bold mb-6">Trusted by 50,000+ Customers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Customers" },
              { value: "200+", label: "Watch Models" },
              { value: "500+", label: "Cities Served" },
              { value: "4.9★", label: "Average Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-heading text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
