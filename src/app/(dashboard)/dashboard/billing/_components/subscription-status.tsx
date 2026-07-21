"use client";

import { Crown, CalendarDays, Clock } from "lucide-react";

interface SubscriptionStatusProps {
  subscription: {
    status: string | null;
    currentPeriodStart: Date | string | null;
    currentPeriodEnd: Date | string | null;
    provider: string | null;
  } | null;
  plan: string;
  restaurantName: string;
}

export function SubscriptionStatus({ subscription, plan, restaurantName }: SubscriptionStatusProps) {
  if (!subscription || plan === "free") return null;

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;
  const isActive = subscription.status === "active" && periodEnd && periodEnd > new Date();
  const daysLeft = periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDate = (d: Date | string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
            Subscription Aktif
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {restaurantName}
          </p>
        </div>
        <div className="ml-auto">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}>
            {isActive ? "Aktif" : "Expired"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Crown className="h-3 w-3 text-orange-500" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Plan</span>
          </div>
          <p className="text-sm font-extrabold text-neutral-900 dark:text-white">{plan.toUpperCase()}</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Berlaku Sampai</span>
          </div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">{formatDate(subscription.currentPeriodEnd)}</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sisa Hari</span>
          </div>
          <p className="text-sm font-extrabold text-neutral-900 dark:text-white">{daysLeft} hari</p>
        </div>
      </div>
    </div>
  );
}
