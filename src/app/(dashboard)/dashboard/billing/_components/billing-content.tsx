"use client";

import { useState, useEffect } from "react";
import { Check, CreditCard, Sparkles, Zap, Crown, AlertTriangle, ExternalLink, ArrowDownCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSubscriptionPayment, downgradeToFree, getPaymentHistoryAction, getSubscriptionStatusAction } from "@/server/actions/subscription-actions";
import { SubscriptionStatus } from "./subscription-status";
import Link from "next/link";

interface Restaurant {
  id: string;
  name: string;
  plan: "free" | "basic" | "pro";
  slug: string;
}

interface BillingContentProps {
  initialRestaurants: Restaurant[];
}

interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  plan: string;
  billingPeriod: string;
  status: string;
  paymentMethod: string | null;
  createdAt: Date | string;
  completedAt: Date | string | null;
}

interface SubscriptionRecord {
  status: string | null;
  currentPeriodStart: Date | string | null;
  currentPeriodEnd: Date | string | null;
  provider: string | null;
}

const translations = {
  id: {
    pageTitle: "Billing & Langganan",
    pageSubtitle: "Kelola plan berlangganan restoran Anda. Pembayaran via QRIS.",
    noRestoTitle: "Belum Ada Restoran",
    noRestoDesc: "Anda harus membuat restoran terlebih dahulu sebelum dapat berlangganan.",
    createRestoBtn: "Buat Restoran Baru",
    restoLabel: "Restoran",
    monthly: "Bulanan",
    yearly: "Tahunan",
    save20: "Hemat 20%",
    freeName: "Gratis Selamanya",
    freePrice: "Rp 0",
    freeDesc: "Cocok untuk kedai kecil atau uji coba.",
    freeFeatures: ["1 Outlet / Restoran", "Maksimal 5 Menu", "Maksimal 2 Kategori", "QR Code Standar", "Pemesanan via WhatsApp"],
    basicName: "Basic",
    basicPrice: "Rp 50.000",
    basicPriceYearly: "Rp 40.000",
    basicPeriod: "/bulan",
    basicDesc: "Untuk kafe & restoran yang sedang berkembang.",
    basicFeatures: ["1 Outlet / Restoran", "Menu & Kategori Tanpa Batas", "Pemesanan via WhatsApp / POS", "Manajemen Pesanan Real Time", "Notifikasi Suara Masuk"],
    proName: "Pro",
    proPrice: "Rp 150.000",
    proPriceYearly: "Rp 120.000",
    proPeriod: "/bulan",
    proDesc: "Untuk franchise atau restoran multi-cabang.",
    proFeatures: ["Cabang/Outlet Tanpa Batas", "Menu & Kategori Tanpa Batas", "Pemesanan via WhatsApp / POS", "Manajemen Pesanan Real Time", "Analisa Data Tingkat Lanjut", "Notifikasi Suara Masuk", "Dukungan Prioritas 24/7"],
    freeForever: "Gratis selamanya",
    billedMonthly: "ditagih bulanan",
    billedYearly: "ditagih tahunan",
    activeBadge: "Aktif",
    activePlanNow: "Plan Aktif Sekarang",
    upgradeViaQris: "Bayar via QRIS",
    downgradeToFree: "Downgrade ke Gratis",
    paymentHistoryTitle: "Riwayat Pembayaran",
    paymentHistoryDesc: "Daftar transaksi pembayaran langganan restoran.",
    noPaymentHistory: "Belum ada riwayat pembayaran",
    selectRestoFirst: "Pilih restoran terlebih dahulu",
    processing: "Membuat pembayaran...",
    redirecting: "Mengalihkan ke halaman pembayaran...",
    paymentSuccess: "Pembayaran berhasil! Plan Anda telah diperbarui.",
    paymentCancelled: "Pembayaran dibatalkan.",
    downgradeConfirm: "Yakin ingin downgrade ke paket Gratis? Fitur premium akan dinonaktifkan.",
    downgrading: "Memproses downgrade...",
    downgradeSuccess: "Berhasil downgrade ke paket Gratis!",
    downgradeError: "Gagal melakukan downgrade",
    popularBadge: "Populer",
    statusPending: "Menunggu",
    statusCompleted: "Selesai",
    statusFailed: "Gagal",
    statusExpired: "Kedaluwarsa",
  },
};

