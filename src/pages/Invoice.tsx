import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer, FileText, Clock, CreditCard, MapPin, Receipt, Sparkles, CheckCircle2, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Invoice = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
    setDownloading(true);
    const html = generateInvoiceHTML(order, items);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ChronoHub-Invoice-${order.order_number || "order"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setDownloading(false);
      toast({ title: "Invoice Downloaded!", description: `Saved as ChronoHub-Invoice-${order.order_number}.html` });
    }, 800);
  };

  const handlePrint = () => {
    const html = generateInvoiceHTML(order, items);
    const printWindow = window.open("", "_blank", "width=800,height=1100");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => setTimeout(() => printWindow.print(), 300);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order.order_number}`,
          text: `ChronoHub Invoice #${order.order_number} - Total: ${formatPrice(order.total_amount)}`,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Invoice URL copied to clipboard" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Receipt className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg font-heading">Invoice not found</p>
        <Link to="/orders" className="text-primary hover:underline text-sm">View all orders</Link>
      </div>
    );
  }

  const invoiceNumber = `INV-${order.order_number?.replace("ORD-", "")}`;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const orderTime = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const isPaid = order.payment_status === "paid";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Top Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Link to={`/order/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Order
          </Link>
          <div className="flex gap-2">
            <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Invoice
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Invoice Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Decorative top accent */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span className="text-[120px] sm:text-[180px] font-heading font-bold text-muted/[0.03] tracking-widest rotate-[-25deg] block whitespace-nowrap">
              CHRONO
            </span>
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                      Chrono<span className="text-primary">Hub</span>
                    </h2>
                    <p className="text-[11px] text-muted-foreground tracking-wider uppercase">Premium Smart Watches</p>
                  </div>
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground ml-[60px]">
                  <p>GSTIN: 27AABCT1234A1ZA</p>
                  <p>hello@chronohub.in • +91 98765 43210</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl mb-3 border border-primary/20">
                  <Receipt className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-sm font-bold text-primary tracking-[3px] uppercase">Tax Invoice</h3>
                </div>
                <p className="text-lg font-heading font-bold">{invoiceNumber}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 sm:justify-end">
                  <Clock className="w-3 h-3" />
                  <span>{orderDate} at {orderTime}</span>
                </div>
              </div>
            </div>

            {/* Elegant divider */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-primary/40 via-border to-transparent" />
              <div className="w-2 h-2 rounded-full bg-primary/30" />
              <div className="flex-1 h-px bg-gradient-to-l from-primary/40 via-border to-transparent" />
            </div>

            {/* Bill To + Order Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h4 className="font-heading font-semibold text-xs text-primary uppercase tracking-[2px]">Bill To</h4>
                </div>
                <p className="font-semibold text-sm mb-1">{order.shipping_name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
                </p>
                <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1.5">
                  📞 {order.shipping_phone}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h4 className="font-heading font-semibold text-xs text-primary uppercase tracking-[2px]">Order Details</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Order No.", value: order.order_number },
                    { label: "Payment", value: order.payment_method?.toUpperCase() },
                    { label: "Status", value: order.payment_status },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">{row.label}</span>
                      {row.label === "Status" ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPaid ? 'bg-green-500/15 text-green-500' : 'bg-amber-500/15 text-amber-500'}`}>
                          {isPaid && <CheckCircle2 className="w-3 h-3" />}
                          {row.value}
                        </span>
                      ) : (
                        <span className="font-medium text-xs">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Items Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl overflow-hidden border border-border/60 mb-10 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
                    <th className="text-left px-6 py-4 font-heading font-semibold text-[11px] uppercase tracking-[2px] text-primary">#</th>
                    <th className="text-left px-6 py-4 font-heading font-semibold text-[11px] uppercase tracking-[2px] text-primary">Item Description</th>
                    <th className="text-center px-6 py-4 font-heading font-semibold text-[11px] uppercase tracking-[2px] text-primary">Qty</th>
                    <th className="text-right px-6 py-4 font-heading font-semibold text-[11px] uppercase tracking-[2px] text-primary">Unit Price</th>
                    <th className="text-right px-6 py-4 font-heading font-semibold text-[11px] uppercase tracking-[2px] text-primary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                      className="border-t border-border/40 hover:bg-muted/20 transition-colors group"
                    >
                      <td className="px-6 py-5 text-muted-foreground font-medium">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <span className="font-semibold group-hover:text-primary transition-colors">{item.product_name}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-xs font-semibold">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                      <td className="px-6 py-5 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-end">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent border border-border/40">
                <div className="space-y-3">
                  {[
                    { label: "Subtotal", value: formatPrice(order.subtotal) },
                    { label: `CGST (${order.gst_rate / 2}%)`, value: formatPrice(order.gst_amount / 2) },
                    { label: `SGST (${order.gst_rate / 2}%)`, value: formatPrice(order.gst_amount / 2) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-semibold">✨ Free</span>}</span>
                  </div>
                </div>
                <div className="my-4 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="font-heading font-bold text-lg">Grand Total</span>
                  <div className="text-right">
                    <span className="font-heading font-bold text-2xl text-primary">{formatPrice(order.total_amount)}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Incl. all taxes</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Amount in Words */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Amount in words: </span>
                {numberToWords(order.total_amount)} Rupees Only
              </p>
            </motion.div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-10 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-muted-foreground">
                    Thank you for shopping with <span className="font-semibold text-foreground">ChronoHub</span> ✨
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    hello@chronohub.in • +91 98765 43210 • www.chronohub.in
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-[11px] text-muted-foreground italic">
                    This is a computer-generated invoice
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">No signature required</p>
                </div>
              </div>

              {/* QR-like decorative element */}
              <div className="flex justify-center mt-6">
                <div className="grid grid-cols-5 gap-0.5 opacity-20">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-[1px] ${Math.random() > 0.4 ? 'bg-primary' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function numberToWords(num: number): string {
  const whole = Math.floor(num);
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (whole === 0) return "Zero";

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };

  return convert(whole);
}

function generateInvoiceHTML(order: any, items: any[]) {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);

  const rows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:16px 20px;color:#aaa;font-size:13px;font-weight:500;">${i + 1}</td>
      <td style="padding:16px 20px;font-weight:700;color:#1a1a1a;font-size:14px;">${item.product_name}</td>
      <td style="padding:16px 20px;text-align:center;"><span style="background:#f5f5f5;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">${item.quantity}</span></td>
      <td style="padding:16px 20px;text-align:right;color:#888;font-size:13px;">${formatPrice(item.price)}</td>
      <td style="padding:16px 20px;text-align:right;font-weight:700;color:#1a1a1a;font-size:14px;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const isPaid = order.payment_status === "paid";
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${order.order_number} | ChronoHub</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:linear-gradient(135deg,#fafafa 0%,#f0f0f0 100%); color:#1a1a1a; min-height:100vh; }
  .page { max-width:800px; margin:24px auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04); }
  h1,h2,h3,h4 { font-family:'Space Grotesk',sans-serif; }
  .accent { color:#c9861a; }
  .accent-bar { height:5px; background:linear-gradient(90deg,#c9861a,#daa54a,#c9861a40); }
  .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-25deg); font-family:'Space Grotesk',sans-serif; font-size:160px; font-weight:800; color:rgba(0,0,0,0.015); letter-spacing:20px; pointer-events:none; white-space:nowrap; }
  .content { position:relative; padding:48px; }
  .info-card { background:linear-gradient(135deg,#fafafa,#f5f5f5); border:1px solid #eee; border-radius:16px; padding:24px; }
  .label { font-size:10px; color:#c9861a; text-transform:uppercase; letter-spacing:2.5px; font-weight:700; font-family:'Space Grotesk',sans-serif; margin-bottom:14px; }
  table { width:100%; border-collapse:collapse; }
  th { background:linear-gradient(90deg,rgba(201,134,26,0.08),rgba(201,134,26,0.03)); padding:16px 20px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:2px; color:#c9861a; font-family:'Space Grotesk',sans-serif; font-weight:700; }
  .summary { background:linear-gradient(135deg,#fafafa,#fff); border:1px solid #eee; border-radius:16px; padding:24px; }
  .grand-total { font-family:'Space Grotesk',sans-serif; font-size:28px; font-weight:800; color:#c9861a; }
  .paid-badge { display:inline-flex; align-items:center; gap:4px; background:#ecfdf5; color:#059669; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
  .pending-badge { display:inline-flex; align-items:center; gap:4px; background:#fffbeb; color:#d97706; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
  .words-box { background:linear-gradient(90deg,rgba(201,134,26,0.06),transparent); border-left:3px solid #c9861a; padding:12px 16px; border-radius:0 8px 8px 0; margin-top:32px; }
  .footer { text-align:center; padding:24px 48px 32px; border-top:1px solid #eee; }
  .divider { display:flex; align-items:center; gap:16px; margin:32px 0; }
  .divider::before, .divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(201,134,26,0.3),#eee,transparent); }
  .divider::after { background:linear-gradient(270deg,rgba(201,134,26,0.3),#eee,transparent); }
  .divider-dot { width:6px; height:6px; border-radius:50%; background:rgba(201,134,26,0.25); }
  @media print {
    body { background:#fff; padding:0; }
    .page { margin:0; box-shadow:none; border-radius:0; }
    .content { padding:32px; }
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
</style></head><body>
<div class="page">
  <div class="accent-bar"></div>
  <div class="content">
    <div class="watermark">CHRONO</div>
    
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#c9861a,#daa54a);display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:20px;">✦</span>
        </div>
        <div>
          <h1 style="font-size:26px;letter-spacing:-0.5px;">Chrono<span class="accent">Hub</span></h1>
          <p style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:2px;">Premium Smart Watches</p>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,rgba(201,134,26,0.1),rgba(201,134,26,0.03));padding:8px 18px;border-radius:10px;border:1px solid rgba(201,134,26,0.15);margin-bottom:10px;">
          <span style="font-size:12px;">🧾</span>
          <span class="accent" style="font-size:12px;font-weight:700;letter-spacing:3px;font-family:'Space Grotesk',sans-serif;">TAX INVOICE</span>
        </div>
        <p style="font-size:16px;font-weight:700;font-family:'Space Grotesk',sans-serif;">#INV-${order.order_number?.replace("ORD-", "")}</p>
        <p style="font-size:11px;color:#999;margin-top:4px;">📅 ${orderDate}</p>
        <p style="font-size:10px;color:#bbb;">GSTIN: 27AABCT1234A1ZA</p>
      </div>
    </div>

    <div class="divider"><div class="divider-dot"></div></div>

    <div style="display:flex;gap:16px;margin-bottom:32px;">
      <div class="info-card" style="flex:1;">
        <p class="label">📍 Bill To</p>
        <p style="font-weight:700;font-size:15px;margin-bottom:6px;">${order.shipping_name}</p>
        <p style="font-size:12px;color:#777;line-height:1.8;">${order.shipping_address}<br/>${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}</p>
        <p style="font-size:12px;color:#777;margin-top:8px;">📞 ${order.shipping_phone}</p>
      </div>
      <div class="info-card" style="flex:1;">
        <p class="label">💳 Order Details</p>
        <table style="width:100%;"><tbody>
          <tr><td style="padding:5px 0;font-size:12px;color:#aaa;">Order No.</td><td style="padding:5px 0;font-size:13px;font-weight:700;text-align:right;">${order.order_number}</td></tr>
          <tr><td style="padding:5px 0;font-size:12px;color:#aaa;">Payment</td><td style="padding:5px 0;font-size:13px;font-weight:600;text-align:right;text-transform:uppercase;">${order.payment_method}</td></tr>
          <tr><td style="padding:5px 0;font-size:12px;color:#aaa;">Status</td><td style="padding:5px 0;text-align:right;"><span class="${isPaid ? 'paid-badge' : 'pending-badge'}">${isPaid ? '✓' : '⏳'} ${order.payment_status}</span></td></tr>
        </tbody></table>
      </div>
    </div>

    <div style="border:1px solid #eee;border-radius:16px;overflow:hidden;margin-bottom:32px;">
      <table>
        <thead><tr>
          <th>#</th><th>Item Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div style="display:flex;justify-content:flex-end;">
      <div class="summary" style="width:320px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#888;">Subtotal</span><span style="font-weight:600;">${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#888;">CGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#888;">SGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;">
          <span style="color:#888;">Shipping</span><span style="color:#c9861a;font-weight:600;">${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "✨ Free"}</span>
        </div>
        <div style="height:2px;background:linear-gradient(90deg,#c9861a,rgba(201,134,26,0.2));border-radius:1px;margin:14px 0;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
          <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;">Grand Total</span>
          <div style="text-align:right;">
            <span class="grand-total">${formatPrice(order.total_amount)}</span>
            <p style="font-size:9px;color:#bbb;margin-top:2px;">Incl. all taxes</p>
          </div>
        </div>
      </div>
    </div>

    <div class="words-box">
      <p style="font-size:11px;color:#777;"><strong style="color:#333;">Amount in words:</strong> ${numberToWords(Math.floor(order.total_amount))} Rupees Only</p>
    </div>
  </div>

  <div class="footer">
    <p style="font-size:12px;color:#777;">Thank you for shopping with <strong style="color:#1a1a1a;">ChronoHub</strong> ✨</p>
    <p style="font-size:10px;color:#bbb;margin-top:4px;">hello@chronohub.in • +91 98765 43210 • www.chronohub.in</p>
    <p style="font-size:9px;color:#ddd;margin-top:10px;font-style:italic;">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</div>
</body></html>`;
}

export default Invoice;
