"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  QrCode,
  Smartphone,
  ArrowRight,
  Check,
  Globe,
  Volume2,
  ChefHat,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const translations = {
  id: {
    heroTitle: "Menu Digital Interaktif Dalam 10 Menit",
    heroSubtitle: "Ubah menu fisik restoran Anda menjadi menu digital yang dinamis. Pelanggan cukup pindai QR, pesan langsung ke kasir/dapur, dan lacak status makanan mereka secara real-time.",
    getStarted: "Mulai Gratis Sekarang",
    learnMore: "Pelajari Lebih Lanjut",
    noCreditCard: "Tanpa kartu kredit • Uji Coba Gratis",
    featuresTitle: "Kenapa Memilih MenuQR?",
    featuresSubtitle: "Segala fitur modern untuk meningkatkan penjualan outlet kuliner Anda",
    howItWorksTitle: "Cara Kerja",
    howItWorksSubtitle: "Hanya 4 langkah mudah untuk mendigitalisasi outlet Anda",
    pricingTitle: "Pilihan Paket Hemat",
    pricingSubtitle: "Pilih paket yang paling sesuai dengan skala bisnis kuliner Anda",
    pricingPopular: "Populer",
    pricingBest: "Terbaik",
    ctaTitle: "Siap Meningkatkan Layanan Outlet Anda?",
    ctaButton: "Buat Menu Anda Sekarang",
    footerText: "Hak Cipta dilindungi undang-undang.",
    
    // Feature list
    feat1Title: "Notifikasi Bunyi Live",
    feat1Desc: "Setiap ada pesanan baru dari meja, laptop/tablet kasir akan berbunyi ping secara real-time.",
    feat2Title: "Integrasi Sistem POS",
    feat2Desc: "Pesanan terkirim otomatis ke dapur dan kasir. Tidak perlu bergantung pada pesan WhatsApp saja.",
    feat3Title: "Lacak Pesanan Mandiri",
    feat3Desc: "Pelanggan bisa memantau proses memasak hidangan mereka secara langsung dari smartphone mereka.",
    feat4Title: "Cetak Massal Meja",
    feat4Desc: "Buat & cetak puluhan QR Code meja sekaligus dengan prefix dan rentang angka kustom.",

    // Steps list
    step1Title: "Daftar Akun",
    step1Desc: "Buat akun restoran Anda secara gratis dalam 30 detik saja.",
    step2Title: "Input Menu",
    step2Desc: "Tambahkan foto, deskripsi, kategori, serta harga makanan Anda.",
    step3Title: "Generate QR",
    step3Desc: "Cetak QR Code meja sekaligus secara instan lewat menu Outlet.",
    step4Title: "Siap Berjualan",
    step4Desc: "Tempel QR di meja. Pembeli langsung scan, pesan, dan lacak.",

    // Pricing details
    freeName: "Gratis",
    freePrice: "Rp 0",
    freeFeatures: ["1 Outlet / Restoran", "Maksimal 5 Menu Makanan", "Maksimal 2 Kategori", "QR Code Standar"],
    basicName: "Basic",
    basicPrice: "Rp 50rb",
    basicPeriod: "/bulan",
    basicFeatures: ["1 Outlet / Restoran", "Menu & Kategori Tanpa Batas", "Pemesanan WhatsApp", "POS Order Manager", "Notifikasi Suara Masuk"],
    proName: "Pro",
    proPrice: "Rp 150rb",
    proPeriod: "/bulan",
    proFeatures: ["Cabang/Outlet Tanpa Batas", "Menu & Kategori Tanpa Batas", "Pemesanan WhatsApp", "POS Order Manager", "Notifikasi Suara Masuk", "Dukungan Prioritas 24/7"],

    // FAQ & Testimonials
    faqTitle: "Pertanyaan Populer (FAQ)",
    faqSubtitle: "Jawaban cepat atas pertanyaan umum seputar fitur & penggunaan MenuQR.",
    faqQ1: "Apakah saya perlu membeli tablet kasir khusus?",
    faqA1: "Tidak perlu. Anda bisa menggunakan Laptop, PC, Tablet, atau HP apa pun yang sudah ada, asalkan memiliki koneksi internet dan peramban web.",
    faqQ2: "Bagaimana cara kerja notifikasi suara pesanan baru?",
    faqA2: "Setiap ada pelanggan yang memesan langsung dari HP mereka, komputer kasir Anda akan mengeluarkan bunyi 'ping' secara otomatis untuk memberi tahu tim dapur.",
    faqQ3: "Berapa lama waktu proses aktivasi paket?",
    faqA3: "Aktivasi bersifat instan. Setelah pembayaran selesai dikonfirmasi, seluruh fitur berbayar akan langsung terbuka dan aktif di akun Anda.",
    faqQ4: "Apakah pelanggan harus menginstal aplikasi?",
    faqA4: "Tidak. Pelanggan cukup memindai kode QR menggunakan kamera HP mereka untuk langsung melihat menu, memesan, dan melacak pesanan di browser bawaan.",

    testiTitle: "Testimoni Rekan Kuliner",
    testiSubtitle: "Dengarkan ulasan jujur dari pengusaha kuliner yang telah mendigitalisasi outlet mereka bersama kami.",
  },
  en: {
    heroTitle: "Interactive Digital Menu in 10 Minutes",
    heroSubtitle: "Transform your physical restaurant menus into dynamic digital experiences. Customers scan, order directly to your POS/kitchen, and track cooking progress in real time.",
    getStarted: "Start Free Now",
    learnMore: "Learn More",
    noCreditCard: "No credit card required • Free Trial",
    featuresTitle: "Why Choose MenuQR?",
    featuresSubtitle: "Modern features built to boost your culinary outlet sales",
    howItWorksTitle: "How It Works",
    howItWorksSubtitle: "Get your digital menu live in four simple steps",
    pricingTitle: "Simple & Flexible Pricing",
    pricingSubtitle: "Choose the plan that best fits your business scale",
    pricingPopular: "Popular",
    pricingBest: "Best Value",
    ctaTitle: "Ready to Modernize Your Service?",
    ctaButton: "Create Your Menu Now",
    footerText: "All rights reserved.",
    
    // Feature list
    feat1Title: "Live Sound Alert",
    feat1Desc: "Get real-time audio chimes on your dashboard when customers place new table orders.",
    feat2Title: "Integrated POS System",
    feat2Desc: "Orders automatically stream into your kitchen and cashier panel. No WhatsApp reliance.",
    feat3Title: "Self-Order Tracking",
    feat3Desc: "Customers can track their cooking progress live on their phone without calling staff.",
    feat4Title: "Bulk QR Printing",
    feat4Desc: "Generate and download dozens of table QR codes in a single click with custom prefixes.",

    // Steps list
    step1Title: "Sign Up",
    step1Desc: "Register your restaurant account for free in just 30 seconds.",
    step2Title: "Create Menu",
    step2Desc: "Upload food images, prices, descriptions, and organized categories.",
    step3Title: "Print QRs",
    step3Desc: "Batch print table QR codes instantly from your outlet settings.",
    step4Title: "Go Live",
    step4Desc: "Place QRs on tables. Customers scan, order, and track live.",

    // Pricing details
    freeName: "Free",
    freePrice: "$0",
    freeFeatures: ["1 Outlet / Restaurant", "Up to 5 Menu Items", "Up to 2 Categories", "Standard QR Code"],
    basicName: "Basic",
    basicPrice: "$4.99",
    basicPeriod: "/mo",
    basicFeatures: ["1 Outlet / Restaurant", "Unlimited Menu Items", "WhatsApp Checkout Integration", "POS Order Manager Dashboard", "Live Sound Notifications"],
    proName: "Pro",
    proPrice: "$12.99",
    proPeriod: "/mo",
    proFeatures: ["Unlimited Outlets", "Unlimited Menu Items", "WhatsApp Checkout Integration", "POS Order Manager Dashboard", "Live Sound Notifications", "24/7 Priority Support"],

    // FAQ & Testimonials
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find quick answers to common questions about MenuQR.",
    faqQ1: "Do I need to buy special cashier hardware?",
    faqA1: "No. You can run our POS dashboard on any existing Laptop, PC, Tablet, or Smartphone with an active internet connection.",
    faqQ2: "How does the live sound notification work?",
    faqA2: "When a customer submits a POS order from their table, your cashier device will automatically play a chime ring alert to notify the team.",
    faqQ3: "How long does it take to activate paid plans?",
    faqA3: "Paid plan activations (Basic/Pro) are instant. Once payment is confirmed, all premium features are immediately unlocked.",
    faqQ4: "Do customers need to download any application?",
    faqA4: "No. Customers just scan the QR code with their mobile camera to view the menu, submit orders, and track preparation directly in the web browser.",

    testiTitle: "Trusted by Culinary Business Owners",
    testiSubtitle: "Hear how outlet owners transformed their restaurant workflow and boosted customer satisfaction.",
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

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

  const t = translations[lang];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Owner Warkop Sahabat",
      quote: lang === "id"
        ? "Setelah pakai MenuQR, antrean kasir berkurang drastis karena pelanggan langsung pesan dari meja. Notifikasi suara ping-nya sangat membantu dapur!"
        : "After using MenuQR, cashier queues dropped drastically because customers order directly from their table. The ping sound alert helps our kitchen a lot!",
      stars: 5,
    },
    {
      name: "Sarah Wijaya",
      role: "Manager Sarah Cafe & Resto",
      quote: lang === "id"
        ? "Fitur lacak pesanan membuat pelanggan merasa tenang karena tahu makanan mereka sedang dimasak. Cetak massal QR mejanya juga sangat cepat!"
        : "The order tracking feature reassures customers since they know their food is being cooked. The batch QR printing is also super fast!",
      stars: 5,
    },
    {
      name: "Rian Hidayat",
      role: "Owner Resto Sederhana",
      quote: lang === "id"
        ? "Kami beralih dari menu cetak kertas yang mahal ke MenuQR. Update harga tinggal klik, hemat biaya cetak jutaan rupiah per bulan!"
        : "We switched from expensive paper menus to MenuQR. Updating prices takes just one click, saving us millions of rupiah in print costs monthly!",
      stars: 5,
    },
    {
      name: "Amanda Putri",
      role: "Founder Kopi Senja",
      quote: lang === "id"
        ? "Tampilan menunya sangat ramah pengguna di HP (mobile-first). Pelanggan milenial kami sangat suka memesan kopi lewat scan QR ini."
        : "The menu interface is extremely user-friendly on mobile. Our millennial customers love ordering their coffee by scanning the QR.",
      stars: 5,
    },
    {
      name: "David Kurnia",
      role: "Owner David Steakhouse",
      quote: lang === "id"
        ? "Sistem POS yang terintegrasi dengan dapur membuat pesanan terkirim secara instan dan tanpa salah catat. Sangat direkomendasikan!"
        : "The integrated kitchen POS system delivers orders instantly with zero recording mistakes. Highly recommended for busy restaurants!",
      stars: 5,
    },
    {
      name: "Linda Lestari",
      role: "Owner Dapur Nenek",
      quote: lang === "id"
        ? "Paket Basic dan Pro harganya sangat terjangkau dibandingkan efisiensi operasional yang kami dapatkan. Dukungan CS juga sangat cepat membantu."
        : "The Basic and Pro plans are incredibly affordable compared to the operational efficiency we gained. CS support is also very quick to help.",
      stars: 5,
    }
  ];

  const testimonialsGroups = [
    [testimonials[0], testimonials[1], testimonials[2]],
    [testimonials[3], testimonials[4], testimonials[5]]
  ];

  // Auto-play testimonials slider every 4.5 seconds
  const autoPlayDuration = 4500;
  const slideCount = testimonialsGroups.length;

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const handleDotClick = (index: number) => {
    setActiveSlide(index);
  };

  const currentGroup = testimonialsGroups[activeSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, autoPlayDuration);
    return () => clearInterval(timer);
  }, [slideCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Volume2,
      title: t.feat1Title,
      description: t.feat1Desc,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
    },
    {
      icon: ChefHat,
      title: t.feat2Title,
      description: t.feat2Desc,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
    },
    {
      icon: Smartphone,
      title: t.feat3Title,
      description: t.feat3Desc,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
    },
    {
      icon: QrCode,
      title: t.feat4Title,
      description: t.feat4Desc,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
    },
  ];

  const steps = [
    { step: "1", title: t.step1Title, desc: t.step1Desc },
    { step: "2", title: t.step2Title, desc: t.step2Desc },
    { step: "3", title: t.step3Title, desc: t.step3Desc },
    { step: "4", title: t.step4Title, desc: t.step4Desc },
  ];

  const plans = [
    {
      name: t.freeName,
      price: t.freePrice,
      period: "",
      originalPrice: null,
      extraNote: lang === "id" ? "Gratis selamanya" : "Free forever",
      features: t.freeFeatures,
      popular: false,
      badge: null,
    },
    {
      name: t.basicName,
      price: billingPeriod === "yearly"
        ? (lang === "id" ? "Rp 40rb" : "$3.99")
        : (lang === "id" ? "Rp 50rb" : "$4.99"),
      originalPrice: billingPeriod === "yearly"
        ? (lang === "id" ? "Rp 50rb" : "$4.99")
        : null,
      period: lang === "id" ? "/bulan" : "/mo",
      extraNote: billingPeriod === "yearly"
        ? (lang === "id" ? "ditagih Rp 480rb/tahun (Hemat 20%)" : "billed $47.88/yr (Save 20%)")
        : (lang === "id" ? "ditagih bulanan" : "billed monthly"),
      features: t.basicFeatures,
      popular: true,
      badge: billingPeriod === "yearly"
        ? (lang === "id" ? "Diskon 20%" : "Save 20%")
        : t.pricingPopular,
    },
    {
      name: t.proName,
      price: billingPeriod === "yearly"
        ? (lang === "id" ? "Rp 120rb" : "$9.99")
        : (lang === "id" ? "Rp 150rb" : "$12.99"),
      originalPrice: billingPeriod === "yearly"
        ? (lang === "id" ? "Rp 150rb" : "$12.99")
        : null,
      period: lang === "id" ? "/bulan" : "/mo",
      extraNote: billingPeriod === "yearly"
        ? (lang === "id" ? "ditagih Rp 1.44jt/tahun (Hemat 20%)" : "billed $119.88/yr (Save 20%)")
        : (lang === "id" ? "ditagih bulanan" : "billed monthly"),
      features: t.proFeatures,
      popular: false,
      badge: billingPeriod === "yearly"
        ? (lang === "id" ? "Diskon 20%" : "Save 20%")
        : t.pricingBest,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-gradient-to-br from-orange-400/20 to-amber-400/0 rounded-full blur-3xl opacity-60" />
      <div className="absolute top-[800px] left-0 -z-10 h-[500px] w-[500px] bg-gradient-to-br from-purple-500/10 to-orange-400/0 rounded-full blur-3xl opacity-40" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25">
              MQ
            </div>
            <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
              MenuQR
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 text-orange-500" />
              <span className="uppercase">{lang}</span>
            </button>

            <nav className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-orange-500 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold px-4 py-4">
                  {lang === "id" ? "Mulai" : "Get Started"}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-5 py-20 lg:py-28 overflow-hidden">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-500 px-3.5 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider">
              ✨ {lang === "id" ? "Platform Menu QR Terbaik" : "The Ultimate QR Menu Platform"}
            </Badge>

            <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-6xl max-w-3xl mx-auto leading-[1.1] bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
              {t.heroTitle}
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
              {t.heroSubtitle}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-sm font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.getStarted}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-sm font-bold border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  {t.learnMore}
                </Button>
              </a>
            </div>

            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
              {t.noCreditCard}
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-slate-100 dark:border-neutral-900 bg-white dark:bg-neutral-900/40 px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center space-y-2">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.featuresTitle}
              </h2>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                {t.featuresSubtitle}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, idx) => (
                <Card 
                  key={idx} 
                  className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] duration-300"
                >
                  <CardHeader className="p-0 space-y-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${f.color} shadow-sm`}>
                      <f.icon className="h-5.5 w-5.5" />
                    </div>
                    <CardTitle className="text-base font-extrabold text-neutral-900 dark:text-white">
                      {f.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                      {f.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-slate-100 dark:border-neutral-900 px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center space-y-2">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.howItWorksTitle}
              </h2>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                {t.howItWorksSubtitle}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-4 relative">
              {steps.map((s, i) => {
                const isActive = i === activeStep;
                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setActiveStep(i)}
                    className={`text-center space-y-4 relative z-10 p-5 rounded-3xl transition-all duration-500 cursor-pointer border ${
                      isActive 
                        ? "border-orange-500/20 bg-orange-500/5 shadow-md scale-[1.05]" 
                        : "border-transparent bg-transparent"
                    }`}
                  >
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black transition-all duration-500 ${
                      isActive 
                        ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/20 scale-110 rotate-3" 
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    }`}>
                      {s.step}
                    </div>
                    <h3 className={`text-sm font-black transition-colors duration-500 ${
                      isActive ? "text-orange-500 dark:text-orange-400" : "text-neutral-900 dark:text-white"
                    }`}>
                      {s.title}
                    </h3>
                    <p className={`text-[11px] leading-relaxed font-medium transition-colors duration-500 ${
                      isActive ? "text-neutral-600 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500"
                    }`}>
                      {s.desc}
                    </p>
                  </div>
                );
              })}
              {/* Connector line for large screens */}
              <div className="absolute top-11 left-[12.5%] right-[12.5%] h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10 hidden sm:block" />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="border-t border-slate-100 dark:border-neutral-900 bg-white dark:bg-neutral-900/40 px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center space-y-5">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {t.pricingTitle}
                </h2>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                  {t.pricingSubtitle}
                </p>
              </div>

              {/* Billing Period Toggle Switch */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 select-none">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-white dark:bg-neutral-800 text-orange-500 shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  {lang === "id" ? "Bulanan" : "Monthly"}
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    billingPeriod === "yearly"
                      ? "bg-white dark:bg-neutral-800 text-orange-500 shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>{lang === "id" ? "Tahunan" : "Yearly"}</span>
                  <span className="bg-orange-500/10 text-orange-500 dark:text-orange-400 px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide">
                    {lang === "id" ? "Hemat 20%" : "Save 20%"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white dark:bg-neutral-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative transition-all duration-500 ease-out hover:scale-[1.04] hover:-translate-y-3 ${
                    plan.popular 
                      ? "border-orange-500 dark:border-orange-500 ring-4 ring-orange-500/10 md:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-600 dark:hover:border-orange-400" 
                      : "border-neutral-100 dark:border-neutral-800 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/5 hover:bg-gradient-to-b hover:from-white hover:to-orange-500/5 dark:hover:from-neutral-900 dark:hover:to-orange-500/5"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md animate-bounce">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-neutral-900 dark:text-white">{plan.price}</span>
                        {plan.period && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-bold">{plan.period}</span>
                        )}
                        {plan.originalPrice && (
                          <span className="text-xs text-neutral-450 dark:text-neutral-500 line-through ml-1.5 font-bold">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold mt-1">
                        {plan.extraNote}
                      </p>
                    </div>

                    <ul className="space-y-3 pt-3 border-t border-neutral-50 dark:border-neutral-950">
                      {plan.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link href="/register">
                      <Button 
                        className={`w-full rounded-2xl py-5 text-xs font-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                          plan.popular 
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35" 
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {lang === "id" ? "Mulai Sekarang" : "Start Now"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Slider Section */}
        <section className="border-t border-slate-100 dark:border-neutral-900 px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.testiTitle}
              </h2>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                {t.testiSubtitle}
              </p>
            </div>

            {/* Slider Container */}
            <div className="relative max-w-5xl mx-auto">
              
              {/* Left/Right Navigation Buttons */}
              <button 
                onClick={prevSlide}
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all shadow-md z-20 border border-neutral-100 dark:border-neutral-800"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:hover:bg-orange-500 transition-all shadow-md z-20 border border-neutral-100 dark:border-neutral-800"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Slide Content (Grid of 3 Testimonials) */}
              <div className="grid gap-6 md:grid-cols-3 grid-cols-1 select-none transition-all duration-300">
                {currentGroup.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Stars */}
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <span key={i} className="text-lg">★</span>
                        ))}
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium italic min-h-[64px]">
                        "{item.quote}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-50 dark:border-neutral-950 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-xs">
                        {item.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-none">{item.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonialsGroups.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeSlide 
                      ? "w-6 bg-orange-500" 
                      : "w-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-slate-100 dark:border-neutral-900 bg-white dark:bg-neutral-900/40 px-5 py-20 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center space-y-2">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.faqTitle}
              </h2>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-md mx-auto">
                {t.faqSubtitle}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { q: t.faqQ1, a: t.faqA1 },
                { q: t.faqQ2, a: t.faqA2 },
                { q: t.faqQ3, a: t.faqA3 },
                { q: t.faqQ4, a: t.faqA4 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-2">
                  <h4 className="text-xs font-black text-neutral-900 dark:text-white flex items-start gap-2">
                    <span className="text-orange-500 text-sm">Q.</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium pl-4">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-5 py-20 bg-gradient-to-br from-neutral-900 to-neutral-950 dark:from-neutral-950 dark:to-neutral-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-orange-500/10 rounded-full blur-3xl -z-10" />
          <div className="mx-auto max-w-2xl space-y-6 relative z-10">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{t.ctaTitle}</h2>
            <div className="pt-2">
              <Link href="/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-sm font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {t.ctaButton}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 dark:border-neutral-900 py-8 bg-white dark:bg-neutral-950 px-5">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white font-extrabold text-[10px]">
              MQ
            </div>
            <span>MenuQR</span>
          </div>
          <div className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} MenuQR. {t.footerText}</span>
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> for Culinary Business
          </div>
        </div>
      </footer>
    </div>
  );
}
