import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer, Clock, CreditCard, MapPin, Receipt, Sparkles, CheckCircle2, Share2, Shield, Hash, Phone, Mail, Globe, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.background = "#fff";
      container.innerHTML = generateInvoiceHTMLForPDF(order, items);
      document.body.appendChild(container);
      await new Promise((r) => setTimeout(r, 500));
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 800 });
      document.body.removeChild(container);
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = 297;
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        let pos = 0;
        let rem = imgHeight;
        while (rem > 0) {
          pdf.addImage(imgData, "JPEG", 0, pos, imgWidth, imgHeight);
          rem -= pageHeight;
          pos -= pageHeight;
          if (rem > 0) pdf.addPage();
        }
      }
      pdf.save(`ChronoHub-Invoice-${order.order_number || "order"}.pdf`);
      toast({ title: "✅ Invoice Downloaded!", description: `Saved as PDF — viewable on any device` });
    } catch {
      toast({ title: "Download failed", description: "Please try the Print option instead", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const html = generatePrintHTML(order, items);
    const w = window.open("", "_blank", "width=800,height=1100");
    if (w) { w.document.write(html); w.document.close(); w.onload = () => setTimeout(() => w.print(), 300); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Invoice ${order.order_number}`, text: `ChronoHub Invoice #${order.order_number} - Total: ${formatPrice(order.total_amount)}` }); } catch {}
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
            <div className="w-20 h-20 border-2 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Receipt className="absolute inset-0 m-auto w-7 h-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse font-heading">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center border border-border">
          <Receipt className="w-12 h-12 text-muted-foreground" />
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
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Action Bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Link to={`/order/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Order
          </Link>
          <div className="flex gap-2 flex-wrap">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePrint} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-all">
              <Printer className="w-4 h-4" /> Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
            >
              {downloading ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="w-4 h-4" /> Download PDF</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Invoice Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative bg-card border border-border rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-accent/40" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/[0.04] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/[0.03] to-transparent pointer-events-none" />
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <span className="text-[140px] sm:text-[200px] font-heading font-black text-muted/[0.02] tracking-[20px] rotate-[-30deg] block whitespace-nowrap">
              CHRONO
            </span>
          </div>

          <div className="relative p-6 sm:p-10 lg:p-14">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30 ring-4 ring-primary/10">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight">
                      Chrono<span className="text-primary">Hub</span>
                    </h2>
                    <p className="text-[10px] text-muted-foreground tracking-[4px] uppercase font-medium">Premium Smart Watches</p>
                  </div>
                </div>
                <div className="ml-[72px] space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-primary/60" /><span>GSTIN: 27AABCT1234A1ZA</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-primary/60" /><span>hello@chronohub.in</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-primary/60" /><span>+91 98765 43210</span></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-left sm:text-right">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-2xl mb-4 border border-primary/20 shadow-sm">
                  <Receipt className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-sm font-bold text-primary tracking-[4px] uppercase">Tax Invoice</h3>
                </div>
                <p className="text-xl font-heading font-black tracking-tight">{invoiceNumber}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 sm:justify-end">
                  <Clock className="w-3 h-3" />
                  <span>{orderDate} • {orderTime}</span>
                </div>
                {/* Payment badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${isPaid ? 'bg-green-500/15 text-green-600 border border-green-500/20' : 'bg-amber-500/15 text-amber-600 border border-amber-500/20'}`}>
                    {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {isPaid ? "PAID" : "PAYMENT PENDING"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Ornate divider */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 via-border to-transparent" />
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-primary/50 via-border to-transparent" />
            </div>

            {/* Bill To + Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative p-6 rounded-2xl bg-gradient-to-br from-muted/50 via-muted/20 to-transparent border border-border/60 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/[0.06] to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-primary uppercase tracking-[3px]">Bill To</h4>
                </div>
                <p className="font-bold text-sm mb-2">{order.shipping_name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
                </p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {order.shipping_phone}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative p-6 rounded-2xl bg-gradient-to-br from-muted/50 via-muted/20 to-transparent border border-border/60 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/[0.06] to-transparent" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-primary uppercase tracking-[3px]">Order Info</h4>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Order No.", value: order.order_number, icon: Hash },
                    { label: "Payment Mode", value: order.payment_method?.toUpperCase(), icon: CreditCard },
                    { label: "Order Date", value: orderDate, icon: Clock },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                        <row.icon className="w-3 h-3" /> {row.label}
                      </span>
                      <span className="font-semibold text-xs">{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Items Table */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl overflow-hidden border border-border/60 mb-8 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <th className="text-left px-5 py-4 font-heading font-bold text-[10px] uppercase tracking-[3px] text-primary">Sr.</th>
                    <th className="text-left px-5 py-4 font-heading font-bold text-[10px] uppercase tracking-[3px] text-primary">Product</th>
                    <th className="text-center px-5 py-4 font-heading font-bold text-[10px] uppercase tracking-[3px] text-primary">Qty</th>
                    <th className="text-right px-5 py-4 font-heading font-bold text-[10px] uppercase tracking-[3px] text-primary">Rate</th>
                    <th className="text-right px-5 py-4 font-heading font-bold text-[10px] uppercase tracking-[3px] text-primary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.04 }}
                      className="border-t border-border/30 hover:bg-primary/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{item.product_name}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-xs font-bold border border-border/50">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-muted-foreground text-xs">{formatPrice(item.price)}</td>
                      <td className="px-5 py-4 text-right font-bold text-sm">{formatPrice(item.price * item.quantity)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-end">
              <div className="w-full max-w-sm">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/40 via-muted/20 to-transparent border border-border/50">
                  <div className="space-y-3">
                    {[
                      { label: "Subtotal", value: formatPrice(order.subtotal) },
                      { label: `CGST (${order.gst_rate / 2}%)`, value: formatPrice(order.gst_amount / 2) },
                      { label: `SGST (${order.gst_rate / 2}%)`, value: formatPrice(order.gst_amount / 2) },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : <span className="text-primary font-bold">FREE</span>}</span>
                    </div>
                  </div>
                  <div className="my-4 h-[2px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent rounded-full" />
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Grand Total</span>
                      <p className="font-heading font-black text-2xl text-primary mt-0.5">{formatPrice(order.total_amount)}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">Incl. all taxes</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Amount in Words */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-transparent border-l-4 border-primary/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Amount in words: </span>
                <span className="italic">{numberToWords(order.total_amount)} Rupees Only</span>
              </p>
            </motion.div>

            {/* Terms */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 p-4 rounded-xl bg-muted/20 border border-border/30">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Terms & Conditions</p>
              <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                <li>Products are covered under manufacturer warranty.</li>
                <li>Returns accepted within 7 days of delivery for eligible items.</li>
                <li>This is a computer-generated invoice and does not require a signature.</li>
              </ul>
            </motion.div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="mt-10 pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-muted-foreground">
                    Thank you for choosing <span className="font-bold text-foreground">ChronoHub</span>
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 mt-1.5">
                    <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> hello@chronohub.in</span>
                    <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> +91 98765 43210</span>
                    <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> chronohub.in</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary/30">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
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

function generateInvoiceHTMLForPDF(order: any, items: any[]) {
  const formatPrice = (p: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);
  const isPaid = order.payment_status === "paid";
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const rows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:14px 18px;color:#bbb;font-size:12px;font-family:monospace;">${String(i+1).padStart(2,'0')}</td>
      <td style="padding:14px 18px;font-weight:700;color:#1a1a1a;font-size:13px;">${item.product_name}</td>
      <td style="padding:14px 18px;text-align:center;font-size:13px;font-weight:600;">${item.quantity}</td>
      <td style="padding:14px 18px;text-align:right;color:#888;font-size:12px;">${formatPrice(item.price)}</td>
      <td style="padding:14px 18px;text-align:right;font-weight:700;color:#1a1a1a;font-size:13px;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;width:800px;background:#fff;">
    <div style="height:6px;background:linear-gradient(90deg,#c9861a,#daa54a,rgba(201,134,26,0.3));"></div>
    <div style="padding:44px 48px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#c9861a,#daa54a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;">C</div>
          <div>
            <div style="font-size:28px;font-weight:900;letter-spacing:-1px;">Chrono<span style="color:#c9861a;">Hub</span></div>
            <div style="font-size:8px;color:#aaa;text-transform:uppercase;letter-spacing:4px;margin-top:2px;">Premium Smart Watches</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="display:inline-block;background:rgba(201,134,26,0.08);padding:8px 18px;border-radius:10px;border:1px solid rgba(201,134,26,0.15);margin-bottom:10px;">
            <span style="color:#c9861a;font-size:11px;font-weight:800;letter-spacing:4px;">TAX INVOICE</span>
          </div>
          <div style="font-size:16px;font-weight:900;">#INV-${order.order_number?.replace("ORD-","")}</div>
          <div style="font-size:11px;color:#999;margin-top:4px;">${orderDate}</div>
          <div style="margin-top:8px;display:inline-block;background:${isPaid?'#ecfdf5':'#fffbeb'};color:${isPaid?'#059669':'#d97706'};padding:3px 12px;border-radius:20px;font-size:10px;font-weight:700;">${isPaid?'✓ PAID':'⏳ PENDING'}</div>
        </div>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,#c9861a40,#eee,#c9861a40);margin:20px 0;"></div>
      <div style="display:flex;gap:16px;margin-bottom:28px;">
        <div style="flex:1;background:linear-gradient(135deg,#fafafa,#f8f8f8);border:1px solid #eee;border-radius:14px;padding:22px;">
          <div style="font-size:9px;color:#c9861a;text-transform:uppercase;letter-spacing:3px;font-weight:800;margin-bottom:14px;">Bill To</div>
          <div style="font-weight:700;font-size:14px;margin-bottom:5px;">${order.shipping_name}</div>
          <div style="font-size:11px;color:#777;line-height:1.8;">${order.shipping_address}<br/>${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}</div>
          <div style="font-size:11px;color:#777;margin-top:6px;">📞 ${order.shipping_phone}</div>
        </div>
        <div style="flex:1;background:linear-gradient(135deg,#fafafa,#f8f8f8);border:1px solid #eee;border-radius:14px;padding:22px;">
          <div style="font-size:9px;color:#c9861a;text-transform:uppercase;letter-spacing:3px;font-weight:800;margin-bottom:14px;">Order Info</div>
          <table style="width:100%;border-collapse:collapse;"><tbody>
            <tr><td style="padding:4px 0;font-size:11px;color:#aaa;">Order No.</td><td style="padding:4px 0;font-size:12px;font-weight:700;text-align:right;">${order.order_number}</td></tr>
            <tr><td style="padding:4px 0;font-size:11px;color:#aaa;">Payment</td><td style="padding:4px 0;font-size:12px;font-weight:600;text-align:right;text-transform:uppercase;">${order.payment_method}</td></tr>
            <tr><td style="padding:4px 0;font-size:11px;color:#aaa;">GSTIN</td><td style="padding:4px 0;font-size:11px;text-align:right;color:#999;">27AABCT1234A1ZA</td></tr>
          </tbody></table>
        </div>
      </div>
      <div style="border:1px solid #eee;border-radius:14px;overflow:hidden;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:linear-gradient(90deg,rgba(201,134,26,0.08),rgba(201,134,26,0.02));">
            <th style="padding:14px 18px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9861a;font-weight:800;">Sr.</th>
            <th style="padding:14px 18px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9861a;font-weight:800;">Product</th>
            <th style="padding:14px 18px;text-align:center;font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9861a;font-weight:800;">Qty</th>
            <th style="padding:14px 18px;text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9861a;font-weight:800;">Rate</th>
            <th style="padding:14px 18px;text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:3px;color:#c9861a;font-weight:800;">Amount</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:flex-end;">
        <div style="width:300px;background:linear-gradient(135deg,#fafafa,#fff);border:1px solid #eee;border-radius:14px;padding:22px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:#888;">Subtotal</span><span style="font-weight:600;">${formatPrice(order.subtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:#888;">CGST (${order.gst_rate/2}%)</span><span>${formatPrice(order.gst_amount/2)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:#888;">SGST (${order.gst_rate/2}%)</span><span>${formatPrice(order.gst_amount/2)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:#888;">Shipping</span><span style="color:#c9861a;font-weight:700;">${order.shipping_amount>0?formatPrice(order.shipping_amount):'FREE'}</span></div>
          <div style="height:2px;background:linear-gradient(90deg,#c9861a,rgba(201,134,26,0.2));margin:12px 0;border-radius:1px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;">
            <span style="font-weight:800;font-size:13px;">Grand Total</span>
            <span style="font-weight:900;font-size:24px;color:#c9861a;">${formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
      <div style="background:rgba(201,134,26,0.05);border-left:4px solid #c9861a;padding:12px 16px;border-radius:0 10px 10px 0;margin-top:24px;">
        <span style="font-size:11px;color:#777;"><strong style="color:#333;">Amount in words:</strong> <em>${numberToWords(Math.floor(order.total_amount))} Rupees Only</em></span>
      </div>
      <div style="margin-top:20px;padding:14px;background:#fafafa;border-radius:10px;border:1px solid #f0f0f0;">
        <div style="font-size:9px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Terms & Conditions</div>
        <div style="font-size:9px;color:#bbb;line-height:1.7;">• Products covered under manufacturer warranty. • Returns within 7 days of delivery. • Computer-generated invoice — no signature required.</div>
      </div>
    </div>
    <div style="text-align:center;padding:20px 48px 28px;border-top:1px solid #f0f0f0;">
      <div style="font-size:11px;color:#777;">Thank you for choosing <strong style="color:#1a1a1a;">ChronoHub</strong></div>
      <div style="font-size:9px;color:#ccc;margin-top:4px;">hello@chronohub.in | +91 98765 43210 | chronohub.in</div>
    </div>
  </div>`;
}

function generatePrintHTML(order: any, items: any[]) {
  const formatPrice = (p: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(p);
  const isPaid = order.payment_status === "paid";
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const rows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:14px 18px;color:#aaa;font-size:12px;">${i+1}</td>
      <td style="padding:14px 18px;font-weight:700;color:#1a1a1a;font-size:13px;">${item.product_name}</td>
      <td style="padding:14px 18px;text-align:center;font-size:13px;font-weight:600;">${item.quantity}</td>
      <td style="padding:14px 18px;text-align:right;color:#888;font-size:12px;">${formatPrice(item.price)}</td>
      <td style="padding:14px 18px;text-align:right;font-weight:700;font-size:13px;">${formatPrice(item.price*item.quantity)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${order.order_number}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a}
.page{max-width:800px;margin:0 auto;padding:40px}table{width:100%;border-collapse:collapse}
th{background:rgba(201,134,26,0.06);padding:12px 18px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#c9861a;font-weight:700}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body><div class="page">
<div style="display:flex;justify-content:space-between;margin-bottom:24px">
<div><div style="font-size:26px;font-weight:900">Chrono<span style="color:#c9861a">Hub</span></div><div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:3px">Premium Smart Watches</div></div>
<div style="text-align:right"><div style="color:#c9861a;font-size:11px;font-weight:700;letter-spacing:3px">TAX INVOICE</div><div style="font-size:15px;font-weight:900;margin-top:4px">#INV-${order.order_number?.replace("ORD-","")}</div><div style="font-size:11px;color:#999;margin-top:2px">${orderDate}</div></div>
</div>
<hr style="border:none;height:1px;background:#eee;margin:16px 0">
<div style="display:flex;gap:16px;margin-bottom:24px">
<div style="flex:1;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:18px"><div style="font-size:9px;color:#c9861a;letter-spacing:2px;font-weight:700;margin-bottom:10px">BILL TO</div><div style="font-weight:700;font-size:14px">${order.shipping_name}</div><div style="font-size:11px;color:#777;line-height:1.7;margin-top:4px">${order.shipping_address}<br>${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}<br>Phone: ${order.shipping_phone}</div></div>
<div style="flex:1;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:18px"><div style="font-size:9px;color:#c9861a;letter-spacing:2px;font-weight:700;margin-bottom:10px">ORDER INFO</div><table><tr><td style="padding:3px 0;font-size:11px;color:#aaa">Order No.</td><td style="text-align:right;font-size:12px;font-weight:700">${order.order_number}</td></tr><tr><td style="padding:3px 0;font-size:11px;color:#aaa">Payment</td><td style="text-align:right;font-size:12px;font-weight:600;text-transform:uppercase">${order.payment_method}</td></tr><tr><td style="padding:3px 0;font-size:11px;color:#aaa">Status</td><td style="text-align:right"><span style="background:${isPaid?'#ecfdf5':'#fffbeb'};color:${isPaid?'#059669':'#d97706'};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600">${isPaid?'Paid':'Pending'}</span></td></tr></table></div>
</div>
<div style="border:1px solid #eee;border-radius:10px;overflow:hidden;margin-bottom:24px"><table><thead><tr><th>#</th><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table></div>
<div style="display:flex;justify-content:flex-end"><div style="width:280px;background:#fafafa;border:1px solid #eee;border-radius:10px;padding:18px">
<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span style="color:#888">Subtotal</span><span style="font-weight:600">${formatPrice(order.subtotal)}</span></div>
<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span style="color:#888">CGST (${order.gst_rate/2}%)</span><span>${formatPrice(order.gst_amount/2)}</span></div>
<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span style="color:#888">SGST (${order.gst_rate/2}%)</span><span>${formatPrice(order.gst_amount/2)}</span></div>
<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span style="color:#888">Shipping</span><span style="color:#c9861a;font-weight:600">${order.shipping_amount>0?formatPrice(order.shipping_amount):'Free'}</span></div>
<hr style="border:none;height:2px;background:#c9861a;margin:10px 0;opacity:0.3">
<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:800;font-size:14px">Total</span><span style="font-weight:900;font-size:22px;color:#c9861a">${formatPrice(order.total_amount)}</span></div>
</div></div>
<div style="margin-top:20px;padding:10px 14px;border-left:3px solid #c9861a;background:rgba(201,134,26,0.04);border-radius:0 8px 8px 0"><span style="font-size:11px;color:#777"><strong style="color:#333">Amount in words:</strong> ${numberToWords(Math.floor(order.total_amount))} Rupees Only</span></div>
<div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #eee"><p style="font-size:11px;color:#777">Thank you for choosing <strong>ChronoHub</strong></p><p style="font-size:9px;color:#ccc;margin-top:4px">Computer-generated invoice — no signature required</p></div>
</div></body></html>`;
}

export default Invoice;
