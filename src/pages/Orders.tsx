import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, Truck, CheckCircle, MapPin, XCircle, ShoppingBag, TrendingUp, ArrowRight, Search, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const statusConfig: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending", bg: "bg-yellow-500/10" },
  confirmed: { icon: CheckCircle, color: "text-blue-500", label: "Confirmed", bg: "bg-blue-500/10" },
  processing: { icon: Package, color: "text-orange-500", label: "Processing", bg: "bg-orange-500/10" },
  shipped: { icon: Truck, color: "text-purple-500", label: "Shipped", bg: "bg-purple-500/10" },
  out_for_delivery: { icon: MapPin, color: "text-cyan-500", label: "Out for Delivery", bg: "bg-cyan-500/10" },
  delivered: { icon: CheckCircle, color: "text-green-500", label: "Delivered", bg: "bg-green-500/10" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled", bg: "bg-destructive/10" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;
type FilterKey = typeof FILTER_TABS[number]["key"];


const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map((o) => o.id === payload.new.id ? payload.new : o));
        } else if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as any, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const activeCount = orders.filter(o => !["delivered","cancelled"].includes(o.status)).length;
  const avgOrder = orders.length ? totalSpent / orders.length : 0;

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (filter === "active") list = list.filter(o => !["delivered","cancelled"].includes(o.status));
    else if (filter === "delivered") list = list.filter(o => o.status === "delivered");
    else if (filter === "cancelled") list = list.filter(o => o.status === "cancelled");
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(o => o.order_number?.toLowerCase().includes(q) || o.status?.toLowerCase().includes(q));
    }
    return list;
  }, [orders, filter, query]);

  const counts = {
    all: orders.length,
    active: activeCount,
    delivered: deliveredCount,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };


  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Sign in to view your orders</h1>
        <p className="text-muted-foreground text-sm">Track and manage all your purchases</p>
        <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/25 blur-[100px]" />
          <div className="relative">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] block mb-2">Your Journey</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
              My <span className="gold-gradient-text">Orders</span>
            </h1>
            <p className="text-muted-foreground">Track, manage and revisit every purchase.</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        {!loading && orders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Orders", value: String(orders.length), icon: ShoppingBag, color: "text-blue-400" },
              { label: "Active", value: String(activeCount), icon: Truck, color: "text-purple-400" },
              { label: "Delivered", value: String(deliveredCount), icon: CheckCircle, color: "text-green-400" },
              { label: "Avg Order", value: formatPrice(avgOrder), icon: IndianRupee, color: "text-primary" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden relative group hover:border-primary/30 transition-all">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                  <CardContent className="p-4 flex items-center gap-3 relative">
                    <div className="p-2.5 rounded-xl bg-muted/60 group-hover:scale-110 transition-transform">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{s.label}</p>
                      <p className="font-heading font-bold text-sm sm:text-base truncate">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filter tabs + search */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-1 p-1 bg-muted/40 rounded-xl overflow-x-auto">
              {FILTER_TABS.map((t) => {
                const active = filter === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setFilter(t.key)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[10px] px-1.5 rounded-full ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      {counts[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order number or status…"
                className="pl-9 bg-card/60 backdrop-blur border-border/60"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">Start shopping to see your orders here. We have amazing watches waiting for you!</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No orders match this filter.</p>
            <button onClick={() => { setFilter("all"); setQuery(""); }} className="mt-3 text-primary text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, i) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/order/${order.id}`}
                    className="glass-card p-5 sm:p-6 flex items-center justify-between gap-4 block hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.bg.replace("/10","/60")}`} />
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-xl ${status.bg} ${status.color} group-hover:scale-110 transition-transform duration-200`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-sm sm:text-base">{order.order_number}</h3>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </p>
                          <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-heading font-bold text-sm sm:text-base">{formatPrice(order.total_amount)}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


export default Orders;
