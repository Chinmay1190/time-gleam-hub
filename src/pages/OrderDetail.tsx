import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, MapPin, XCircle, FileText, Download, Eye, Printer } from "lucide-react";
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
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !id) return;

    const fetchOrder = async () => {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${id}`,
      }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, id]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const handleViewInvoice = () => {
    setShowInvoice(true);
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      // Auto-trigger print for PDF save
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handlePrintInvoice = () => {
    const invoiceContent = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">{order.order_number}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleViewInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium hover:bg-surface-hover transition-all duration-200 border border-transparent hover:border-primary/20"
              >
                <Eye className="w-4 h-4 text-primary" /> View Invoice
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* Tracking */}
          {!isCancelled && (
            <div className="glass-card p-6 mb-6">
              <h2 className="font-heading font-semibold text-lg mb-6">Order Tracking</h2>
              <div className="relative">
                <div className="flex justify-between">
                  {allStatuses.map((s, i) => {
                    const isActive = i <= currentStatusIndex;
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
                            isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"
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
              {order.tracking_number && (
                <p className="text-xs text-muted-foreground mt-4">
                  Tracking #: <span className="text-foreground font-medium">{order.tracking_number}</span>
                </p>
              )}
              {order.estimated_delivery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated delivery: <span className="text-foreground font-medium">
                    {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                </p>
              )}
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
            <h2 className="font-heading font-semibold text-lg mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  {item.product_image && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 border border-border">
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-heading font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Shipping */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({order.gst_rate}%)</span>
                  <span>{formatPrice(order.gst_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-medium">Free</span>}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-heading font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total_amount)}</span>
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

          {/* Invoice View (inline preview) */}
          {showInvoice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Invoice Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-surface-hover transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:scale-[1.02] transition-transform"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div ref={invoiceRef} className="glass-card p-8 border-primary/20">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="font-heading text-2xl font-bold">
                      Chrono<span className="text-primary">Hub</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Premium Smart Watches</p>
                    <p className="text-xs text-muted-foreground">GSTIN: 27AABCT1234A1ZA</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-heading text-xl font-bold text-primary">TAX INVOICE</h3>
                    <p className="text-xs text-muted-foreground mt-1">Invoice #: INV-{order.order_number?.replace("ORD-", "")}</p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-6" />

                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Bill To</h4>
                    <p className="font-medium">{order.shipping_name}</p>
                    <p className="text-muted-foreground text-xs">{order.shipping_address}</p>
                    <p className="text-muted-foreground text-xs">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Order Details</h4>
                    <p className="text-xs">Order: {order.order_number}</p>
                    <p className="text-xs text-muted-foreground">Payment: {order.payment_method?.toUpperCase()}</p>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-border mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">#</th>
                        <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Item</th>
                        <th className="text-center px-4 py-3 font-medium text-xs uppercase tracking-wider">Qty</th>
                        <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider">Price</th>
                        <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{item.product_name}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST ({order.gst_rate / 2}%)</span>
                      <span>{formatPrice(order.gst_amount / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST ({order.gst_rate / 2}%)</span>
                      <span>{formatPrice(order.gst_amount / 2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "Free"}</span>
                    </div>
                    <div className="border-t border-primary/30 pt-2 flex justify-between font-heading font-bold text-lg">
                      <span>Grand Total</span>
                      <span className="text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-6" />
                <p className="text-center text-xs text-muted-foreground">
                  Thank you for shopping with ChronoHub! • hello@chronohub.in • +91 98765 43210
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

function generateInvoiceHTML(order: any, items: any[]) {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const rows = items.map((item, i) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${i + 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${item.product_name}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">${formatPrice(item.price)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html><head><title>Invoice - ${order.order_number}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:#ffffff; color:#111827; padding:0; }
  .invoice { max-width:800px; margin:0 auto; padding:48px; }
  h1,h2,h3 { font-family:'Space Grotesk',sans-serif; }
  .brand { color:#c9861a; }
  .divider { height:2px; background:linear-gradient(90deg,#c9861a20,#c9861a60,#c9861a20); margin:24px 0; }
  table { width:100%; border-collapse:collapse; margin:20px 0; }
  th { background:#f9fafb; padding:12px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#6b7280; border-bottom:2px solid #e5e7eb; }
  .total-row { font-size:22px; font-weight:700; color:#c9861a; }
  .footer-text { text-align:center; font-size:12px; color:#9ca3af; margin-top:32px; padding-top:24px; border-top:1px solid #e5e7eb; }
  @media print {
    body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice { padding: 24px; }
    .no-print { display: none !important; }
  }
</style></head><body>
<div class="invoice">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
    <div>
      <h1 style="font-size:32px;letter-spacing:-0.5px;">Chrono<span class="brand">Hub</span></h1>
      <p style="font-size:13px;color:#6b7280;margin-top:6px;">Premium Smart Watches</p>
      <p style="font-size:12px;color:#9ca3af;">GSTIN: 27AABCT1234A1ZA</p>
    </div>
    <div style="text-align:right;">
      <h2 class="brand" style="font-size:26px;letter-spacing:2px;">TAX INVOICE</h2>
      <p style="font-size:13px;color:#6b7280;margin-top:6px;">Invoice #: INV-${order.order_number?.replace("ORD-", "")}</p>
      <p style="font-size:13px;color:#6b7280;">Date: ${new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </div>
  <div class="divider"></div>
  <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
    <div>
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:600;">Bill To</p>
      <p style="font-weight:600;font-size:16px;margin-bottom:4px;">${order.shipping_name}</p>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;">${order.shipping_address}<br/>${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
      <p style="font-size:13px;color:#6b7280;margin-top:4px;">${order.shipping_phone}</p>
    </div>
    <div style="text-align:right;">
      <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:600;">Order Info</p>
      <p style="font-size:14px;font-weight:600;">${order.order_number}</p>
      <p style="font-size:13px;color:#6b7280;">Payment: ${order.payment_method?.toUpperCase()}</p>
      <p style="font-size:13px;color:#6b7280;">Status: ${order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}</p>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-top:24px;">
    <div style="width:300px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
        <span style="color:#6b7280;">Subtotal</span><span style="font-weight:500;">${formatPrice(order.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
        <span style="color:#6b7280;">CGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
        <span style="color:#6b7280;">SGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;">
        <span style="color:#6b7280;">Shipping</span><span>${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "Free"}</span>
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;" class="total-row">
        <span>Grand Total</span><span>${formatPrice(order.total_amount)}</span>
      </div>
    </div>
  </div>
  <p class="footer-text">Thank you for shopping with ChronoHub!<br/>hello@chronohub.in • +91 98765 43210<br/><br/><em style="font-size:11px;">This is a computer-generated invoice and does not require a signature.</em></p>
</div>
</body></html>`;
}

export default OrderDetail;
