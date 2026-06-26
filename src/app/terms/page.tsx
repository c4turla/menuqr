"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Shield, FileText, Lock, Globe } from "lucide-react";

type Language = "id" | "en";

const t = {
  id: {
    title: "Syarat & Ketentuan Layanan",
    subtitle: "Aturan dan panduan penggunaan platform MenuQR.",
    lastUpdated: "Terakhir diperbarui: 26 Juni 2026",
    backHome: "Kembali ke Beranda",
    signIn: "Masuk",
    getStarted: "Daftar Sekarang",
    toc: "Daftar Isi",
    sections: [
      {
        id: "acceptance",
        title: "1. Penerimaan Syarat",
        content: "Dengan mengakses dan menggunakan platform MenuQR, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini secara hukum. Jika Anda tidak menyetujui bagian apa pun dari ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami."
      },
      {
        id: "accounts",
        title: "2. Pendaftaran dan Akun Pengguna",
        content: "Untuk menggunakan beberapa fitur MenuQR, Anda harus mendaftar dan membuat akun. Anda bertanggung jawab penuh untuk menjaga keamanan akun dan kata sandi Anda. Anda wajib memberikan informasi yang akurat, lengkap, dan terbaru. Penyalahgunaan akun milik orang lain tidak diperbolehkan."
      },
      {
        id: "pricing",
        title: "3. Layanan dan Pembayaran",
        content: "MenuQR menawarkan paket Free, Basic, dan Pro dengan batasan fitur masing-masing (seperti jumlah outlet, menu, dan analitik). Untuk paket berbayar, tagihan akan dilakukan secara berulang sesuai periode (bulanan/tahunan) yang Anda pilih. Harga dapat berubah sewaktu-waktu dengan pemberitahuan terlebih dahulu."
      },
      {
        id: "cancellation",
        title: "4. Pembatalan dan Pengembalian Dana",
        content: "Anda dapat membatalkan langganan berbayar kapan saja melalui halaman Billing di dashboard. Pembatalan akan berlaku efektif di akhir periode tagihan yang sedang berjalan. Kami tidak memberikan pengembalian dana untuk sisa periode yang tidak digunakan."
      },
      {
        id: "restrictions",
        title: "5. Batasan Penggunaan",
        content: "Anda setuju untuk tidak menyalahgunakan sistem kami, termasuk tetapi tidak terbatas pada: mencoba meretas server, mengirimkan spam pesanan, memanipulasi analitik, atau mengunggah konten ilegal pada menu publik Anda. Pelanggaran ketentuan ini akan mengakibatkan pemblokiran akun secara permanen."
      },
      {
        id: "liability",
        title: "6. Batasan Tanggung Jawab",
        content: "MenuQR disediakan 'sebagaimana adanya' tanpa jaminan apa pun. Kami tidak bertanggung jawab atas segala kerugian material, non-material, kehilangan data, atau kehilangan potensi keuntungan bisnis akibat adanya gangguan teknis atau pemeliharaan sistem."
      }
    ],
    footerText: "Dibuat dengan ❤️ untuk UMKM Kuliner Indonesia."
  },
  en: {
    title: "Terms & Conditions",
    subtitle: "Rules and guidelines for using the MenuQR platform.",
    lastUpdated: "Last updated: June 26, 2026",
    backHome: "Back to Home",
    signIn: "Sign In",
    getStarted: "Sign Up Now",
    toc: "Table of Contents",
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: "By accessing and using the MenuQR platform, you agree to be legally bound by these terms and conditions. If you do not agree with any part of these terms, you are not authorized to use our services."
      },
      {
        id: "accounts",
        title: "2. Registration and User Accounts",
        content: "To use certain features of MenuQR, you must register and create an account. You are fully responsible for maintaining the security of your account and password. You must provide accurate, complete, and current information. Unauthorized use of another's account is strictly prohibited."
      },
      {
        id: "pricing",
        title: "3. Services and Payments",
        content: "MenuQR offers Free, Basic, and Pro plans with their respective feature limits (such as number of outlets, menus, and analytics). For paid plans, billing is processed on a recurring basis matching your selected billing cycle (monthly/yearly). Prices are subject to change with prior notice."
      },
      {
        id: "cancellation",
        title: "4. Cancellation and Refunds",
        content: "You can cancel your subscription at any time through the Billing page in the dashboard. The cancellation will take effect at the end of the current billing cycle. We do not provide refunds for any unused portion of the subscription period."
      },
      {
        id: "restrictions",
        title: "5. Usage Restrictions",
        content: "You agree not to abuse our system, including but not limited to: attempting to hack servers, sending spam orders, manipulating analytics, or uploading illegal content on your public menus. Violating these rules will result in permanent account suspension."
      },
      {
        id: "liability",
        title: "6. Limitation of Liability",
        content: "MenuQR is provided 'as is' without warranties of any kind. We are not liable for any material or non-material damages, data loss, or loss of potential business profit arising from technical disruptions or system maintenance."
      }
    ],
    footerText: "Made with ❤️ for Culinary SMEs."
  }
};

export default function TermsPage() {
  const [lang, setLang] = useState<Language>("id");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("menuqr-lang") as Language;
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("menuqr-lang", newLang);
  };

  const currentT = t[lang];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-neutral-950 font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-[100px] opacity-80" />
      <div className="absolute top-[800px] left-0 -z-10 h-[500px] w-[500px] bg-gradient-to-tr from-purple-500/5 via-orange-500/5 to-transparent rounded-full blur-[100px] opacity-60" />

      {/* Modern Navigation Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-neutral-200/50 dark:border-neutral-800/50 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-32 shrink-0">
              <Image src="/lightmode.webp" alt="MenuQR Logo" fill className="object-contain dark:hidden" />
              <Image src="/darkmode.webp" alt="MenuQR Logo" fill className="object-contain hidden dark:block" />
            </div>
          </Link>

          {/* Desktop Right Nav */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="uppercase">{lang}</span>
            </button>

            <Link href="/login">
              <Button variant="ghost" className="rounded-xl font-bold text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                {currentT.signIn}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {currentT.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-20 px-5">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-orange-500 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            {currentT.backHome}
          </Link>

          {/* Hero Heading */}
          <div className="space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-orange-600 dark:text-orange-400">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">MenuQR Legal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
              {currentT.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium">
              {currentT.subtitle} &bull; {currentT.lastUpdated}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar TOC */}
            <div className="lg:col-span-4 bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
              <p className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {currentT.toc}
              </p>
              <nav className="flex flex-col gap-2.5">
                {currentT.sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Articles Column */}
            <div className="lg:col-span-8 space-y-8">
              {currentT.sections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-white dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900/60 rounded-3xl p-6 sm:p-8 shadow-sm scroll-mt-24"
                >
                  <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mb-4">
                    {sec.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                    {sec.content}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 py-8 px-5">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold">
            &copy; {new Date().getFullYear()} MenuQR. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold flex items-center gap-1.5">
            {currentT.footerText.split("❤️")[0]}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            {currentT.footerText.split("❤️")[1]}
          </p>
        </div>
      </footer>
    </div>
  );
}
