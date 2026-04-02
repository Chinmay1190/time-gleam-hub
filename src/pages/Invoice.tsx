import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Printer, Clock, CreditCard, MapPin, Receipt, Sparkles, CheckCircle2, Share2, Shield, Hash, Phone, Mail, Globe, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Invoice = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const autoDownloadTriggered = useRef(false);

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

  const handleDownload = useCallback(async () => {
    if (!order) return;

    setDownloading(true);
    let container: HTMLDivElement | null = null;

    try {
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.padding = "0";
      container.style.background = "#ffffff";
      container.innerHTML = generateInvoiceHTMLForPDF(order, items);
      document.body.appendChild(container);

      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: container.scrollWidth,
        windowWidth: container.scrollWidth,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;
      const pageHeightInPixels = Math.floor((printableHeight * canvas.width) / printableWidth);
      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");

      if (!pageContext) {
        throw new Error("Canvas context unavailable");
      }

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(pageHeightInPixels, canvas.height - renderedHeight);
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        pageContext.fillStyle = "#ffffff";
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageContext.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height,
        );

        const pageImage = pageCanvas.toDataURL("image/jpeg", 0.98);
        const renderedPageHeight = (pageCanvas.height * printableWidth) / pageCanvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImage, "JPEG", margin, margin, printableWidth, renderedPageHeight);

        renderedHeight += sliceHeight;
        pageIndex += 1;
      }

      pdf.save(`ChronoHub-Invoice-${order.order_number || "order"}.pdf`);
      toast({ title: "✅ Invoice Downloaded!", description: `Saved as PDF — viewable on any device` });
    } catch {
      toast({ title: "Download failed", description: "Please try the Print option instead", variant: "destructive" });
    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setDownloading(false);
    }
  }, [items, order, toast]);

  useEffect(() => {
    const shouldAutoDownload = new URLSearchParams(location.search).get("download") === "1";

    if (order && shouldAutoDownload && !autoDownloadTriggered.current && !downloading) {
      autoDownloadTriggered.current = true;
      void handleDownload();
    }
  }, [downloading, handleDownload, location.search, order]);

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
  const paymentBadgeStyle = isPaid
    ? {
        backgroundColor: "hsl(var(--success) / 0.12)",
        color: "hsl(var(--success))",
        borderColor: "hsl(var(--success) / 0.2)",
      }
    : {
        backgroundColor: "hsl(var(--primary) / 0.12)",
        color: "hsl(var(--primary))",
        borderColor: "hsl(var(--primary) / 0.2)",
      };
  const invoiceHighlights = [
    {
      label: "Invoice status",
      value: isPaid ? "Paid invoice" : "Payment pending",
      meta: `Issued ${orderDate}`,
      icon: CheckCircle2,
    },
    {
      label: "Document ID",
      value: invoiceNumber,
      meta: `Order ${order.order_number}`,
      icon: Receipt,
    },
    {
      label: "Export ready",
      value: formatPrice(order.total_amount),
      meta: "Optimized for print and PDF",
      icon: Download,
    },
  ];

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

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 mb-8 md:grid-cols-3"
        >
          {invoiceHighlights.map((highlight, index) => {
            const Icon = highlight.icon;

            return (
              <motion.div
                key={highlight.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.05 }}
                className="glass-card premium-border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{highlight.label}</p>
                    <p className="mt-3 font-heading text-xl font-black leading-tight">{highlight.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{highlight.meta}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
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
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-bold shadow-sm" style={paymentBadgeStyle}>
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
  const orderTime = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const invoiceNumber = `INV-${order.order_number?.replace("ORD-", "")}`;
  const statusLabel = (order.status || "pending").replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
  const paymentBg = isPaid ? "hsl(142 76% 96%)" : "hsl(48 100% 96%)";
  const paymentColor = isPaid ? "hsl(142 72% 29%)" : "hsl(32 95% 44%)";
  const rows = items.map((item, i) => `
    <tr style="border-bottom:1px solid hsl(40 14% 92%);">
      <td style="padding:16px 18px;color:hsl(220 9% 46%);font-size:12px;font-family:monospace;">${String(i + 1).padStart(2, "0")}</td>
      <td style="padding:16px 18px;">
        <div style="font-weight:700;color:hsl(222 24% 14%);font-size:13px;">${item.product_name}</div>
        <div style="font-size:11px;color:hsl(220 9% 46%);margin-top:4px;">Product ID: ${item.product_id}</div>
      </td>
      <td style="padding:16px 18px;text-align:center;font-size:13px;font-weight:700;color:hsl(222 24% 14%);">${item.quantity}</td>
      <td style="padding:16px 18px;text-align:right;color:hsl(220 9% 46%);font-size:12px;">${formatPrice(item.price)}</td>
      <td style="padding:16px 18px;text-align:right;font-weight:800;color:hsl(222 24% 14%);font-size:13px;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:hsl(222 24% 14%);width:794px;background:linear-gradient(180deg,hsl(40 33% 98%),hsl(0 0% 100%));">
    <div style="padding:28px;">
      <div style="background:hsl(0 0% 100%);border:1px solid hsl(40 18% 90%);border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.08);position:relative;">
        <div style="height:6px;background:linear-gradient(90deg,hsl(38 72% 46%),hsl(42 78% 60%),hsl(38 72% 46%));"></div>
        <div style="position:absolute;top:42px;right:36px;font-size:88px;font-weight:900;color:hsla(38,72%,46%,0.05);letter-spacing:0.28em;transform:rotate(-18deg);">CH</div>
        <div style="padding:34px 34px 30px;position:relative;z-index:1;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px;">
            <div>
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:54px;height:54px;border-radius:18px;background:linear-gradient(135deg,hsl(38 72% 46%),hsl(42 78% 60%));display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:900;box-shadow:0 16px 36px hsla(38,72%,46%,0.28);">C</div>
                <div>
                  <div style="font-size:30px;font-weight:900;letter-spacing:-0.03em;line-height:1;">Chrono<span style="color:hsl(38 72% 46%);">Hub</span></div>
                  <div style="font-size:9px;color:hsl(220 9% 46%);text-transform:uppercase;letter-spacing:0.34em;margin-top:6px;">Premium Smart Watches</div>
                </div>
              </div>
              <div style="margin-top:18px;font-size:11px;line-height:1.8;color:hsl(220 9% 46%);">
                GSTIN: 27AABCT1234A1ZA<br />
                hello@chronohub.in • +91 98765 43210<br />
                chronohub.in
              </div>
            </div>
            <div style="min-width:220px;text-align:right;">
              <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;background:hsl(38 72% 46% / 0.08);border:1px solid hsl(38 72% 46% / 0.14);color:hsl(38 72% 46%);font-size:11px;font-weight:800;letter-spacing:0.26em;text-transform:uppercase;">Tax Invoice</div>
              <div style="margin-top:14px;font-size:22px;font-weight:900;letter-spacing:-0.03em;">${invoiceNumber}</div>
              <div style="margin-top:6px;font-size:12px;color:hsl(220 9% 46%);">${orderDate} • ${orderTime}</div>
              <div style="margin-top:12px;display:inline-flex;align-items:center;padding:6px 14px;border-radius:999px;background:${paymentBg};color:${paymentColor};font-size:11px;font-weight:800;border:1px solid ${paymentColor}22;">
                ${isPaid ? "Paid" : "Payment Pending"}
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:22px;">
            <div style="padding:16px 18px;border-radius:18px;background:hsl(40 33% 98%);border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(220 9% 46%);">Invoice status</div>
              <div style="margin-top:8px;font-size:18px;font-weight:800;">${isPaid ? "Paid invoice" : "Awaiting payment"}</div>
              <div style="margin-top:4px;font-size:11px;color:hsl(220 9% 46%);">Stored in a device-friendly PDF layout</div>
            </div>
            <div style="padding:16px 18px;border-radius:18px;background:hsl(40 33% 98%);border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(220 9% 46%);">Order status</div>
              <div style="margin-top:8px;font-size:18px;font-weight:800;">${statusLabel}</div>
              <div style="margin-top:4px;font-size:11px;color:hsl(220 9% 46%);">Order ${order.order_number}</div>
            </div>
            <div style="padding:16px 18px;border-radius:18px;background:hsl(40 33% 98%);border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(220 9% 46%);">Grand total</div>
              <div style="margin-top:8px;font-size:18px;font-weight:800;color:hsl(38 72% 46%);">${formatPrice(order.total_amount)}</div>
              <div style="margin-top:4px;font-size:11px;color:hsl(220 9% 46%);">Includes taxes and shipping</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px;">
            <div style="padding:20px;border-radius:22px;background:linear-gradient(180deg,hsl(40 33% 98%),hsl(0 0% 100%));border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;color:hsl(38 72% 46%);text-transform:uppercase;letter-spacing:0.24em;font-weight:800;margin-bottom:14px;">Bill To</div>
              <div style="font-size:15px;font-weight:800;margin-bottom:8px;">${order.shipping_name}</div>
              <div style="font-size:12px;color:hsl(220 9% 46%);line-height:1.7;">${order.shipping_address}<br />${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}</div>
              <div style="margin-top:10px;font-size:12px;color:hsl(220 9% 46%);">Phone: ${order.shipping_phone}</div>
            </div>
            <div style="padding:20px;border-radius:22px;background:linear-gradient(180deg,hsl(40 33% 98%),hsl(0 0% 100%));border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;color:hsl(38 72% 46%);text-transform:uppercase;letter-spacing:0.24em;font-weight:800;margin-bottom:14px;">Order Info</div>
              <table style="width:100%;border-collapse:collapse;">
                <tbody>
                  <tr><td style="padding:5px 0;font-size:12px;color:hsl(220 9% 46%);">Order No.</td><td style="padding:5px 0;font-size:12px;text-align:right;font-weight:700;">${order.order_number}</td></tr>
                  <tr><td style="padding:5px 0;font-size:12px;color:hsl(220 9% 46%);">Payment Mode</td><td style="padding:5px 0;font-size:12px;text-align:right;font-weight:700;text-transform:uppercase;">${order.payment_method}</td></tr>
                  <tr><td style="padding:5px 0;font-size:12px;color:hsl(220 9% 46%);">Tracking ID</td><td style="padding:5px 0;font-size:12px;text-align:right;font-weight:700;">${order.tracking_number || "Generated on shipment"}</td></tr>
                  <tr><td style="padding:5px 0;font-size:12px;color:hsl(220 9% 46%);">Issue Date</td><td style="padding:5px 0;font-size:12px;text-align:right;font-weight:700;">${orderDate}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="border:1px solid hsl(40 18% 90%);border-radius:22px;overflow:hidden;margin-bottom:22px;background:hsl(0 0% 100%);">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:linear-gradient(90deg,hsl(38 72% 46% / 0.10),hsl(38 72% 46% / 0.03));">
                  <th style="padding:14px 18px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(38 72% 46%);font-weight:800;">Sr.</th>
                  <th style="padding:14px 18px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(38 72% 46%);font-weight:800;">Product</th>
                  <th style="padding:14px 18px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(38 72% 46%);font-weight:800;">Qty</th>
                  <th style="padding:14px 18px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(38 72% 46%);font-weight:800;">Rate</th>
                  <th style="padding:14px 18px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(38 72% 46%);font-weight:800;">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:14px;align-items:start;">
            <div style="padding:18px 20px;border-radius:20px;background:hsl(40 33% 98%);border:1px solid hsl(40 18% 92%);">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:hsl(220 9% 46%);font-weight:800;">Invoice Notes</div>
              <div style="margin-top:12px;font-size:12px;line-height:1.8;color:hsl(220 9% 46%);">
                Amount in words: <strong style="color:hsl(222 24% 14%);font-style:italic;">${numberToWords(Math.floor(order.total_amount))} Rupees Only</strong><br />
                Products are covered under manufacturer warranty and this invoice remains valid for service and returns verification.
              </div>
            </div>
            <div style="padding:20px;border-radius:20px;background:linear-gradient(180deg,hsl(40 33% 98%),hsl(0 0% 100%));border:1px solid hsl(40 18% 92%);">
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:hsl(220 9% 46%);">Subtotal</span><span style="font-weight:700;">${formatPrice(order.subtotal)}</span></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:hsl(220 9% 46%);">CGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:hsl(220 9% 46%);">SGST (${order.gst_rate / 2}%)</span><span>${formatPrice(order.gst_amount / 2)}</span></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:hsl(220 9% 46%);">Shipping</span><span style="font-weight:700;color:hsl(38 72% 46%);">${order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : "FREE"}</span></div>
              <div style="height:2px;background:linear-gradient(90deg,hsl(38 72% 46%),transparent);margin:12px 0 14px;border-radius:999px;"></div>
              <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                <div>
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:hsl(220 9% 46%);">Grand Total</div>
                  <div style="font-size:28px;font-weight:900;line-height:1;color:hsl(38 72% 46%);margin-top:6px;">${formatPrice(order.total_amount)}</div>
                </div>
                <div style="font-size:10px;color:hsl(220 9% 46%);">Incl. all taxes</div>
              </div>
            </div>
          </div>

          <div style="margin-top:22px;padding-top:18px;border-top:1px solid hsl(40 18% 92%);display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <div>
              <div style="font-size:12px;color:hsl(222 24% 14%);font-weight:700;">Thank you for choosing ChronoHub</div>
              <div style="margin-top:4px;font-size:10px;color:hsl(220 9% 46%);">Computer-generated invoice • Valid for print, PDF storage, and mobile viewing</div>
            </div>
            <div style="text-align:right;font-size:10px;color:hsl(220 9% 46%);line-height:1.7;">
              hello@chronohub.in<br />
              +91 98765 43210<br />
              chronohub.in
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function generatePrintHTML(order: any, items: any[]) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${order.order_number}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111827}
  @page{size:A4;margin:10mm}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>${generateInvoiceHTMLForPDF(order, items)}</body></html>`;
}

export default Invoice;
