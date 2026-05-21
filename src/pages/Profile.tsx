import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Heart, LogOut, ChevronRight, Mail, Phone, MapPin, Edit3, Save, X, ShieldCheck, ShoppingBag, IndianRupee, Calendar, BarChart3, Sparkles, Award, Truck, ShoppingCart, HelpCircle, Store, Copy, Check, TrendingUp, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CountUp from "@/components/CountUp";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, spent: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        });
      } else {
        const fullName = user.user_metadata?.full_name || "";
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({ user_id: user.id, full_name: fullName })
          .select()
          .single();
        if (newProfile) {
          setProfile(newProfile);
          setForm({ full_name: newProfile.full_name || "", phone: "", address: "", city: "", state: "", pincode: "" });
        }
      }
    };

    const loadStats = async () => {
      const [{ data: orders }, { count: wishCount }] = await Promise.all([
        supabase.from("orders").select("id,order_number,total_amount,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const totalSpent = (orders || []).reduce((s, o: any) => s + Number(o.total_amount || 0), 0);
      const delivered = (orders || []).filter((o: any) => o.status === "delivered").length;
      setStats({ orders: orders?.length || 0, wishlist: wishCount || 0, spent: totalSpent, delivered });
      setRecentOrders((orders || []).slice(0, 4));
      setAllOrders(orders || []);
    };

    loadProfile();
    loadStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Profile updated successfully!" });
      setEditing(false);
      setProfile({ ...profile, ...form });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Monthly spend (last 6 months) — must run before any early return to keep hook order stable
  const monthlySpend = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: MONTH_LABELS[d.getMonth()], total: 0 });
    }
    allOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff < 6) {
        buckets[5 - diff].total += Number(o.total_amount || 0);
      }
    });
    const max = Math.max(...buckets.map(b => b.total), 1);
    return { buckets, max };
  }, [allOrders]);

  // Active shipment — also hoisted above early return
  const activeOrder = useMemo(() => {
    return allOrders.find((o: any) =>
      ["pending", "confirmed", "processing", "shipped", "out_for_delivery"].includes(o.status)
    );
  }, [allOrders]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Sign in to view your profile</h1>
        <p className="text-muted-foreground text-sm">Access your orders, wishlist and account settings</p>
        <Link to="/auth" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const inputClass = "input-field";

  const initials = form.full_name
    ? form.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "-";

  // Profile completion percentage
  const completionFields = [form.full_name, form.phone, form.address, form.city, form.state, form.pincode];
  const filledCount = completionFields.filter(Boolean).length;
  const completionPct = Math.round((filledCount / completionFields.length) * 100);

  // Monthly spend (last 6 months)
  const monthlySpend = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: MONTH_LABELS[d.getMonth()], total: 0 });
    }
    allOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff < 6) {
        buckets[5 - diff].total += Number(o.total_amount || 0);
      }
    });
    const max = Math.max(...buckets.map(b => b.total), 1);
    return { buckets, max };
  }, [allOrders]);

  // Active shipment
  const activeOrder = useMemo(() => {
    return allOrders.find((o: any) =>
      ["pending", "confirmed", "processing", "shipped", "out_for_delivery"].includes(o.status)
    );
  }, [allOrders]);

  const copyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    toast({ title: "Email copied!" });
    setTimeout(() => setCopied(false), 1800);
  };

  // Loyalty tier based on spend
  const tier = stats.spent > 100000 ? { name: "Platinum", color: "from-purple-400 to-pink-400" }
    : stats.spent > 50000 ? { name: "Gold", color: "from-amber-300 to-amber-500" }
    : stats.spent > 10000 ? { name: "Silver", color: "from-slate-300 to-slate-500" }
    : { name: "Bronze", color: "from-orange-300 to-orange-600" };

  const statCards = [
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
    { label: "Delivered", value: stats.delivered, icon: Package, color: "from-green-500/20 to-green-500/5", iconColor: "text-green-400" },
    { label: "Wishlist", value: stats.wishlist, icon: Heart, color: "from-pink-500/20 to-pink-500/5", iconColor: "text-pink-400" },
    { label: "Total Spent", value: stats.spent, prefix: "₹", icon: IndianRupee, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400" },
  ];

  const links = [
    { to: "/orders", icon: Package, label: "My Orders", desc: "Track deliveries & view history", color: "bg-blue-500/10 text-blue-400" },
    { to: "/wishlist", icon: Heart, label: "My Wishlist", desc: "Saved products you love", color: "bg-pink-500/10 text-pink-400" },
    { to: "/reports", icon: BarChart3, label: "Reports & Analytics", desc: "Detailed spend & order analytics", color: "bg-purple-500/10 text-purple-400" },
  ];

  const quickActions = [
    { to: "/shop", icon: Store, label: "Shop", tint: "from-primary/20 to-primary/5" },
    { to: "/cart", icon: ShoppingCart, label: "Cart", tint: "from-accent/20 to-accent/5" },
    { to: "/wishlist", icon: Heart, label: "Wishlist", tint: "from-pink-500/20 to-pink-500/5" },
    { to: "/faq", icon: HelpCircle, label: "Help", tint: "from-blue-500/20 to-blue-500/5" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Hero Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-10 mb-6 relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl blur-xl opacity-50 animate-pulse-glow" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center text-primary-foreground font-heading text-3xl font-bold shadow-2xl">
                {initials}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.color} text-[10px] font-bold uppercase tracking-wider text-background shadow-lg flex items-center gap-1`}>
                <Award className="w-2.5 h-2.5" /> {tier.name}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 space-y-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="font-heading text-3xl font-bold">{form.full_name || "Welcome!"}</h1>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5 text-sm text-muted-foreground">
                <button onClick={copyEmail} className="flex items-center gap-1.5 justify-center sm:justify-start hover:text-primary transition-colors group/email">
                  <Mail className="w-3.5 h-3.5 text-primary" /> {user.email}
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover/email:opacity-100 transition-opacity" />}
                </button>
                {form.phone && <span className="flex items-center gap-1.5 justify-center sm:justify-start"><Phone className="w-3.5 h-3.5 text-primary" /> {form.phone}</span>}
              </div>
              {form.city && form.state && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center sm:justify-start">
                  <MapPin className="w-3 h-3 text-primary" /> {form.city}, {form.state}
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs">
                  <Calendar className="w-3 h-3 text-accent" /> Member since {memberSince}
                </span>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 hover:scale-105 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="glass-card p-5 relative overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-bl ${s.color} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                <p className="font-heading font-bold text-2xl mt-1">
                  {s.prefix === "₹" ? "₹" : ""}
                  <CountUp end={s.value} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loyalty Progress + Achievements */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Tier progress card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 lg:col-span-2 relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block">Loyalty Progress</span>
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Award className={`w-5 h-5 bg-gradient-to-r ${tier.color} bg-clip-text`} style={{ color: "transparent", WebkitTextStroke: "1px currentColor" } as any} />
                    You're <span className={`bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>{tier.name}</span>
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  ₹<CountUp end={stats.spent} /> spent
                </span>
              </div>
              {(() => {
                const tiers = [
                  { name: "Bronze", min: 0, color: "from-orange-300 to-orange-600" },
                  { name: "Silver", min: 10000, color: "from-slate-300 to-slate-500" },
                  { name: "Gold", min: 50000, color: "from-amber-300 to-amber-500" },
                  { name: "Platinum", min: 100000, color: "from-purple-400 to-pink-400" },
                ];
                const next = tiers.find(t => t.min > stats.spent);
                const current = [...tiers].reverse().find(t => t.min <= stats.spent) || tiers[0];
                const progress = next ? ((stats.spent - current.min) / (next.min - current.min)) * 100 : 100;
                return (
                  <>
                    <div className="h-3 rounded-full bg-muted/50 overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${current.color} shadow-lg`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span><span className="font-bold text-foreground">{current.name}</span> · ₹{formatINR(current.min)}</span>
                      {next ? (
                        <span>₹<span className="font-bold text-accent">{formatINR(next.min - stats.spent)}</span> to <span className="font-bold text-foreground">{next.name}</span></span>
                      ) : (
                        <span className="font-bold text-amber-400">🎉 Max tier unlocked</span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>

          {/* Achievements badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block mb-2">Achievements</span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "First Buy", unlocked: stats.orders >= 1, icon: "🎁" },
                { label: "5 Orders", unlocked: stats.orders >= 5, icon: "🛍️" },
                { label: "10 Orders", unlocked: stats.orders >= 10, icon: "🏆" },
                { label: "₹10k+", unlocked: stats.spent >= 10000, icon: "💎" },
                { label: "₹50k+", unlocked: stats.spent >= 50000, icon: "👑" },
                { label: "Wishlist", unlocked: stats.wishlist >= 1, icon: "❤️" },
              ].map(a => (
                <div
                  key={a.label}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    a.unlocked ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/40 shadow-inner" : "bg-muted/20 border-border/40 opacity-40 grayscale"
                  }`}
                  title={a.label}
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-[8px] font-semibold text-center leading-tight">{a.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block">Recent Activity</span>
                <h3 className="font-heading font-bold text-lg">Latest Orders</h3>
              </div>
              <Link to="/orders" className="text-xs text-accent font-semibold hover:underline inline-flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recentOrders.map((o, i) => {
                const statusColor =
                  o.status === "delivered" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                  o.status === "cancelled" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                  o.status === "shipped" || o.status === "out_for_delivery" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" :
                  "bg-amber-500/15 text-amber-400 border-amber-500/30";
                return (
                  <Link
                    key={o.id}
                    to={`/orders`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/40 hover:border-primary/40 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{o.order_number}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-heading font-bold text-primary">₹{formatINR(o.total_amount)}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${statusColor}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Edit Form */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-xl">Edit Your Profile</h2>
                  <button onClick={() => setEditing(false)} className="p-2 rounded-lg hover:bg-muted">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                    <input placeholder="Enter your full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                    <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">PIN Code</label>
                    <input placeholder="400001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                    <input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                    <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
                    <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button onClick={handleSave} className="flex-1 btn-primary">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {links.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <Link to={link.to} className="glass-card-hover p-5 flex flex-col gap-3 h-full group">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${link.color}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
                <div>
                  <h3 className="font-heading font-bold">{link.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {quickActions.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className={`glass-card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:-translate-y-0.5 transition-all group bg-gradient-to-br ${q.tint}`}
            >
              <div className="w-10 h-10 rounded-xl bg-background/40 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                <q.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold">{q.label}</span>
            </Link>
          ))}
        </motion.div>

        {/* Active Shipment + Profile Completion Row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Active Shipment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 lg:col-span-2 relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block">Live Tracking</span>
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Active Shipment
                  </h3>
                </div>
                {activeOrder && (
                  <Link to="/orders" className="text-xs text-accent font-semibold hover:underline">Track →</Link>
                )}
              </div>
              {activeOrder ? (
                <Link to="/orders" className="block">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-base">{activeOrder.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activeOrder.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="text-sm font-heading font-bold text-primary">₹{formatINR(activeOrder.total_amount)}</span>
                  </div>
                  {(() => {
                    const steps = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
                    const idx = Math.max(0, steps.indexOf(activeOrder.status));
                    const pct = (idx / (steps.length - 1)) * 100;
                    return (
                      <>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-lg"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                          <span className={idx >= 0 ? "text-primary font-bold" : ""}>Placed</span>
                          <span className={idx >= 2 ? "text-primary font-bold" : ""}>Processing</span>
                          <span className={idx >= 3 ? "text-primary font-bold" : ""}>Shipped</span>
                          <span className={idx >= 4 ? "text-primary font-bold" : ""}>Out for Delivery</span>
                          <span className={idx >= 5 ? "text-primary font-bold" : ""}>Delivered</span>
                        </div>
                      </>
                    );
                  })()}
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
                    <Truck className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold mb-1">No active shipments</p>
                  <p className="text-xs text-muted-foreground mb-3">Place an order to track it here in real time</p>
                  <Link to="/shop" className="text-xs text-accent font-semibold hover:underline">Browse Shop →</Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Completion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block mb-3">Profile Completion</span>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" strokeWidth="6" stroke="hsl(var(--muted))" fill="none" opacity="0.4" />
                  <motion.circle
                    cx="40" cy="40" r="34" strokeWidth="6" strokeLinecap="round"
                    stroke="url(#completionGrad)" fill="none"
                    initial={{ strokeDasharray: "0 213" }}
                    animate={{ strokeDasharray: `${(completionPct / 100) * 213} 213` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="completionGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading font-bold text-lg">{completionPct}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" /> {filledCount}/{completionFields.length} fields
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mb-2">
                  {completionPct === 100 ? "Your profile is complete!" : "Complete your profile for a better experience."}
                </p>
                {completionPct < 100 && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    Complete now →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Spend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block">Spending Insights</span>
                <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Last 6 Months
                </h3>
              </div>
              <Link to="/reports" className="text-xs text-accent font-semibold hover:underline">Full Report →</Link>
            </div>
            <div className="flex items-end gap-2 sm:gap-4 h-40 px-2">
              {monthlySpend.buckets.map((b, i) => {
                const heightPct = (b.total / monthlySpend.max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{formatINR(b.total)}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, 2)}%` }}
                      transition={{ duration: 0.9, delay: 0.5 + i * 0.07, ease: "easeOut" }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-accent/80 hover:from-primary/60 hover:to-accent transition-colors relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
                    </motion.div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Saved Address */}
        {(form.address || form.city) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em] block">Default Shipping Address</span>
                  <h3 className="font-heading font-bold text-base mt-0.5">{form.full_name || "Your Address"}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {[form.address, form.city, form.state, form.pincode].filter(Boolean).join(", ")}
                    {form.phone && <span className="block mt-0.5">📞 {form.phone}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-accent font-semibold hover:underline flex-shrink-0"
              >
                Edit
              </button>
            </div>
          </motion.div>
        )}

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleSignOut}
          className="w-full glass-card p-5 flex items-center gap-4 hover:border-destructive/40 hover:bg-destructive/5 transition-all text-left group"
        >
          <div className="p-3 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <span className="font-heading font-bold text-destructive block">Sign Out</span>
            <span className="text-xs text-muted-foreground">Log out of your account on this device</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
