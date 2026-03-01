import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const handleWishlist = () => {
    if (!user) {
      toast({ title: "Sign in to add to wishlist", description: "Create an account to save your favorites." });
      return;
    }
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group glass-card-hover overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/20">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addToCart(product)}
            className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
          <Link
            to={`/product/${product.id}`}
            className="p-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-surface-hover transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`p-3 rounded-xl ${
              wishlisted ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-[10px] text-primary/80 font-semibold uppercase tracking-widest">{product.brand}</span>
        <Link to={`/product/${product.id}`} className="font-heading font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 mt-auto">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="font-heading font-bold text-lg">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
