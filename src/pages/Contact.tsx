import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Headphones, ArrowRight, CheckCircle, Globe, Shield, Instagram, Twitter, Facebook, Youtube, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const inputClass = "w-full px-5 py-3.5 bg-muted/50 rounded-xl text-sm outline-none focus:ring-2 ring-primary/50 border border-border focus:border-primary transition-all placeholder:text-muted-foreground/60";

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container-main px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8"
            >
              <MessageCircle className="w-4 h-4" /> We're here to help
            </motion.div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Get in <span className="gold-gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">Have a question or feedback? We'd love to hear from you. Our team responds within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Mail, title: "Email Us", info: "hello@chronohub.in", sub: "We reply within 24 hours", color: "from-blue-500/20 to-blue-500/5" },
            { icon: Phone, title: "Call Us", info: "+91 98765 43210", sub: "Mon-Sat, 10am-7pm IST", color: "from-green-500/20 to-green-500/5" },
            { icon: MapPin, title: "Visit Us", info: "Mumbai, Maharashtra", sub: "By appointment only", color: "from-purple-500/20 to-purple-500/5" },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 text-center relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${c.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <c.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{c.title}</h3>
                <p className="text-sm font-semibold text-foreground">{c.info}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{c.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form + Sidebar */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 glass-card p-8 sm:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            <h2 className="font-heading text-2xl font-bold mb-2">Send us a message</h2>
            <p className="text-sm text-muted-foreground mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Thank you for reaching out. Our team will review your message and respond shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name</label>
                    <input
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                    <input
                      placeholder="john@example.com"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                  <input
                    placeholder="What's this about?"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
                  <textarea
                    placeholder="Tell us more..."
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">Business Hours</h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { day: "Monday - Friday", time: "10:00 AM - 7:00 PM" },
                  { day: "Saturday", time: "10:00 AM - 5:00 PM" },
                  { day: "Sunday", time: "Closed" },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-semibold">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">Quick Help</h3>
              </div>
              <div className="space-y-2">
                {[
                  { q: "Track your order", link: "/orders" },
                  { q: "Shipping & Returns", link: "/shipping-returns" },
                  { q: "FAQs", link: "/faq" },
                ].map((item) => (
                  <Link
                    key={item.q}
                    to={item.link}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-muted/50 transition-colors text-sm group"
                  >
                    <span className="font-medium">{item.q}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="glass-card p-7 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
              <h3 className="font-heading font-bold text-lg mb-2">Emergency Support?</h3>
              <p className="text-sm text-muted-foreground mb-5">For urgent order issues, reach us directly.</p>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: "Secure Shopping", sub: "256-bit SSL" },
              { icon: Globe, label: "Pan India", sub: "500+ Cities" },
              { icon: CheckCircle, label: "100% Genuine", sub: "Verified Products" },
              { icon: Headphones, label: "24/7 Support", sub: "Always Available" },
            ].map((b, i) => (
              <div key={b.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading font-bold text-sm">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
