import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Invoice = () => {
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
  }, [user, id]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const handleDownload = () => {
    const invoiceContent = generateInvoiceHTML(order, items);
    const blob = new Blob([invoiceContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const invoiceContent = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
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
        <p className="text-muted-foreground">Invoice not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm">View all orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link to={`/order/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </Link>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium hover:bg-surface-hover transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownload} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border-primary/20">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold">Chrono<span className="text-primary">Hub</span></h2>
              <p className="text-xs text-muted-foreground mt-1">Premium Smart Watches</p>
              <p className="text-xs text-muted-foreground">GSTIN: 27AABCT1234A1ZA</p>
            </div>
            <div className="text-right">
              <h3 className="font-heading text-xl font-bold text-primary">TAX INVOICE</h3>
              <p className="text-xs text-muted-foreground mt-1">Invoice #: INV-{order.order_number?.replace("ORD-", "")}</p>
              <p className="text-xs text-muted-foreground">Date: {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-6" />

          {/* Bill To / Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div>
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Bill To</h4>
              <p className="font-medium">{order.shipping_name}</p>
              <p className="text-muted-foreground text-xs">{order.shipping_address}</p>
              <p className="text-muted-foreground text-xs">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
              <p className="text-muted-foreground text-xs mt-1">{order.shipping_phone}</p>
            </div>
            <div className="text-right">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-2">Order Details</h4>
              <p className="text-xs font-medium">{order.order_number}</p>
              <p className="text-xs text-muted-foreground">Payment: {order.payment_method?.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">Status: {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}</p>
            </div>
          </div>

          {/* Items Table */}
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

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CGST ({order.gst_rate / 2}%)</span><span>{formatPrice(order.gst_amount / 2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SGST ({order.gst_rate / 2}%)</span><span>{formatPrice(order.gst_amount / 2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "Free"}</span></div>
              <div className="border-t border-primary/30 pt-2 flex justify-between font-heading font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent my-6" />
          <p className="text-center text-xs text-muted-foreground">
            Thank you for shopping with ChronoHub! • hello@chronohub.in • +91 98765 43210
            <br /><em className="text-[10px]">This is a computer-generated invoice and does not require a signature.</em>
          </p>
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

export default Invoice;
