import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Heart, LogOut, ChevronRight, Mail, Phone, MapPin, Edit3, Save, X, ShieldCheck, ShoppingBag, IndianRupee, Calendar, BarChart3, Sparkles, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CountUp from "@/components/CountUp";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, spent: 0, delivered: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

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
                <span className="flex items-center gap-1.5 justify-center sm:justify-start"><Mail className="w-3.5 h-3.5 text-primary" /> {user.email}</span>
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
