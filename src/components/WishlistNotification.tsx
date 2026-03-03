import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

interface WishlistNotificationProps {
  product: { name: string; image: string; price: number } | null;
  action: "added" | "removed";
  onClose: () => void;
}

const WishlistNotification = ({ product, action, onClose }: WishlistNotificationProps) => {
  useEffect(() => {
    if (product) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [product, onClose]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          className="fixed top-20 right-4 z-[60] w-80 glass-card p-4 shadow-2xl border-primary/30"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action === "added" ? "bg-destructive/15" : "bg-muted"}`}>
              <Heart className={`w-5 h-5 ${action === "added" ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary mb-0.5">
                {action === "added" ? "Added to Wishlist!" : "Removed from Wishlist"}
              </p>
              <div className="flex items-center gap-2">
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="flex-1 text-center text-xs font-semibold px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:scale-[1.02] transition-transform"
                >
                  View Wishlist
                </Link>
                <button
                  onClick={onClose}
                  className="text-xs font-medium px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WishlistNotification;
