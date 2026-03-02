import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Headphones, ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";

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
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container-main px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6"
            >
              <MessageCircle className="w-4 h-4" /> We're here to help
            </motion.div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
              Get in <span className="gold-gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>
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
              className="glass-card p-7 text-center relative overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${c.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <c.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">{c.title}</h3>
                <p className="text-sm font-medium text-foreground">{c.info}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form + FAQ side by side */}
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
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you soon.</p>
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

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold">Business Hours</h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { day: "Monday - Friday", time: "10:00 AM - 7:00 PM" },
                  { day: "Saturday", time: "10:00 AM - 5:00 PM" },
                  { day: "Sunday", time: "Closed" },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold">Quick Help</h3>
              </div>
              <div className="space-y-3">
                {[
                  { q: "Track your order", link: "/orders" },
                  { q: "Shipping & Returns", link: "/shipping-returns" },
                  { q: "FAQs", link: "/faq" },
                ].map((item) => (
                  <a
                    key={item.q}
                    href={item.link}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors text-sm group"
                  >
                    <span>{item.q}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card p-7 bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="font-heading font-bold mb-2">Emergency Support?</h3>
              <p className="text-sm text-muted-foreground mb-4">For urgent order issues, reach us directly.</p>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] transition-transform"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
