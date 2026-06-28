"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight, AlertCircle, ArrowLeft, Globe } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const authTranslations = {
  id: {
    forgotTitle: "Lupa Password",
    forgotSubtitle: "Masukkan alamat email Anda untuk mendapatkan tautan pemulihan kata sandi.",
    emailLabel: "Alamat Email",
    emailPlaceholder: "nama@email.com",
    forgotButton: "Kirim Tautan Reset",
    loadingForgot: "Mengirim...",
    forgotSuccess: "Jika alamat email tersebut terdaftar, kami telah mengirimkan link untuk mereset kata sandi Anda. Silakan periksa inbox atau spam.",
    backToLogin: "Kembali Ke Login",
    invalidError: "Gagal mengirim email reset password",
  },
  en: {
    forgotTitle: "Forgot Password",
    forgotSubtitle: "Enter your email address to receive a password reset link.",
    emailLabel: "Email Address",
    emailPlaceholder: "name@email.com",
    forgotButton: "Send Reset Link",
    loadingForgot: "Sending...",
    forgotSuccess: "If the email address exists, we have sent a password reset link. Please check your inbox or spam folder.",
    backToLogin: "Back to Login",
    invalidError: "Failed to send reset password email",
  }
};

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || t.invalidError);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

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
          {/* Brand Logo */}
          <div className="mx-auto relative h-16 w-48 shrink-0">
            <Image src="/lightmode.webp" alt="MenuQR Logo" fill className="object-contain dark:hidden" />
            <Image src="/darkmode.webp" alt="MenuQR Logo" fill className="object-contain hidden dark:block" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {t.forgotTitle}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {t.forgotSubtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {sent ? (
            <div className="space-y-5 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed">
                {t.forgotSuccess}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 hover:underline transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {t.emailLabel}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-450 dark:text-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                {loading ? t.loadingForgot : t.forgotButton}
                {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </Button>
              
              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-450 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}
