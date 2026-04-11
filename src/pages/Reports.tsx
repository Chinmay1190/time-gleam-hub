import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Calendar as CalendarIcon, TrendingUp, ShoppingBag,
  Activity, BarChart3, ArrowRight, LogIn, Clock
} from "lucide-react";
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
    // Get user metadata for login info
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

    const addFooter = () => {
      doc.setFillColor(25, 25, 40);
      doc.rect(0, pageH - 18, w, 18, "F");
      doc.setFillColor(212, 175, 55);
      doc.rect(0, pageH - 18, w, 1.5, "F");
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 140);
      doc.setFont("helvetica", "normal");
      doc.text("ChronoHub - Premium Watch Collection", 15, pageH - 8);
      doc.text("Confidential Report", w / 2, pageH - 8, { align: "center" });
      doc.text(`Page ${doc.getNumberOfPages()}`, w - 15, pageH - 8, { align: "right" });
    };

    const checkPage = (needed: number) => {
      if (y + needed > pageH - 25) {
        addFooter();
        doc.addPage();
        y = 15;
      }
    };

    // ===== PAGE 1: HEADER =====
    // Dark header block
    doc.setFillColor(18, 18, 32);
    doc.rect(0, 0, w, 58, "F");
    // Gold accent line
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 56, w, 2.5, "F");
    // Decorative corner accent
    doc.setFillColor(212, 175, 55, 0.15);
    doc.rect(w - 50, 0, 50, 58, "F");

    // Brand
    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(26);
    doc.text("CHRONOHUB", 15, 20);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 160);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM WATCH COLLECTION", 15, 27);

    // Report title
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 15, 40);
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 180);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${periodLabel}`, 15, 48);

    // Right side info
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text(`Generated: ${format(now, "dd MMM yyyy, hh:mm a")}`, w - 15, 40, { align: "right" });
    if (user?.email) {
      doc.text(`User: ${user.email}`, w - 15, 47, { align: "right" });
    }
    y = 68;

    // ===== ACCOUNT INFO =====
    doc.setFillColor(28, 28, 45);
    doc.roundedRect(15, y, w - 30, 20, 3, 3, "F");
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, w - 30, 20, 3, 3, "S");
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 160);
    doc.setFont("helvetica", "normal");
    doc.text("Account Created", 22, y + 8);
    doc.text("Last Login", 85, y + 8);
    doc.text("Total Orders (All Time)", 148, y + 8);
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 235);
    doc.setFont("helvetica", "bold");
    doc.text(accountCreatedAt ? format(new Date(accountCreatedAt), "dd MMM yyyy") : "N/A", 22, y + 15);
    doc.text(lastSignIn ? format(new Date(lastSignIn), "dd MMM yyyy, hh:mm a") : "N/A", 85, y + 15);
    doc.text(String(orders.length), 148, y + 15);
    y += 28;

    // ===== SUMMARY CARDS =====
    const cardW = (w - 45) / 3;
    const summaryData = [
      { label: "TOTAL REVENUE", value: formatINR(stats.totalRevenue), accent: [212, 175, 55] as [number, number, number] },
      { label: "TOTAL ORDERS", value: String(stats.count), accent: [99, 149, 255] as [number, number, number] },
      { label: "GST COLLECTED", value: formatINR(stats.totalGST), accent: [168, 85, 247] as [number, number, number] },
    ];
    summaryData.forEach((c, i) => {
      const cx = 15 + i * (cardW + 7.5);
      // Card bg
      doc.setFillColor(28, 28, 45);
      doc.roundedRect(cx, y, cardW, 32, 3, 3, "F");
      // Accent top bar
      doc.setFillColor(c.accent[0], c.accent[1], c.accent[2]);
      doc.roundedRect(cx, y, cardW, 3, 3, 3, "F");
      doc.setFillColor(28, 28, 45);
      doc.rect(cx, y + 2, cardW, 4, "F");

      doc.setFontSize(7);
      doc.setTextColor(130, 130, 155);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 6, y + 12);
      doc.setFontSize(16);
      doc.setTextColor(c.accent[0], c.accent[1], c.accent[2]);
      doc.setFont("helvetica", "bold");
      doc.text(c.value, cx + 6, y + 25);
    });
    y += 42;

    // ===== STATUS BREAKDOWN =====
    const statusCards = [
      { label: "Delivered", value: String(stats.delivered), color: [34, 197, 94] as [number, number, number] },
      { label: "Pending", value: String(stats.pending), color: [234, 179, 8] as [number, number, number] },
      { label: "Cancelled", value: String(stats.cancelled), color: [239, 68, 68] as [number, number, number] },
      { label: "Shipping Charges", value: formatINR(stats.totalShipping), color: [99, 149, 255] as [number, number, number] },
    ];
    const sCardW = (w - 42) / 4;
    statusCards.forEach((c, i) => {
      const cx = 15 + i * (sCardW + 4);
      doc.setFillColor(28, 28, 45);
      doc.roundedRect(cx, y, sCardW, 24, 3, 3, "F");
      // Colored dot
      doc.setFillColor(c.color[0], c.color[1], c.color[2]);
      doc.circle(cx + 6, y + 9, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 160);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 11, y + 10);
      doc.setFontSize(13);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(c.value, cx + 6, y + 20);
    });
    y += 34;

    // ===== ORDERS TABLE =====
    if (list.length > 0) {
      checkPage(25);
      // Section heading with line
      doc.setFillColor(212, 175, 55);
      doc.rect(15, y, 4, 1.5, "F");
      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER DETAILS", 22, y + 1);
      y += 8;

      // Table header
      doc.setFillColor(25, 25, 42);
      doc.roundedRect(15, y, w - 30, 11, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 180);
      doc.setFont("helvetica", "bold");
      const cols = [18, 32, 70, 102, 135, 162];
      const headers = ["No.", "Order Number", "Date", "Amount", "Status", "Payment"];
      headers.forEach((h, i) => doc.text(h, cols[i], y + 7));
      y += 14;

      list.forEach((order, idx) => {
        checkPage(11);
        // Alternate row bg
        if (idx % 2 === 0) {
          doc.setFillColor(22, 22, 38);
          doc.rect(15, y - 2, w - 30, 10, "F");
        }
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        // Serial number - properly formatted
        doc.setTextColor(120, 120, 145);
        const serialNum = String(idx + 1).padStart(2, "0");
        doc.text(serialNum, cols[0], y + 5);

        // Order number
        doc.setTextColor(210, 210, 225);
        doc.setFont("helvetica", "bold");
        doc.text(order.order_number, cols[1], y + 5);

        // Date
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 180);
        doc.text(format(new Date(order.created_at), "dd MMM yyyy"), cols[2], y + 5);

        // Amount - gold bold
        doc.setFont("helvetica", "bold");
        doc.setTextColor(212, 175, 55);
        doc.text(formatINR(order.total_amount), cols[3], y + 5);

        // Status with colored pill bg
        const statusColorMap: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
          delivered: { bg: [34, 60, 40], text: [34, 197, 94] },
          pending: { bg: [60, 55, 20], text: [234, 179, 8] },
          confirmed: { bg: [25, 40, 65], text: [59, 130, 246] },
          processing: { bg: [60, 40, 15], text: [249, 115, 22] },
          shipped: { bg: [40, 25, 60], text: [168, 85, 247] },
          cancelled: { bg: [60, 20, 20], text: [239, 68, 68] },
          out_for_delivery: { bg: [15, 50, 55], text: [6, 182, 212] },
        };
        const sc = statusColorMap[order.status] || { bg: [40, 40, 55] as [number, number, number], text: [180, 180, 190] as [number, number, number] };
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ");
        const stWidth = doc.getTextWidth(statusText) + 6;
        doc.setFillColor(sc.bg[0], sc.bg[1], sc.bg[2]);
        doc.roundedRect(cols[4] - 1, y + 1, stWidth, 6, 1.5, 1.5, "F");
        doc.setTextColor(sc.text[0], sc.text[1], sc.text[2]);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(statusText, cols[4] + 2, y + 5);

        // Payment
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 170);
        doc.text(order.payment_method.toUpperCase(), cols[5], y + 5);

        y += 10;
      });

      // Table bottom border
      doc.setDrawColor(50, 50, 70);
      doc.setLineWidth(0.3);
      doc.line(15, y, w - 15, y);
      y += 6;

      // Totals row
      checkPage(14);
      doc.setFillColor(28, 28, 48);
      doc.roundedRect(15, y, w - 30, 12, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(160, 160, 180);
      doc.text("GRAND TOTAL", cols[1], y + 8);
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(11);
      doc.text(formatINR(stats.totalRevenue), cols[3], y + 8);
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 155);
      doc.text(`${stats.count} order${stats.count !== 1 ? "s" : ""}`, cols[4] + 2, y + 8);
    } else {
      checkPage(20);
      doc.setFillColor(28, 28, 45);
      doc.roundedRect(15, y, w - 30, 25, 3, 3, "F");
      doc.setFontSize(10);
      doc.setTextColor(130, 130, 155);
      doc.setFont("helvetica", "normal");
      doc.text("No orders found for this period.", w / 2, y + 14, { align: "center" });
    }

    addFooter();
    doc.save(`ChronoHub_${title.replace(/\s+/g, "_")}.pdf`);
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
        {/* Stats Grid */}
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

        {/* Orders Table */}
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-1">
                <span className="gold-gradient-text">Reports</span> & Analytics
              </h1>
              <p className="text-muted-foreground">View and download your order reports</p>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
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
