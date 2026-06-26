"use client";

import { useState, useEffect } from "react";
import { Check, CreditCard, Sparkles, Zap, Crown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateRestaurantPlan } from "@/server/actions/restaurant-actions";
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

const billingTranslations = {
  id: {
    pageTitle: "Billing & Subscriptions",
    pageSubtitle: "Kelola plan berlangganan dan fitur uji coba premium restoran Anda.",
    trialNotice: "Mode Uji Coba: Bebas Upgrade/Downgrade Kapan Saja",
    noRestoTitle: "Belum Ada Restoran",
    noRestoDesc: "Anda harus membuat restoran terlebih dahulu di menu Restaurants sebelum dapat menguji coba fitur berlangganan Basic atau Pro.",
    createRestoBtn: "Buat Restoran Baru",
    activeTrialTitle: "Restoran Aktif Uji Coba",
    activeTrialDesc: "Pilih restoran untuk disimulasikan plan berlangganannya.",
    restoLabel: "Restoran",
    pricingToggleMonthly: "Bulanan",
    pricingToggleYearly: "Tahunan",
    pricingSave: "Hemat 20%",
    freeName: "Gratis Selamanya",
    freePrice: "Rp 0",
    freeDesc: "Cocok untuk kedai kecil atau uji coba.",
    freeFeatures: ["1 Outlet / Restoran", "Maksimal 5 Menu", "Maksimal 2 Kategori", "QR Code Standar", "Pemesanan via WhatsApp"],
    basicName: "Basic",
    basicBadge: "Paling Populer",
    basicPrice: "Rp 50.000",
    basicPriceYearly: "Rp 40.000",
    basicPeriod: "/bulan",
    basicDesc: "Untuk kafe & restoran yang sedang berkembang.",
    basicFeatures: ["1 Outlet / Restoran", "Menu & Kategori Tanpa Batas", "Pemesanan via WhatsApp / POS", "Manajemen Pesanan Real Time", "Notifikasi Suara Masuk"],
    proName: "Pro",
    proBadge: "Skala Besar",
    proPrice: "Rp 150.000",
    proPriceYearly: "Rp 120.000",
    proPeriod: "/bulan",
    proDesc: "Untuk franchise atau restoran multi-cabang.",
    proFeatures: ["Cabang/Outlet Tanpa Batas", "Menu & Kategori Tanpa Batas", "Pemesanan via WhatsApp / POS", "Manajemen Pesanan Real Time", "Analisa Data Tingkat Lanjut ", "Notifikasi Suara Masuk", "Dukungan Prioritas 24/7"],
    freeForever: "Gratis selamanya",
    billedMonthly: "ditagih bulanan",
    activeBadge: "Aktif",
    activePlanNow: "Plan Aktif Sekarang",
    activatePlanTrial: "Aktifkan Plan {name} (Trial)",
    paymentHistoryTitle: "Payment History (Trial Mode)",
    paymentHistoryDesc: "Daftar invoice simulasi uji coba berlangganan.",
    noPaymentHistory: "Belum ada histori pembayaran riil",
    sandboxNotice: "Sistem saat ini berjalan dalam mode Uji Coba (Sandbox). Semua aksi aktivasi di atas bersifat instan dan gratis tanpa kartu kredit.",
    popularBadge: "Populer",
    recommendedBadge: "Rekomendasi",
    selectRestoErr: "Silakan pilih restoran terlebih dahulu",
    upgradingPlan: "Memperbarui plan restoran ke {plan}...",
    upgradeSuccess: "Berhasil memperbarui plan {name} ke paket {plan}!",
    upgradeError: "Gagal memperbarui plan",
  },
  en: {
    pageTitle: "Billing & Subscriptions",
    pageSubtitle: "Manage subscription plans and premium trial features of your restaurant.",
    trialNotice: "Trial Mode: Free Upgrade/Downgrade Anytime",
    noRestoTitle: "No Restaurants Yet",
    noRestoDesc: "You must create a restaurant first in the Restaurants menu before trying out Basic or Pro subscription features.",
    createRestoBtn: "Create New Restaurant",
    activeTrialTitle: "Active Trial Restaurant",
    activeTrialDesc: "Select a restaurant to simulate its subscription plan.",
    restoLabel: "Restaurant",
    pricingToggleMonthly: "Monthly",
    pricingToggleYearly: "Yearly",
    pricingSave: "Save 20%",
    freeName: "Free Forever",
    freePrice: "$0",
    freeDesc: "Perfect for small food stalls or trials.",
    freeFeatures: ["1 Outlet / Restaurant", "Up to 5 Menu Items", "Up to 2 Categories", "Standard QR Code", "WhatsApp Checkout"],
    basicName: "Basic",
    basicBadge: "Most Popular",
    basicPrice: "$4.99",
    basicPriceYearly: "$3.99",
    basicPeriod: "/mo",
    basicDesc: "For growing cafes & restaurants.",
    basicFeatures: ["1 Outlet / Restaurant", "Unlimited Menu Items", "WhatsApp Checkout / POS", "Order Management Real Time", "Live Sound Notifications"],
    proName: "Pro",
    proBadge: "Large Scale",
    proPrice: "$12.99",
    proPriceYearly: "$9.99",
    proPeriod: "/mo",
    proDesc: "For franchises or multi-branch restaurants.",
    proFeatures: ["Unlimited Outlets", "Unlimited Menu Items", "WhatsApp Checkout / POS", "Order Management Real Time", "Advanced Analytics", "Live Sound Notifications", "24/7 Priority Support"],
    freeForever: "Free forever",
    billedMonthly: "billed monthly",
    activeBadge: "Active",
    activePlanNow: "Active Plan Now",
    activatePlanTrial: "Activate {name} (Trial)",
    paymentHistoryTitle: "Payment History (Trial Mode)",
    paymentHistoryDesc: "List of simulated trial subscription invoices.",
    noPaymentHistory: "No real payment history yet",
    sandboxNotice: "The system is currently running in Trial Mode (Sandbox). All activation actions above are instant and free without a credit card.",
    popularBadge: "Popular",
    recommendedBadge: "Recommended",
    selectRestoErr: "Please select a restaurant first",
    upgradingPlan: "Upgrading restaurant plan to {plan}...",
    upgradeSuccess: "Successfully updated plan of {name} to {plan}!",
    upgradeError: "Failed to update plan",
  }
};

