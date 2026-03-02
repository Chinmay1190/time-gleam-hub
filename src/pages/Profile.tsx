import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, ChevronRight, Mail, Phone, MapPin, Edit3, Save, X, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
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
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
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
        <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3.5 bg-muted/50 rounded-xl text-sm outline-none focus:ring-2 ring-primary/50 border border-border focus:border-primary transition-all placeholder:text-muted-foreground/60";

  const links = [
    { to: "/orders", icon: Package, label: "My Orders", desc: "View order history & track deliveries", color: "bg-blue-500/10 text-blue-500" },
    { to: "/wishlist", icon: Heart, label: "My Wishlist", desc: "Saved products you love", color: "bg-pink-500/10 text-pink-500" },
  ];

  const initials = form.full_name
    ? form.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="glass-card p-6 sm:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-heading text-2xl font-bold shadow-lg shadow-primary/25">
                {initials}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-heading text-2xl font-bold">{form.full_name || "Welcome!"}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </span>
                  {form.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" /> {form.phone}
                    </span>
                  )}
                </div>
                {form.city && form.state && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 justify-center sm:justify-start">
                    <MapPin className="w-3 h-3" /> {form.city}, {form.state}
                  </span>
                )}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {/* Verified badge */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Email verified • Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 sm:p-8 mb-6"
            >
              <h2 className="font-heading font-semibold text-lg mb-5">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                  <input placeholder="Enter your full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                  <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                  <input placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">City</label>
                    <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">PIN Code</label>
                    <input placeholder="400001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">State</label>
                  <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 px-6 py-3.5 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <div className="space-y-3 mb-6">
            {links.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link to={link.to} className="glass-card-hover p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${link.color}`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm">{link.label}</h3>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sign Out */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleSignOut}
            className="w-full glass-card p-5 flex items-center gap-4 hover:border-destructive/30 transition-colors text-left group"
          >
            <div className="p-3 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <span className="font-heading font-semibold text-sm text-destructive block">Sign Out</span>
              <span className="text-xs text-muted-foreground">Log out of your account</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
