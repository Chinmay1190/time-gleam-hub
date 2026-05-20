import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Pause, Play, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface ProductGallery360Props {
  images: string[];
  productName: string;
  badge?: string;
}

const ProductGallery360 = ({ images, productName, badge }: ProductGallery360Props) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const momentumRef = useRef<number>();
  const dialRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const normalizedAngle = Math.round(((rotation % 360) + 360) % 360);

  const stopMomentum = useCallback(() => {
    if (momentumRef.current) cancelAnimationFrame(momentumRef.current);
  }, []);

  const startMomentum = useCallback(() => {
    stopMomentum();
    const decelerate = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.05) {
        velocityRef.current = 0;
        return;
      }
      setRotation((prev) => prev + velocityRef.current);
      momentumRef.current = requestAnimationFrame(decelerate);
    };
    decelerate();
  }, [stopMomentum]);

  // Main image drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    stopMomentum();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [stopMomentum]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // Track hover position for zoom-on-hover lens
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      setHoverPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
    if (!isDragging || isAutoRotating) return;
    const delta = e.clientX - lastXRef.current;
    velocityRef.current = delta * 0.35;
    setRotation((prev) => prev + delta * 0.5);
    lastXRef.current = e.clientX;
  }, [isDragging, isAutoRotating]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (!isAutoRotating && Math.abs(velocityRef.current) > 0.3) startMomentum();
  }, [startMomentum, isAutoRotating]);

  // Circular dial drag
  const handleDialPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setIsAutoRotating(false);
    stopMomentum();
    lastXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [stopMomentum]);

  const handleDialPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastXRef.current;
    setRotation((prev) => prev + delta * 0.8);
    lastXRef.current = e.clientX;
  }, [isDragging]);

  const handleDialPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoRotating) return;
    let frame: number;
    let counter = 0;
    const animate = () => {
      setRotation((prev) => prev + 0.4);
      counter++;
      if (counter % 250 === 0) {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isAutoRotating, images.length]);

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
    stopMomentum();
  };

  const handleZoom = (dir: 1 | -1) => {
    setZoomLevel((prev) => Math.min(2, Math.max(1, prev + dir * 0.25)));
  };

  // Dial tick marks
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      {/* Main Viewport */}
      <div
        ref={viewportRef}
        className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card to-background group select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => { setIsHovering(false); handlePointerUp(); }}
        style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div className="w-full aspect-square overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImageIndex}
              src={images[activeImageIndex]}
              alt={productName}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-cover will-change-transform"
              style={{
                transformOrigin: `${hoverPos.x}% ${hoverPos.y}%`,
                transform: `perspective(900px) rotateY(${rotation}deg) scale(${zoomLevel * (isHovering && !isDragging ? 1.6 : 1) * (isDragging ? 1.02 : 1)})`,
                transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 0.15s ease-out",
              }}
              draggable={false}
            />
          </AnimatePresence>

          {/* Hover zoom lens indicator */}
          {isHovering && !isDragging && (
            <div
              className="absolute pointer-events-none w-24 h-24 rounded-full border-2 border-primary/40 backdrop-blur-[1px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
              style={{
                left: `${hoverPos.x}%`,
                top: `${hoverPos.y}%`,
                boxShadow: "0 0 0 9999px hsl(var(--background) / 0.05)",
              }}
            />
          )}

          {/* Ambient glow behind image */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at ${50 + Math.sin(rotation * Math.PI / 180) * 20}% 50%, hsl(var(--primary) / 0.3), transparent 70%)`,
            }}
          />
        </div>

        {/* Badge */}
        {badge && (
          <span className="absolute top-4 left-4 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30">
            {badge}
          </span>
        )}

        {/* Top-right: Degree readout */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-md border border-border">
          <div
            className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="w-0.5 h-2 bg-primary rounded-full origin-bottom" />
          </div>
          <span className="text-xs font-mono font-semibold text-foreground tabular-nums w-8 text-right">
            {normalizedAngle}°
          </span>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground bg-background/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
            <RotateCw className="w-3 h-3" /> Drag to rotate
          </p>

          <div className="flex items-center gap-1.5">
            {/* Zoom controls */}
            <button
              onClick={(e) => { e.stopPropagation(); handleZoom(-1); }}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoom(1); }}
              disabled={zoomLevel >= 2}
              className="p-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Auto-rotate */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleAutoRotate(); }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg backdrop-blur-sm border text-xs font-medium transition-all ${
                isAutoRotating
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-background/70 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
              }`}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isAutoRotating ? "Pause" : "Spin"}
            </button>
          </div>
        </div>
      </div>

      {/* Circular Rotation Dial */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          {/* Mini dial visualization */}
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {/* Track */}
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              {/* Progress arc */}
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(normalizedAngle / 360) * 175.9} 175.9`}
                transform="rotate(-90 32 32)"
                className="transition-all duration-100"
              />
              {/* Tick marks */}
              {[0, 90, 180, 270].map((angle) => (
                <line
                  key={angle}
                  x1="32" y1="6" x2="32" y2="10"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 32 32)`}
                />
              ))}
              {/* Needle */}
              <line
                x1="32" y1="32" x2="32" y2="10"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${normalizedAngle} 32 32)`}
                className="transition-transform duration-100"
              />
              <circle cx="32" cy="32" r="3" fill="hsl(var(--primary))" />
            </svg>
          </div>

          {/* Horizontal slider dial */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Rotation Control</span>
              <button
                onClick={() => { setIsAutoRotating(false); stopMomentum(); setRotation(0); }}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                Reset to 0°
              </button>
            </div>

            {/* Draggable track */}
            <div
              ref={dialRef}
              className="relative h-10 rounded-xl bg-muted/50 border border-border overflow-hidden select-none"
              onPointerDown={handleDialPointerDown}
              onPointerMove={handleDialPointerMove}
              onPointerUp={handleDialPointerUp}
              style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
            >
              {/* Scrolling ticks */}
              <div className="absolute inset-0 flex items-center">
                {ticks.map((tick) => {
                  const isMajor = tick % 90 === 0;
                  const offset = ((tick - normalizedAngle + 180 + 360) % 360) - 180;
                  const pos = 50 + offset * 0.28;
                  if (pos < -5 || pos > 105) return null;
                  return (
                    <div
                      key={tick}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                    >
                      <div
                        className={`rounded-full ${isMajor ? "w-0.5 h-5 bg-primary" : "w-px h-3 bg-muted-foreground/40"}`}
                      />
                      {isMajor && (
                        <span className="text-[8px] font-mono text-muted-foreground mt-0.5">{tick}°</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Center indicator */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/80 -translate-x-1/2 z-10" />
              <div className="absolute left-1/2 top-0 w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-px z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2.5">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setActiveImageIndex(i); setIsAutoRotating(false); }}
            className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              activeImageIndex === i
                ? "border-primary shadow-md shadow-primary/20 scale-[1.03]"
                : "border-border hover:border-primary/30 opacity-60 hover:opacity-100"
            }`}
          >
            <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
            {activeImageIndex === i && (
              <motion.div
                layoutId="thumb-indicator"
                className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default ProductGallery360;
