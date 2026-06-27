"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  Store,
  Grid3X3,
  UtensilsCrossed,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  HelpCircle,
  ChefHat,
  ShoppingBag,
  Moon,
  Sun,
  Monitor,
  Users,
  Globe,
  BarChart3,
  X,
} from "lucide-react";

const sidebarTranslations = {
  id: {
    dashboard: "Dashboard",
    users: "Pengguna",
    restaurants: "Restoran",
    outlets: "Outlet",
    posOrders: "Pesanan POS",
    categories: "Kategori",
    menus: "Menu Makanan",
    billing: "Billing",
    analytics: "Analitik",
    domain: "Domain",
    settings: "Pengaturan",
    help: "Bantuan",
    staff: "Kelola Staff",
    storeHeader: "Toko",
    menuHeader: "Menu Utama",
    proHeader: "Pro",
    othersHeader: "Lainnya",
    lightMode: "Terang",
    darkMode: "Gelap",
    systemMode: "Sistem",
    signOut: "Keluar",
    myRestaurant: "Restoran Saya",
  },
  en: {
    dashboard: "Dashboard",
    users: "Users",
    restaurants: "Restaurants",
    outlets: "Outlets",
    posOrders: "POS Orders",
    categories: "Categories",
    menus: "Menus",
    billing: "Billing",
    analytics: "Analytics",
    domain: "Domain",
    settings: "Settings",
    help: "Help",
    staff: "Manage Staff",
    storeHeader: "Store",
    menuHeader: "Main Menu",
    proHeader: "Pro",
    othersHeader: "Others",
    lightMode: "Light",
    darkMode: "Dark",
    systemMode: "System",
    signOut: "Sign Out",
    myRestaurant: "My Restaurant",
  }
};

export function DashboardSidebar({
  planTier,
  isOpen = false,
  onClose,
}: {
  planTier: "free" | "basic" | "pro" | "super_admin";
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const isPro = planTier === "pro";
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [storeOpen, setStoreOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }
  }, []);

  const handleLangChange = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("menuqr-lang", newLang);
    window.dispatchEvent(new Event("menuqr-lang-change"));
  };

  const t = sidebarTranslations[lang];

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const isSuperAdmin = (session?.user as { role?: string })?.role === "super_admin";

  const menuNavItems = isSuperAdmin
    ? [
        { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
        { href: "/dashboard/users", label: t.users, icon: Users },
        { href: "/dashboard/restaurants", label: t.restaurants, icon: Store },
        { href: "/dashboard/settings", label: t.settings, icon: Settings },
      ]
    : [
        { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
        { href: "/dashboard/orders", label: t.posOrders, icon: ChefHat },
        { href: "/dashboard/restaurants", label: t.outlets, icon: ShoppingBag },
        { href: "/dashboard/categories", label: t.categories, icon: Grid3X3 },
        { href: "/dashboard/menu", label: t.menus, icon: UtensilsCrossed },
        { href: "/dashboard/billing", label: t.billing, icon: CreditCard },
      ];

  const otherNavItems = [
    { href: "/dashboard/help", label: t.help, icon: HelpCircle },
    { href: "/dashboard/settings", label: t.settings, icon: Settings },
  ];

  const restaurantName =
    (session?.user as { name?: string })?.name ?? t.myRestaurant;

  function cycleTheme() {
    if (theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("system");
    }
  }

  function getThemeIcon() {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    if (theme === "light") return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  }

  function getThemeLabel() {
    if (!mounted) return t.systemMode;
    if (theme === "dark") return t.darkMode;
    if (theme === "light") return t.lightMode;
    return t.systemMode;
  }

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[240px] md:w-[220px] flex-col bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-900 transition-transform duration-300 ease-in-out md:translate-x-0 md:z-40",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="relative h-8 w-28 shrink-0">
            <Image src="/lightmode.webp" alt="MenuQR Logo" fill className="object-contain dark:hidden" />
            <Image src="/darkmode.webp" alt="MenuQR Logo" fill className="object-contain hidden dark:block" />
          </div>
          {planTier && planTier !== "super_admin" && (
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm select-none ${
              planTier === "pro"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                : planTier === "basic"
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
            }`}>
              {planTier}
            </span>
          )}
          {planTier === "super_admin" && (
            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider bg-red-500 text-white shadow-sm select-none">
              Admin
            </span>
          )}
        </div>

        {/* Store Selector (only for non-super-admin) */}
        {!isSuperAdmin && (
          <div className="px-3 mb-2">
            <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
              {t.storeHeader}
            </p>
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-100 dark:border-neutral-800"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <Store className="h-3 w-3 text-orange-500" />
                </div>
                <span className="truncate max-w-[100px]">{restaurantName}</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-400 transition-transform duration-200", storeOpen && "rotate-180")} />
            </button>
          </div>
        )}

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-5 py-2">
          {/* Menu group */}
          <div>
            <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
              {t.menuHeader}
            </p>
            <div className="space-y-0.5">
              {menuNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                      isActive
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pro group (only for superadmin or pro plan) */}
          {(isSuperAdmin || isPro) && (
            <div>
              <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                {t.proHeader}
              </p>
              <div className="space-y-0.5">
                {[
                  { href: "/dashboard/analytics", label: t.analytics, icon: BarChart3 },
                  { href: "/dashboard/domain", label: t.domain, icon: Globe },
                  { href: "/dashboard/staff", label: t.staff, icon: Users },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                        isActive
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Others group */}
          <div>
            <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
              {t.othersHeader}
            </p>
            <div className="space-y-0.5">
              {otherNavItems.map((item) => {
                const isActive = pathname === item.href && item.href !== "#";
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                      isActive
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Language Switcher */}
        <div className="px-3 pb-1">
          <button
            onClick={() => {
              handleLangChange(lang === "id" ? "en" : "id");
              if (onClose) onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-150"
          >
            <Globe className="h-4 w-4 text-orange-500 shrink-0" />
            <span>{lang === "id" ? "Bahasa: ID" : "Language: EN"}</span>
          </button>
        </div>

        {/* Theme toggle */}
        <div className="px-3 pb-1">
          <button
            onClick={() => {
              cycleTheme();
              if (onClose) onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-150"
          >
            {getThemeIcon()}
            <span>{getThemeLabel()} Mode</span>
          </button>
        </div>

        {/* User profile footer */}
        <div className="border-t border-neutral-100 dark:border-neutral-900 p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-950 bg-emerald-400" />
            </div>
            {/* Name & role */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {session?.user?.name ?? "Restaurant Owner"}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            </div>
            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                if (onClose) onClose();
              }}
              title={t.signOut}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
