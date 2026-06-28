"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, Sparkles, ArrowRight, Globe } from "lucide-react";

const authTranslations = {
  id: {
    loginTitle: "Selamat Datang",
    loginSubtitle: "Masuk ke akun Anda untuk mengelola menu digital & pesanan outlet.",
    emailLabel: "Alamat Email",
    emailPlaceholder: "nama@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPasswordLink: "Lupa Password?",
    loginButton: "Masuk Sekarang",
    loadingLogin: "Menghubungkan...",
    noAccountText: "Belum punya akun?",
    signUpLink: "Daftar Sekarang",
    regSuccess: "Pendaftaran sukses! Silakan masuk menggunakan akun baru Anda.",
    resetSuccess: "Reset kata sandi berhasil! Silakan masuk dengan kata sandi baru Anda.",
    invalidError: "Email atau password salah",
    orText: "Atau masuk dengan",
    googleLoginButton: "Masuk dengan Google",
  },
  en: {
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to manage your digital menus & POS kitchen orders.",
    emailLabel: "Email Address",
    emailPlaceholder: "name@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPasswordLink: "Forgot Password?",
    loginButton: "Sign In Now",
    loadingLogin: "Connecting...",
    noAccountText: "Don't have an account?",
    signUpLink: "Register Now",
    regSuccess: "Registration successful! Please sign in using your new account.",
    resetSuccess: "Password reset successful! Please sign in with your new password.",
    invalidError: "Invalid email or password",
    orText: "Or sign in with",
    googleLoginButton: "Sign in with Google",
  }
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const reset = searchParams.get("reset") === "true";

  const [lang, setLang] = useState<"id" | "en">("id");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setLoadingGoogle(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setLoadingGoogle(false);
    }
  }

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

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || t.invalidError);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
              {t.loginTitle}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {t.loginSubtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {/* Success Notifications */}
          {registered && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-500 text-xs font-bold leading-relaxed">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t.regSuccess}</span>
            </div>
          )}

          {reset && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-600 dark:text-emerald-500 text-xs font-bold leading-relaxed">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t.resetSuccess}</span>
            </div>
          )}

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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {t.passwordLabel}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 transition-colors"
                >
                  {t.forgotPasswordLink}
                </Link>
              </div>
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
              disabled={loading || loadingGoogle}
            >
              {loading ? t.loadingLogin : t.loginButton}
              {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
            </div>
            <span className="relative px-3 bg-white dark:bg-neutral-900 text-[10px] font-bold text-neutral-450 uppercase tracking-wider">
              {t.orText}
            </span>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || loadingGoogle}
            variant="outline"
            className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 rounded-xl py-6.5 text-xs font-bold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.77 3.03,-4.38 3.03,-7.4C21.65,11.66 21.54,11.36 21.35,11.1z" fill="#4285F4"/>
                <path d="M12,20.6c2.59,0 4.77,-0.86 6.36,-2.33l-3.28,-2.6c-0.91,0.61 -2.07,0.97 -3.08,0.97 -2.37,0 -4.38,-1.6 -5.1,-3.75H3.5v2.68C5.08,18.8 8.35,20.6 12,20.6z" fill="#34A853"/>
                <path d="M6.9,12.89c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V6.81H3.5C2.88,8.05 2.5,9.45 2.5,11c0,1.55 0.38,2.95 1,4.19l3.4,-2.3z" fill="#FBBC05"/>
                <path d="M12,5.38c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.77,2.56 14.59,1.4 12,1.4C8.35,1.4 5.08,3.2 3.5,6.81l3.4,2.68C7.62,7.38 9.63,5.38 12,5.38z" fill="#EA4335"/>
              </g>
            </svg>
            <span>{t.googleLoginButton}</span>
          </Button>

          <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-450 font-medium">
            {t.noAccountText}{" "}
            <Link
              href="/register"
              className="font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 hover:underline transition-colors"
            >
              {t.signUpLink}
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
