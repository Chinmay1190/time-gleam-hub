import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Battery, Droplets, Cpu, Smartphone, ArrowLeft, Check, Truck, RotateCcw, Shield } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import ProductGallery360 from "@/components/ProductGallery360";

import watch1 from "@/assets/watch-1.png";
import watch2 from "@/assets/watch-2.png";
import watch3 from "@/assets/watch-3.png";
import watch4 from "@/assets/watch-4.png";

const galleryImages = [watch1, watch2, watch3, watch4];

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(0);
  const [added, setAdded] = useState(false);
  const wishlisted = product ? isWishlisted(product.id) : false;

  const productImages = product
    ? [product.image, ...galleryImages.filter((img) => img !== product.image).slice(0, 3)]
    : galleryImages;

  const handleWishlistToggle = () => {
    if (!product) return;
    if (!user) {
      toast({ title: "Sign in to add to wishlist" });
      return;
    }
    toggleWishlist(product.id);
  };

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const handleAddToCart = () => {
    addToCart(product, product.colors[selectedColor]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const featureIcons = [
    { icon: Battery, label: "7-Day Battery" },
    { icon: Droplets, label: "Water Resistant" },
    { icon: Cpu, label: "Advanced Sensors" },
    { icon: Smartphone, label: "iOS & Android" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* 360° Gallery */}
          <ProductGallery360
            images={productImages}
            productName={product.name}
            badge={product.badge}
          />

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <span className="text-xs text-primary font-semibold uppercase tracking-widest">{product.brand}</span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-1">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-heading text-4xl font-bold">{formatPrice(product.price)}</span>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-bold rounded-full">{discount}% OFF</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div>
              <h3 className="text-sm font-medium mb-3">Color: <span className="text-primary">{product.colors[selectedColor]}</span></h3>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button key={c} onClick={() => setSelectedColor(i)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${selectedColor === i ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10" : "border-border hover:border-primary/30"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <span key={f} className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium border border-border">{f}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {featureIcons.map((f) => (
                <div key={f.label} className="glass-card p-4 flex items-center gap-3 hover:border-primary/20 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddToCart} className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-heading font-semibold transition-all duration-300 shadow-lg ${added ? "bg-green-600 text-white shadow-green-600/20" : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/25"}`}>
                {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleWishlistToggle} className={`p-4 rounded-2xl border transition-all duration-200 ${wishlisted ? "border-destructive text-destructive bg-destructive/10" : "border-border hover:border-primary hover:text-primary hover:bg-primary/5"}`}>
                <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, text: "Free delivery above ₹999" },
                { icon: RotateCcw, text: "7-day easy returns" },
                { icon: Shield, text: "2-year warranty" },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30">
                  <item.icon className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
