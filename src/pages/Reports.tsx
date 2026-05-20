import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, ShoppingBag,
  Activity, BarChart3, ArrowRight, LogIn, Clock, IndianRupee, Percent, Truck as TruckIcon, Sparkles,
  Search, ArrowUpDown, FileSpreadsheet
} from "lucide-react";
import { Input } from "@/components/ui/input";
import CountUp from "@/components/CountUp";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter, startOfDay, endOfDay } from "date-fns";
import jsPDF from "jspdf";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar
} from "recharts";

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  gst_amount: number;
  shipping_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_name: string;
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// PDF-safe format: uses "Rs." instead of ₹ symbol which jsPDF can't render
const formatINRpdf = (amount: number) =>
  "Rs. " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

const Reports = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState<Date | undefined>(undefined);
  const [rangeTo, setRangeTo] = useState<Date | undefined>(undefined);
  const [rangeFromOpen, setRangeFromOpen] = useState(false);
  const [rangeToOpen, setRangeToOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("monthly");
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setAccountCreatedAt(user.created_at || null);
    setLastSignIn(user.last_sign_in_at || null);

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as OrderData[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filterOrders = (from: Date, to: Date) =>
    orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= from && d <= to;
    });

  const now = new Date();

  const monthlyOrders = useMemo(() => filterOrders(startOfMonth(now), endOfMonth(now)), [orders]);
  const prevMonthOrders = useMemo(() => filterOrders(startOfMonth(subMonths(now, 1)), endOfMonth(subMonths(now, 1))), [orders]);
  const weeklyOrders = useMemo(() => filterOrders(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })), [orders]);
  const quarterlyOrders = useMemo(() => filterOrders(startOfQuarter(now), endOfQuarter(now)), [orders]);
  const dailyOrders = useMemo(() => selectedDate ? filterOrders(startOfDay(selectedDate), endOfDay(selectedDate)) : [], [orders, selectedDate]);
  const rangeOrders = useMemo(() => rangeFrom && rangeTo ? filterOrders(startOfDay(rangeFrom), endOfDay(rangeTo)) : [], [orders, rangeFrom, rangeTo]);

  const computeStats = (list: OrderData[]) => {
    const totalRevenue = list.reduce((s, o) => s + o.total_amount, 0);
    const totalGST = list.reduce((s, o) => s + o.gst_amount, 0);
    const totalShipping = list.reduce((s, o) => s + o.shipping_amount, 0);
    const delivered = list.filter((o) => o.status === "delivered").length;
    const pending = list.filter((o) => o.status === "pending").length;
    const cancelled = list.filter((o) => o.status === "cancelled").length;
    return { totalRevenue, totalGST, totalShipping, delivered, pending, cancelled, count: list.length };
  };

  const generatePDF = (title: string, periodLabel: string, list: OrderData[]) => {
    const stats = computeStats(list);
    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 0;

    const addFooter = (pageNum: number) => {
      doc.setFillColor(15, 15, 28);
      doc.rect(0, pageH - 16, w, 16, "F");
      doc.setFillColor(200, 160, 40);
      doc.rect(0, pageH - 16, w, 0.8, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 120);
      doc.setFont("helvetica", "normal");
      doc.text("ChronoHub - Premium Watch Collection", 15, pageH - 6);
      doc.text("Confidential Report", w / 2, pageH - 6, { align: "center" });
      doc.text("Page " + String(pageNum), w - 15, pageH - 6, { align: "right" });
    };

    let currentPage = 1;
    const checkPage = (needed: number) => {
      if (y + needed > pageH - 22) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        y = 15;
      }
    };

    // ===== HEADER =====
    doc.setFillColor(12, 12, 24);
    doc.rect(0, 0, w, 55, "F");
    // Gold gradient bar
    doc.setFillColor(200, 160, 40);
    doc.rect(0, 53, w, 2, "F");
    // Subtle accent panel on right
    doc.setFillColor(200, 160, 40);
    doc.rect(w - 4, 0, 4, 55, "F");

    // Brand
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 160, 40);
    doc.setFontSize(24);
    doc.text("CHRONOHUB", 15, 18);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 140);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM WATCH COLLECTION", 15, 24);

    // Report title
    doc.setFontSize(13);
    doc.setTextColor(240, 240, 250);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 15, 36);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 170);
    doc.setFont("helvetica", "normal");
    doc.text("Period: " + periodLabel, 15, 43);

    // Right side info
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 170);
    doc.text("Generated: " + format(now, "dd MMM yyyy, hh:mm a"), w - 19, 36, { align: "right" });
    if (user?.email) {
      doc.text("User: " + user.email, w - 19, 43, { align: "right" });
    }
    y = 63;

    // ===== ACCOUNT INFO =====
    doc.setFillColor(20, 20, 36);
    doc.roundedRect(15, y, w - 30, 18, 2, 2, "F");
    doc.setDrawColor(60, 60, 80);
    doc.setLineWidth(0.2);
    doc.roundedRect(15, y, w - 30, 18, 2, 2, "S");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 140);
    doc.setFont("helvetica", "normal");
    doc.text("ACCOUNT CREATED", 22, y + 7);
    doc.text("LAST LOGIN", 85, y + 7);
    doc.text("LIFETIME ORDERS", 148, y + 7);
    doc.setFontSize(9);
    doc.setTextColor(210, 210, 225);
    doc.setFont("helvetica", "bold");
    doc.text(accountCreatedAt ? format(new Date(accountCreatedAt), "dd MMM yyyy") : "N/A", 22, y + 14);
    doc.text(lastSignIn ? format(new Date(lastSignIn), "dd MMM yyyy, hh:mm a") : "N/A", 85, y + 14);
    doc.text(String(orders.length), 148, y + 14);
    y += 26;

    // ===== SUMMARY CARDS =====
    const cardW = (w - 42) / 3;
    const summaryData = [
      { label: "TOTAL REVENUE", value: formatINRpdf(stats.totalRevenue), accent: [200, 160, 40] as [number, number, number] },
      { label: "TOTAL ORDERS", value: String(stats.count), accent: [80, 130, 240] as [number, number, number] },
      { label: "GST COLLECTED", value: formatINRpdf(stats.totalGST), accent: [150, 70, 220] as [number, number, number] },
    ];
    summaryData.forEach((c, i) => {
      const cx = 15 + i * (cardW + 6);
      doc.setFillColor(20, 20, 36);
      doc.roundedRect(cx, y, cardW, 30, 2, 2, "F");
      // Accent left bar
      doc.setFillColor(c.accent[0], c.accent[1], c.accent[2]);
      doc.roundedRect(cx, y, 3, 30, 2, 2, "F");
      doc.setFillColor(20, 20, 36);
      doc.rect(cx + 2, y, 3, 30, "F");

      doc.setFontSize(6.5);
      doc.setTextColor(110, 110, 135);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 8, y + 10);
      doc.setFontSize(14);
      doc.setTextColor(c.accent[0], c.accent[1], c.accent[2]);
      doc.setFont("helvetica", "bold");
      doc.text(c.value, cx + 8, y + 22);
    });
    y += 38;

    // ===== STATUS ROW =====
    const statusCards = [
      { label: "Delivered", value: String(stats.delivered), color: [34, 197, 94] as [number, number, number] },
      { label: "Pending", value: String(stats.pending), color: [234, 179, 8] as [number, number, number] },
      { label: "Cancelled", value: String(stats.cancelled), color: [239, 68, 68] as [number, number, number] },
      { label: "Shipping", value: formatINRpdf(stats.totalShipping), color: [80, 130, 240] as [number, number, number] },
    ];
    const sCardW = (w - 42) / 4;
    statusCards.forEach((c, i) => {
      const cx = 15 + i * (sCardW + 4);
      doc.setFillColor(20, 20, 36);
      doc.roundedRect(cx, y, sCardW, 22, 2, 2, "F");
      doc.setFillColor(c.color[0], c.color[1], c.color[2]);
      doc.circle(cx + 6, y + 8, 1.8, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 140);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 10, y + 9);
      doc.setFontSize(12);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(c.value, cx + 6, y + 18);
    });
    y += 30;

    // ===== ORDERS TABLE =====
    if (list.length > 0) {
      checkPage(22);
      // Section heading
      doc.setFillColor(200, 160, 40);
      doc.rect(15, y, 3, 1.2, "F");
      doc.setFontSize(11);
      doc.setTextColor(200, 160, 40);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER DETAILS", 21, y + 1);
      y += 8;

      // Table header
      doc.setFillColor(18, 18, 34);
      doc.roundedRect(15, y, w - 30, 10, 1.5, 1.5, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 160);
      doc.setFont("helvetica", "bold");
      const cols = [18, 30, 68, 100, 134, 162];
      const headers = ["S.No", "Order Number", "Date", "Amount", "Status", "Payment"];
      headers.forEach((h, i) => doc.text(h, cols[i], y + 7));
      y += 13;

      list.forEach((order, idx) => {
        checkPage(10);
        if (idx % 2 === 0) {
          doc.setFillColor(16, 16, 30);
          doc.rect(15, y - 1.5, w - 30, 9, "F");
        }
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");

        // Serial number
        doc.setTextColor(100, 100, 125);
        doc.text(String(idx + 1).padStart(2, "0"), cols[0], y + 4.5);

        // Order number
        doc.setTextColor(200, 200, 215);
        doc.setFont("helvetica", "bold");
        doc.text(order.order_number, cols[1], y + 4.5);

        // Date
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 160);
        doc.text(format(new Date(order.created_at), "dd MMM yyyy"), cols[2], y + 4.5);

        // Amount - use PDF-safe format
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 160, 40);
        doc.text(formatINRpdf(order.total_amount), cols[3], y + 4.5);

        // Status pill
        const statusColorMap: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
          delivered: { bg: [20, 50, 30], text: [34, 197, 94] },
          pending: { bg: [50, 45, 15], text: [234, 179, 8] },
          confirmed: { bg: [20, 35, 55], text: [59, 130, 246] },
          processing: { bg: [50, 35, 10], text: [249, 115, 22] },
          shipped: { bg: [35, 20, 50], text: [168, 85, 247] },
          cancelled: { bg: [50, 15, 15], text: [239, 68, 68] },
          out_for_delivery: { bg: [10, 40, 45], text: [6, 182, 212] },
        };
        const sc = statusColorMap[order.status] || { bg: [35, 35, 50] as [number, number, number], text: [160, 160, 175] as [number, number, number] };
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ");
        const stWidth = doc.getTextWidth(statusText) + 5;
        doc.setFillColor(sc.bg[0], sc.bg[1], sc.bg[2]);
        doc.roundedRect(cols[4] - 1, y + 0.5, stWidth, 5.5, 1.2, 1.2, "F");
        doc.setTextColor(sc.text[0], sc.text[1], sc.text[2]);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text(statusText, cols[4] + 1.5, y + 4.5);

        // Payment
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 150);
        doc.text(order.payment_method.toUpperCase(), cols[5], y + 4.5);

        y += 9;
      });

      // Bottom line
      doc.setDrawColor(40, 40, 60);
      doc.setLineWidth(0.2);
      doc.line(15, y, w - 15, y);
      y += 5;

      // Grand total row
      checkPage(14);
      doc.setFillColor(20, 20, 38);
      doc.roundedRect(15, y, w - 30, 12, 2, 2, "F");
      doc.setDrawColor(200, 160, 40);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, y, w - 30, 12, 2, 2, "S");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(140, 140, 160);
      doc.text("GRAND TOTAL", cols[1], y + 8);
      doc.setTextColor(200, 160, 40);
      doc.setFontSize(11);
      doc.text(formatINRpdf(stats.totalRevenue), cols[3], y + 8);
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 135);
      doc.text(stats.count + " order" + (stats.count !== 1 ? "s" : ""), cols[4] + 2, y + 8);
    } else {
      checkPage(20);
      doc.setFillColor(20, 20, 36);
      doc.roundedRect(15, y, w - 30, 22, 2, 2, "F");
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 135);
      doc.setFont("helvetica", "normal");
      doc.text("No orders found for this period.", w / 2, y + 13, { align: "center" });
    }

    addFooter(currentPage);
    doc.save("ChronoHub_" + title.replace(/\s+/g, "_") + ".pdf");
  };

  const generateCSV = (title: string, list: OrderData[]) => {
    const headers = ["S.No", "Order Number", "Date", "Status", "Payment Method", "Subtotal", "GST", "Shipping", "Total"];
    const rows = list.map((o, i) => [
      i + 1,
      o.order_number,
      format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      o.status,
      o.payment_method,
      o.subtotal,
      o.gst_amount,
      o.shipping_amount,
      o.total_amount,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ChronoHub_${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
    if (date) setActiveTab("daily");
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground" />
        <h1 className="font-heading text-2xl font-bold">Sign in to view reports</h1>
        <Link to="/auth" className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-105 transition-transform">
          Sign In
        </Link>
      </div>
    );
  }

  const ReportSection = ({ title, periodLabel, list, onDownload }: {
    title: string; periodLabel: string; list: OrderData[]; onDownload: () => void;
  }) => {
    const stats = computeStats(list);
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: TrendingUp, color: "text-primary" },
            { label: "Total Orders", value: String(stats.count), icon: ShoppingBag, color: "text-blue-400" },
            { label: "Delivered", value: String(stats.delivered), icon: Activity, color: "text-green-400" },
            { label: "GST Collected", value: formatINR(stats.totalGST), icon: FileText, color: "text-purple-400" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-heading font-bold text-lg">{s.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {list.length > 0 ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Order Details</CardTitle>
                <Button size="sm" onClick={onDownload} className="gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">S.No.</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Order No.</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Amount</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((order, idx) => (
                      <tr key={order.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="px-4 py-3 font-medium">{order.order_number}</td>
                        <td className="px-4 py-3 text-muted-foreground">{format(new Date(order.created_at), "dd MMM yyyy")}</td>
                        <td className="px-4 py-3 font-heading font-bold text-primary">{formatINR(order.total_amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            order.status === "delivered" ? "bg-green-500/10 text-green-400" :
                            order.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                            order.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground uppercase text-xs">{order.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders found for this period</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/25 blur-[100px]" />
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] mb-2 block">Insights</span>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-1">
                  <span className="gold-gradient-text">Reports</span> & Analytics
                </h1>
                <p className="text-muted-foreground">Track performance, growth and download branded PDFs</p>
              </div>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-card/60 backdrop-blur">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>

        {/* Account Info Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <LogIn className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Created</p>
                    <p className="text-sm font-semibold">{accountCreatedAt ? format(new Date(accountCreatedAt), "dd MMM yyyy") : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <Clock className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p className="text-sm font-semibold">{lastSignIn ? format(new Date(lastSignIn), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders (All Time)</p>
                    <p className="text-sm font-semibold">{orders.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hero KPI Dashboard */}
        {(() => {
          const monthStats = computeStats(monthlyOrders);
          const prevStats = computeStats(prevMonthOrders);
          const revGrowth = prevStats.totalRevenue > 0
            ? ((monthStats.totalRevenue - prevStats.totalRevenue) / prevStats.totalRevenue) * 100
            : monthStats.totalRevenue > 0 ? 100 : 0;
          const orderGrowth = prevStats.count > 0
            ? ((monthStats.count - prevStats.count) / prevStats.count) * 100
            : monthStats.count > 0 ? 100 : 0;
          const avgOrder = monthStats.count > 0 ? monthStats.totalRevenue / monthStats.count : 0;

          const trendData = Array.from({ length: 6 }).map((_, i) => {
            const d = subMonths(now, 5 - i);
            const monthOrders = filterOrders(startOfMonth(d), endOfMonth(d));
            return { label: format(d, "MMM"), value: monthOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0) };
          });
          const maxTrend = Math.max(...trendData.map((t) => t.value), 1);
          const lifetimeSpend = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

          const kpis = [
            { label: "This Month Revenue", value: Math.round(monthStats.totalRevenue), prefix: "₹", icon: IndianRupee, growth: revGrowth, iconColor: "text-amber-400" },
            { label: "This Month Orders", value: monthStats.count, icon: ShoppingBag, growth: orderGrowth, iconColor: "text-blue-400" },
            { label: "Avg Order Value", value: Math.round(avgOrder), prefix: "₹", icon: TrendingUp, growth: null as number | null, iconColor: "text-purple-400" },
            { label: "Lifetime Spend", value: Math.round(lifetimeSpend), prefix: "₹", icon: Sparkles, growth: null as number | null, iconColor: "text-pink-400" },
          ];

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="glass-card p-5 relative overflow-hidden group hover:border-primary/30 transition-all"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <k.icon className={`w-5 h-5 ${k.iconColor}`} />
                        </div>
                        {k.growth !== null && (
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            k.growth >= 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {k.growth >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {Math.abs(k.growth).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{k.label}</p>
                      <p className="font-heading font-bold text-2xl mt-1">
                        {k.prefix || ""}<CountUp end={k.value} />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" /> Revenue Trend
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Last 6 months spending pattern</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
                    {trendData.map((t, i) => {
                      const heightPct = (t.value / maxTrend) * 100;
                      const isCurrent = i === trendData.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{formatINR(t.value).replace("₹", "")}
                          </div>
                          <div className="w-full flex-1 flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(heightPct, 2)}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                              className={`w-full rounded-t-lg ${
                                isCurrent
                                  ? "bg-gradient-to-t from-primary to-primary/40 shadow-lg shadow-primary/30"
                                  : "bg-gradient-to-t from-muted-foreground/30 to-muted-foreground/10 group-hover:from-primary/60 group-hover:to-primary/20"
                              } transition-all`}
                            />
                          </div>
                          <span className={`text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        {/* Advanced Charts Dashboard */}
        {orders.length > 0 && (() => {
          const allStats = computeStats(orders);

          const statusBreakdown = [
            { name: "Delivered", value: orders.filter((o) => o.status === "delivered").length, color: "hsl(160 70% 50%)" },
            { name: "Shipped", value: orders.filter((o) => o.status === "shipped").length, color: "hsl(200 90% 60%)" },
            { name: "Processing", value: orders.filter((o) => o.status === "processing").length, color: "hsl(40 90% 55%)" },
            { name: "Out for Delivery", value: orders.filter((o) => o.status === "out_for_delivery").length, color: "hsl(280 70% 60%)" },
            { name: "Confirmed", value: orders.filter((o) => o.status === "confirmed").length, color: "hsl(220 80% 60%)" },
            { name: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "hsl(50 90% 55%)" },
            { name: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length, color: "hsl(0 75% 55%)" },
          ].filter((s) => s.value > 0);

          const paymentMap = new Map<string, number>();
          orders.forEach((o) => paymentMap.set(o.payment_method, (paymentMap.get(o.payment_method) || 0) + 1));
          const paymentBreakdown = Array.from(paymentMap.entries()).map(([name, value], i) => ({
            name: name.toUpperCase(),
            value,
            color: ["hsl(350 72% 55%)", "hsl(200 90% 65%)", "hsl(280 65% 60%)", "hsl(160 65% 50%)", "hsl(40 90% 55%)"][i % 5],
          }));

          const areaData = Array.from({ length: 6 }).map((_, i) => {
            const d = subMonths(now, 5 - i);
            const list = filterOrders(startOfMonth(d), endOfMonth(d));
            return {
              month: format(d, "MMM"),
              revenue: list.reduce((s, o) => s + Number(o.total_amount || 0), 0),
              orders: list.length,
              gst: list.reduce((s, o) => s + Number(o.gst_amount || 0), 0),
            };
          });

          const splitData = [
            { name: "Net Revenue", value: Math.max(0, Math.round(allStats.totalRevenue - allStats.totalGST - allStats.totalShipping)), fill: "hsl(350 72% 55%)" },
            { name: "GST", value: Math.round(allStats.totalGST), fill: "hsl(200 90% 65%)" },
            { name: "Shipping", value: Math.round(allStats.totalShipping), fill: "hsl(280 65% 60%)" },
          ];
          const totalSplit = splitData.reduce((s, x) => s + x.value, 0) || 1;

          const tooltipStyle = {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            fontSize: "12px",
          };

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] block">Visual Analytics</span>
                <h2 className="font-heading text-2xl font-bold">
                  Charts <span className="gold-gradient-text">& Insights</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-heading font-bold text-base flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" /> Order Status Distribution
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Breakdown of all orders by current status</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" stroke="hsl(var(--background))" strokeWidth={2}>
                          {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RTooltip contentStyle={tooltipStyle} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-heading font-bold text-base flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-accent" /> Payment Methods
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">How customers are paying</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="hsl(var(--background))" strokeWidth={2} label={(e: any) => e.value} labelLine={false}>
                          {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RTooltip contentStyle={tooltipStyle} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="font-heading font-bold text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" /> Revenue & GST — 6 Month Trend
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Stacked area showing growth pattern</p>
                    </div>
                    <div className="flex gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Revenue</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent" /> GST</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradGst" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} stroke="hsl(var(--border))" tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                      <RTooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === "orders" ? value : formatINR(value), name.charAt(0).toUpperCase() + name.slice(1)]} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gradRevenue)" />
                      <Area type="monotone" dataKey="gst" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gradGst)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <h3 className="font-heading font-bold text-base flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-accent" /> Revenue Composition
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">Lifetime split between net revenue, GST and shipping</p>
                      <div className="space-y-3">
                        {splitData.map((s) => {
                          const pct = (s.value / totalSplit) * 100;
                          return (
                            <div key={s.name}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">{s.name}</span>
                                <span className="text-muted-foreground">{formatINR(s.value)} <span className="text-foreground font-bold">({pct.toFixed(1)}%)</span></span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${pct}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="h-full rounded-full"
                                  style={{ background: s.fill }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={16} data={splitData}>
                          <RadialBar background dataKey="value" cornerRadius={8} />
                          <RTooltip contentStyle={tooltipStyle} formatter={(value: number) => formatINR(value)} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })()}

        {/* Weekly Activity + Order Funnel */}
        {orders.length > 0 && (() => {
          const weekData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (6 - i));
            const list = filterOrders(startOfDay(d), endOfDay(d));
            return { day: format(d, "EEE"), orders: list.length, revenue: list.reduce((s, o) => s + Number(o.total_amount || 0), 0) };
          });

          const funnelSteps = [
            { name: "Placed", count: orders.length, color: "hsl(220 80% 60%)" },
            { name: "Confirmed", count: orders.filter(o => ["confirmed","processing","shipped","out_for_delivery","delivered"].includes(o.status)).length, color: "hsl(280 70% 60%)" },
            { name: "Shipped", count: orders.filter(o => ["shipped","out_for_delivery","delivered"].includes(o.status)).length, color: "hsl(200 90% 60%)" },
            { name: "Delivered", count: orders.filter(o => o.status === "delivered").length, color: "hsl(160 70% 50%)" },
          ];
          const funnelMax = Math.max(...funnelSteps.map(f => f.count), 1);

          const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" };

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Weekly Activity Bar Chart */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-3">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-base flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-accent" /> Last 7 Days Activity
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Daily order volume & revenue</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-1 rounded-full uppercase tracking-wider">7 Day</span>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-44">
                      {weekData.map((d, i) => {
                        const max = Math.max(...weekData.map(x => x.revenue), 1);
                        const h = (d.revenue / max) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <span className="text-[10px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">{d.orders}</span>
                            <div className="w-full flex-1 flex items-end">
                              <motion.div
                                initial={{ height: 0 }}
                                whileInView={{ height: `${Math.max(h, 3)}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.5 }}
                                className="w-full rounded-t-md bg-gradient-to-t from-accent to-accent/30 group-hover:from-primary group-hover:to-primary/30 transition-colors"
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Funnel */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-heading font-bold text-base flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" /> Order Funnel
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Lifecycle conversion</p>
                    </div>
                    <div className="space-y-3">
                      {funnelSteps.map((step, i) => {
                        const widthPct = (step.count / funnelMax) * 100;
                        const conversion = i === 0 ? 100 : funnelSteps[0].count > 0 ? (step.count / funnelSteps[0].count) * 100 : 0;
                        return (
                          <div key={step.name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{step.name}</span>
                              <span className="text-muted-foreground"><span className="font-bold text-foreground">{step.count}</span> <span className="text-[10px]">({conversion.toFixed(0)}%)</span></span>
                            </div>
                            <div className="h-7 rounded-lg bg-muted/40 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.max(widthPct, 4)}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.7, ease: "easeOut" }}
                                className="h-full rounded-lg flex items-center justify-end pr-3"
                                style={{ background: `linear-gradient(90deg, ${step.color}40, ${step.color})` }}
                              >
                                <span className="text-[10px] font-bold text-white">{step.count}</span>
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          );
        })()}

        {/* Best Day & Quick Insights */}
        {orders.length > 0 && (() => {
          const dayMap = new Map<string, { count: number; revenue: number }>();
          orders.forEach((o) => {
            const k = format(new Date(o.created_at), "EEEE");
            const cur = dayMap.get(k) || { count: 0, revenue: 0 };
            cur.count += 1;
            cur.revenue += Number(o.total_amount || 0);
            dayMap.set(k, cur);
          });
          const bestDay = Array.from(dayMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue)[0];
          const biggestOrder = [...orders].sort((a, b) => Number(b.total_amount) - Number(a.total_amount))[0];
          const deliveryRate = orders.length ? (orders.filter(o => o.status === "delivered").length / orders.length) * 100 : 0;
          const cancelRate = orders.length ? (orders.filter(o => o.status === "cancelled").length / orders.length) * 100 : 0;
          const avgGst = orders.length ? orders.reduce((s, o) => s + Number(o.gst_amount || 0), 0) / orders.length : 0;

          const insights = [
            { label: "Best Shopping Day", value: bestDay ? bestDay[0] : "—", sub: bestDay ? `${bestDay[1].count} orders · ${formatINR(bestDay[1].revenue)}` : "", icon: CalendarIcon, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Biggest Order", value: biggestOrder ? formatINR(Number(biggestOrder.total_amount)) : "—", sub: biggestOrder ? biggestOrder.order_number : "", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Delivery Success", value: deliveryRate.toFixed(0) + "%", sub: `${orders.filter(o => o.status === "delivered").length} of ${orders.length} delivered`, icon: TruckIcon, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Avg GST / Order", value: formatINR(Math.round(avgGst)), sub: cancelRate.toFixed(0) + "% cancellation rate", icon: Percent, color: "text-blue-400", bg: "bg-blue-500/10" },
          ];

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] block">Smart Insights</span>
                <h2 className="font-heading text-2xl font-bold">
                  Personal <span className="gold-gradient-text">Highlights</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((insight, i) => (
                  <motion.div
                    key={insight.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card p-5 relative overflow-hidden group hover:border-accent/30 transition-all"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                    <div className={`relative w-10 h-10 rounded-xl ${insight.bg} ${insight.color} flex items-center justify-center mb-3`}>
                      <insight.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{insight.label}</p>
                    <p className="font-heading font-bold text-lg mt-0.5 truncate">{insight.value}</p>
                    {insight.sub && <p className="text-[11px] text-muted-foreground mt-1 truncate">{insight.sub}</p>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })()}




        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {[
              { value: "monthly", label: "Monthly" },
              { value: "weekly", label: "Weekly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "daily", label: "Daily" },
              { value: "range", label: "Date Range" },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1 min-w-[80px] text-xs sm:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="monthly">
            <ReportSection
              title="Monthly Report"
              periodLabel={format(now, "MMMM yyyy")}
              list={monthlyOrders}
              onDownload={() => generatePDF("Monthly Report", format(now, "MMMM yyyy"), monthlyOrders)}
            />
            {prevMonthOrders.length > 0 && (
              <div className="mt-8">
                <h3 className="font-heading text-lg font-semibold mb-4 text-muted-foreground">
                  Previous Month — {format(subMonths(now, 1), "MMMM yyyy")}
                </h3>
                <ReportSection
                  title="Previous Month Report"
                  periodLabel={format(subMonths(now, 1), "MMMM yyyy")}
                  list={prevMonthOrders}
                  onDownload={() => generatePDF("Previous Month Report", format(subMonths(now, 1), "MMMM yyyy"), prevMonthOrders)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly">
            <ReportSection
              title="Weekly Report"
              periodLabel={`${format(startOfWeek(now, { weekStartsOn: 1 }), "dd MMM")} - ${format(endOfWeek(now, { weekStartsOn: 1 }), "dd MMM yyyy")}`}
              list={weeklyOrders}
              onDownload={() => generatePDF("Weekly Report", `${format(startOfWeek(now, { weekStartsOn: 1 }), "dd MMM")} - ${format(endOfWeek(now, { weekStartsOn: 1 }), "dd MMM yyyy")}`, weeklyOrders)}
            />
          </TabsContent>

          <TabsContent value="quarterly">
            <ReportSection
              title="Quarterly Report"
              periodLabel={`${format(startOfQuarter(now), "dd MMM")} - ${format(endOfQuarter(now), "dd MMM yyyy")}`}
              list={quarterlyOrders}
              onDownload={() => generatePDF("Quarterly Report", `${format(startOfQuarter(now), "dd MMM")} - ${format(endOfQuarter(now), "dd MMM yyyy")}`, quarterlyOrders)}
            />
          </TabsContent>

          <TabsContent value="daily">
            {selectedDate ? (
              <ReportSection
                title="Daily Report"
                periodLabel={format(selectedDate, "dd MMMM yyyy")}
                list={dailyOrders}
                onDownload={() => generatePDF("Daily Report", format(selectedDate, "dd MMMM yyyy"), dailyOrders)}
              />
            ) : (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Select a date from the calendar to view daily report</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarIcon className="w-4 h-4" /> Pick a Date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => { setSelectedDate(d); }}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="range">
            <div className="flex flex-wrap gap-4 mb-6">
              <Popover open={rangeFromOpen} onOpenChange={setRangeFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {rangeFrom ? format(rangeFrom, "dd MMM yyyy") : "From Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rangeFrom}
                    onSelect={(d) => { setRangeFrom(d); setRangeFromOpen(false); }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <ArrowRight className="w-5 h-5 text-muted-foreground self-center" />
              <Popover open={rangeToOpen} onOpenChange={setRangeToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {rangeTo ? format(rangeTo, "dd MMM yyyy") : "To Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rangeTo}
                    onSelect={(d) => { setRangeTo(d); setRangeToOpen(false); }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {rangeFrom && rangeTo && (
                <Button onClick={() => generatePDF("Custom Range Report", `${format(rangeFrom, "dd MMM yyyy")} - ${format(rangeTo, "dd MMM yyyy")}`, rangeOrders)} className="gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              )}
            </div>
            {rangeFrom && rangeTo ? (
              <ReportSection
                title="Custom Range Report"
                periodLabel={`${format(rangeFrom, "dd MMM yyyy")} - ${format(rangeTo, "dd MMM yyyy")}`}
                list={rangeOrders}
                onDownload={() => generatePDF("Custom Range Report", `${format(rangeFrom, "dd MMM yyyy")} - ${format(rangeTo, "dd MMM yyyy")}`, rangeOrders)}
              />
            ) : (
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a date range to generate report</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
