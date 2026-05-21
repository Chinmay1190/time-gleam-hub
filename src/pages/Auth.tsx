import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Watch, Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Zap, Star, Check, Quote, X as XIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["bg-destructive", "bg-destructive", "bg-orange-500", "bg-amber-500", "bg-green-500", "bg-emerald-400"];
    return { score, label: labels[score], color: colors[score], pct: (score / 5) * 100 };
  }, [password]);

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { toast({ title: "Enter your email", variant: "destructive" }); return; }
    setForgotSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSending(false);
    if (error) toast({ title: "Could not send reset link", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Check your email", description: "We've sent a password reset link." });
      setForgotOpen(false); setForgotEmail("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome back!" });
        navigate("/");
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: "Please enter your full name", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        });
      }
    }
    setLoading(false);
  };

  const features = [
    { icon: Shield, title: "Secure Payments", desc: "256-bit encryption on all transactions" },
    { icon: Zap, title: "Fast Delivery", desc: "Free express shipping across India" },
    { icon: Star, title: "Premium Quality", desc: "Authentic watches with 2-year warranty" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-md px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse-glow">
                <Watch className="w-7 h-7 text-primary" />
              </div>
              <span className="font-heading text-3xl font-bold tracking-tight">
                Chrono<span className="text-primary">Hub</span>
              </span>
            </div>

            <h2 className="font-heading text-4xl font-bold leading-tight mb-4">
              Your Premium
              <br />
              <span className="gold-gradient-text">Watch Destination</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Join 50,000+ customers who trust ChronoHub for authentic smartwatches at the best prices in India.
            </p>

            <div className="space-y-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm">{f.title}</h4>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-10 relative rounded-2xl border border-primary/15 bg-card/50 backdrop-blur-sm p-5"
            >
              <Quote className="absolute -top-3 -left-2 w-6 h-6 text-primary/40 rotate-180" />
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                "Got my dream Apple Watch in 2 days. Authentic, perfectly packed, with a real bill. ChronoHub is now my go-to."
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                  RK
                </div>
                <div>
                  <p className="text-xs font-bold">Rohan Kapoor</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-accent text-accent" />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">Verified buyer</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Watch className="w-8 h-8 text-primary" />
              <span className="font-heading text-2xl font-bold">
                Chrono<span className="text-primary">Hub</span>
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Sign in to access your orders, wishlist & more" : "Join us for the best smartwatch experience in India"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted/50 rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all duration-300 ${
                isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-heading font-semibold transition-all duration-300 ${
                !isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter (signup only) */}
              <AnimatePresence>
                {!isLogin && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Password strength: <span className="font-semibold text-foreground">{passwordStrength.label}</span></span>
                      {passwordStrength.score >= 4 && <Check className="w-3 h-3 text-green-500" />}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me + forgot password (login only) */}
            {isLogin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Signup bonus banner */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Welcome bonus: ₹500 off</p>
                  <p className="text-muted-foreground">On your first order above ₹5,000</p>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-heading font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password dialog */}
          <AnimatePresence>
            {forgotOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setForgotOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="glass-card p-6 w-full max-w-sm relative"
                >
                  <button
                    onClick={() => setForgotOpen(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-1">Reset password</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Enter your email — we'll send you a secure link to reset your password.
                  </p>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input-field mb-3"
                  />
                  <button
                    onClick={handleForgotPassword}
                    disabled={forgotSending}
                    className="w-full btn-primary"
                  >
                    {forgotSending ? "Sending..." : "Send reset link"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
