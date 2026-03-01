import { motion } from "framer-motion";
import { FileText, ShoppingCart, Truck, RotateCcw, CreditCard, AlertTriangle } from "lucide-react";

const TermsOfService = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container-main px-4 sm:px-6 lg:px-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
          Terms of <span className="gold-gradient-text">Service</span>
        </h1>
        <p className="text-muted-foreground">Last updated: March 2025</p>
      </motion.div>

      <div className="space-y-8">
        {[
          { icon: FileText, title: "General Terms", content: "By accessing and using ChronoHub (chronohub.in), you agree to be bound by these Terms of Service. ChronoHub is operated by ChronoHub Technologies Pvt. Ltd., registered in Mumbai, India. We reserve the right to modify these terms at any time. Continued use of the site constitutes acceptance of updated terms." },
          { icon: ShoppingCart, title: "Orders & Pricing", content: "All prices are listed in Indian Rupees (₹) and include applicable GST. Prices are subject to change without notice. We reserve the right to cancel orders due to pricing errors, stock unavailability, or suspected fraudulent activity. Order confirmation emails do not constitute acceptance — your order is confirmed only upon dispatch." },
          { icon: CreditCard, title: "Payment Terms", content: "We accept payments via UPI, credit/debit cards, net banking, and select wallets. EMI options are available on eligible cards. All payments are processed securely through authorized payment gateways. Refunds for cancelled/returned orders are processed to the original payment method within 5-7 business days." },
          { icon: Truck, title: "Shipping & Delivery", content: "We aim to dispatch all orders within 24 hours (Mon-Sat). Delivery timelines are estimates and may vary due to logistics or unforeseen circumstances. Risk of loss passes to you upon delivery. Please inspect packages upon receipt and report any damage within 24 hours." },
          { icon: RotateCcw, title: "Returns & Refunds", content: "Products may be returned within 7 days of delivery provided they are unused, in original packaging with all accessories. Refunds are processed after inspection of the returned product. Shipping charges are non-refundable. Personalized products cannot be returned." },
          { icon: AlertTriangle, title: "Limitation of Liability", content: "ChronoHub shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the purchase price of the product. Product warranties are provided by respective manufacturers." },
        ].map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6"
          >
            <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
              <section.icon className="w-5 h-5 text-primary" /> {section.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default TermsOfService;
