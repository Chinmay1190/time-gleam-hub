import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Clock, Package, CheckCircle } from "lucide-react";

const ShippingReturns = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Shipping & <span className="gold-gradient-text">Returns</span>
          </h1>
          <p className="text-muted-foreground">Fast delivery, hassle-free returns</p>
        </motion.div>

        {/* Shipping Highlights */}
        <motion.div {...fadeUp} className="grid sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹999" },
            { icon: Clock, title: "3-5 Days", desc: "Standard delivery across India" },
            { icon: Package, title: "Express Available", desc: "1-2 day delivery in metros" },
          ].map((item) => (
            <div key={item.title} className="glass-card-hover p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Shipping Details */}
        <motion.div {...fadeUp} className="glass-card p-8 mb-10">
          <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" /> Shipping Policy
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>We partner with India's top logistics providers — Delhivery, BlueDart, and DTDC — for safe and timely delivery.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 font-heading font-semibold text-foreground">Shipping Method</th>
                    <th className="py-3 pr-4 font-heading font-semibold text-foreground">Delivery Time</th>
                    <th className="py-3 font-heading font-semibold text-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-3 pr-4">Standard</td><td className="py-3 pr-4">3-5 business days</td><td className="py-3">Free (₹999+) / ₹99</td></tr>
                  <tr><td className="py-3 pr-4">Express (Metros)</td><td className="py-3 pr-4">1-2 business days</td><td className="py-3">₹199</td></tr>
                  <tr><td className="py-3 pr-4">Same Day (Mumbai)</td><td className="py-3 pr-4">Same day</td><td className="py-3">₹299</td></tr>
                </tbody>
              </table>
            </div>
            <p>All orders are dispatched within 24 hours (Mon-Sat). Sunday orders ship on Monday.</p>
          </div>
        </motion.div>

        {/* Returns Details */}
        <motion.div {...fadeUp} className="glass-card p-8 mb-10">
          <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-primary" /> Return Policy
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>We want you to love your purchase. If you're not completely satisfied, we've made returns simple:</p>
            <div className="grid sm:grid-cols-2 gap-4 my-6">
              {[
                "7-day easy return window",
                "Free return pickup from your doorstep",
                "Full refund to original payment method",
                "Refund processed within 5-7 business days",
                "Product must be unused with original packaging",
                "Warranty claims handled separately",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs">Note: Personalized/engraved products are non-returnable. Damaged products during transit are eligible for immediate replacement.</p>
          </div>
        </motion.div>

        {/* Warranty */}
        <motion.div {...fadeUp} className="glass-card p-8">
          <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" /> Warranty Information
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>Every smartwatch purchased from ChronoHub comes with manufacturer warranty:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-foreground">Apple, Samsung, Garmin:</strong> 2-year warranty</li>
              <li><strong className="text-foreground">Fossil, Fitbit:</strong> 1-year warranty</li>
              <li><strong className="text-foreground">Noise, Fire-Boltt, boAt:</strong> 1-year warranty</li>
            </ul>
            <p>Warranty covers manufacturing defects only. Physical damage, water damage (beyond rated resistance), and unauthorized repairs are not covered.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingReturns;
