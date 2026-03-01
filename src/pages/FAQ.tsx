import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days across India. Express delivery (1-2 days) is available in metro cities for an additional ₹199." },
      { q: "Do you offer free shipping?", a: "Yes! All orders above ₹999 qualify for free standard shipping. Orders below ₹999 have a flat ₹99 delivery charge." },
      { q: "Can I track my order?", a: "Absolutely. Once shipped, you'll receive a tracking link via SMS and email. You can also track from your order history dashboard." },
      { q: "Do you deliver internationally?", a: "Currently we deliver across India only. International shipping will be available soon." },
    ],
  },
  {
    category: "Returns & Warranty",
    items: [
      { q: "What is your return policy?", a: "We offer a 7-day easy return policy. If you're not satisfied, initiate a return within 7 days of delivery for a full refund." },
      { q: "What warranty do you provide?", a: "All products come with a minimum 1-year manufacturer warranty. Premium brands offer up to 2 years. Warranty covers manufacturing defects only." },
      { q: "How do I claim warranty?", a: "Contact our support team with your order ID and issue description. We'll arrange pickup and repair/replacement within 7-10 business days." },
      { q: "Are replacement straps available?", a: "Yes, we stock replacement straps for all popular models. Check our accessories section or contact support for specific strap queries." },
    ],
  },
  {
    category: "Products & Features",
    items: [
      { q: "Are all products genuine?", a: "100% genuine and authentic. Every product comes with original brand packaging, warranty card, and invoice. We are authorized resellers for all listed brands." },
      { q: "How do I choose the right smartwatch?", a: "Consider your primary use (fitness, casual, outdoor), budget, preferred features (GPS, AMOLED, calling), and phone compatibility (iOS/Android). Our experts can help too!" },
      { q: "Do all watches support Bluetooth calling?", a: "No, Bluetooth calling is available on select models. Check the product features list — watches with 'Bluetooth Calling' explicitly listed support this feature." },
      { q: "Are watches waterproof?", a: "Most watches are water-resistant (IP67/IP68 or 5ATM). This means they handle splashes, rain, and swimming. However, we don't recommend hot showers or deep diving unless specified." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, net banking, popular wallets (Paytm, PhonePe, Google Pay), and EMI options on select cards." },
      { q: "Is EMI available?", a: "Yes, no-cost EMI is available on select products for credit cards from major banks. EMI options are shown at checkout." },
      { q: "Is my payment information secure?", a: "Absolutely. All transactions are encrypted with 256-bit SSL. We never store your card details — payments are processed through secure payment gateways." },
    ],
  },
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggle = (key: string) =>
    setOpenItems((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Frequently Asked <span className="gold-gradient-text">Questions</span>
          </h1>
          <p className="text-muted-foreground">Everything you need to know about shopping with ChronoHub</p>
        </motion.div>

        <div className="space-y-10">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
            >
              <h2 className="font-heading text-lg font-semibold mb-4 text-primary">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item, qi) => {
                  const key = `${si}-${qi}`;
                  const isOpen = openItems.includes(key);
                  return (
                    <div key={key} className="glass-card overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:text-primary transition-colors"
                      >
                        {item.q}
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="px-4 pb-4"
                        >
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
