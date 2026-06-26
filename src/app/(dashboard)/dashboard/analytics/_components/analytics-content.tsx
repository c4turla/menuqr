"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  Coins, 
  Utensils, 
  Store, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { getAnalyticsAction } from "@/server/actions/order-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  plan: "free" | "basic" | "pro";
}

interface AnalyticsContentProps {
  initialRestaurants: Restaurant[];
}

const analyticsTranslations = {
  id: {
    title: "Dasbor Analitik Penjualan",
    subtitle: "Pahami apa yang disukai pelanggan Anda, pantau pesanan harian, dan evaluasi pendapatan dengan grafik interaktif.",
    totalRevenue: "Pendapatan Bulan Ini",
    totalRevenueDesc: "Total dari pesanan selesai",
    totalOrders: "Total Pesanan",
    totalOrdersDesc: "Jumlah pesanan masuk",
    bestSeller: "Best-Seller",
    bestSellerDesc: "Hidangan terlaris saat ini",
    avgOrderValue: "Rata-rata Transaksi",
    avgOrderValueDesc: "Rata-rata nilai pesanan",
    ordersTitle: "Tren Pesanan Harian",
    ordersPeriod: "7 hari terakhir",
    revenueTitle: "Evaluasi Pendapatan Bulanan",
    revenuePeriod: "6 bulan terakhir",
    popularTitle: "Hidangan Terpopuler",
    popularSubtitle: "Berdasarkan kuantitas yang dipesan",
    qtySold: "terjual",
    noRestoTitle: "Belum Ada Outlet",
    noRestoDesc: "Silakan buat outlet terlebih dahulu untuk melihat analitik.",
    selectOutlet: "Pilih Outlet",
    demoBadge: "Mode Simulasi",
    demoNotice: "Menampilkan data simulasi karena outlet terpilih belum memiliki transaksi penjualan.",
    realBadge: "Data Riil",
    refreshBtn: "Segarkan",
    noDataTitle: "Belum Ada Data Penjualan",
    noDataDesc: "Data analitik akan muncul setelah ada pesanan yang masuk dan diselesaikan.",
  },
  en: {
    title: "Sales Analytics Dashboard",
    subtitle: "Understand what your customers love, track daily orders, and evaluate monthly revenue with interactive charts.",
    totalRevenue: "Monthly Revenue",
    totalRevenueDesc: "Total from completed orders",
    totalOrders: "Total Orders",
    totalOrdersDesc: "Total incoming orders",
    bestSeller: "Best-Selling Item",
    bestSellerDesc: "Currently most popular dish",
    avgOrderValue: "Avg Order Value",
    avgOrderValueDesc: "Average order value",
    ordersTitle: "Daily Orders Trend",
    ordersPeriod: "Last 7 days",
    revenueTitle: "Monthly Revenue Evaluation",
    revenuePeriod: "Last 6 months",
    popularTitle: "Most Popular Dishes",
    popularSubtitle: "Based on quantity ordered",
    qtySold: "sold",
    noRestoTitle: "No Outlets Yet",
    noRestoDesc: "Please create an outlet first to view analytics.",
    selectOutlet: "Select Outlet",
    demoBadge: "Demo Mode",
    demoNotice: "Showing simulation data because the selected outlet has no transaction history yet.",
    realBadge: "Real Data",
    refreshBtn: "Refresh",
    noDataTitle: "No Sales Data Yet",
    noDataDesc: "Analytical data will appear after orders are placed and completed.",
  }
};

// Simulated data to show when database has 0 orders (to keep dashboard gorgeous)
const MOCK_ANALYTICS = {
  totalRevenue: 4850000,
  totalOrders: 154,
  bestSeller: "Nasi Goreng Spesial",
  popularItems: [
    { name: "Nasi Goreng Spesial", quantity: 58, revenue: 1450000 },
    { name: "Soto Ayam Lamongan", quantity: 42, revenue: 840000 },
    { name: "Es Teh Manis Jumbo", quantity: 38, revenue: 190000 },
    { name: "Ayam Goreng Kalasan", quantity: 24, revenue: 600000 },
    { name: "Jus Jeruk Segar", quantity: 18, revenue: 180000 },
  ],
  dailyOrdersData: [
    { date: "Sen", orders: 12, revenue: 380000 },
    { date: "Sel", orders: 19, revenue: 590000 },
    { date: "Rab", orders: 15, revenue: 470000 },
    { date: "Kam", orders: 22, revenue: 680000 },
    { date: "Jum", orders: 28, revenue: 890000 },
    { date: "Sab", orders: 35, revenue: 1120000 },
    { date: "Min", orders: 23, revenue: 720000 },
  ],
  monthlyRevenueData: [
    { month: "Jan", revenue: 2400000 },
    { month: "Feb", revenue: 3100000 },
    { month: "Mar", revenue: 2800000 },
    { month: "Apr", revenue: 4200000 },
    { month: "Mei", revenue: 5100000 },
    { month: "Jun", revenue: 4850000 },
  ],
};

