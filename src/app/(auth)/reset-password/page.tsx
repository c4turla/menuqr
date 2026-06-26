"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight, AlertCircle, Globe } from "lucide-react";

const authTranslations = {
  id: {
    resetTitle: "Reset Password",
    resetSubtitle: "Masukkan kata sandi baru Anda untuk memulihkan akses akun.",
    newPasswordLabel: "Password Baru",
    newPasswordPlaceholder: "Minimal 8 karakter",
    resetButton: "Simpan Kata Sandi Baru",
    loadingReset: "Menyetel Ulang...",
    invalidResetLink: "Tautan Tidak Valid",
    invalidResetDesc: "Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa.",
    requestNewLink: "Minta Tautan Baru",
    invalidError: "Gagal mereset password",
  },
  en: {
    resetTitle: "Reset Password",
    resetSubtitle: "Enter your new password to regain access to your account.",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "Minimum 8 characters",
    resetButton: "Save New Password",
    loadingReset: "Resetting...",
    invalidResetLink: "Invalid Link",
    invalidResetDesc: "The password reset link is invalid or has expired.",
    requestNewLink: "Request New Link",
    invalidError: "Failed to reset password",
  }
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [lang, setLang] = useState<"id" | "en">("id");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }
  }, []);

  const handleLangChange = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("menuqr-lang", newLang);
  };

  const t = authTranslations[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || t.invalidError);
        setLoading(false);
        return;
      }

      router.push("/login?reset=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        {/* Floating Language Switcher */}
        <div className="absolute top-5 right-5 z-50">
          <button
            type="button"
            onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all shadow-sm cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-orange-500" />
            <span className="uppercase">{lang}</span>
          </button>
        </div>

        <Card className="backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/60 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
          <CardHeader className="space-y-4 pt-8 pb-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive font-extrabold text-base shadow-sm">
              !
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {t.invalidResetLink}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                {t.invalidResetDesc}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 hover:underline transition-colors"
            >
              {t.requestNewLink}
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Floating Language Switcher */}
      <div className="absolute top-5 right-5 z-50">
        <button
          type="button"
          onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
          className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-855 transition-all shadow-sm cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 text-orange-500" />
          <span className="uppercase">{lang}</span>
        </button>
      </div>

      <Card className="backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/60 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-4 pt-8 pb-6 text-center">
          {/* Brand Logo */}
          <div className="mx-auto relative h-16 w-48 shrink-0">
            <Image src="/lightmode.webp" alt="MenuQR Logo" fill className="object-contain dark:hidden" />
            <Image src="/darkmode.webp" alt="MenuQR Logo" fill className="object-contain hidden dark:block" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t.resetTitle}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {t.resetSubtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {t.newPasswordLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-450 dark:text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.newPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10.5 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 focus-visible:ring-orange-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 p-3 rounded-xl text-destructive text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-6.5 text-xs font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            disabled={loading}
          >
            {loading ? t.loadingReset : t.resetButton}
            {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
