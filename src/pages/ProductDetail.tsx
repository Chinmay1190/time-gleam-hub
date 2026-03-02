import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Battery, Droplets, Cpu, Smartphone, ArrowLeft, Check, Truck, RotateCcw, Shield, RotateCw, Pause, Play, Image } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";

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

  // 360° gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const autoRotateRef = useRef<number>();
  const momentumRef = useRef<number>();

  // Use product image + 3 gallery images
  const productImages = product
    ? [product.image, ...galleryImages.filter((img) => img !== product.image).slice(0, 3)]
    : galleryImages;

  const stopMomentum = useCallback(() => {
    if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
  }, []);

  const startMomentum = useCallback(() => {
    stopMomentum();
    const decelerate = () => {
      velocityRef.current *= 0.94;
      if (Math.abs(velocityRef.current) < 0.08) {
        velocityRef.current = 0;
        return;
      }
      setRotation((prev) => prev + velocityRef.current);
      momentumRef.current = requestAnimationFrame(decelerate);
    };
    decelerate();
  }, [stopMomentum]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    stopMomentum();
    if (isAutoRotating) return;
  }, [stopMomentum, isAutoRotating]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isAutoRotating) return;
    const delta = e.clientX - lastXRef.current;
    velocityRef.current = delta * 0.4;
    setRotation((prev) => prev + delta * 0.6);
    lastXRef.current = e.clientX;
  }, [isDragging, isAutoRotating]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (!isAutoRotating && Math.abs(velocityRef.current) > 0.5) startMomentum();
  }, [startMomentum, isAutoRotating]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    lastXRef.current = e.touches[0].clientX;
    velocityRef.current = 0;
    stopMomentum();
  }, [stopMomentum]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isAutoRotating) return;
    const delta = e.touches[0].clientX - lastXRef.current;
    velocityRef.current = delta * 0.4;
    setRotation((prev) => prev + delta * 0.6);
    lastXRef.current = e.touches[0].clientX;
  }, [isDragging, isAutoRotating]);

  // Auto-rotate with image cycling
  useEffect(() => {
    if (!isAutoRotating) return;
    let frame: number;
    let counter = 0;
    const animate = () => {
      setRotation((prev) => prev + 0.6);
      counter++;
      // Switch image every ~200 frames (~3.3 seconds at 60fps)
      if (counter % 200 === 0) {
        setActiveImageIndex((prev) => (prev + 1) % productImages.length);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isAutoRotating, productImages.length]);

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
    stopMomentum();
  };

  const setAngle = (angle: number) => {
    setIsAutoRotating(false);
    stopMomentum();
    setRotation(angle);
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

  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery with 360° rotation */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Main Image */}
            <div
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
              <div className="w-full aspect-square overflow-hidden relative bg-gradient-to-br from-muted/20 to-muted/5">
                <img
                  src={productImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover select-none"
                  style={{
                    transform: `perspective(800px) rotateY(${rotation}deg) scale(${isDragging ? 1.03 : 1})`,
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                  }}
                  draggable={false}
                />

                {/* Rotation indicator */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-background/70 backdrop-blur-sm border border-border text-[10px] font-mono text-muted-foreground">
                  {Math.round(((rotation % 360) + 360) % 360)}°
                </div>
              </div>

              {product.badge && (
                <span className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30">
                  {product.badge}
                </span>
              )}

              {/* Auto-Rotate button */}
              <button
                onClick={toggleAutoRotate}
                className={`absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm border text-sm font-medium transition-all duration-200 ${
                  isAutoRotating
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-background/70 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                }`}
              >
                {isAutoRotating ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Auto-Rotate</>}
              </button>

              <p className="absolute bottom-4 left-4 text-[10px] text-muted-foreground bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
                <RotateCw className="w-3 h-3" /> Drag to rotate
              </p>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImageIndex(i); setIsAutoRotating(false); }}
                  className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === i
                      ? "border-primary shadow-md shadow-primary/20 scale-[1.02]"
                      : "border-border hover:border-primary/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Angle Buttons */}
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Angles</span>
                <button
                  onClick={() => setAngle(0)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {angles.map((angle) => {
                  const currentAngle = Math.round(((rotation % 360) + 360) % 360);
                  const isActive = Math.abs(currentAngle - angle) < 15;
                  return (
                    <button
                      key={angle}
                      onClick={() => setAngle(angle)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {angle}°
                    </button>
                  );
                })}
              </div>
            </div>
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
