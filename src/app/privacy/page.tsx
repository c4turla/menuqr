"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Shield, FileText, Lock, Globe } from "lucide-react";

type Language = "id" | "en";

const t = {
  id: {
    title: "Kebijakan Privasi",
    subtitle: "Komitmen kami untuk melindungi data pribadi dan informasi outlet kuliner Anda.",
    lastUpdated: "Terakhir diperbarui: 26 Juni 2026",
    backHome: "Kembali ke Beranda",
    signIn: "Masuk",
    getStarted: "Daftar Sekarang",
    toc: "Daftar Isi",
    sections: [
      {
        id: "collect",
        title: "1. Informasi yang Kami Kumpulkan",
        content: "Kami mengumpulkan beberapa informasi saat Anda mendaftar dan menggunakan platform kami, termasuk nama, alamat email, kata sandi yang dienkripsi secara aman, informasi outlet kuliner Anda (seperti nama, menu, harga, kategori), serta data transaksi pesanan pelanggan. Kami tidak mengumpulkan atau menyimpan informasi kartu kredit atau metode pembayaran sensitif milik Anda."
      },
      {
        id: "usage",
        title: "2. Penggunaan Informasi",
        content: "Kami menggunakan informasi yang dikumpulkan untuk mengoperasikan, memelihara, dan menyediakan fitur-fitur platform MenuQR. Ini mencakup proses pengiriman pesanan real-time ke dapur Anda, menyajikan dasbor analitik penjualan, mempermudah komunikasi pemesanan via WhatsApp, serta mengirimkan pembaruan sistem dan pengumuman administratif lainnya."
      },
      {
        id: "protection",
        title: "3. Perlindungan Keamanan Data",
        content: "Kami menerapkan standar keamanan enkripsi SSL/TLS untuk melindungi transmisi data antara perangkat Anda dan server kami. Informasi Anda disimpan di server database cloud terlindungi dengan akses terbatas untuk mencegah kehilangan, pencurian, atau modifikasi data tanpa izin."
      },
      {
        id: "sharing",
        title: "4. Berbagi Informasi dengan Pihak Ketiga",
        content: "Kami tidak menjual, menyewakan, memperdagangkan, atau membagikan informasi pribadi atau data bisnis Anda kepada pihak ketiga mana pun tanpa persetujuan Anda. Kami hanya dapat membagikan informasi tersebut jika diwajibkan oleh undang-undang atau perintah pengadilan resmi."
      },
      {
        id: "control",
        title: "5. Hak Akses dan Kontrol Pengguna",
        content: "Anda memiliki hak penuh untuk mengakses, mengedit, atau menghapus informasi restoran dan menu Anda kapan saja melalui dasbor MenuQR. Jika Anda ingin menghapus akun Anda secara permanen dari sistem kami, silakan kirimkan permintaan ke tim dukungan pelanggan kami."
      }
    ],
    footerText: "Dibuat dengan ❤️ untuk UMKM Kuliner Indonesia."
  },
  en: {
    title: "Privacy Policy",
    subtitle: "Our commitment to protecting your personal data and restaurant information.",
    lastUpdated: "Last updated: June 26, 2026",
    backHome: "Back to Home",
    signIn: "Sign In",
    getStarted: "Sign Up Now",
    toc: "Table of Contents",
    sections: [
      {
        id: "collect",
        title: "1. Information We Collect",
        content: "We collect certain information when you register and use our platform, including your name, email address, securely encrypted password, restaurant information (such as name, menus, prices, categories), and customer order transaction logs. We do not collect or store credit card details or other sensitive payment credentials."
      },
      {
        id: "usage",
        title: "2. How We Use Information",
        content: "We use the information collected to operate, maintain, and provide the features of the MenuQR platform. This includes processing real-time orders to your kitchen screen, rendering sales analytics dashboards, facilitating WhatsApp order communications, and sending system updates or administrative notices."
      },
      {
        id: "protection",
        title: "3. Data Security and Protection",
        content: "We implement standard SSL/TLS encryption protocols to secure data transmission between your device and our servers. Your information is stored on protected cloud database servers with limited access to prevent any loss, theft, or unauthorized data modifications."
      },
      {
        id: "sharing",
        title: "4. Sharing Information with Third Parties",
        content: "We do not sell, rent, trade, or share your personal or business data with any third parties without your explicit consent. We may only disclose such information if required by applicable laws or official court orders."
      },
      {
        id: "control",
        title: "5. User Control and Access Rights",
        content: "You have full rights to access, edit, or delete your restaurant and menu information at any time directly through the MenuQR dashboard. If you wish to permanently delete your account from our systems, please submit a request to our support team."
      }
    ],
    footerText: "Made with ❤️ for Culinary SMEs."
  }
};

export default function PrivacyPage() {
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
              <Lock className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">MenuQR Security</span>
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
