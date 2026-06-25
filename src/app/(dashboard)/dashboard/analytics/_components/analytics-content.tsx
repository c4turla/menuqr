"use client";

import { useState, useEffect } from "react";
import { BarChart3, Eye, ScanLine, TrendingUp, Users, ShoppingCart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const analyticsTranslations = {
  id: {
    title: "Dashboard Analitik",
    subtitle: "Analisis performa menu dan pemindaian QR secara real-time.",
    totalViews: "Total Dilihat",
    totalViewsDesc: "Menu dilihat bulan ini",
    totalScans: "Total Dipindai",
    totalScansDesc: "QR dipindai bulan ini",
    popularItems: "Item Populer",
    popularItemsDesc: "Berdasarkan jumlah klik",
    conversionRate: "Konversi",
    conversionRateDesc: "Pemindaian ke pesanan",
    viewsTitle: "Tren Dilihat Menu",
    scansTitle: "Distribusi Pemindaian",
    viewsPeriod: "30 hari terakhir",
    dayShort: { mon: "Sn", tue: "Sl", wed: "Rb", thu: "Km", fri: "Jm", sat: "Sb", sun: "Mg" },
    directMenu: "Menu Langsung",
    tableQR: "QR Meja",
  },
  en: {
    title: "Analytics Dashboard",
    subtitle: "Real-time menu performance and QR scan analytics.",
    totalViews: "Total Views",
    totalViewsDesc: "Menu views this month",
    totalScans: "Total Scans",
    totalScansDesc: "QR scans this month",
    popularItems: "Popular Items",
    popularItemsDesc: "Based on click count",
    conversionRate: "Conversion",
    conversionRateDesc: "Scan to order rate",
    viewsTitle: "Menu Views Trend",
    scansTitle: "Scan Distribution",
    viewsPeriod: "Last 30 days",
    dayShort: { mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su" },
    directMenu: "Direct Menu",
    tableQR: "Table QR",
  },
};

const VIEWS_DATA = [
  { day: "mon", views: 120 },
  { day: "tue", views: 200 },
  { day: "wed", views: 150 },
  { day: "thu", views: 300 },
  { day: "fri", views: 450 },
  { day: "sat", views: 520 },
  { day: "sun", views: 380 },
];

const SCAN_DISTRIBUTION = [
  { name: "directMenu", value: 65, color: "#f97316" },
  { name: "tableQR", value: 35, color: "#3b82f6" },
];

const POPULAR_ITEMS = [
  { name: "Nasi Goreng", clicks: 245 },
  { name: "Sate Ayam", clicks: 198 },
  { name: "Mie Goreng", clicks: 176 },
  { name: "Ayam Bakar", clicks: 154 },
  { name: "Es Teh", clicks: 132 },
];

export function AnalyticsContent() {
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

  const t = analyticsTranslations[lang];

  const stats = [
    { label: t.totalViews, value: "2,120", subtitle: t.totalViewsDesc, icon: Eye },
    { label: t.totalScans, value: "847", subtitle: t.totalScansDesc, icon: ScanLine },
    { label: t.popularItems, value: "12", subtitle: t.popularItemsDesc, icon: ShoppingCart },
    { label: t.conversionRate, value: "32%", subtitle: t.conversionRateDesc, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <Icon className="h-4.5 w-4.5 text-orange-500" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{stat.value}</p>
              <p className="text-[11px] font-bold text-neutral-400 mt-0.5">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.viewsTitle}</p>
              <p className="text-[11px] text-neutral-400">{t.viewsPeriod}</p>
            </div>
            <BarChart3 className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VIEWS_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="dark:stroke-neutral-800" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                  tickFormatter={(v: string) => t.dayShort[v as keyof typeof t.dayShort] ?? v}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="views" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.scansTitle}</p>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SCAN_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {SCAN_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Legend
                  formatter={(value) => {
                    const label = t[value as keyof typeof t];
                    return <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{typeof label === "string" ? label : value}</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <p className="font-extrabold text-sm text-neutral-900 dark:text-white">
            {lang === "id" ? "Menu Paling Populer" : "Most Popular Items"}
          </p>
          <p className="text-[11px] text-neutral-400">{t.popularItemsDesc}</p>
        </div>
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {POPULAR_ITEMS.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <span className="text-orange-500 font-extrabold text-xs">#{index + 1}</span>
              </div>
              <span className="flex-1 text-sm font-bold text-neutral-900 dark:text-white">{item.name}</span>
              <span className="text-sm font-extrabold text-neutral-400">{item.clicks}</span>
              <span className="text-[11px] font-medium text-neutral-400">
                {lang === "id" ? "klik" : "clicks"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
