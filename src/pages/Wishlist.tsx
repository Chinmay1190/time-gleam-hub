import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <Heart className="w-16 h-16 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Sign in to view your wishlist</h1>
        <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  const wishlisted = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            My <span className="gold-gradient-text">Wishlist</span>
          </h1>
          <p className="text-muted-foreground mb-8">{wishlisted.length} saved items</p>
        </motion.div>

        {wishlisted.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">Your wishlist is empty</p>
            <Link to="/shop" className="text-primary hover:underline text-sm">Browse watches</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlisted.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
