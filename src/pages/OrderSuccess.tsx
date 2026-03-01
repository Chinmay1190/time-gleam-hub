import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Package, FileText, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Trigger confetti
    const duration = 2000;
    const end = Date.now() + duration;
    const colors = ["#d4a843", "#e8c068", "#f0d48a"];
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    if (!user || !orderId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setOrder(data));
  }, [user, orderId]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-lg text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="relative mx-auto w-28 h-28 mb-8"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-primary-foreground" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2 p-2 bg-card rounded-full border border-primary/30"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-3xl sm:text-4xl font-bold mb-3"
        >
          Order <span className="gold-gradient-text">Confirmed!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-2"
        >
          Thank you for shopping with ChronoHub
        </motion.p>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 my-8 text-left space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order Number</span>
              <span className="font-heading font-bold text-primary">{order.order_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm font-medium uppercase">{order.payment_method}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">GST ({order.gst_rate}%)</span>
              <span className="text-sm">{formatPrice(order.gst_amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Shipping</span>
              <span className="text-sm text-primary">{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "Free"}</span>
            </div>
            <div className="h-px bg-primary/20" />
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-lg">Total</span>
              <span className="font-heading font-bold text-xl text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {orderId && (
            <Link
              to={`/order/${orderId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-[1.02] transition-transform"
            >
              <Package className="w-4 h-4" /> Track Order
            </Link>
          )}
          <Link
            to="/orders"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-border rounded-2xl font-heading font-semibold hover:bg-secondary transition-colors"
          >
            <FileText className="w-4 h-4" /> View All Orders
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            Continue Shopping <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
