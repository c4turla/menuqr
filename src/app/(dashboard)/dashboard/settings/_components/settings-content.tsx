"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Settings, User, Mail, Calendar, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SettingsContentProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

const settingsTranslations = {
  id: {
    pageTitle: "Pengaturan",
    pageSubtitle: "Kelola pengaturan akun dan preferensi Anda.",
    accountOwner: "Pemilik Akun",
    verified: "Terverifikasi",
    unverified: "Belum Terverifikasi",
    emailAddress: "Alamat Email",
    memberSince: "Anggota Sejak",
    lastUpdated: "Terakhir Diperbarui",
    accountSecurity: "Keamanan Akun",
    securityDesc: "Kelola preferensi keamanan akun Anda",
    emailVerification: "Verifikasi Email",
    emailVerifiedMsg: "Email Anda telah terverifikasi",
    emailUnverifiedMsg: "Silakan verifikasi alamat email Anda",
    activeStatus: "Aktif",
    pendingStatus: "Tertunda",
    twoFactor: "Autentikasi Dua Faktor (2FA)",
    extraLayer: "Tambahkan lapisan keamanan ekstra",
    comingSoon: "Segera Hadir",
  },
  en: {
    pageTitle: "Settings",
    pageSubtitle: "Manage your account settings and preferences.",
    accountOwner: "Account Owner",
    verified: "Verified",
    unverified: "Unverified",
    emailAddress: "Email Address",
    memberSince: "Member Since",
    lastUpdated: "Last Updated",
    accountSecurity: "Account Security",
    securityDesc: "Manage your security preferences",
    emailVerification: "Email Verification",
    emailVerifiedMsg: "Your email has been verified",
    emailUnverifiedMsg: "Please verify your email address",
    activeStatus: "Active",
    pendingStatus: "Pending",
    twoFactor: "Two-Factor Authentication",
    extraLayer: "Add an extra layer of security",
    comingSoon: "Coming Soon",
  }
};

export function SettingsContent({ user }: SettingsContentProps) {
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

  const t = settingsTranslations[lang];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Card header with gradient background */}
        <div className="relative h-24 bg-gradient-to-r from-orange-400 via-orange-505 to-amber-500">
          <div className="absolute -bottom-8 left-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-neutral-900 p-0.5 shadow-lg">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={64}
                    height={64}
                    className="h-full w-full rounded-[14px] object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-orange-400 to-orange-655 text-white font-extrabold text-xl">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-neutral-900 bg-emerald-400" />
            </div>
          </div>
        </div>

        <div className="pt-12 px-6 pb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                {t.accountOwner}
              </p>
            </div>
            <Badge
              className={`text-[10px] font-bold border-0 px-2.5 py-0.5 rounded-full ${
                user.emailVerified
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
              }`}
            >
              {user.emailVerified ? t.verified : t.unverified}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{t.emailAddress}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <Calendar className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{t.memberSince}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Clock className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{t.lastUpdated}</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Card */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <Shield className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.accountSecurity}</p>
            <p className="text-[11px] text-neutral-400">{t.securityDesc}</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.emailVerification}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {user.emailVerified ? t.emailVerifiedMsg : t.emailUnverifiedMsg}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                user.emailVerified
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {user.emailVerified ? t.activeStatus : t.pendingStatus}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.twoFactor}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {t.extraLayer}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {t.comingSoon}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
