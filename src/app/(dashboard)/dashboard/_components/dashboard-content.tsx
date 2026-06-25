"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateRestaurantPlan } from "@/server/actions/restaurant-actions";
import {
  ArrowUpRight,
  Store,
  Bell,
  Settings2,
  UtensilsCrossed,
  ShoppingCart,
  Clock,
  ChevronDown,
  QrCode,
  Plus,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ============================================================
   Types
============================================================ */
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  plan: "free" | "basic" | "pro";
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

interface DashboardContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
  restaurants: Restaurant[];
  users?: UserRecord[];
  stats: {
    totalRestaurants: number;
    totalCategories: number;
    totalMenuItems: number;
    totalUsers?: number;
  };
}

/* ============================================================
   Mock weekly revenue data
============================================================ */
const WEEKLY_REVENUE = [
  { day: "Sun", revenue: 320 },
  { day: "Mon", revenue: 480 },
  { day: "Tue", revenue: 390 },
  { day: "Wed", revenue: 520 },
  { day: "Thu", revenue: 843, highlighted: true },
  { day: "Fri", revenue: 410 },
  { day: "Sat", revenue: 360 },
];

/* ============================================================
   Translations
============================================================ */
const contentTranslations = {
  id: {
    systemOverview: "Ikhtisar Sistem",
    dashboard: "Dashboard",
    platformStats: "Statistik platform",
    welcomeBack: "Selamat datang kembali",
    totalRestaurants: "Total Restoran",
    systemWideActive: "Aktif di sistem",
    registeredUsers: "Pengguna Terdaftar",
    platformAccounts: "Akun platform",
    totalCategories: "Total Kategori",
    acrossAllResto: "Di seluruh restoran",
    totalMenuItems: "Total Menu Makanan",
    availableDishes: "Menu hidangan aktif",
    totalOutlets: "Total Outlet",
    createFirstOutlet: "Buat outlet pertama Anda",
    activeOutlets: "outlet aktif",
    menuCategories: "Kategori Menu",
    menuGroupings: "Pengelompokan menu di seluruh outlet",
    activeDishes: "Makanan & minuman aktif",
    totalRevenue: "Total Pendapatan",
    salesOverview: "Ikhtisar Penjualan",
    thisWeek: "Minggu Ini",
    businessData: "Data Bisnis",
    numCustomers: "Jumlah Pelanggan",
    totalOrders: "Total Pesanan",
    avgOrderValue: "Rata-rata Nilai Pesanan",
    recentActivity: "Aktivitas Terbaru",
    quickActions: "Aksi Cepat",
    createOutletBtn: "Buat Outlet",
    noActivity: "Belum ada aktivitas",
    getStartedQuickly: "Mulai dengan cepat:",
    createOutletToStart: "Buat restoran baru untuk memulai",
    allRestaurants: "Semua Restoran",
    registeredInSystem: "Terdaftar dalam sistem",
    totalBadge: "Total",
    userDirectory: "Direktori Pengguna",
    activeAccounts: "Akun pengguna aktif",
    planBillingLoading: "Memperbarui plan billing...",
    planBillingSuccess: "Plan billing berhasil diperbarui!",
    planBillingError: "Gagal memperbarui plan billing",
    items: "Menu Makanan",
    qrActive: "QR Aktif",
    noRestaurantsYet: "Belum ada restoran",
    createRestoDesc: "Tambah outlet pertama Anda",
    addMenuItemsDesc: "Susun menu makanan digital",
    genQrDesc: "Dapatkan QR meja pelanggan",
    restoAction: "Buat Restoran",
    menuAction: "Tambah Menu",
    qrAction: "Generate QR Code",
    noDesc: "Tidak ada deskripsi",
  },
  en: {
    systemOverview: "System Overview",
    dashboard: "Dashboard",
    platformStats: "Platform statistics",
    welcomeBack: "Welcome back",
    totalRestaurants: "Total Restaurants",
    systemWideActive: "System-wide active",
    registeredUsers: "Registered Users",
    platformAccounts: "Platform accounts",
    totalCategories: "Total Categories",
    acrossAllResto: "Across all restaurants",
    totalMenuItems: "Total Menu Items",
    availableDishes: "Available dishes",
    totalOutlets: "Total Outlets",
    createFirstOutlet: "Create your first outlet",
    activeOutlets: "active outlet",
    menuCategories: "Menu Categories",
    menuGroupings: "Menu groupings across all outlets",
    activeDishes: "Active dishes & beverages",
    totalRevenue: "Total Revenue",
    salesOverview: "Sales Overview",
    thisWeek: "This Week",
    businessData: "Business Data",
    numCustomers: "Number of Customers",
    totalOrders: "Total Orders",
    avgOrderValue: "Average Order Value",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    createOutletBtn: "Create Outlet",
    noActivity: "No activity yet",
    getStartedQuickly: "Get started quickly:",
    createOutletToStart: "Create a restaurant to get started",
    allRestaurants: "All Restaurants",
    registeredInSystem: "Registered in the system",
    totalBadge: "Total",
    userDirectory: "User Directory",
    activeAccounts: "Active platform accounts",
    planBillingLoading: "Updating billing plan...",
    planBillingSuccess: "Billing plan updated successfully!",
    planBillingError: "Failed to update billing plan",
    items: "Items",
    qrActive: "QR Active",
    noRestaurantsYet: "No restaurants yet",
    createRestoDesc: "Add your first outlet",
    addMenuItemsDesc: "Build your digital menu",
    genQrDesc: "Get your QR for tables",
    restoAction: "Create Restaurant",
    menuAction: "Add Menu Items",
    qrAction: "Generate QR Code",
    noDesc: "No description",
  }
};