export function AnalyticsContent({ initialRestaurants }: AnalyticsContentProps) {
  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedId, setSelectedId] = useState<string>(
    restaurants[0]?.id || ""
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [useDemo, setUseDemo] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

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

  const fetchAnalytics = async (restaurantId: string, showToast = false) => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await getAnalyticsAction(restaurantId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const realData = res.data;
      setData(realData);
      // Auto-toggle demo mode if outlet is brand new with 0 orders
      if (realData && realData.totalOrders === 0) {
        setUseDemo(true);
      } else {
        setUseDemo(false);
      }
      if (showToast) {
        toast.success(lang === "id" ? "Data berhasil diperbarui!" : "Data updated successfully!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedId);
  }, [selectedId]);

  const handleRefresh = () => {
    startTransition(async () => {
      await fetchAnalytics(selectedId, true);
    });
  };

  if (restaurants.length === 0) {
    const tEmpty = analyticsTranslations[lang];
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Store className="h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h2 className="text-lg font-black text-neutral-800 dark:text-white">{tEmpty.noRestoTitle}</h2>
        <p className="text-xs text-neutral-400 max-w-sm">{tEmpty.noRestoDesc}</p>
      </div>
    );
  }

  const t = analyticsTranslations[lang];
  const activeData = useDemo ? MOCK_ANALYTICS : data;

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const avgOrderVal = activeData?.totalOrders > 0 
    ? Math.round(activeData.totalRevenue / activeData.totalOrders) 
    : 0;

  const stats = [
    { 
      label: t.totalRevenue, 
      value: activeData ? formatPrice(activeData.totalRevenue) : "Rp 0", 
      subtitle: t.totalRevenueDesc, 
      icon: Coins,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: t.totalOrders, 
      value: activeData ? activeData.totalOrders.toLocaleString() : "0", 
      subtitle: t.totalOrdersDesc, 
      icon: ShoppingCart,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: t.avgOrderValue, 
      value: activeData ? formatPrice(avgOrderVal) : "Rp 0", 
      subtitle: t.avgOrderValueDesc, 
      icon: TrendingUp,
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      textColor: "text-orange-500"
    },
    { 
      label: t.bestSeller, 
      value: activeData?.bestSeller || "-", 
      subtitle: t.bestSellerDesc, 
      icon: Utensils,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      textColor: "text-amber-600 dark:text-amber-400"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Restaurant Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              {t.selectOutlet}:
            </span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs font-bold bg-transparent text-neutral-800 dark:text-white focus:outline-none border-none cursor-pointer"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-neutral-900">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={loading || isPending}
            variant="outline"
            className="rounded-xl h-9 text-xs font-bold gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || isPending ? "animate-spin" : ""}`} />
            {t.refreshBtn}
          </Button>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {data && data.totalOrders === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-2xl">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {t.demoBadge}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-500/70 font-medium">
                {t.demoNotice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseDemo(!useDemo)}
            className="text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 self-start sm:self-center transition-colors"
          >
            {useDemo ? (lang === "id" ? "Lihat Data Kosong" : "View Empty Data") : (lang === "id" ? "Aktifkan Simulasi" : "Enable Simulation")}
          </button>
        </div>
      )}

      {/* Demo/Real Status Indicator when not forced by zero data */}
      {data && data.totalOrders > 0 && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl border">
            <button
              onClick={() => setUseDemo(false)}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all ${
                !useDemo 
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm" 
                  : "text-neutral-400"
              }`}
            >
              {t.realBadge}
            </button>
            <button
              onClick={() => setUseDemo(true)}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg transition-all ${
                useDemo 
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm" 
                  : "text-neutral-400"
              }`}
            >
              {t.demoBadge}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                      {stat.label}
                    </span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg lg:text-xl font-black text-neutral-900 dark:text-white leading-none tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[9px] font-bold text-neutral-400 mt-1.5">{stat.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Daily Orders Trend (Area Chart) */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-neutral-900 dark:text-white">{t.ordersTitle}</p>
                  <p className="text-[10px] text-neutral-400 font-bold mt-0.5">{t.ordersPeriod}</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeData?.dailyOrdersData || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="dark:stroke-neutral-800" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }} />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: 12, 
                        border: "none", 
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                        fontSize: 11,
                        fontWeight: "bold",
                        backgroundColor: "rgba(255, 255, 255, 0.95)"
                      }}
                    />
                    <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Revenue (Bar Chart) */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-neutral-900 dark:text-white">{t.revenueTitle}</p>
                  <p className="text-[10px] text-neutral-400 font-bold mt-0.5">{t.revenuePeriod}</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData?.monthlyRevenueData || []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="dark:stroke-neutral-800" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "#a3a3a3", fontWeight: 700 }}
                      tickFormatter={(val) => `Rp ${val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`}`}
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: 12, 
                        border: "none", 
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                        fontSize: 11,
                        fontWeight: "bold",
                        backgroundColor: "rgba(255, 255, 255, 0.95)"
                      }}
                      formatter={(value: any) => [formatPrice(value), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Best Selling Items List */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <p className="font-black text-sm text-neutral-900 dark:text-white">
                {t.popularTitle}
              </p>
              <p className="text-[10px] text-neutral-400 font-bold mt-0.5">{t.popularSubtitle}</p>
            </div>
            
            {activeData?.popularItems && activeData.popularItems.length > 0 ? (
              <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {activeData.popularItems.map((item: any, index: number) => {
                  const maxQty = Math.max(...activeData.popularItems.map((i: any) => i.quantity));
                  const percentage = maxQty > 0 ? (item.quantity / maxQty) * 100 : 0;

                  return (
                    <div key={item.name} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all">
                      <div className="flex items-center gap-3.5 flex-1">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <span className="text-orange-500 font-black text-xs">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="block text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          {/* Beautiful Progress Bar */}
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pl-12 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">{t.qtySold}</span>
                          <span className="text-sm font-black text-neutral-800 dark:text-neutral-200">{item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-neutral-400 font-bold uppercase tracking-wider">{t.totalRevenue}</span>
                          <span className="text-sm font-black text-orange-500">{formatPrice(item.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400 dark:text-neutral-600">
                <AlertCircle className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                <p className="text-xs font-bold">{t.noDataTitle}</p>
                <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1">{t.noDataDesc}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
