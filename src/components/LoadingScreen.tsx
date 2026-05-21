import { motion, AnimatePresence } from "framer-motion";
import { Watch } from "lucide-react";
import { useState, useEffect } from "react";

const loadingTexts = [
  "Curating your collection...",
  "Polishing the bezels...",
  "Syncing the time zones...",
  "Loading premium watches...",
];

const LoadingScreen = () => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 12, 100));
    }, 180);
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 700);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated mesh gradient background */}
          <div className="absolute inset-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full"
            >
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-primary/8 rounded-full blur-[120px]" />
              <div className="absolute top-1/2 right-1/3 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[100px]" />
            </motion.div>
          </div>

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

          {/* Watch icon with multi-ring animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="relative mb-12"
          >
            {/* Ring 3 - outermost */}
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
              className="absolute -inset-16 rounded-full border border-primary/10"
            >
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 bg-primary/30 rounded-full" />
            </motion.div>

            {/* Ring 2 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 rounded-full border border-dashed border-primary/15"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/60 rounded-full shadow-sm shadow-primary/30" />
            </motion.div>

            {/* Ring 1 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-5 rounded-full border border-primary/25"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/40" />
            </motion.div>

            {/* Center icon with clock tick markers + sweeping hand */}
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center backdrop-blur-sm relative"
            >
              {/* 12 hour-tick markers */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-px h-9 origin-top"
                  style={{ transform: `translate(-50%, 0) rotate(${i * 30}deg) translateY(-44px)` }}
                >
                  <div className={`w-px h-1.5 mx-auto ${i % 3 === 0 ? "bg-primary/80 h-2" : "bg-primary/30"}`} />
                </div>
              ))}
              {/* Sweeping second hand */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 top-1/2 w-0.5 h-10 -mt-10 origin-bottom bg-gradient-to-t from-accent to-transparent rounded-full"
                style={{ transformOrigin: "50% 100%" }}
              />
              <Watch className="w-10 h-10 text-primary relative z-10" />
            </motion.div>

            {/* Pulse rings */}
            {[0, 0.5, 1].map((delay) => (
              <motion.div
                key={delay}
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
                className="absolute inset-0 rounded-3xl border border-primary/20"
              />
            ))}
          </motion.div>

          {/* Brand */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-heading text-5xl font-bold tracking-tight"
          >
            Chrono<span className="text-primary">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-sm mt-3 tracking-[0.3em] uppercase"
          >
            Premium Smart Watches
          </motion.p>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 w-64"
          >
            <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/80 rounded-full relative"
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </motion.div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={textIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-muted-foreground"
                >
                  {loadingTexts[textIndex]}
                </motion.p>
              </AnimatePresence>
              <span className="text-xs font-mono text-primary font-medium">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
