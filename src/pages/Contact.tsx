import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Get in <span className="gold-gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground">Have a question? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Mail, title: "Email Us", info: "hello@chronohub.in", sub: "We reply within 24 hours" },
            { icon: Phone, title: "Call Us", info: "+91 98765 43210", sub: "Mon-Sat, 10am-7pm" },
            { icon: MapPin, title: "Visit Us", info: "Mumbai, India", sub: "By appointment only" },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 text-center space-y-3"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold">{c.title}</h3>
              <p className="text-sm font-medium">{c.info}</p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-8 max-w-xl mx-auto">
          <h2 className="font-heading text-xl font-semibold mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Your Name" required className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary" />
            <input placeholder="Email Address" type="email" required className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary" />
            <input placeholder="Subject" required className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary" />
            <textarea placeholder="Your Message" rows={4} required className="w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary resize-none" />
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-heading font-semibold transition-all duration-300 ${
                sent ? "bg-green-600 text-foreground" : "bg-primary text-primary-foreground hover:scale-[1.02]"
              }`}
            >
              {sent ? "Message Sent! ✓" : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
