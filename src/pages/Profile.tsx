import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, ChevronRight } from "lucide-react";
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
    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <User className="w-16 h-16 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Sign in to view your profile</h1>
        <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-muted rounded-xl text-sm outline-none focus:ring-2 ring-primary transition-all";
  const links = [
    { to: "/orders", icon: Package, label: "My Orders", desc: "View order history & track deliveries" },
    { to: "/wishlist", icon: Heart, label: "My Wishlist", desc: "Saved products you love" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold mb-8">
            My <span className="gold-gradient-text">Profile</span>
          </h1>

          {/* Profile Card */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold">{form.full_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                  <input placeholder="PIN Code" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className={inputClass} />
                </div>
                <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                <div className="flex gap-3">
                  <button onClick={handleSave} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:scale-[1.02] transition-transform">
                    Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="px-6 py-3 border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-primary text-sm font-medium hover:underline"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3 mb-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="glass-card-hover p-5 flex items-center justify-between block"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">{link.label}</h3>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full glass-card p-5 flex items-center gap-4 hover:border-destructive/30 transition-colors text-left"
          >
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-heading font-semibold text-sm text-destructive">Sign Out</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
