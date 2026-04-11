import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Calendar as CalendarIcon, TrendingUp, ShoppingBag,
  Users, Activity, ChevronRight, BarChart3, ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks, startOfQuarter, endOfQuarter, subQuarters, startOfDay, endOfDay } from "date-fns";
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

  useEffect(() => {
    if (!user) return;
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

    const checkPage = (needed: number) => {
      if (y + needed > pageH - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Header gradient bar
    doc.setFillColor(30, 30, 45);
    doc.rect(0, 0, w, 50, "F");
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 48, w, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(22);
    doc.text("ChronoHub", 15, 22);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 190);
    doc.text(title, 15, 32);
    doc.setFontSize(9);
    doc.text(`Period: ${periodLabel}`, 15, 40);
    doc.text(`Generated: ${format(now, "dd MMM yyyy, hh:mm a")}`, w - 15, 40, { align: "right" });
    y = 60;

    // Summary cards
    const cardW = (w - 40) / 3;
    const cardData = [
      { label: "Total Revenue", value: formatINR(stats.totalRevenue) },
      { label: "Total Orders", value: String(stats.count) },
      { label: "GST Collected", value: formatINR(stats.totalGST) },
    ];
    cardData.forEach((c, i) => {
      const cx = 15 + i * (cardW + 5);
      doc.setFillColor(38, 38, 55);
      doc.roundedRect(cx, y, cardW, 28, 3, 3, "F");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 170);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 5, y + 10);
      doc.setFontSize(14);
      doc.setTextColor(212, 175, 55);
      doc.setFont("helvetica", "bold");
      doc.text(c.value, cx + 5, y + 22);
    });
    y += 38;

    // Status breakdown
    const statusCards = [
      { label: "Delivered", value: stats.delivered, color: [34, 197, 94] as [number, number, number] },
      { label: "Pending", value: stats.pending, color: [234, 179, 8] as [number, number, number] },
      { label: "Cancelled", value: stats.cancelled, color: [239, 68, 68] as [number, number, number] },
      { label: "Shipping", value: formatINR(stats.totalShipping), color: [99, 102, 241] as [number, number, number] },
    ];
    const sCardW = (w - 40) / 4;
    statusCards.forEach((c, i) => {
      const cx = 15 + i * (sCardW + 3.3);
      doc.setFillColor(38, 38, 55);
      doc.roundedRect(cx, y, sCardW, 22, 3, 3, "F");
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 170);
      doc.setFont("helvetica", "normal");
      doc.text(c.label, cx + 4, y + 8);
      doc.setFontSize(12);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(String(c.value), cx + 4, y + 18);
    });
    y += 32;

    // Orders table
    if (list.length > 0) {
      checkPage(20);
      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.setFont("helvetica", "bold");
      doc.text("Order Details", 15, y);
      y += 8;

      // Table header
      doc.setFillColor(38, 38, 55);
      doc.rect(15, y, w - 30, 10, "F");
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 190);
      doc.setFont("helvetica", "bold");
      const cols = [15, 45, 82, 112, 142, 170];
      const headers = ["S.No.", "Order No.", "Date", "Amount", "Status", "Payment"];
      headers.forEach((h, i) => doc.text(h, cols[i] + 3, y + 7));
      y += 12;

      list.forEach((order, idx) => {
        checkPage(12);
        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.setFillColor(32, 32, 48);
          doc.rect(15, y - 2, w - 30, 10, "F");
        }
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(220, 220, 230);
        doc.text(String(idx + 1), cols[0] + 3, y + 5);
        doc.text(order.order_number, cols[1] + 3, y + 5);
        doc.text(format(new Date(order.created_at), "dd MMM yyyy"), cols[2] + 3, y + 5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(212, 175, 55);
        doc.text(formatINR(order.total_amount), cols[3] + 3, y + 5);
        const statusColor: Record<string, [number, number, number]> = {
          delivered: [34, 197, 94], pending: [234, 179, 8], confirmed: [59, 130, 246],
          processing: [249, 115, 22], shipped: [168, 85, 247], cancelled: [239, 68, 68],
          out_for_delivery: [6, 182, 212],
        };
        const sc = statusColor[order.status] || [180, 180, 190];
        doc.setTextColor(sc[0], sc[1], sc[2]);
        doc.setFont("helvetica", "normal");
        doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " "), cols[4] + 3, y + 5);
        doc.setTextColor(180, 180, 190);
        doc.text(order.payment_method.toUpperCase(), cols[5] + 3, y + 5);
        y += 10;
      });
    }

    // Footer
    y = pageH - 15;
    doc.setFillColor(212, 175, 55);
    doc.rect(0, y - 2, w, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 170);
    doc.setFont("helvetica", "normal");
    doc.text("ChronoHub - Premium Watch Collection | Generated Report", 15, y + 5);
    doc.text("Confidential", w - 15, y + 5, { align: "right" });

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
            { label: "Total Orders", value: stats.count, icon: ShoppingBag, color: "text-blue-400" },
            { label: "Delivered", value: stats.delivered, icon: Activity, color: "text-green-400" },
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
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
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
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
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
            {/* Calendar quick-pick */}
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
            {/* Previous month comparison */}
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
