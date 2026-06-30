"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import {
  Lock,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Coins,
  Percent,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Store,
  CheckCircle2,
  XCircle,
  Download,
  CreditCard,
  ChefHat,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getOrdersAction } from "@/server/actions/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Restaurant {
  id: string;
  name: string;
  plan: "free" | "basic" | "pro";
}

interface ReportsContentProps {
  initialRestaurants: Restaurant[];
  planTier: "free" | "basic" | "pro" | "super_admin";
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: string;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: Date;
  customerName: string;
  orderType: "dine_in" | "takeaway";
  tableNumber: string | null;
  status: "pending" | "processing" | "completed" | "cancelled";
  totalPrice: string;
  items: OrderItem[];
}

const reportsTranslations = {
  id: {
    title: "Laporan Penjualan Lanjutan",
    subtitle: "Analisis keuangan, statistik transaksi, dan ekspor laporan detail dalam format PDF & Excel.",
    selectOutlet: "Pilih Outlet",
    dateRange: "Periode Tanggal",
    orderType: "Tipe Pesanan",
    orderStatus: "Status Pesanan",
    today: "Hari Ini",
    yesterday: "Kemarin",
    last7Days: "7 Hari Terakhir",
    last30Days: "30 Hari Terakhir",
    thisMonth: "Bulan Ini",
    custom: "Kustom Tanggal",
    allTypes: "Semua Tipe",
    dineIn: "Dine-in (Meja)",
    takeaway: "Takeaway",
    allStatuses: "Semua Status",
    pending: "Menunggu",
    processing: "Diproses",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    totalRevenue: "Total Pendapatan",
    totalRevenueDesc: "Omzet dari pesanan selesai",
    totalTransactions: "Total Transaksi",
    totalTransactionsDesc: "Jumlah pesanan terfilter",
    avgOrderValue: "Rata-rata Transaksi (AOV)",
    avgOrderValueDesc: "Rata-rata nilai per pesanan",
    completedOrders: "Pesanan Sukses",
    completedOrdersDesc: "Rasio pesanan berhasil diselesaikan",
    cancelledOrders: "Pesanan Batal",
    cancelledOrdersDesc: "Rasio pesanan dibatalkan",
    salesTrend: "Tren Omzet Harian",
    salesTrendPeriod: "Grafik pendapatan harian dalam periode terpilih",
    typeBreakdown: "Rasio Tipe Pesanan",
    statusBreakdown: "Rasio Status Pesanan",
    exportExcel: "Ekspor ke Excel",
    exportPdf: "Ekspor ke PDF",
    orderId: "ID Pesanan",
    date: "Tanggal",
    customer: "Pelanggan",
    type: "Tipe",
    table: "Meja",
    status: "Status",
    total: "Total",
    actions: "Aksi",
    items: "Menu Dipesan",
    loading: "Memuat data...",
    noDataTitle: "Tidak Ada Data Transaksi",
    noDataDesc: "Tidak ada transaksi yang cocok dengan filter yang dipilih saat ini.",
    lockedTitle: "Fitur Laporan Lanjutan Terkunci",
    lockedDesc: "Fitur ekspor laporan ke PDF & Excel serta filter detail rentang tanggal hanya tersedia untuk pengguna paket Basic dan Pro.",
    upgradeBtn: "Upgrade Paket Sekarang",
    premiumFeature: "FITUR PREMIUM BASIC & PRO",
    noRestoTitle: "Belum Ada Outlet",
    noRestoDesc: "Silakan buat outlet terlebih dahulu untuk melihat laporan.",
  },
  en: {
    title: "Advanced Sales Reports",
    subtitle: "Analyze finances, transaction stats, and export detailed reports in PDF & Excel formats.",
    selectOutlet: "Select Outlet",
    dateRange: "Date Range",
    orderType: "Order Type",
    orderStatus: "Order Status",
    today: "Today",
    yesterday: "Yesterday",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    thisMonth: "This Month",
    custom: "Custom Range",
    allTypes: "All Types",
    dineIn: "Dine-In",
    takeaway: "Takeaway",
    allStatuses: "All Statuses",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
    totalRevenue: "Total Revenue",
    totalRevenueDesc: "Revenue from completed orders",
    totalTransactions: "Total Transactions",
    totalTransactionsDesc: "Count of filtered orders",
    avgOrderValue: "Avg Order Value (AOV)",
    avgOrderValueDesc: "Average value per order",
    completedOrders: "Success Rate",
    completedOrdersDesc: "Ratio of successfully completed orders",
    cancelledOrders: "Cancellation Rate",
    cancelledOrdersDesc: "Ratio of cancelled orders",
    salesTrend: "Daily Sales Trend",
    salesTrendPeriod: "Daily revenue chart for the selected period",
    typeBreakdown: "Order Type Ratio",
    statusBreakdown: "Order Status Ratio",
    exportExcel: "Export to Excel",
    exportPdf: "Export to PDF",
    orderId: "Order ID",
    date: "Date",
    customer: "Customer",
    type: "Type",
    table: "Table",
    status: "Status",
    total: "Total",
    actions: "Actions",
    items: "Items Ordered",
    loading: "Loading data...",
    noDataTitle: "No Transactions Found",
    noDataDesc: "No transactions match the currently selected filter options.",
    lockedTitle: "Advanced Reports Locked",
    lockedDesc: "Detailed PDF & Excel export features and custom date ranges are only available for Basic and Pro plan subscribers.",
    upgradeBtn: "Upgrade Plan Now",
    premiumFeature: "BASIC & PRO PREMIUM FEATURE",
    noRestoTitle: "No Outlets Yet",
    noRestoDesc: "Please create an outlet first to view reports.",
  }
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export function ReportsContent({ initialRestaurants, planTier }: ReportsContentProps) {
  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedId, setSelectedId] = useState<string>(restaurants[0]?.id || "");
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lang, setLang] = useState<"id" | "en">("id");

  // Filter States
  const [dateRangeOption, setDateRangeOption] = useState<string>("last7");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  useEffect(() => {
    const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }
    const handler = () => {
      const l = localStorage.getItem("menuqr-lang") as "id" | "en";
      if (l) setLang(l);
    };
    window.addEventListener("menuqr-lang-change", handler);
    return () => window.removeEventListener("menuqr-lang-change", handler);
  }, []);

  const t = reportsTranslations[lang];
  const isPremium = planTier === "basic" || planTier === "pro" || planTier === "super_admin";

  // Compute date limits based on option
  const dateLimits = useMemo(() => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    to.setHours(23, 59, 59, 999);

    switch (dateRangeOption) {
      case "today":
        from.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        from.setDate(now.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(now.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case "last7":
        from.setDate(now.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        break;
      case "last30":
        from.setDate(now.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case "custom":
        if (customStartDate) {
          from = new Date(customStartDate);
          from.setHours(0, 0, 0, 0);
        } else {
          from.setDate(now.getDate() - 7);
          from.setHours(0, 0, 0, 0);
        }
        if (customEndDate) {
          to = new Date(customEndDate);
          to.setHours(23, 59, 59, 999);
        }
        break;
    }
    return { from, to };
  }, [dateRangeOption, customStartDate, customEndDate]);

  // Fetch orders from DB when restaurant or date range changes
  const fetchOrders = async (restoId: string, showNotification = false) => {
    if (!restoId) return;
    setLoading(true);
    try {
      const res = await getOrdersAction(restoId, {
        dateFrom: dateLimits.from.toISOString(),
        dateTo: dateLimits.to.toISOString(),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.data) {
        // cast because DB returns createdAt as Date
        setRawOrders((res.data as any[]) || []);
        if (showNotification) {
          toast.success(lang === "id" ? "Laporan berhasil diperbarui!" : "Report updated successfully!");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium && selectedId) {
      fetchOrders(selectedId);
    }
  }, [selectedId, dateLimits.from, dateLimits.to, isPremium]);

  const handleRefresh = () => {
    startTransition(async () => {
      await fetchOrders(selectedId, true);
    });
  };

  // Client-side filtering for type and status for zero-latency filter changes
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const matchType = orderTypeFilter === "all" || order.orderType === orderTypeFilter;
      const matchStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      return matchType && matchStatus;
    });
  }, [rawOrders, orderTypeFilter, orderStatusFilter]);

  // Metric computations based on filtered subset
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    const totalTransactions = filteredOrders.length;
    let completedCount = 0;
    let cancelledCount = 0;

    filteredOrders.forEach((o) => {
      if (o.status === "completed") {
        totalRevenue += Number(o.totalPrice);
        completedCount += 1;
      } else if (o.status === "cancelled") {
        cancelledCount += 1;
      }
    });

    const avgOrderValue = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;
    const completedRatio = totalTransactions > 0 ? Math.round((completedCount / totalTransactions) * 100) : 0;
    const cancelledRatio = totalTransactions > 0 ? Math.round((cancelledCount / totalTransactions) * 100) : 0;

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      completedCount,
      completedRatio,
      cancelledCount,
      cancelledRatio,
    };
  }, [filteredOrders]);

  // Chart trend (chronologically sorted)
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; count: number }> = {};
    
    // Sort transactions first so map aggregates chronologically
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((o) => {
      const d = new Date(o.createdAt);
      const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      if (!map[dateStr]) {
        map[dateStr] = { date: dateStr, revenue: 0, count: 0 };
      }
      map[dateStr].count += 1;
      if (o.status === "completed") {
        map[dateStr].revenue += Number(o.totalPrice);
      }
    });

    return Object.values(map);
  }, [filteredOrders]);

  // Order Type Breakdown values
  const typeBreakdown = useMemo(() => {
    let dineInCount = 0;
    let takeawayCount = 0;

    filteredOrders.forEach((o) => {
      if (o.orderType === "dine_in") dineInCount += 1;
      else if (o.orderType === "takeaway") takeawayCount += 1;
    });

    const total = dineInCount + takeawayCount;
    return {
      dineIn: dineInCount,
      dineInPercent: total > 0 ? Math.round((dineInCount / total) * 100) : 0,
      takeaway: takeawayCount,
      takeawayPercent: total > 0 ? Math.round((takeawayCount / total) * 100) : 0,
    };
  }, [filteredOrders]);

  // Order Status Breakdown values
  const statusBreakdown = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let cancelled = 0;

    filteredOrders.forEach((o) => {
      if (o.status === "pending") pending += 1;
      else if (o.status === "processing") processing += 1;
      else if (o.status === "completed") completed += 1;
      else if (o.status === "cancelled") cancelled += 1;
    });

    const total = pending + processing + completed + cancelled;
    return {
      pending,
      pendingPercent: total > 0 ? Math.round((pending / total) * 100) : 0,
      processing,
      processingPercent: total > 0 ? Math.round((processing / total) * 100) : 0,
      completed,
      completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancelled,
      cancelledPercent: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    };
  }, [filteredOrders]);

  // Toggle order expansion
  const toggleOrderExpand = (id: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const activeRestaurantName = useMemo(() => {
    return restaurants.find((r) => r.id === selectedId)?.name || "Restoran";
  }, [restaurants, selectedId]);

  const dateRangeLabel = useMemo(() => {
    if (dateRangeOption === "custom") {
      const startStr = customStartDate
        ? new Date(customStartDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "-";
      const endStr = customEndDate
        ? new Date(customEndDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "-";
      return `${startStr} - ${endStr}`;
    }
    const keyMap: Record<string, string> = {
      last7: "last7Days",
      last30: "last30Days"
    };
    const lookupKey = keyMap[dateRangeOption] || dateRangeOption;
    return t[lookupKey as keyof typeof t] || dateRangeOption;
  }, [dateRangeOption, customStartDate, customEndDate, lang]);

  // EXPORT EXCEL
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Info
      const summaryData = [
        ["LAPORAN PENJUALAN ADVANCED - " + activeRestaurantName.toUpperCase()],
        ["Periode Laporan", dateRangeLabel],
        ["Waktu Cetak", new Date().toLocaleString("id-ID")],
        [],
        ["Rangkuman Metrik Utama"],
        ["Metrik", "Nilai"],
        [t.totalRevenue, metrics.totalRevenue],
        [t.totalTransactions, metrics.totalTransactions],
        [t.avgOrderValue, metrics.avgOrderValue],
        [`${t.completedOrders} (Qty)`, metrics.completedCount],
        [`${t.completedOrders} (%)`, `${metrics.completedRatio}%`],
        [`${t.cancelledOrders} (Qty)`, metrics.cancelledCount],
        [`${t.cancelledOrders} (%)`, `${metrics.cancelledRatio}%`],
        [],
        ["Distribusi Tipe Pesanan"],
        ["Tipe", "Jumlah", "Persentase"],
        [t.dineIn, typeBreakdown.dineIn, `${typeBreakdown.dineInPercent}%`],
        [t.takeaway, typeBreakdown.takeaway, `${typeBreakdown.takeawayPercent}%`],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Laporan");

      // Sheet 2: Order Transactions Details
      const detailsData = [];
      detailsData.push([
        t.orderId,
        t.date,
        t.customer,
        t.type,
        t.table,
        t.status,
        t.items,
        "Qty",
        "Harga Satuan",
        "Subtotal",
        t.total
      ]);

      filteredOrders.forEach((order) => {
        order.items.forEach((item, idx) => {
          detailsData.push([
            order.id.slice(0, 8),
            new Date(order.createdAt).toLocaleString("id-ID"),
            order.customerName,
            order.orderType === "dine_in" ? t.dineIn : t.takeaway,
            order.tableNumber || "-",
            t[order.status as keyof typeof t] || order.status,
            item.name,
            item.quantity,
            Number(item.price),
            Number(item.price) * item.quantity,
            idx === 0 ? Number(order.totalPrice) : "" // Show order total only on first item row
          ]);
        });
      });

      const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
      XLSX.utils.book_append_sheet(wb, wsDetails, "Detail Transaksi");

      // Save file
      const fileName = `Laporan_Penjualan_${activeRestaurantName.replace(/\s+/g, "_")}_${dateRangeOption}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success(lang === "id" ? "File Excel berhasil dibuat!" : "Excel file successfully created!");
    } catch (e: any) {
      toast.error(lang === "id" ? "Gagal mengekspor Excel" : "Failed to export Excel");
      console.error(e);
    }
  };

  // EXPORT PDF
  const handleExportPdf = async () => {
    try {
      const doc = new jsPDF();
      const printDate = new Date().toLocaleString("id-ID");

      // Header Brand
      try {
        const logoImg = await loadImage("/lightmode.png");
        // Aspect ratio is 1538 / 462 = 3.3289
        // If width is 33mm, height is 33 / 3.3289 = ~10mm
        doc.addImage(logoImg, "PNG", 14, 15, 33, 10);
      } catch (e) {
        console.error("Failed to load logo", e);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(249, 115, 22); // Orange MenuQR
        doc.text("MenuQR", 14, 20);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(115, 115, 115);
        doc.text("Premium Business Reports", 14, 25);
      }

      // Report Header info
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(23, 23, 23);
      doc.text(t.title.toUpperCase(), 14, 38);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(64, 64, 64);
      
      const metaInfo = [
        `Outlet / Restaurant: ${activeRestaurantName}`,
        `${t.dateRange}: ${dateRangeLabel}`,
        `Cetak Laporan: ${printDate}`
      ];
      metaInfo.forEach((line, idx) => {
        doc.text(line, 14, 45 + idx * 5);
      });

      // Horizontal Divider
      doc.setDrawColor(229, 229, 229);
      doc.line(14, 62, 196, 62);

      // Summary Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(23, 23, 23);
      doc.text("RINGKASAN KINERJA KEUANGAN (FINANCIAL SUMMARY)", 14, 70);

      const formatPrice = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

      const summaryTableData = [
        [t.totalRevenue, formatPrice(metrics.totalRevenue), t.totalTransactions, metrics.totalTransactions],
        [t.avgOrderValue, formatPrice(metrics.avgOrderValue), t.completedOrders, `${metrics.completedCount} (${metrics.completedRatio}%)`],
        [t.cancelledOrders, `${metrics.cancelledCount} (${metrics.cancelledRatio}%)`, "", ""]
      ];

      autoTable(doc, {
        startY: 74,
        head: [],
        body: summaryTableData,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [115, 115, 115], cellWidth: 50 },
          1: { textColor: [23, 23, 23], fontStyle: "bold" },
          2: { fontStyle: "bold", textColor: [115, 115, 115], cellWidth: 50 },
          3: { textColor: [23, 23, 23] }
        }
      });

      // Transactions Section
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(23, 23, 23);
      doc.text("DAFTAR TRANSAKSI DETAIL (TRANSACTION DETAILS)", 14, finalY);

      // Table orders
      const orderHeaders = [
        t.orderId,
        t.date,
        t.customer,
        t.type,
        t.status,
        t.items,
        t.total
      ];

      const orderBody = filteredOrders.map((o) => {
        const dateFormatted = new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
        const itemsList = o.items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
        return [
          o.id.slice(0, 8),
          dateFormatted,
          o.customerName,
          o.orderType === "dine_in" ? `Dine-in ${o.tableNumber ? `(#${o.tableNumber})` : ""}` : t.takeaway,
          t[o.status as keyof typeof t] || o.status,
          itemsList,
          formatPrice(Number(o.totalPrice))
        ];
      });

      autoTable(doc, {
        startY: finalY + 4,
        head: [orderHeaders],
        body: orderBody,
        theme: "striped",
        headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 25 },
          2: { cellWidth: 22 },
          3: { cellWidth: 26 },
          4: { cellWidth: 20, fontStyle: "bold" },
          5: { cellWidth: 48 },
          6: { cellWidth: 23, fontStyle: "bold", halign: "right" }
        }
      });

      // Save PDF
      const pdfFileName = `Laporan_Penjualan_${activeRestaurantName.replace(/\s+/g, "_")}_${dateRangeOption}.pdf`;
      doc.save(pdfFileName);
      toast.success(lang === "id" ? "File PDF berhasil dibuat!" : "PDF file successfully created!");
    } catch (e: any) {
      toast.error(lang === "id" ? "Gagal mengekspor PDF" : "Failed to export PDF");
      console.error(e);
    }
  };

  // Locked/Free Plan UI Render
  if (!isPremium) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center p-4">
        {/* Glow Effects */}
        <div className="absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
          <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 blur-3xl animate-pulse" />
          <div className="h-[300px] w-[300px] rounded-full bg-blue-500 blur-3xl -ml-20" />
        </div>

        {/* Premium Lock Card */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-100 dark:border-neutral-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
          {/* Top Banner Tag */}
          <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-1.5 text-center text-[10px] font-black tracking-widest uppercase select-none">
            {t.premiumFeature}
          </div>

          <div className="mt-4 flex flex-col items-center text-center space-y-6">
            {/* Animated Lock Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-xl scale-125 animate-ping" />
              <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg relative border border-white/20">
                <Lock className="h-8 w-8 animate-bounce mt-[-2px]" />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2.5">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.lockedTitle}
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-md mx-auto leading-relaxed">
                {t.lockedDesc}
              </p>
            </div>

            {/* Grid showing features unlocked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left bg-neutral-50 dark:bg-neutral-950/40 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-900">
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center text-emerald-500 shrink-0">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Ekspor Excel (.xlsx)</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Unduh data transaksi flat dengan detail item untuk pengolahan mandiri.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/5 flex items-center justify-center text-blue-500 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Ekspor PDF Siap Cetak</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Konversi performa bisnis menjadi laporan PDF dengan header formal.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-orange-500/10 dark:bg-orange-500/5 flex items-center justify-center text-orange-500 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Filter Periode Kustom</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Atur rentang tanggal laporan secara kustom tanpa batasan visual.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-purple-500/10 dark:bg-purple-500/5 flex items-center justify-center text-purple-500 shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Analisis Keuangan</h4>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Hitung AOV (nilai transaksi rata-rata) serta metrik pembatalan pesanan.</p>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            <Link href="/dashboard/billing" className="w-full">
              <button className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition-all group duration-300 transform active:scale-[0.98]">
                <CreditCard className="h-4 w-4" />
                {t.upgradeBtn}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active / Premium UI Render
  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Store className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h2 className="text-lg font-black text-neutral-800 dark:text-white">{t.noRestoTitle}</h2>
        <p className="text-xs text-neutral-400 max-w-sm">{t.noRestoDesc}</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            {t.title}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={loading || isPending}
            variant="outline"
            className="rounded-xl h-9 text-xs font-bold gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || isPending ? "animate-spin" : ""}`} />
          </Button>

          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            disabled={loading || filteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-400 disabled:border-none text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm transition-colors border border-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">{t.exportExcel}</span>
          </button>

          {/* Export to PDF */}
          <button
            onClick={handleExportPdf}
            disabled={loading || filteredOrders.length === 0}
            className="inline-flex items-center gap-1.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-950 dark:hover:bg-neutral-750 disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-400 disabled:border-none text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-sm transition-colors border border-neutral-900 dark:border-neutral-700"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filter Laporan Lanjutan
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Restaurant Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {t.selectOutlet}
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.plan.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {t.dateRange}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={dateRangeOption}
                onChange={(e) => setDateRangeOption(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                <option value="today">{t.today}</option>
                <option value="yesterday">{t.yesterday}</option>
                <option value="last7">{t.last7Days}</option>
                <option value="last30">{t.last30Days}</option>
                <option value="thisMonth">{t.thisMonth}</option>
                <option value="custom">{t.custom}</option>
              </select>
            </div>
          </div>

          {/* Order Type Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {t.orderType}
            </label>
            <div className="relative">
              <ChefHat className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                <option value="all">{t.allTypes}</option>
                <option value="dine_in">{t.dineIn}</option>
                <option value="takeaway">{t.takeaway}</option>
              </select>
            </div>
          </div>

          {/* Order Status Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
              {t.orderStatus}
            </label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="pending">{t.pending}</option>
                <option value="processing">{t.processing}</option>
                <option value="completed">{t.completed}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Picker Fields (only visible if 'custom' is selected) */}
        {dateRangeOption === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-50 dark:border-neutral-950">
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Mulai Tanggal (Start Date)</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Sampai Tanggal (End Date)</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 text-neutral-800 dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t.totalRevenue}</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">{formatPrice(metrics.totalRevenue)}</h3>
                <p className="text-[9px] font-bold text-neutral-400 mt-1">{t.totalRevenueDesc}</p>
              </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t.totalTransactions}</span>
                <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">{metrics.totalTransactions}</h3>
                <p className="text-[9px] font-bold text-neutral-400 mt-1">{t.totalTransactionsDesc}</p>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t.avgOrderValue}</span>
                <div className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">{formatPrice(metrics.avgOrderValue)}</h3>
                <p className="text-[9px] font-bold text-neutral-400 mt-1">{t.avgOrderValueDesc}</p>
              </div>
            </div>

            {/* Completed Orders (Success Rate) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t.completedOrders}</span>
                <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
                  {metrics.completedCount} <span className="text-xs text-teal-500 font-bold">({metrics.completedRatio}%)</span>
                </h3>
                <p className="text-[9px] font-bold text-neutral-400 mt-1">{t.completedOrdersDesc}</p>
              </div>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">{t.cancelledOrders}</span>
                <div className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
                  <XCircle className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white tracking-tight">
                  {metrics.cancelledCount} <span className="text-xs text-rose-500 font-bold">({metrics.cancelledRatio}%)</span>
                </h3>
                <p className="text-[9px] font-bold text-neutral-400 mt-1">{t.cancelledOrdersDesc}</p>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-16 text-center space-y-4">
              <AlertCircle className="h-14 w-14 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <h3 className="text-lg font-black text-neutral-950 dark:text-white">{t.noDataTitle}</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">{t.noDataDesc}</p>
            </div>
          ) : (
            <>
              {/* Analytics Trend & Breakdown */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Trend Area Chart (Left) */}
                <div className="xl:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 dark:text-white">{t.salesTrend}</h3>
                    <p className="text-[10px] text-neutral-400 font-bold mt-0.5">{t.salesTrendPeriod} ({dateRangeLabel})</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReportRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} className="dark:stroke-neutral-800" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }} tickFormatter={(v) => `Rp ${v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}K`}`} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", fontSize: 11, fontWeight: "bold", backgroundColor: "rgba(255, 255, 255, 0.95)" }} formatter={(value: any) => [formatPrice(value), "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorReportRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Breakdown Progress Lists (Right) */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
                  {/* Order Type Ratio */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-neutral-900 dark:text-white">{t.typeBreakdown}</h3>
                    
                    <div className="space-y-3">
                      {/* Dine In */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">{t.dineIn}</span>
                          <span className="font-black text-neutral-900 dark:text-white">{typeBreakdown.dineIn} ({typeBreakdown.dineInPercent}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${typeBreakdown.dineInPercent}%` }} />
                        </div>
                      </div>

                      {/* Takeaway */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">{t.takeaway}</span>
                          <span className="font-black text-neutral-900 dark:text-white">{typeBreakdown.takeaway} ({typeBreakdown.takeawayPercent}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${typeBreakdown.takeawayPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Ratio */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">{t.statusBreakdown}</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{t.completed}</span>
                          <span className="text-sm font-black text-emerald-500">{statusBreakdown.completed}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-neutral-400 bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border">{statusBreakdown.completedPercent}%</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{t.cancelled}</span>
                          <span className="text-sm font-black text-rose-500">{statusBreakdown.cancelled}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-neutral-400 bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border">{statusBreakdown.cancelledPercent}%</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{t.processing}</span>
                          <span className="text-sm font-black text-orange-500">{statusBreakdown.processing}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-neutral-400 bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border">{statusBreakdown.processingPercent}%</span>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{t.pending}</span>
                          <span className="text-sm font-black text-amber-500">{statusBreakdown.pending}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-neutral-400 bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded-md border">{statusBreakdown.pendingPercent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Transactions List */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 dark:text-white">Daftar Transaksi Detail</h3>
                    <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Daftar pesanan terperinci beserta menu yang dipesan.</p>
                  </div>
                  <span className="text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full text-neutral-500">
                    {filteredOrders.length} {lang === "id" ? "Pesanan" : "Orders"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-neutral-50/50 dark:bg-neutral-950/20 text-neutral-400 dark:text-neutral-500 text-[10px] font-black uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                        <th className="py-3.5 px-5 w-[8%]">{t.orderId}</th>
                        <th className="py-3.5 px-3 w-[18%]">{t.date}</th>
                        <th className="py-3.5 px-3 w-[15%]">{t.customer}</th>
                        <th className="py-3.5 px-3 w-[15%]">{t.type}</th>
                        <th className="py-3.5 px-3 w-[12%]">{t.status}</th>
                        <th className="py-3.5 px-3 w-[18%] text-right">{t.total}</th>
                        <th className="py-3.5 px-5 w-[14%] text-center">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800 text-xs">
                      {filteredOrders.map((order) => {
                        const isExpanded = !!expandedOrders[order.id];
                        
                        // Status Badge Color Class
                        let statusColor = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
                        if (order.status === "completed") {
                          statusColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                        } else if (order.status === "pending") {
                          statusColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                        } else if (order.status === "processing") {
                          statusColor = "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400";
                        } else if (order.status === "cancelled") {
                          statusColor = "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400";
                        }

                        // Order Type Badge Color Class
                        const typeColor = order.orderType === "dine_in"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                          : "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";

                        const orderDate = new Date(order.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <React.Fragment key={order.id}>
                            <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all font-semibold text-neutral-800 dark:text-neutral-200">
                              <td className="py-4 px-5 font-black text-neutral-900 dark:text-white">
                                #{order.id.slice(0, 8)}
                              </td>
                              <td className="py-4 px-3 text-neutral-500 font-medium">
                                {orderDate}
                              </td>
                              <td className="py-4 px-3">
                                {order.customerName}
                              </td>
                              <td className="py-4 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${typeColor}`}>
                                  {order.orderType === "dine_in"
                                    ? `${t.dineIn} ${order.tableNumber ? `#${order.tableNumber}` : ""}`
                                    : t.takeaway}
                                </span>
                              </td>
                              <td className="py-4 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${statusColor}`}>
                                  {t[order.status as keyof typeof t] || order.status}
                                </span>
                              </td>
                              <td className="py-4 px-3 text-right font-black text-neutral-950 dark:text-white">
                                {formatPrice(Number(order.totalPrice))}
                              </td>
                              <td className="py-4 px-5 text-center">
                                <button
                                  onClick={() => toggleOrderExpand(order.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-[10px] uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-100 dark:border-neutral-900 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      Tutup
                                      <ChevronUp className="h-3 w-3" />
                                    </>
                                  ) : (
                                    <>
                                      Menu Detail
                                      <ChevronDown className="h-3 w-3" />
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Order Items Row */}
                            {isExpanded && (
                              <tr className="bg-neutral-50/30 dark:bg-neutral-950/10">
                                <td colSpan={7} className="p-4 px-8">
                                  <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 p-4 space-y-3.5 shadow-inner">
                                    <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest flex items-center gap-1.5">
                                      <ShoppingCart className="h-3.5 w-3.5 text-neutral-400" />
                                      {t.items}
                                    </h4>
                                    
                                    <div className="divide-y divide-neutral-50 dark:divide-neutral-900">
                                      {order.items.map((item) => (
                                        <div key={item.menuItemId} className="flex justify-between items-center py-2.5 text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-neutral-900 dark:text-white">{item.name}</span>
                                            <span className="text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                                          </div>
                                          <div className="flex gap-4 font-semibold">
                                            <span className="text-neutral-400">{formatPrice(Number(item.price))} / pcs</span>
                                            <span className="font-black text-neutral-900 dark:text-white">{formatPrice(Number(item.price) * item.quantity)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="pt-3 border-t flex justify-between items-center text-xs font-black">
                                      <span className="text-neutral-400 uppercase tracking-wider">Total Pembayaran</span>
                                      <span className="text-sm text-orange-500">{formatPrice(Number(order.totalPrice))}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