export function BillingContent({ initialRestaurants }: BillingContentProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(initialRestaurants[0] || null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);

  const t = translations.id;
  const restaurantId = restaurant?.id || "";
  const currentPlanId = restaurant?.plan || "free";

  // Fetch payment history & subscription on mount
  useEffect(() => {
    if (!restaurantId) return;
    getPaymentHistoryAction(restaurantId).then((data) => {
      setPaymentHistory(data as PaymentRecord[]);
    });
    getSubscriptionStatusAction(restaurantId).then((data) => {
      setSubscription(data as SubscriptionRecord | null);
    });
  }, [restaurantId]);

  // Handle success/cancel query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      toast.success(t.paymentSuccess);
      // Refresh data
      if (restaurantId) {
        getPaymentHistoryAction(restaurantId).then((data) => setPaymentHistory(data as PaymentRecord[]));
        getSubscriptionStatusAction(restaurantId).then((data) => setSubscription(data as SubscriptionRecord | null));
      }
      window.history.replaceState({}, "", "/dashboard/billing");
    } else if (status === "cancelled") {
      toast.error(t.paymentCancelled);
      window.history.replaceState({}, "", "/dashboard/billing");
    }
  }, []);

  const handleUpgrade = async (planId: "basic" | "pro") => {
    if (!restaurantId) {
      toast.error(t.selectRestoFirst);
      return;
    }
    setIsLoading(planId);
    try {
      const result = await createSubscriptionPayment(restaurantId, planId, billingPeriod);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if (result.paymentLinkUrl) {
        toast.success(t.redirecting);
        window.location.href = result.paymentLinkUrl;
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDowngrade = async () => {
    if (!restaurantId) return;
    if (!confirm(t.downgradeConfirm)) return;

    setIsLoading("free");
    const toastId = toast.loading(t.downgrading);
    try {
      const res = await downgradeToFree(restaurantId);
      if (res.error) {
        toast.error(res.error, { id: toastId });
        return;
      }
      setRestaurant((prev) => prev ? { ...prev, plan: "free" } : prev);
      toast.success(t.downgradeSuccess, { id: toastId });
    } catch {
      toast.error(t.downgradeError, { id: toastId });
    } finally {
      setIsLoading(null);
    }
  };

  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;
  const formatDate = (d: Date | string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: t.statusPending, cls: "bg-yellow-500/10 text-yellow-600" },
      completed: { label: t.statusCompleted, cls: "bg-emerald-500/10 text-emerald-600" },
      failed: { label: t.statusFailed, cls: "bg-red-500/10 text-red-600" },
      expired: { label: t.statusExpired, cls: "bg-neutral-500/10 text-neutral-500" },
    };
    const s = map[status] || map.pending;
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${s.cls}`}>{s.label}</span>;
  };

  const plans = [
    { name: t.freeName, id: "free" as const, price: t.freePrice, period: "", description: t.freeDesc, features: t.freeFeatures, icon: Zap, gradient: "from-neutral-400 to-neutral-600", accent: "neutral" },
    { name: t.basicName, id: "basic" as const, price: billingPeriod === "yearly" ? t.basicPriceYearly : t.basicPrice, period: t.basicPeriod, description: t.basicDesc, features: t.basicFeatures, icon: Sparkles, gradient: "from-blue-500 to-indigo-600", accent: "blue", badge: billingPeriod === "yearly" ? t.save20 : t.popularBadge },
    { name: t.proName, id: "pro" as const, price: billingPeriod === "yearly" ? t.proPriceYearly : t.proPrice, period: t.proPeriod, description: t.proDesc, features: t.proFeatures, icon: Crown, gradient: "from-orange-500 to-amber-600", accent: "orange", badge: billingPeriod === "yearly" ? t.save20 : undefined },
  ];

  const accentColors: Record<string, { bg: string; check: string; button: string }> = {
    neutral: { bg: "bg-neutral-50 dark:bg-neutral-800/50", check: "text-neutral-500", button: "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-default" },
    blue: { bg: "bg-blue-50/50 dark:bg-blue-900/10", check: "text-blue-500", button: "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20" },
    orange: { bg: "bg-orange-50/50 dark:bg-orange-900/10", check: "text-orange-500", button: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{t.pageTitle}</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.pageSubtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
          <CreditCard className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500">Pembayaran QRIS</span>
        </div>
      </div>

      {!restaurant ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-8 shadow-sm text-center max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{t.noRestoTitle}</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5 max-w-sm mx-auto leading-relaxed">{t.noRestoDesc}</p>
          <div className="mt-5">
            <Link href="/dashboard/restaurants" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold px-5 py-2.5 inline-block transition-colors">
              {t.createRestoBtn}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">{restaurant.name}</h3>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Plan saat ini: <span className="font-bold text-orange-500">{currentPlanId.toUpperCase()}</span></p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 select-none shadow-sm h-fit">
              <button onClick={() => setBillingPeriod("monthly")} className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${billingPeriod === "monthly" ? "bg-orange-500 text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800"}`}>
                {t.monthly}
              </button>
              <button onClick={() => setBillingPeriod("yearly")} className={`relative px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${billingPeriod === "yearly" ? "bg-orange-500 text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800"}`}>
                <span>{t.yearly}</span>
                <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide ${billingPeriod === "yearly" ? "bg-white/20 text-white" : "bg-orange-500/10 text-orange-500"}`}>{t.save20}</span>
              </button>
            </div>
          </div>

          {/* Subscription Status */}
          {currentPlanId !== "free" && (
            <SubscriptionStatus subscription={subscription} plan={currentPlanId} restaurantName={restaurant.name} />
          )}

          {/* Pricing Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const colors = accentColors[plan.accent];
              const isCurrent = currentPlanId === plan.id;
              const loading = isLoading === plan.id;

              let extraNote = plan.id === "free" ? t.freeForever : billingPeriod === "yearly" ? t.billedYearly : t.billedMonthly;
              let originalPrice: string | null = null;
              if (billingPeriod === "yearly" && plan.id === "basic") originalPrice = t.basicPrice;
              if (billingPeriod === "yearly" && plan.id === "pro") originalPrice = t.proPrice;

              return (
                <div key={plan.id} className={`relative rounded-2xl bg-white dark:bg-neutral-900 border shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1.5 ${isCurrent ? "border-orange-500 ring-4 ring-orange-500/10" : "border-neutral-100 dark:border-neutral-800 hover:border-orange-400/50"}`}>
                  {plan.badge && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">{plan.badge}</div>
                    </div>
                  )}
                  {isCurrent && !plan.badge && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">{t.activeBadge}</div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-sm`}>
                        <plan.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">{plan.name}</h3>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{plan.price}</span>
                        <span className="text-xs text-neutral-400 font-bold">{plan.period}</span>
                        {originalPrice && <span className="text-xs text-neutral-400 line-through ml-1.5 font-bold">{originalPrice}</span>}
                      </div>
                      <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{extraNote}</p>
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${colors.bg}`}>
                            <Check className={`h-3 w-3 ${colors.check}`} />
                          </div>
                          <span className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Buttons */}
                    {plan.id === "free" ? (
                      isCurrent ? (
                        <button disabled className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default">{t.activePlanNow}</button>
                      ) : (
                        <button onClick={handleDowngrade} disabled={loading} className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 flex items-center justify-center gap-1.5">
                          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
                          {t.downgradeToFree}
                        </button>
                      )
                    ) : isCurrent ? (
                      <button disabled className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default">{t.activePlanNow}</button>
                    ) : (
                      <button onClick={() => handleUpgrade(plan.id)} disabled={loading} className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${colors.button}`}>
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                        {loading ? t.processing : t.upgradeViaQris}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <CreditCard className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.paymentHistoryTitle}</p>
            <p className="text-[11px] text-neutral-400">{t.paymentHistoryDesc}</p>
          </div>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
              <CreditCard className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{t.noPaymentHistory}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400">
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider text-[10px]">Order ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px]">Plan</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px]">Jumlah</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-[10px]">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-3 font-mono font-semibold text-neutral-700 dark:text-neutral-300">{p.orderId}</td>
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white uppercase">{p.plan} ({p.billingPeriod === "yearly" ? "Tahunan" : "Bulanan"})</td>
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