/* ============================================================
   Stat Card
============================================================ */
function StatCard({
  title,
  value,
  subtitle,
  subtitleColor = "text-emerald-500",
  icon,
  href,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  subtitleColor?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="relative rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {icon}
          {title}
        </div>
        {href && (
          <Link href={href}>
            <button className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          </Link>
        )}
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className={`mt-1 text-xs font-semibold ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}

/* ============================================================
   Business Data Row
============================================================ */
function BusinessDataRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-neutral-400">{icon}</span>}
          <span className="text-xl font-extrabold text-neutral-900 dark:text-white">{value}</span>
        </div>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
        <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
      </button>
    </div>
  );
}

/* ============================================================
   Main Component
============================================================ */
export function DashboardContent({ user, restaurants, users = [], stats }: DashboardContentProps) {
  const isSuperAdmin = user.role === "super_admin";
  const [localRestaurants, setLocalRestaurants] = useState<Restaurant[]>(restaurants);
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    setLocalRestaurants(restaurants);
  }, [restaurants]);

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

  const t = contentTranslations[lang];

  async function handlePlanChange(restaurantId: string, newPlan: "free" | "basic" | "pro") {
    const previous = [...localRestaurants];
    setLocalRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, plan: newPlan } : r))
    );

    toast.promise(
      updateRestaurantPlan(restaurantId, newPlan).then((res) => {
        if (res.error) throw new Error(res.error);
        return res.data;
      }),
      {
        loading: t.planBillingLoading,
        success: t.planBillingSuccess,
        error: (err) => {
          setLocalRestaurants(previous);
          return err.message || t.planBillingError;
        },
      }
    );
  }

  const userName = user.name || user.email;
  const today = new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* Highlighted bar index */
  const maxIdx = WEEKLY_REVENUE.reduce(
    (maxI, cur, i, arr) => (cur.revenue > arr[maxI].revenue ? i : maxI),
    0
  );

  /* Custom Tooltip for BarChart */
  function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold">{label}</p>
        <p className="text-orange-300">
          {lang === "id"
            ? `Rp ${(payload[0].value * 15).toLocaleString("id-ID")}rb`
            : `$${payload[0].value.toLocaleString("en-US")}`}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ───── Top Header ───── */}
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {isSuperAdmin ? t.systemOverview : t.dashboard}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {isSuperAdmin ? `${t.platformStats} — ${today}` : `${t.welcomeBack}, ${userName}!`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <Bell className="h-4 w-4 text-neutral-500" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
              8
            </span>
          </button>
          <Link href="/dashboard/settings">
            <button className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
              <Settings2 className="h-4 w-4 text-neutral-500" />
            </button>
          </Link>
        </div>
      </header>

      <div className="py-5 space-y-6">
        {/* ───── SUPER ADMIN VIEW ───── */}
        {isSuperAdmin ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title={t.totalRestaurants}
                value={stats.totalRestaurants}
                subtitle={t.systemWideActive}
                icon={<Store className="h-4 w-4 text-orange-500" />}
                href="/dashboard/restaurants"
              />
              <StatCard
                title={t.registeredUsers}
                value={stats.totalUsers ?? 0}
                subtitle={t.platformAccounts}
                subtitleColor="text-blue-500"
                icon={<Users className="h-4 w-4 text-blue-500" />}
              />
              <StatCard
                title={t.totalCategories}
                value={stats.totalCategories}
                subtitle={t.acrossAllResto}
                subtitleColor="text-amber-500"
                icon={<UtensilsCrossed className="h-4 w-4 text-amber-500" />}
              />
              <StatCard
                title={t.totalMenuItems}
                value={stats.totalMenuItems}
                subtitle={t.availableDishes}
                subtitleColor="text-emerald-500"
                icon={<ShoppingCart className="h-4 w-4 text-emerald-500" />}
              />
            </div>

            {/* Restaurants grid + User list */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Restaurants */}
              <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.allRestaurants}</p>
                    <p className="text-[11px] text-neutral-400">{t.registeredInSystem}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{restaurants.length} {t.totalBadge}</Badge>
                </div>
                <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {localRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-neutral-400">
                      <Building2 className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">{t.noRestaurantsYet}</p>
                    </div>
                  ) : (
                    localRestaurants.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-bold text-sm">
                            {r.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">{r.name}</p>
                            <p className="text-[11px] text-neutral-400">/{r.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={r.plan}
                            onChange={(e) => handlePlanChange(r.id, e.target.value as "free" | "basic" | "pro")}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border-none outline-none ring-1 ring-neutral-200 dark:ring-neutral-850 cursor-pointer bg-transparent py-1
                              ${r.plan === "pro" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 ring-purple-100 dark:ring-purple-950" :
                                r.plan === "basic" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 ring-blue-100 dark:ring-blue-950" :
                                "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ring-neutral-200 dark:ring-neutral-800"}`}
                          >
                            <option value="free" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">Free</option>
                            <option value="basic" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">Basic</option>
                            <option value="pro" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">Pro</option>
                          </select>
                          <Link href={`/r/${r.slug}`} target="_blank">
                            <ArrowUpRight className="h-4 w-4 text-neutral-300 hover:text-orange-500 transition-colors" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Directory */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.userDirectory}</p>
                    <p className="text-[11px] text-neutral-400">{t.activeAccounts}</p>
                  </div>
                </div>
                <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-850/50 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{u.email}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize shrink-0
                        ${u.role === "super_admin" ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "bg-blue-50 text-blue-500 dark:bg-blue-900/20"}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ───── REGULAR ADMIN VIEW ───── */
          <>
            {/* Top stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={t.totalOutlets}
                value={stats.totalRestaurants}
                subtitle={stats.totalRestaurants === 0 ? t.createFirstOutlet : `${stats.totalRestaurants} ${t.activeOutlets}`}
                subtitleColor={stats.totalRestaurants === 0 ? "text-neutral-400" : "text-emerald-500"}
                icon={<Store className="h-4 w-4 text-orange-500" />}
                href="/dashboard/restaurants"
              />
              <StatCard
                title={t.menuCategories}
                value={stats.totalCategories}
                subtitle={t.menuGroupings}
                subtitleColor="text-blue-500"
                icon={<UtensilsCrossed className="h-4 w-4 text-blue-500" />}
                href="/dashboard/categories"
              />
              <StatCard
                title={t.totalMenuItems}
                value={stats.totalMenuItems}
                subtitle={t.activeDishes}
                subtitleColor="text-emerald-500"
                icon={<ShoppingCart className="h-4 w-4 text-emerald-500" />}
                href="/dashboard/menu"
              />
            </div>

            {/* Middle row: Revenue chart + Business Data */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Revenue Chart */}
              <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.totalRevenue}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{t.salesOverview}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                      <span>{t.thisWeek}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                  </div>
                </div>

                <div className="h-52 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={WEEKLY_REVENUE}
                      margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        vertical={false}
                        className="dark:stroke-neutral-800"
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                        dy={6}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                        tickFormatter={(v) => (lang === "id" ? `Rp ${v * 15}k` : `$${v}`)}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                        {WEEKLY_REVENUE.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={index === maxIdx ? "#f97316" : "#f3f4f6"}
                            className={index === maxIdx ? "" : "dark:fill-neutral-800"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Business Data panel */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.businessData}</p>
                  <button className="flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                    <span>{t.thisWeek}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  <BusinessDataRow
                    label={t.numCustomers}
                    value="197"
                    icon={<Users className="h-4 w-4" />}
                  />
                  <BusinessDataRow
                    label={t.totalOrders}
                    value="270"
                    icon={<ShoppingCart className="h-4 w-4" />}
                  />
                  <BusinessDataRow
                    label={t.avgOrderValue}
                    value={lang === "id" ? "Rp 109rb" : "$12.50"}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Bottom row: Recent Activity + Top Dishes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Recent Activity */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.recentActivity}</p>
                  <button className="p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                </div>
                <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {restaurants.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-neutral-400">
                      <ShoppingCart className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">{t.noActivity}</p>
                      <p className="text-xs mt-1">{t.createOutletToStart}</p>
                      <Link href="/dashboard/restaurants" className="mt-4">
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {t.createOutletBtn}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    restaurants.slice(0, 5).map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        {/* Avatar thumbnail */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-sm shadow-sm">
                          {restaurant.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {restaurant.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                            <Clock className="h-3 w-3" />
                            <span>/{restaurant.slug}</span>
                            <span className="text-neutral-300 dark:text-neutral-700">·</span>
                            <QrCode className="h-3 w-3" />
                            <span>{t.qrActive}</span>
                          </div>
                        </div>
                        <Badge
                          className={`text-[10px] font-bold border-0 shrink-0 capitalize px-2.5 py-0.5 rounded-full
                            ${restaurant.plan === "pro" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
                              restaurant.plan === "basic" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                              "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"}`}
                        >
                          {restaurant.plan}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions / Top Dishes */}
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.quickActions}</p>
                  <button className="flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                    <span>{t.thisWeek}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {restaurants.length === 0 ? (
                  <div className="flex flex-col gap-3 p-5">
                    <p className="text-xs text-neutral-400 font-medium">{t.getStartedQuickly}</p>
                    {[
                      { icon: <Store className="h-4 w-4 text-orange-500" />, label: t.restoAction, desc: t.createRestoDesc, href: "/dashboard/restaurants" },
                      { icon: <UtensilsCrossed className="h-4 w-4 text-blue-500" />, label: t.menuAction, desc: t.addMenuItemsDesc, href: "/dashboard/menu" },
                      { icon: <QrCode className="h-4 w-4 text-emerald-500" />, label: t.qrAction, desc: t.genQrDesc, href: "/dashboard/restaurants" },
                    ].map((action) => (
                      <Link key={action.label} href={action.href}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-neutral-100 dark:border-neutral-800 cursor-pointer">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-800">
                            {action.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-white">{action.label}</p>
                            <p className="text-[11px] text-neutral-400">{action.desc}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-neutral-300 ml-auto" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                    {restaurants.map((restaurant, index) => (
                      <Link key={restaurant.id} href={`/dashboard/restaurants/${restaurant.id}`}>
                        <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
                          {/* Colored rank badge */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
                            <span className="text-orange-500 font-extrabold text-sm">#{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{restaurant.name}</p>
                            <p className="text-[11px] text-neutral-400 truncate">{restaurant.description || t.noDesc}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-neutral-900 dark:text-white">{stats.totalMenuItems}</p>
                            <p className="text-[10px] font-bold text-orange-500">{t.items}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
