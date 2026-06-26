"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock, AlertCircle, ArrowRight, Globe } from "lucide-react";

const authTranslations = {
  id: {
    registerTitle: "Daftar Akun Baru",
    registerSubtitle: "Mulailah mendigitalisasi menu & tingkatkan omzet outlet Anda sekarang.",
    nameLabel: "Nama Lengkap",
    namePlaceholder: "Nama Anda",
    emailLabel: "Alamat Email",
    emailPlaceholder: "nama@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Minimal 8 karakter",
    registerButton: "Daftar Akun Baru",
    loadingRegister: "Mendaftarkan...",
    hasAccountText: "Sudah memiliki akun?",
    signInLink: "Masuk Sekarang",
    invalidError: "Gagal mendaftarkan akun",
  },
  en: {
    registerTitle: "Create New Account",
    registerSubtitle: "Start digitizing your menus & boost your outlet revenue now.",
    nameLabel: "Full Name",
    namePlaceholder: "Your Name",
    emailLabel: "Email Address",
    emailPlaceholder: "name@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Minimum 8 characters",
    registerButton: "Register Account",
    loadingRegister: "Registering...",
    hasAccountText: "Already have an account?",
    signInLink: "Sign In Now",
    invalidError: "Failed to register account",
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"id" | "en">("id");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setError(error.message || t.invalidError);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
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
              {t.registerTitle}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {t.registerSubtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {t.nameLabel}
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-450 dark:text-neutral-500" />
                <Input
                  id="name"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10.5 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 focus-visible:ring-orange-500"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {t.passwordLabel}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-450 dark:text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
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
              {loading ? t.loadingRegister : t.registerButton}
              {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-450 font-medium">
            {t.hasAccountText}{" "}
            <Link
              href="/login"
              className="font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 hover:underline transition-colors"
            >
              {t.signInLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
