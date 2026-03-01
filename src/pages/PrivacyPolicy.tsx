import { motion } from "framer-motion";
import { Lock, CreditCard, Eye, Shield, Server, FileCheck } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container-main px-4 sm:px-6 lg:px-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
          Privacy <span className="gold-gradient-text">Policy</span>
        </h1>
        <p className="text-muted-foreground">Last updated: March 2025</p>
      </motion.div>

      <div className="space-y-8">
        {[
          { icon: Eye, title: "Information We Collect", content: "We collect personal information you provide during registration, orders, and contact — including name, email, phone, shipping address, and payment details. We also collect browsing data such as pages visited, device type, and IP address to improve your experience." },
          { icon: Server, title: "How We Use Your Information", content: "Your data is used to process orders, provide customer support, send order updates, personalize your shopping experience, and improve our services. We may send promotional emails which you can unsubscribe from anytime." },
          { icon: CreditCard, title: "Payment Security", content: "All payment transactions are encrypted using 256-bit SSL technology. We never store your credit/debit card details. Payments are processed through PCI-DSS compliant payment gateways including Razorpay and PayU." },
          { icon: Shield, title: "Data Protection", content: "We implement industry-standard security measures to protect your personal data. Access to personal information is restricted to authorized personnel only. We regularly audit our security practices." },
          { icon: Lock, title: "Cookies", content: "We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can disable cookies in your browser settings, though some features may not work properly." },
          { icon: FileCheck, title: "Your Rights", content: "You can access, update, or delete your personal information at any time by contacting us at privacy@chronohub.in. We will respond within 30 days. You may also request a copy of all data we hold about you." },
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

export default PrivacyPolicy;
