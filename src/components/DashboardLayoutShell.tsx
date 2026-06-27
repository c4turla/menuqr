"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { Menu, Store, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  planTier: "free" | "basic" | "pro" | "super_admin";
}

export function DashboardLayoutShell({ children, planTier }: DashboardLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  // Get dynamic breadcrumb or section name
  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard/orders")) return "Pesanan POS / Orders";
    if (pathname.startsWith("/dashboard/restaurants")) return "Outlet / Restaurants";
    if (pathname.startsWith("/dashboard/categories")) return "Kategori / Categories";
    if (pathname.startsWith("/dashboard/menu")) return "Menu Makanan / Menus";
    if (pathname.startsWith("/dashboard/billing")) return "Tagihan / Billing";
    if (pathname.startsWith("/dashboard/analytics")) return "Analitik / Analytics";
    if (pathname.startsWith("/dashboard/domain")) return "Domain";
    if (pathname.startsWith("/dashboard/staff")) return "Staff";
    if (pathname.startsWith("/dashboard/settings")) return "Pengaturan / Settings";
    if (pathname.startsWith("/dashboard/help")) return "Bantuan / Help";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center justify-between px-4 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-black tracking-tight text-neutral-900 dark:text-white truncate max-w-[120px]">
              MenuQR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 truncate max-w-[100px] border-l border-neutral-100 dark:border-neutral-800 pl-2">
            {getPageTitle()}
          </span>
        </div>
      </header>

      {/* Sidebar (Responsive Overlay on Mobile, Fixed on Desktop) */}
      <DashboardSidebar
        planTier={planTier}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="min-h-screen pt-16 md:pt-0 md:ml-[220px] transition-all duration-300">
        <div className="px-4 py-5 md:px-8 md:py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
