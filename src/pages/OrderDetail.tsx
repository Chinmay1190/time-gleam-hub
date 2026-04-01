import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, XCircle, Eye, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const allStatuses = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const fetchOrder = async () => {
      const { data: orderData } = await supabase
        .from("orders").select("*").eq("id", id).eq("user_id", user.id).single();
      const { data: itemsData } = await supabase
        .from("order_items").select("*").eq("order_id", id);
      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
    };
    fetchOrder();

    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}`,
      }, (payload) => {
        const newOrder = payload.new as any;
        const oldStatus = order?.status;
        setOrder(newOrder);
        // Show realtime toast when status changes
        if (oldStatus && oldStatus !== newOrder.status) {
          const statusLabel = allStatuses.find(s => s.key === newOrder.status)?.label || newOrder.status;
          import("sonner").then(({ toast }) => {
            toast.success(`Order ${statusLabel}`, {
              description: `Your order ${newOrder.order_number} has been updated to "${statusLabel}"`,
            });
          });
        }
      })
      .subscribe();

    // Also subscribe to order_items changes
    const itemsChannel = supabase
      .channel(`order-items-${id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "order_items", filter: `order_id=eq.${id}`,
      }, () => {
        // Refetch items on any change
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

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm">View all orders</Link>
      </div>
    );
  }

  const currentStatusIndex = allStatuses.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header with separate buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/invoice/${id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Eye className="w-4 h-4" /> View Invoice
              </Link>
              <Link
                to={`/invoice/${id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" /> Download PDF
              </Link>
            </div>
          </div>

          {/* Enhanced Tracking */}
          {!isCancelled && (
            <div className="glass-card p-6 sm:p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-semibold text-lg">Order Tracking</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{order.status?.replace("_", " ")}</span>
              </div>
              <div className="relative">
                <div className="flex justify-between">
                  {allStatuses.map((s, i) => {
                    const isActive = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className="flex flex-col items-center flex-1 relative">
                        {i > 0 && (
                          <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 transition-colors duration-500 ${
                            i <= currentStatusIndex ? "bg-primary" : "bg-muted"
                          }`} />
                        )}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                              : isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Status Timestamps */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {order.created_at && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Order Placed</p>
                    <p className="text-xs font-medium mt-1">{new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}
                {order.confirmed_at && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Confirmed</p>
                    <p className="text-xs font-medium mt-1">{new Date(order.confirmed_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.confirmed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Shipped</p>
                    <p className="text-xs font-medium mt-1">{new Date(order.shipped_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.shipped_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-[10px] text-primary uppercase tracking-wider font-semibold">Delivered</p>
                    <p className="text-xs font-medium mt-1">{new Date(order.delivered_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.delivered_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}
              </div>
              {order.tracking_number && (
                <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    Tracking #: <span className="text-foreground font-mono font-medium">{order.tracking_number}</span>
                  </p>
                </div>
              )}
              {order.estimated_delivery && (
                <p className="text-xs text-muted-foreground mt-3">
                  📦 Estimated delivery: <span className="text-foreground font-medium">
                    {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                </p>
              )}
              {/* Last updated indicator */}
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Live tracking • Last updated {new Date(order.updated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="glass-card p-6 mb-6 border-destructive/30">
              <div className="flex items-center gap-3 text-destructive">
                <XCircle className="w-6 h-6" />
                <span className="font-heading font-semibold">Order Cancelled</span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="glass-card p-6 mb-6">
            <h2 className="font-heading font-semibold text-lg mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/20 transition-colors">
                  {item.product_image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 border border-border">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-heading font-bold text-sm self-center">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Shipping */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST ({order.gst_rate}%)</span><span>{formatPrice(order.gst_amount)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-medium">Free</span>}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-heading font-bold text-lg">
                  <span>Total</span><span className="text-primary">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Shipping Address</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p>{order.shipping_phone}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Payment: <span className="text-foreground font-medium uppercase">{order.payment_method}</span></p>
                <p className="text-xs text-muted-foreground">Status: <span className="text-foreground font-medium capitalize">{order.payment_status}</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;
