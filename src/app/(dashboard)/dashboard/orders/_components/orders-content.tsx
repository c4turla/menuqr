"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Crown, 
  AlertTriangle, 
  RefreshCw,
  Receipt,
  User,
  CalendarDays,
  Zap,
  History,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getOrdersAction, updateOrderStatusAction } from "@/server/actions/order-actions";
import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  plan: "free" | "basic" | "pro";
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: string;
  quantity: number;
}

interface Order {
  id: string;
  restaurantId: string;
  tableNumber: string | null;
  customerName: string | null;
  orderType: string;
  status: string; // pending, processing, completed, cancelled
  totalPrice: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrdersContentProps {
  initialRestaurants: Restaurant[];
}

// ──────────────────────────────────────────────────────────────────────────
// TIMEZONE NOTE:
// Skema DB menggunakan `timestamp` (tanpa tz). PostgreSQL menyimpan waktu
// WIB apa adanya (karena app/DB server di UTC+7). Drizzle membaca nilai ini
// dan membungkusnya dalam JS Date seolah UTC → tampilan jadi 7 jam ke depan.
//
// Solusi display: pakai timeZone: "UTC" agar JS tidak menggeser nilai raw,
// sehingga nilai WIB yang tersimpan tampil dengan benar.
//
// Fix proper jangka panjang: migrasi schema ke timestamp({ withTimezone: true })
// ──────────────────────────────────────────────────────────────────────────

// Offset WIB dalam ms (dipakai untuk filter range tanggal ke server)
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Untuk filter ke DB: konversi "00:00 WIB" menjadi nilai raw yang setara.
 * Karena DB menyimpan WIB as-is (tidak ada tz-awareness), kita TIDAK perlu
 * menggeser — cukup bangun Date dengan nilai WIB langsung lalu pakai ISO.
 */
function getTodayRange(): { dateFrom: string; dateTo: string } {
  // Ambil tanggal hari ini di WIB dengan menggeser UTC+7
  const wibNow = new Date(Date.now() + WIB_OFFSET_MS);
  const y = wibNow.getUTCFullYear();
  const mo = wibNow.getUTCMonth();
  const d = wibNow.getUTCDate();
  // Bangun batas hari dalam "waktu WIB as UTC" — cocok dengan nilai raw di DB
  const start = new Date(Date.UTC(y, mo, d, 0, 0, 0, 0));
  const end   = new Date(Date.UTC(y, mo, d, 23, 59, 59, 999));
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
}

// Helper: range untuk tanggal tertentu (YYYY-MM-DD) — WIB-aware
function getDateRange(dateStr: string): { dateFrom: string; dateTo: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const end   = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
}

type ViewMode = "pos" | "history";

const ordersTranslations = {
  id: {
    pageTitle: "Manajer Pesanan POS",
    pageSubtitle: "Manajemen antrean pesanan masuk, proses masak, dan kasir secara real-time.",
    refreshBtn: "Segarkan",
    liveActive: "Live — Hari Ini",
    modePOS: "Live POS",
    modeHistory: "Riwayat",
    historyDate: "Tanggal",
    noRestoTitle: "Belum Ada Restoran",
    noRestoDesc: "Anda harus membuat restoran terlebih dahulu di menu Outlets sebelum dapat menggunakan POS Order Manager.",
    createRestoBtn: "Buat Restoran Baru",
    selectOutlet: "Pilih Outlet",
    filterAll: "Semua",
    filterNew: "Baru",
    filterProcessing: "Diproses",
    filterCompleted: "Selesai",
    filterCancelled: "Batal",
    lockedTitle: "Fitur Live POS Orders Terkunci",
    lockedDesc: "Terima pesanan pelanggan secara langsung di dashboard Anda, dapatkan notifikasi suara bel real-time, dan pantau status memasak dari dapur. Fitur POS ini hanya tersedia untuk paket Basic dan Pro.",
    upgradeBtn: "Tingkatkan Sekarang & Coba Gratis",
    loadingOrders: "Memuat pesanan...",
    noOrdersTitle: "Tidak Ada Pesanan Aktif",
    noOrdersDesc: "Saat ini belum ada pesanan dengan status \"{status}\" untuk hari ini.",
    noOrdersHistoryDesc: "Tidak ada pesanan ditemukan pada tanggal yang dipilih.",
    tableLabel: "Meja",
    generalLabel: "Umum",
    statusNew: "Baru",
    statusProcessing: "Diproses",
    statusCompleted: "Selesai",
    statusCancelled: "Batal",
    totalLabel: "Total",
    btnCancel: "Batal",
    btnCook: "Proses Masak",
    btnComplete: "Selesai (Kasir)",
    toastUpdatingStatus: "Mengubah status pesanan...",
    toastStatusChanged: "Status pesanan berhasil diubah ke {status}!",
    toastUpdateFailed: "Gagal memperbarui status",
    toastNewOrder: "🔔 Pesanan Baru masuk! Meja {table} ({name})",
    statusTextProcessed: "diproses",
    statusTextCompleted: "selesai",
    statusTextCancelled: "dibatalkan",
    typeDineIn: "Makan di Tempat",
    typeTakeaway: "Bungkus",
  },
  en: {
    pageTitle: "POS Order Manager",
    pageSubtitle: "Real-time management of incoming orders, kitchen queue, and cashier.",
    refreshBtn: "Refresh",
    liveActive: "Live — Today",
    modePOS: "Live POS",
    modeHistory: "History",
    historyDate: "Date",
    noRestoTitle: "No Restaurants Yet",
    noRestoDesc: "You must create a restaurant first in the Outlets menu before you can use the POS Order Manager.",
    createRestoBtn: "Create New Restaurant",
    selectOutlet: "Select Outlet",
    filterAll: "All",
    filterNew: "New",
    filterProcessing: "Processing",
    filterCompleted: "Completed",
    filterCancelled: "Cancelled",
    lockedTitle: "Live POS Orders Locked",
    lockedDesc: "Receive customer orders directly in your dashboard, get real-time chime notifications, and monitor kitchen cooking status. This POS feature is only available for Basic and Pro packages.",
    upgradeBtn: "Upgrade Now & Try Free",
    loadingOrders: "Loading orders...",
    noOrdersTitle: "No Active Orders",
    noOrdersDesc: "There are currently no orders with status \"{status}\" for today.",
    noOrdersHistoryDesc: "No orders found for the selected date.",
    tableLabel: "Table",
    generalLabel: "General",
    statusNew: "New",
    statusProcessing: "Processing",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    totalLabel: "Total",
    btnCancel: "Cancel",
    btnCook: "Cook / Process",
    btnComplete: "Complete (Cashier)",
    toastUpdatingStatus: "Updating order status...",
    toastStatusChanged: "Order status successfully changed to {status}!",
    toastUpdateFailed: "Failed to update status",
    toastNewOrder: "🔔 New Order received! Table {table} ({name})",
    statusTextProcessed: "processing",
    statusTextCompleted: "completed",
    statusTextCancelled: "cancelled",
    typeDineIn: "Dine-in",
    typeTakeaway: "Takeaway",
  }
};

export function OrdersContent({ initialRestaurants }: OrdersContentProps) {
  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    restaurants[0]?.id || ""
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const previousOrdersRef = useRef<Order[]>([]);

  useEffect(() => {
    const handleGesture = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === "suspended") {
            ctx.resume().then(() => {
              setAudioUnlocked(true);
            });
          } else {
            setAudioUnlocked(true);
          }
        }
      } catch (e) {}
    };

    window.addEventListener("click", handleGesture);
    return () => window.removeEventListener("click", handleGesture);
  }, []);

  // ── View Mode ──────────────────────────────────────────────────────────
  // "pos"     → hanya pesanan HARI INI yang aktif (pending/processing)
  // "history" → semua pesanan pada tanggal yang dipilih (semua status)
  const [viewMode, setViewMode] = useState<ViewMode>("pos");
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const [historyDate, setHistoryDate] = useState<string>(todayStr);

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  const isPremium = selectedRestaurant?.plan === "basic" || selectedRestaurant?.plan === "pro";

  useEffect(() => {
    const loadLang = () => {
      const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
      if (savedLang && (savedLang === "id" || savedLang === "en")) {
        setLang(savedLang);
      }
    };
    loadLang();
    window.addEventListener("menuqr-lang-change", loadLang);
    return () => window.removeEventListener("menuqr-lang-change", loadLang);
  }, []);

  const t = ordersTranslations[lang];

  // Play synthetic chime sound
  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.6);
      setTimeout(() => {
        try {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.6);
        } catch (e) {}
      }, 100);
    } catch (e) {
      console.warn("Chime blocked by browser", e);
    }
  };

  const handleToggleAudio = () => {
    playNotificationSound();
    setAudioUnlocked(true);
    toast.success(lang === "id" ? "Suara notifikasi aktif!" : "Notification sound enabled!");
  };

  // ── Fetch orders ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!selectedRestaurantId || !isPremium) return;
    if (!silent) setLoading(true);
    try {
      let options: { dateFrom?: string; dateTo?: string; activeOnly?: boolean };

      if (viewMode === "pos") {
        // POS: pesanan hari ini saja, hanya yang masih aktif (pending/processing)
        options = { ...getTodayRange(), activeOnly: true };
      } else {
        // History: semua status pada tanggal yang dipilih
        options = { ...getDateRange(historyDate) };
      }

      const res = await getOrdersAction(selectedRestaurantId, options);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      const newOrders = (res.data || []).map((o) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      }));

      // Hanya notifikasi pesanan baru di mode POS
      if (viewMode === "pos" && previousOrdersRef.current.length > 0) {
        const newPendingOrders = newOrders.filter(
          (newOrder) =>
            newOrder.status === "pending" &&
            !previousOrdersRef.current.some((prevOrder) => prevOrder.id === newOrder.id)
        );
        if (newPendingOrders.length > 0) {
          playNotificationSound();
          newPendingOrders.forEach((order) => {
            toast.success(
              t.toastNewOrder
                .replace("{table}", order.tableNumber || t.generalLabel)
                .replace("{name}", order.customerName || ""),
              { duration: 8000 }
            );
          });
        }
      }

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;
    } catch (err: any) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedRestaurantId, isPremium, viewMode, historyDate, t]);

  // ── Polling: hanya di mode POS (mode history tidak perlu live) ──────────
  useEffect(() => {
    previousOrdersRef.current = [];
    fetchOrders(false);

    if (viewMode !== "pos") return; // tidak perlu poll di mode history

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedRestaurantId, isPremium, viewMode, historyDate, fetchOrders]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: "pending" | "processing" | "completed" | "cancelled") => {
    const toastId = toast.loading(t.toastUpdatingStatus);
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.error) {
        toast.error(res.error, { id: toastId });
        return;
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updatedAt: new Date() }
            : o
        )
      );
      
      let statusLabel = "";
      if (newStatus === "processing") statusLabel = t.statusTextProcessed;
      if (newStatus === "completed") statusLabel = t.statusTextCompleted;
      if (newStatus === "cancelled") statusLabel = t.statusTextCancelled;
      
      toast.success(t.toastStatusChanged.replace("{status}", statusLabel), { id: toastId });
    } catch (err: any) {
      toast.error(err.message || t.toastUpdateFailed, { id: toastId });
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-500" />
            {t.pageTitle}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {t.pageSubtitle}
          </p>
        </div>

        {isPremium && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
              <button
                onClick={() => { setViewMode("pos"); setStatusFilter("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  viewMode === "pos"
                    ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <Zap className="h-3 w-3" />
                {t.modePOS}
              </button>
              <button
                onClick={() => { setViewMode("history"); setStatusFilter("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  viewMode === "history"
                    ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <History className="h-3 w-3" />
                {t.modeHistory}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders(false)}
              disabled={loading}
              className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {t.refreshBtn}
            </Button>

            {/* Audio Toggle Button */}
            {viewMode === "pos" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAudio}
                className={`rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 transition-all duration-200 ${
                  audioUnlocked
                    ? "text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30"
                    : "text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900"
                }`}
              >
                {audioUnlocked ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">{lang === "id" ? "Suara Aktif" : "Sound Active"}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-neutral-400 animate-pulse" />
                    <span className="text-orange-500">{lang === "id" ? "Aktifkan Suara" : "Enable Sound"}</span>
                  </>
                )}
              </Button>
            )}

            {viewMode === "pos" && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-600 dark:text-emerald-500 text-[11px] font-black uppercase tracking-wider animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.liveActive}
              </div>
            )}
          </div>
        )}
      </div>

      {restaurants.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-8 shadow-sm text-center max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{t.noRestoTitle}</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {t.noRestoDesc}
          </p>
          <div className="mt-5">
            <Link
              href="/dashboard/restaurants"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-5 py-2.5 inline-block transition-colors"
            >
              {t.createRestoBtn}
            </Link>
          </div>
        </div>
      ) : (
        /* POS Layout */
        <div className="space-y-6">
          {/* Restaurant Selector & Status Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider shrink-0">
                {t.selectOutlet}
              </span>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[160px]"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Date picker — only in history mode */}
              {isPremium && viewMode === "history" && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {t.historyDate}
                  </span>
                  <input
                    type="date"
                    value={historyDate}
                    max={todayStr}
                    onChange={(e) => setHistoryDate(e.target.value)}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {isPremium && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {[
                  { value: "all", label: t.filterAll },
                  { value: "pending", label: t.filterNew },
                  { value: "processing", label: t.filterProcessing },
                  { value: "completed", label: t.filterCompleted },
                  { value: "cancelled", label: t.filterCancelled },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                      statusFilter === f.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isPremium ? (
            /* Locked Paywall Overlay */
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-4 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <Crown className="h-40 w-40 text-orange-500" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mx-auto">
                <Crown className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  {t.lockedTitle}
                </h3>
                <p className="text-xs text-neutral-505 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  {t.lockedDesc}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/billing"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-6 py-3 inline-block shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
                >
                  {t.upgradeBtn}
                </Link>
              </div>
            </div>
          ) : (
            /* Live Orders Dashboard List */
            <div className="space-y-4">
              {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                  <p className="text-xs text-neutral-400">{t.loadingOrders}</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl py-20 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-400 mx-auto mb-3">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{t.noOrdersTitle}</h3>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                    {viewMode === "pos"
                      ? t.noOrdersDesc.replace("{status}", statusFilter === "all" ? "aktif" : statusFilter.toUpperCase())
                      : t.noOrdersHistoryDesc}
                  </p>
                </div>
              ) : (
                /* Orders Grid */
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredOrders.map((order) => {
                    // DB sekarang menyimpan UTC yang benar (timestamptz).
                    // Tampilkan dengan timezone WIB = UTC+7.
                    const orderDate = new Date(order.createdAt).toLocaleString(
                      lang === "id" ? "id-ID" : "en-US",
                      {
                        timeZone: "Asia/Jakarta",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );

                    return (
                      <div
                        key={order.id}
                        className={`bg-white dark:bg-neutral-900 border rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:shadow-md flex flex-col justify-between ${
                          order.status === "pending"
                            ? "border-amber-300 dark:border-amber-900/50 ring-2 ring-amber-500/10"
                            : order.status === "processing"
                            ? "border-blue-300 dark:border-blue-900/50"
                            : "border-neutral-100 dark:border-neutral-800"
                        }`}
                      >
                        {/* Order Header Card */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {order.orderType === "takeaway" ? (
                                  <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {t.typeTakeaway}
                                  </span>
                                ) : (
                                  <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {t.typeDineIn}
                                  </span>
                                )}

                                {order.tableNumber && (
                                  <span className="inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {t.tableLabel} {order.tableNumber}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-neutral-400 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>{orderDate}</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {order.status === "pending" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                  {t.statusNew}
                                </span>
                              )}
                              {order.status === "processing" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-wider">
                                  {t.statusProcessing}
                                </span>
                              )}
                              {order.status === "completed" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-wider">
                                  {t.statusCompleted}
                                </span>
                              )}
                              {order.status === "cancelled" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-wider">
                                  {t.statusCancelled}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Customer Name */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            <User className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{order.customerName}</span>
                          </div>

                          {/* Items ordered list */}
                          <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-start text-xs font-medium text-neutral-600 dark:text-neutral-400"
                              >
                                <span className="pr-2">
                                  <strong className="text-neutral-950 dark:text-white mr-1.5">
                                    {item.quantity}x
                                  </strong>
                                  {item.name}
                                </span>
                                <span className="shrink-0 font-semibold">
                                  {formatPrice(Number(item.price) * item.quantity)}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800 flex justify-between items-center text-xs font-extrabold">
                              <span className="text-neutral-400">{t.totalLabel}</span>
                              <span className="text-orange-500 text-sm font-black">
                                {formatPrice(Number(order.totalPrice))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions */}
                        {order.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              variant="outline"
                              className="flex-1 rounded-xl text-[10px] font-black text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              {t.btnCancel}
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "processing")}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black"
                            >
                              {t.btnCook}
                            </Button>
                          </div>
                        )}
                        {order.status === "processing" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              variant="outline"
                              className="flex-1 rounded-xl text-[10px] font-black text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              {t.btnCancel}
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              {t.btnComplete}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