export function BillingContent({ initialRestaurants }: BillingContentProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    restaurants[0]?.id || ""
  );
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [lang, setLang] = useState<"id" | "en">("id");

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

  const t = billingTranslations[lang];

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  const currentPlanId = selectedRestaurant?.plan || "free";

  const handleUpgradeTrial = async (planId: "free" | "basic" | "pro") => {
    if (!selectedRestaurantId) {
      toast.error(t.selectRestoErr);
      return;
    }

    const loadMsg = t.upgradingPlan.replace("{plan}", planId.toUpperCase());
    const toastId = toast.loading(loadMsg);
    try {
      const res = await updateRestaurantPlan(selectedRestaurantId, planId);
      if (res.error) {
        toast.error(res.error, { id: toastId });
        return;
      }
      
      setRestaurants((prev) =>
        prev.map((r) => (r.id === selectedRestaurantId ? { ...r, plan: planId } : r))
      );
      
      const successMsg = t.upgradeSuccess
        .replace("{name}", selectedRestaurant?.name || "")
        .replace("{plan}", planId.toUpperCase());
      toast.success(successMsg, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || t.upgradeError, { id: toastId });
    }
  };

  const basePlans = [
    {
      name: t.freeName,
      id: "free",
      price: t.freePrice,
      period: "",
      description: t.freeDesc,
      features: t.freeFeatures,
      icon: Zap,
      gradient: "from-neutral-400 to-neutral-600",
      accent: "neutral",
    },
    {
      name: t.basicName,
      id: "basic",
      price: billingPeriod === "yearly" ? t.basicPriceYearly : t.basicPrice,
      period: t.basicPeriod,
      description: t.basicDesc,
      features: t.basicFeatures,
      icon: Sparkles,
      gradient: "from-blue-500 to-indigo-600",
      accent: "blue",
    },
    {
      name: t.proName,
      id: "pro",
      price: billingPeriod === "yearly" ? t.proPriceYearly : t.proPrice,
      period: t.proPeriod,
      description: t.proDesc,
      features: t.proFeatures,
      popular: true,
      icon: Crown,
      gradient: "from-orange-500 to-amber-600",
      accent: "orange",
    },
  ];

  const accentColors: Record<string, { bg: string; text: string; check: string; button: string }> = {
    neutral: {
      bg: "bg-neutral-50 dark:bg-neutral-800/50",
      text: "text-neutral-600 dark:text-neutral-400",
      check: "text-neutral-500",
      button: "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-default",
    },
    blue: {
      bg: "bg-blue-50/50 dark:bg-blue-900/10",
      text: "text-blue-600 dark:text-blue-400",
      check: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20",
    },
    orange: {
      bg: "bg-orange-50/50 dark:bg-orange-900/10",
      text: "text-orange-600 dark:text-orange-400",
      check: "text-orange-500",
      button: "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20",
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {t.pageTitle}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {t.pageSubtitle}
          </p>
        </div>

        {/* Trial Feature Notice */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">
            {t.trialNotice}
          </span>
        </div>
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
        /* Subscription Management Interface */
        <div className="space-y-6">
          {/* Restaurant Selector & Billing Toggle */}
          <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
            {/* Restaurant Selector */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4 w-full max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    {t.activeTrialTitle}
                  </h3>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {t.activeTrialDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {t.restoLabel}
                </label>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.plan.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Billing Period Toggle Switch */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 select-none shadow-sm h-fit">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {t.pricingToggleMonthly}
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  billingPeriod === "yearly"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <span>{t.pricingToggleYearly}</span>
                <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-orange-500/10 text-orange-500 dark:text-orange-400"
                }`}>
                  {t.pricingSave}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {basePlans.map((plan) => {
              const colors = accentColors[plan.accent];
              const isCurrent = currentPlanId === plan.id;

              // Compute dynamic price features
              let displayPrice = plan.price;
              let displayPeriod = plan.period;
              let originalPrice: string | null = null;
              let extraNote = t.billedMonthly;
              let badgeText = plan.popular ? t.proBadge : null;

              if (plan.id === "free") {
                displayPeriod = "";
                extraNote = t.freeForever;
              } else if (plan.id === "basic") {
                if (billingPeriod === "yearly") {
                  displayPrice = t.basicPriceYearly;
                  originalPrice = t.basicPrice;
                  extraNote = lang === "id" 
                    ? `ditagih Rp ${(40000 * 12).toLocaleString("id-ID")}/tahun (${t.pricingSave})` 
                    : `billed $${(3.99 * 12).toFixed(2)}/yr (${t.pricingSave})`;
                  badgeText = t.pricingSave;
                } else {
                  displayPrice = t.basicPrice;
                  extraNote = t.billedMonthly;
                  badgeText = t.basicBadge;
                }
              } else if (plan.id === "pro") {
                if (billingPeriod === "yearly") {
                  displayPrice = t.proPriceYearly;
                  originalPrice = t.proPrice;
                  extraNote = lang === "id" 
                    ? `ditagih Rp ${(120000 * 12).toLocaleString("id-ID")}/tahun (${t.pricingSave})` 
                    : `billed $${(9.99 * 12).toFixed(2)}/yr (${t.pricingSave})`;
                  badgeText = t.pricingSave;
                } else {
                  displayPrice = t.proPrice;
                  extraNote = t.billedMonthly;
                  badgeText = t.proBadge;
                }
              }

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl bg-white dark:bg-neutral-900 border shadow-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1.5 ${
                    isCurrent
                      ? "border-orange-500 dark:border-orange-500 ring-4 ring-orange-500/10"
                      : "border-neutral-100 dark:border-neutral-800 hover:border-orange-400/50"
                  }`}
                >
                  {/* Badge */}
                  {badgeText && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        {badgeText}
                      </div>
                    </div>
                  )}

                  {/* Current plan badge */}
                  {isCurrent && !badgeText && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        {t.activeBadge}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan icon & name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-sm`}>
                        <plan.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                          {displayPrice}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold">
                          {displayPeriod}
                        </span>
                        {originalPrice && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through ml-1.5 font-bold">
                            {originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold mt-1 uppercase tracking-wider">
                        {extraNote}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${colors.bg}`}>
                            <Check className={`h-3 w-3 ${colors.check}`} />
                          </div>
                          <span className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Upgrade button (Actionable for trial) */}
                    <button
                      onClick={() => handleUpgradeTrial(plan.id as "free" | "basic" | "pro")}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isCurrent
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-default"
                          : colors.button
                      }`}
                      disabled={isCurrent}
                    >
                      {isCurrent ? (
                        t.activePlanNow
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" />
                          {t.activatePlanTrial.replace("{name}", plan.name)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History Mock */}
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
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <CreditCard className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t.noPaymentHistory}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm leading-relaxed">
            {t.sandboxNotice}
          </p>
        </div>
      </div>
    </div>
  );
}
