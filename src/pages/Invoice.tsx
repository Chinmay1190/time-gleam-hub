import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
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

  const handleDownloadPDF = () => {
    const html = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 300);
      };
    }
  };

  const handlePrint = () => {
    const html = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 300);
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
        <FileText className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Invoice not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm">View all orders</Link>
      </div>
    );
  }

  const invoiceNumber = `INV-${order.order_number?.replace("ORD-", "")}`;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Link to={`/order/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </Link>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" /> Save as PDF
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Gold accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div>
                <h2 className="font-heading text-3xl font-bold tracking-tight">
                  Chrono<span className="text-primary">Hub</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Premium Smart Watches</p>
                <p className="text-xs text-muted-foreground">GSTIN: 27AABCT1234A1ZA</p>
                <p className="text-xs text-muted-foreground">hello@chronohub.in • +91 98765 43210</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-lg mb-2">
                  <h3 className="font-heading text-lg font-bold text-primary tracking-wider">TAX INVOICE</h3>
                </div>
                <p className="text-sm font-medium">{invoiceNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">{orderDate}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-primary/30 via-border to-primary/30 mb-8" />

            {/* Bill To + Order Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div className="p-5 rounded-xl bg-muted/30 border border-border">
                <h4 className="font-heading font-semibold text-xs text-primary uppercase tracking-widest mb-3">Bill To</h4>
                <p className="font-semibold text-sm">{order.shipping_name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{order.shipping_phone}</p>
              </div>
              <div className="p-5 rounded-xl bg-muted/30 border border-border">
                <h4 className="font-heading font-semibold text-xs text-primary uppercase tracking-widest mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Order No.</span>
                    <span className="font-medium text-xs">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Payment</span>
                    <span className="font-medium text-xs uppercase">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-xs">Status</span>
                    <span className="font-medium text-xs capitalize">{order.payment_status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl overflow-hidden border border-border mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="text-left px-5 py-3.5 font-heading font-semibold text-xs uppercase tracking-wider text-primary">#</th>
                    <th className="text-left px-5 py-3.5 font-heading font-semibold text-xs uppercase tracking-wider text-primary">Item Description</th>
                    <th className="text-center px-5 py-3.5 font-heading font-semibold text-xs uppercase tracking-wider text-primary">Qty</th>
                    <th className="text-right px-5 py-3.5 font-heading font-semibold text-xs uppercase tracking-wider text-primary">Unit Price</th>
                    <th className="text-right px-5 py-3.5 font-heading font-semibold text-xs uppercase tracking-wider text-primary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 text-muted-foreground">{idx + 1}</td>
                      <td className="px-5 py-4 font-medium">{item.product_name}</td>
                      <td className="px-5 py-4 text-center">{item.quantity}</td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                      <td className="px-5 py-4 text-right font-semibold">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST ({order.gst_rate / 2}%)</span>
                  <span>{formatPrice(order.gst_amount / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST ({order.gst_rate / 2}%)</span>
                  <span>{formatPrice(order.gst_amount / 2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-medium">Free</span>}</span>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/40 to-transparent my-2" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-heading font-bold text-lg">Grand Total</span>
                  <span className="font-heading font-bold text-xl text-primary">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Thank you for shopping with <span className="font-semibold text-foreground">ChronoHub</span>!
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 italic">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function generateInvoiceHTML(order: any, items: any[]) {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const rows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:14px 18px;color:#9ca3af;font-size:13px;">${i + 1}</td>
      <td style="padding:14px 18px;font-weight:600;color:#111827;font-size:14px;">${item.product_name}</td>
      <td style="padding:14px 18px;text-align:center;color:#374151;font-size:13px;">${item.quantity}</td>
      <td style="padding:14px 18px;text-align:right;color:#6b7280;font-size:13px;">${formatPrice(item.price)}</td>
      <td style="padding:14px 18px;text-align:right;font-weight:600;color:#111827;font-size:14px;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html><head>
<title>Invoice - ${order.order_number} | ChronoHub</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:#fff; color:#111827; }
  .invoice { max-width:780px; margin:0 auto; padding:48px; }
  h1,h2,h3,h4 { font-family:'Space Grotesk',sans-serif; }
  .brand { color:#c9861a; }
  .accent-bar { height:4px; background:linear-gradient(90deg,#c9861a,#c9861a80,#c9861a30); border-radius:2px; margin-bottom:40px; }
  .info-box { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#fef9f0; padding:14px 18px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#c9861a; font-family:'Space Grotesk',sans-serif; font-weight:600; border-bottom:2px solid #f0dfc0; }
  .total-row { font-size:24px; font-weight:700; color:#c9861a; font-family:'Space Grotesk',sans-serif; }
  .footer { text-align:center; font-size:12px; color:#9ca3af; margin-top:40px; padding-top:24px; border-top:1px solid #e5e7eb; }
  @media print {
    body { padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .invoice { padding:24px; }
  }
</style></head><body>
<div class="invoice">
  <div class="accent-bar"></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;">
    <div>
      <h1 style="font-size:28px;letter-spacing:-0.5px;">Chrono<span class="brand">Hub</span></h1>
      <p style="font-size:12px;color:#9ca3af;margin-top:4px;">Premium Smart Watches</p>
      <p style="font-size:11px;color:#9ca3af;">GSTIN: 27AABCT1234A1ZA</p>
    </div>
    <div style="text-align:right;">
      <div style="display:inline-block;background:#fef9f0;padding:6px 16px;border-radius:8px;margin-bottom:8px;">
        <h2 class="brand" style="font-size:18px;letter-spacing:3px;">TAX INVOICE</h2>
      </div>
      <p style="font-size:14px;font-weight:600;">#INV-${order.order_number?.replace("ORD-", "")}</p>
      <p style="font-size:12px;color:#6b7280;margin-top:4px;">${new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  </div>

  <div style="display:flex;gap:20px;margin-bottom:36px;">
    <div class="info-box" style="flex:1;">
      <p style="font-size:10px;color:#c9861a;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;">Bill To</p>
      <p style="font-weight:600;font-size:15px;margin-bottom:6px;">${order.shipping_name}</p>
      <p style="font-size:12px;color:#6b7280;line-height:1.7;">${order.shipping_address}<br/>${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}</p>
      <p style="font-size:12px;color:#6b7280;margin-top:6px;">📞 ${order.shipping_phone}</p>
    </div>
    <div class="info-box" style="flex:1;">
      <p style="font-size:10px;color:#c9861a;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:12px;font-family:'Space Grotesk',sans-serif;">Order Info</p>
      <table style="width:100%;"><tbody>
        <tr><td style="padding:4px 0;font-size:12px;color:#9ca3af;">Order No.</td><td style="padding:4px 0;font-size:13px;font-weight:600;text-align:right;">${order.order_number}</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#9ca3af;">Payment</td><td style="padding:4px 0;font-size:13px;font-weight:500;text-align:right;text-transform:uppercase;">${order.payment_method}</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:#9ca3af;">Status</td><td style="padding:4px 0;font-size:13px;font-weight:500;text-align:right;text-transform:capitalize;">${order.payment_status}</td></tr>
      </tbody></table>
    </div>
  </div>

  <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:32px;">
    <table>
      <thead><tr>
        <th>#</th><th>Item Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div style="display:flex;justify-content:flex-end;">
    <div style="width:280px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
        <span style="color:#6b7280;">Subtotal</span><span style="font-weight:500;">${formatPrice(order.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
        <span style="color:#6b7280;">CGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
        <span style="color:#6b7280;">SGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
        <span style="color:#6b7280;">Shipping</span><span>${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "Free"}</span>
      </div>
      <div style="height:2px;background:linear-gradient(90deg,#c9861a,#c9861a40);border-radius:1px;margin:12px 0;"></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;" class="total-row">
        <span>Grand Total</span><span>${formatPrice(order.total_amount)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with <strong>ChronoHub</strong>!</p>
    <p style="margin-top:4px;">hello@chronohub.in • +91 98765 43210</p>
    <p style="margin-top:8px;font-size:10px;font-style:italic;color:#c0c0c0;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</div>
</body></html>`;
}

export default Invoice;
