import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Battery, Droplets, Cpu, Smartphone, ArrowLeft, Check, Truck, RotateCcw, Shield, RotateCw } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";

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

  // 360° rotation state
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const lastXRef = useRef(0);
  const autoRotateRef = useRef<number>();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastXRef.current = e.clientX;
    setIsAutoRotating(false);
    if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastXRef.current;
    setRotation((prev) => prev + delta * 0.5);
    lastXRef.current = e.clientX;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    lastXRef.current = e.touches[0].clientX;
    setIsAutoRotating(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - lastXRef.current;
    setRotation((prev) => prev + delta * 0.5);
    lastXRef.current = e.touches[0].clientX;
  }, [isDragging]);

  const toggle360 = () => {
    if (isAutoRotating) {
      setIsAutoRotating(false);
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    } else {
      setIsAutoRotating(true);
      const animate = () => {
        setRotation((prev) => prev + 1);
        autoRotateRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  };

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
          {/* Image with 360° rotation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card overflow-hidden rounded-3xl relative group"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="w-full aspect-square overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-100"
                style={{ transform: `perspective(1000px) rotateY(${rotation}deg)` }}
                draggable={false}
              />
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30">
                {product.badge}
              </span>
            )}
            {/* 360° button */}
            <button
              onClick={toggle360}
              className={`absolute bottom-4 right-4 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 ${
                isAutoRotating
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-background/60 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isAutoRotating ? "animate-spin" : ""}`} />
            </button>
            <p className="absolute bottom-4 left-4 text-[10px] text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-border">
              Drag to rotate 360°
            </p>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs text-primary font-semibold uppercase tracking-widest">{product.brand}</span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-1">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground"}`}
                  />
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

            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium mb-3">Color: <span className="text-primary">{product.colors[selectedColor]}</span></h3>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(i)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      selectedColor === i
                        ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <span key={f} className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium border border-border">{f}</span>
              ))}
            </div>

            {/* Specs */}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-heading font-semibold transition-all duration-300 shadow-lg ${
                  added
                    ? "bg-green-600 text-white shadow-green-600/20"
                    : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/25"
                }`}
              >
                {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlistToggle}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  wishlisted ? "border-destructive text-destructive bg-destructive/10" : "border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                }`}
              >
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

        {/* Related */}
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
