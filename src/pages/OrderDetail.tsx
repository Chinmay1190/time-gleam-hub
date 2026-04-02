import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, XCircle, Eye, Download, RefreshCw, Bell, FileText, Copy, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const allStatuses = [
  { key: "pending", label: "Order Placed", icon: Clock, description: "Your order has been received" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, description: "Seller has confirmed your order" },
  { key: "processing", label: "Processing", icon: Package, description: "Your order is being prepared" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "Your order is on the way" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin, description: "Arriving today" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Successfully delivered" },
];

const statusTimestampKeys: Record<string, string> = {
  pending: "created_at",
  confirmed: "confirmed_at",
  shipped: "shipped_at",
  delivered: "delivered_at",
};

const deliverySimulationFlow = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [simulatingDelivery, setSimulatingDelivery] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const fetchData = async () => {
    if (!user || !id) return;
    const { data: orderData } = await supabase
      .from("orders").select("*").eq("id", id).eq("user_id", user.id).single();
    const { data: itemsData } = await supabase
      .from("order_items").select("*").eq("order_id", id);
    setOrder(orderData);
    setItems(itemsData || []);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 600);
    toast({ title: "✅ Status refreshed", description: "Order tracking is up to date" });
  };

  useEffect(() => {
    if (!user || !id) return;
    fetchData();

    const channel = supabase
      .channel(`order-detail-${id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}`,
      }, (payload) => {
        const newOrder = payload.new as any;
        if (prevStatusRef.current && prevStatusRef.current !== newOrder.status) {
          setStatusChanged(true);
          setTimeout(() => setStatusChanged(false), 3000);
          const statusLabel = allStatuses.find(s => s.key === newOrder.status)?.label || newOrder.status;
          toast({
            title: `🔔 Order ${statusLabel}!`,
            description: `Your order ${newOrder.order_number} status updated to "${statusLabel}"`,
          });
        }
        prevStatusRef.current = newOrder.status;
        setOrder(newOrder);
      })
      .subscribe();

    const itemsChannel = supabase
      .channel(`order-items-detail-${id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "order_items", filter: `order_id=eq.${id}`,
      }, () => {
        supabase.from("order_items").select("*").eq("order_id", id).then(({ data }) => {
          if (data) setItems(data);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, [user, id]);

  useEffect(() => {
    if (order) prevStatusRef.current = order.status;
  }, [order?.status]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, id]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const getNextSimulatedStatus = (status: string) => {
    const currentIndex = deliverySimulationFlow.indexOf(status);

    if (currentIndex === -1 || currentIndex >= deliverySimulationFlow.length - 1) {
      return null;
    }

    return deliverySimulationFlow[currentIndex + 1];
  };

  const handleSimulateDelivery = async () => {
    if (!user || !id || !order || simulatingDelivery) return;

    const nextStatus = getNextSimulatedStatus(order.status);

    if (!nextStatus) {
      toast({
        title: order.status === "delivered" ? "Already delivered" : "Simulation unavailable",
        description: order.status === "cancelled"
          ? "Cancelled orders cannot be advanced."
          : "This order is already at the final delivery step.",
      });
      return;
    }

    setSimulatingDelivery(true);

    try {
      const now = new Date().toISOString();
      const nextLabel = allStatuses.find((status) => status.key === nextStatus)?.label || nextStatus;
      const updates: Record<string, string> = {
        status: nextStatus,
        updated_at: now,
      };

      if (nextStatus === "confirmed" && !order.confirmed_at) {
        updates.confirmed_at = now;
      }

      if ((nextStatus === "shipped" || nextStatus === "out_for_delivery" || nextStatus === "delivered") && !order.confirmed_at) {
        updates.confirmed_at = now;
      }

      if ((nextStatus === "shipped" || nextStatus === "out_for_delivery" || nextStatus === "delivered") && !order.shipped_at) {
        updates.shipped_at = now;
      }

      if (nextStatus === "out_for_delivery" && !order.estimated_delivery) {
        updates.estimated_delivery = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      if (nextStatus === "delivered") {
        updates.delivered_at = now;
        if (!order.estimated_delivery) {
          updates.estimated_delivery = now;
        }
      }

      if ((nextStatus === "shipped" || nextStatus === "out_for_delivery" || nextStatus === "delivered") && !order.tracking_number) {
        updates.tracking_number = `TRK-${(order.order_number || id).replace(/[^A-Za-z0-9]/g, "").slice(-10).toUpperCase()}`;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setOrder(data);
      }

      toast({
        title: "Simulation updated",
        description: `This order moved to ${nextLabel} without affecting other options.`,
      });
    } catch {
      toast({
        title: "Simulation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSimulatingDelivery(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Package className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse font-heading">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center border border-border">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg font-heading">Order not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm">View all orders</Link>
      </div>
    );
  }

  const currentStatusIndex = allStatuses.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";
  const completedSteps = Math.max(currentStatusIndex + 1, 1);
  const trackingProgress = isCancelled ? 0 : Math.min((completedSteps / allStatuses.length) * 100, 100);
  const currentStatus = allStatuses.find((s) => s.key === order.status) || allStatuses[0];
  const nextSimulatedStatus = getNextSimulatedStatus(order.status);
  const nextSimulatedLabel = nextSimulatedStatus
    ? allStatuses.find((status) => status.key === nextSimulatedStatus)?.label || nextSimulatedStatus
    : null;

  const trackingActions = [
    {
      label: "Refresh Status",
      description: "Get the latest delivery movement",
      icon: RefreshCw,
      onClick: handleRefresh,
      isButton: true,
      active: refreshing,
    },
    {
      label: "Simulate Delivery",
      description: nextSimulatedLabel
        ? `Move this order to ${nextSimulatedLabel}`
        : order.status === "cancelled"
          ? "Cancelled orders cannot be simulated"
          : "This order has completed the delivery flow",
      icon: Truck,
      onClick: handleSimulateDelivery,
      isButton: true,
      active: simulatingDelivery,
      disabled: !nextSimulatedStatus || simulatingDelivery,
    },
    {
      label: "View Invoice",
      description: "Open the invoice in a separate page",
      icon: Eye,
      to: `/invoice/${id}`,
    },
    {
      label: "Download PDF",
      description: "Save a copy of your invoice anytime",
      icon: Download,
      to: `/invoice/${id}?download=1`,
    },
    ...(order.tracking_number
      ? [{
          label: "Copy Tracking ID",
          description: order.tracking_number,
          icon: Copy,
          onClick: async () => {
            await navigator.clipboard.writeText(order.tracking_number);
            toast({ title: "Tracking ID copied", description: "You can now paste it anywhere." });
          },
          isButton: true,
        }]
      : []),
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Orders
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Tracking dashboard
            </div>
          </div>

          <div className="grid gap-4 mb-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="glass-card premium-border p-6 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Current status</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <currentStatus.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold">{currentStatus.label}</h2>
                      <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[240px]">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                    <p className="mt-1 font-heading text-2xl font-black text-primary">{Math.round(trackingProgress)}%</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
                    <p className="mt-1 text-sm font-semibold">{formatTime(order.updated_at)}</p>
                    <p className="text-[11px] text-muted-foreground">Live status sync</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${trackingProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                  Live updates enabled
                </span>
                {order.estimated_delivery && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    Delivery by {formatDate(order.estimated_delivery)}
                  </span>
                )}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading text-lg font-bold">Tracking Options</h2>
                  <p className="text-xs text-muted-foreground">Quick actions for this order</p>
                </div>
                <FileText className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-2.5">
                {trackingActions.map((action) => {
                  const Icon = action.icon;

                  if (action.isButton) {
                    return (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/80 text-primary">
                          <Icon className={`w-4 h-4 ${action.active ? "animate-spin" : ""}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{action.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={action.label}
                      to={action.to!}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card/80 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{action.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Change Alert */}
          <AnimatePresence>
            {statusChanged && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3"
              >
                <Bell className="w-5 h-5 text-primary animate-bounce" />
                <span className="text-sm font-medium text-primary">Order status just updated!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vertical Timeline Tracking */}
          {!isCancelled && (
            <div className="glass-card p-6 sm:p-8 mb-6 overflow-hidden relative">
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.05] to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-bold text-lg">Live Order Tracking</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time updates every 30 seconds</p>
                </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">Live</span>
                </div>
              </div>

              {/* Horizontal Stepper for large screens */}
              <div className="hidden sm:block">
                <div className="relative flex justify-between">
                  {allStatuses.map((s, i) => {
                    const isActive = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    const Icon = s.icon;
                    const tsKey = statusTimestampKeys[s.key];
                    const timestamp = tsKey ? order[tsKey] : null;
                    return (
                      <div key={s.key} className="flex flex-col items-center flex-1 relative">
                        {i > 0 && (
                          <div className={`absolute top-6 right-1/2 w-full h-1 -z-10 rounded-full transition-all duration-700 ${
                            i <= currentStatusIndex
                              ? "bg-gradient-to-r from-primary to-primary/80"
                              : "bg-muted"
                          }`} />
                        )}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isCurrent
                              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/40 ring-[5px] ring-primary/15 scale-110"
                              : isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>
                        <span className={`text-[10px] sm:text-xs font-semibold mt-2.5 text-center transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {s.label}
                        </span>
                        {timestamp && (
                          <span className="text-[9px] text-muted-foreground mt-0.5">{formatDate(timestamp)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical Timeline for mobile */}
              <div className="sm:hidden space-y-0">
                {allStatuses.map((s, i) => {
                  const isActive = i <= currentStatusIndex;
                  const isCurrent = i === currentStatusIndex;
                  const Icon = s.icon;
                  const tsKey = statusTimestampKeys[s.key];
                  const timestamp = tsKey ? order[tsKey] : null;
                  return (
                    <div key={s.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCurrent
                              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/15"
                              : isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        {i < allStatuses.length - 1 && (
                          <div className={`w-0.5 h-10 transition-colors ${i < currentStatusIndex ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                      <div className="pb-6 pt-2">
                        <span className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                        <p className="text-[11px] text-muted-foreground">{s.description}</p>
                        {timestamp && <p className="text-[10px] text-primary mt-0.5">{formatDate(timestamp)} at {formatTime(timestamp)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Details Cards */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Placed", ts: order.created_at, active: true },
                  { label: "Confirmed", ts: order.confirmed_at, active: !!order.confirmed_at },
                  { label: "Shipped", ts: order.shipped_at, active: !!order.shipped_at },
                  { label: "Delivered", ts: order.delivered_at, active: !!order.delivered_at },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-xl border transition-all ${item.active && item.ts ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/40 opacity-50"}`}>
                    <p className={`text-[9px] uppercase tracking-[2px] font-bold ${item.active && item.ts ? "text-primary" : "text-muted-foreground"}`}>{item.label}</p>
                    {item.ts ? (
                      <>
                        <p className="text-xs font-semibold mt-1">{formatDate(item.ts)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(item.ts)}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-1">—</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tracking Number */}
              {order.tracking_number && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Tracking #: <span className="text-foreground font-mono font-bold">{order.tracking_number}</span>
                  </p>
                  <button onClick={() => { navigator.clipboard.writeText(order.tracking_number); toast({ title: "Copied!" }); }} className="text-[10px] text-primary font-semibold hover:underline">
                    Copy
                  </button>
                </motion.div>
              )}

              {/* Estimated Delivery */}
              {order.estimated_delivery && (
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    📦 Estimated delivery: <span className="text-foreground font-bold">{formatDate(order.estimated_delivery)}</span>
                  </p>
                </div>
              )}

              {/* Live indicator */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">
                    Live tracking • Updated {formatTime(order.updated_at)}
                  </span>
                </div>
                <button onClick={handleRefresh} className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh now
                </button>
              </div>
            </div>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mb-6 border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-3 text-destructive">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg">Order Cancelled</span>
                  <p className="text-xs text-destructive/70 mt-0.5">This order has been cancelled.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Items */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
            <h2 className="font-heading font-bold text-lg mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.04 }}
                  className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  {item.product_image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 border border-border group-hover:border-primary/20 transition-colors">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-heading font-bold text-sm self-center">{formatPrice(item.price * item.quantity)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Summary + Shipping */}
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h2 className="font-heading font-bold text-lg mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST ({order.gst_rate}%)</span><span className="font-medium">{formatPrice(order.gst_amount)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-bold">FREE</span>}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-heading font-black text-lg">
                  <span>Total</span><span className="text-primary">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
              <h2 className="font-heading font-bold text-lg mb-4">Shipping Address</h2>
              <div className="text-sm text-muted-foreground space-y-1.5">
                <p className="text-foreground font-semibold">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p>{order.shipping_phone}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-1.5">
                  <p className="text-xs text-muted-foreground">Payment: <span className="text-foreground font-semibold uppercase">{order.payment_method}</span></p>
                <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold capitalize" style={{ color: order.payment_status === "paid" ? "hsl(var(--success))" : "hsl(var(--primary))" }}>{order.payment_status}</span>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;
