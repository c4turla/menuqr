"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronDown,
  Menu,
  X,
  Star,
  TrendingUp,
  Clock,
  Ban,
  Store,
  LayoutDashboard,
  ArrowUp
} from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

// Types
type Language = "id" | "en";

// Translation data (extended for new sections)
const translations = {
  id: {
    // Nav
    navFeatures: "Fitur",
    navHowItWorks: "Cara Kerja",
    navPricing: "Harga",
    navTestimonials: "Testimoni",
    navFAQ: "FAQ",
    signIn: "Masuk",
    getStarted: "Mulai Gratis",

    // Hero
    heroBadge: "✨ Platform Menu QR Terbaik di Indonesia",
    heroTitle: "Ubah Antrean Panjang Menjadi ",
    heroTitleHighlight: "Pesanan Instan",
    heroSubtitle: "Jangan biarkan pelanggan menunggu. Dengan MenuQR, pembeli langsung pesan & pantau pesanan dari meja lewat HP mereka sendiri.",
    heroCtaPrimary: "Buat Menu Gratis Sekarang",
    heroCtaSecondary: "Lihat Cara Kerja",
    heroNoCreditCard: "Tanpa Kartu Kredit • Setup < 10 Menit",

    // Social Proof Bar
    stat1: "500+ Resto Bergabung",
    stat2: "10,000+ Pesanan/Hari",
    stat3: "Tingkat Kepuasan 99%",

    // Problem/Pain Point Section
    problemTitle: "Masih Menggunakan Cara Lama yang Bikin Pusing?",
    problemSubtitle: "Banyak outlet kuliner kehilangan pendapatan karena pelayanan yang lambat dan sistem kasir yang berantakan.",
    pain1Title: "Antrean Kasir Mengular",
    pain1Desc: "Pelanggan bosan menunggu lama hanya untuk memesan, berpotensi batal beli.",
    pain2Title: "Menu Kertas Mahal & Repot",
    pain2Desc: "Setiap ada perubahan harga atau menu baru, harus cetak ulang dengan biaya mahal.",
    pain3Title: "Pelayan Kewalahan",
    pain3Desc: "Mencatat manual sangat rawan pesanan salah, tertukar, atau terlewat.",
    pain4Title: "Pembeli Bertanya Terus",
    pain4Desc: "'Mas, pesanan saya sudah sampai mana?' Pertanyaan yang bikin sibuk dapur.",

    // Features list
    featuresBadge: "Solusi Lengkap",
    featuresTitle: "Kenapa Memilih MenuQR?",
    featuresSubtitle: "Segala fitur modern untuk meminimalisir kesalahan dan meningkatkan penjualan outlet kuliner Anda.",
    feat1Title: "Notifikasi Bunyi Live",
    feat1Desc: "Sistem kasir cerdas kami tidak hanya mencatat pesanan, tapi juga memberikan peringatan suara 'ping' nyaring secara real-time. Pelayan tak perlu memelototi layar, dapur bisa langsung mengeksekusi pesanan detik itu juga tanpa takut ada pesanan masuk yang terlewat.",
    feat2Title: "Integrasi Dapur (Kitchen Display)",
    feat2Desc: "Ubah sistem dapur Anda menjadi 100% digital tanpa kertas nota pesanan yang rawan hilang, basah, atau kotor. Setiap order pelanggan masuk secara simultan ke kasir dan layar dapur. Koki bisa langsung memasak, update status, dan mempercepat alur penyajian hidangan.",
    feat3Title: "Lacak Pesanan Mandiri",
    feat3Desc: "Hentikan teriakan pelanggan yang bertanya 'pesanan saya sudah sampai mana?'. Melalui link QR yang sama, pelanggan dapat melihat proses masak secara live (Menunggu Dikonfirmasi > Sedang Dimasak > Siap Disajikan) langsung dari layar smartphone mereka.",
    feat4Title: "Cetak Massal Meja",
    feat4Desc: "Buka cabang baru atau punya 50+ meja? Tidak perlu membuat QR Code satu per satu secara manual. Dengan generator massal kami, cukup masukkan kode awal (contoh: Meja VIP, Area Luar) dan cetak puluhan QR Code unik dalam satu kali klik. Sangat efisien!",
    feat5Title: "Order via WhatsApp",
    feat5Desc: "Belum siap sepenuhnya pakai layar di dapur? Tidak masalah. Pelanggan tetap bisa menyusun keranjang belanjaan mereka melalui scan QR, lalu keranjang tersebut otomatis diformat menjadi pesan teks rapi dan dikirim langsung ke WhatsApp restoran Anda.",
    feat6Title: "Dasbor Analitik Penjualan",
    feat6Desc: "Pahami apa yang disukai pelanggan Anda. Pantau hidangan paling laris (best-seller), lacak jumlah pesanan harian, dan evaluasi pendapatan bulanan dengan visualisasi grafik yang menarik. Ambil keputusan bisnis berdasarkan data riil yang ada.",

    // Steps list
    howItWorksTitle: "Digitalisasi Outlet Hanya Dalam 4 Langkah",
    howItWorksSubtitle: "Tidak perlu keahlian IT. Siapapun bisa membuat sistem pemesanan canggih.",
    step1Title: "Daftar Akun Gratis",
    step1Desc: "Buat akun restoran Anda kurang dari 30 detik. Tanpa kartu kredit, tanpa syarat.",
    step2Title: "Input Menu & Harga",
    step2Desc: "Upload foto makanan yang menggugah selera, deskripsi, kategori, serta atur harganya.",
    step3Title: "Cetak & Tempel QR",
    step3Desc: "Generate QR meja dari dasbor. Cetak dan letakkan di setiap meja restoran Anda.",
    step4Title: "Terima Pesanan",
    step4Desc: "Pelanggan scan, pesan, dan notifikasi langsung berbunyi di kasir/dapur Anda.",

    // Pricing details
    pricingTitle: "Investasi Super Murah untuk Bisnis Anda",
    pricingSubtitle: "Jauh lebih hemat daripada mempekerjakan kasir ekstra atau mencetak ulang buku menu tiap bulan.",
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

    // Testimonials
    testiTitle: "Testimoni Rekan Kuliner",
    testiSubtitle: "Dengarkan ulasan jujur dari pengusaha kuliner yang telah menghemat biaya operasional bersama MenuQR.",

    // FAQ
    faqTitle: "Pertanyaan Populer (FAQ)",
    faqSubtitle: "Hal-hal yang sering ditanyakan seputar sistem MenuQR.",
    faqQ1: "Apakah pelanggan harus mengunduh aplikasi untuk memesan?",
    faqA1: "Sama sekali tidak. Pelanggan cukup memindai (scan) QR Code meja menggunakan kamera HP, dan menu langsung terbuka di browser bawaan HP mereka (Safari/Chrome). Sangat praktis!",
    faqQ2: "Apakah saya membutuhkan perangkat kasir (POS) khusus?",
    faqA2: "Tidak. Halaman kelola pesanan dan POS kami berbasis web modern. Anda dapat mengaksesnya lewat Laptop, Tablet, PC, atau bahkan Smartphone yang sudah Anda miliki di kasir/dapur.",
    faqQ3: "Apakah ada biaya potongan komisi per transaksi pesanan?",
    faqA3: "Sama sekali TIDAK. Kami tidak memotong omset penjualan Anda atau mengenakan biaya per transaksi. Anda berhak menerima 100% pendapatan Anda. Anda hanya membayar biaya langganan flat per bulan sesuai paket yang dipilih.",
    faqQ4: "Apakah MenuQR mendukung pilihan Makan di Tempat (Dine-in) atau Bungkus (Takeaway)?",
    faqA4: "Ya, tentu saja! Bagi pengguna paket Basic dan Pro, pelanggan Anda dapat memilih metode 'Makan di Tempat' atau 'Bungkus' langsung di menu publik saat checkout, dan pesanan masuk akan langsung ditandai dengan badge khusus.",
    faqQ5: "Bagaimana dengan notifikasi suara jika ada pesanan baru masuk?",
    faqA5: "Setiap kali pelanggan menekan tombol kirim pesanan, sistem kasir/kitchen POS Anda akan otomatis membunyikan alarm suara bel (live ping chime) secara real-time agar pelayan atau koki Anda tidak melewatkan pesanan masuk.",
    faqQ6: "Apakah dasbor analitik penjualan tersedia untuk melacak pendapatan?",
    faqA6: "Ya! Pengguna paket Pro akan memiliki akses ke Dasbor Analitik Penjualan canggih untuk melihat grafik pesanan harian, pendapatan bulanan, melacak menu paling laris (best-seller), dan nilai rata-rata transaksi secara real-time.",

    // Final CTA
    ctaTitle: "Tingkatkan Omzet Restoran Anda Hari Ini Juga",
    ctaSubtitle: "Bergabung dengan ratusan pengusaha kuliner yang telah mendigitalisasi operasional mereka. Mulai dari Rp 0, tanpa risiko.",
    ctaButton: "Coba MenuQR Sekarang",

    // Footer
    footerProduct: "Produk",
    footerResources: "Sumber Daya",
    footerCompany: "Perusahaan",
    footerTerms: "Syarat Ketentuan",
    footerPrivacy: "Privasi",
    footerRefund: "Kebijakan Refund",
    footerContact: "Hubungi Kami",
    footerText: "Dibuat dengan ❤️ untuk UMKM Kuliner Indonesia.",
  },
  en: {
    // Nav
    navFeatures: "Features",
    navHowItWorks: "How it Works",
    navPricing: "Pricing",
    navTestimonials: "Reviews",
    navFAQ: "FAQ",
    signIn: "Sign In",
    getStarted: "Start Free",

    // Hero
    heroBadge: "✨ The Ultimate QR Menu Platform",
    heroTitle: "Turn Long Lines Into ",
    heroTitleHighlight: "Instant Orders",
    heroSubtitle: "Stop making customers wait. With MenuQR, diners order & track their meals directly from their table using their own smartphones.",
    heroCtaPrimary: "Create Free Menu Now",
    heroCtaSecondary: "See How It Works",
    heroNoCreditCard: "No Credit Card • Setup < 10 Mins",

    // Social Proof Bar
    stat1: "500+ Restaurants Joined",
    stat2: "10,000+ Daily Orders",
    stat3: "99% Satisfaction Rate",

    // Problem/Pain Point Section
    problemTitle: "Still Using the Stressful Old Way?",
    problemSubtitle: "Many culinary outlets lose revenue due to slow service and messy order management.",
    pain1Title: "Long Cashier Lines",
    pain1Desc: "Customers get frustrated waiting just to place an order, leading to walk-outs.",
    pain2Title: "Expensive Paper Menus",
    pain2Desc: "Every time prices change or new items arrive, you must reprint menus at high costs.",
    pain3Title: "Overwhelmed Staff",
    pain3Desc: "Manual note-taking is highly prone to errors, wrong items, or missed orders.",
    pain4Title: "Constant Customer Questions",
    pain4Desc: "'Excuse me, how much longer for my food?' – distracting your busy kitchen.",

    // Features list
    featuresBadge: "Complete Solution",
    featuresTitle: "Why Choose MenuQR?",
    featuresSubtitle: "Modern features designed to minimize errors and maximize your outlet's sales.",
    feat1Title: "Live Sound Alerts",
    feat1Desc: "Our smart POS system doesn't just log orders; it plays a loud 'ping' sound in real-time. Your staff doesn't need to constantly stare at screens, and the kitchen can execute orders instantly without the fear of missing incoming tickets.",
    feat2Title: "Kitchen Display Integration",
    feat2Desc: "Transform your kitchen into a 100% paperless zone. Say goodbye to lost, wet, or messy paper order tickets. Every customer order syncs simultaneously to the cashier and kitchen screens. Chefs can cook, update statuses, and speed up serving times.",
    feat3Title: "Self-Order Tracking",
    feat3Desc: "Stop customers from constantly asking 'where is my food?'. Through the same scanned QR link, diners can monitor their meal's cooking progress live (Waiting > Cooking > Ready to Serve) directly from their smartphone screen, giving them peace of mind.",
    feat4Title: "Bulk Table QR Printing",
    feat4Desc: "Opening a new branch or managing 50+ tables? No need to generate QR codes one by one. With our bulk generator, simply input your prefix (e.g., VIP Table, Outdoor) and print dozens of unique table QR codes in a single click. Incredibly efficient!",
    feat5Title: "WhatsApp Checkout",
    feat5Desc: "Not ready to use digital kitchen screens yet? No problem. Customers can still build their shopping cart via the QR menu, and it will be automatically formatted into a neat text message sent directly to your restaurant's WhatsApp for confirmation.",
    feat6Title: "Sales Analytics Dashboard",
    feat6Desc: "Understand what your customers truly love. Monitor your best-selling dishes, track daily order volumes, and evaluate monthly revenue with visually appealing charts. Make critical business decisions based on real, actionable data.",

    // Steps list
    howItWorksTitle: "Go Digital in Just 4 Steps",
    howItWorksSubtitle: "No IT skills required. Anyone can set up this advanced ordering system.",
    step1Title: "Register for Free",
    step1Desc: "Create your restaurant account in under 30 seconds. No credit card required.",
    step2Title: "Add Menu & Prices",
    step2Desc: "Upload appetizing food photos, write descriptions, organize categories, and set prices.",
    step3Title: "Print & Place QRs",
    step3Desc: "Generate table QRs from the dashboard. Print and place them on every table.",
    step4Title: "Start Receiving Orders",
    step4Desc: "Customers scan, order, and notifications instantly ring at your cashier/kitchen.",

    // Pricing details
    pricingTitle: "Incredibly Affordable Investment",
    pricingSubtitle: "Much cheaper than hiring extra cashiers or reprinting menu books every month.",
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

    // Testimonials
    testiTitle: "Trusted by Culinary Business Owners",
    testiSubtitle: "Hear honest reviews from culinary entrepreneurs who slashed operational costs with MenuQR.",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Quick answers to common questions about the MenuQR system.",
    faqQ1: "Do customers need to download an app to order?",
    faqA1: "Not at all. Customers simply scan the table QR Code using their phone's camera, and the menu opens instantly in their native mobile browser (Safari/Chrome). Incredibly simple!",
    faqQ2: "Do I need special POS hardware?",
    faqA2: "No. Our order management and POS system are web-based. You can access it using any Laptop, Tablet, PC, or Smartphone you already own at the cashier or kitchen.",
    faqQ3: "Is there any transaction fee or commission per order?",
    faqA3: "Absolutely NOT. We do not take any commission cuts from your sales. You keep 100% of your revenue. You only pay a flat monthly subscription based on your plan.",
    faqQ4: "Does MenuQR support Dine-in or Takeaway options?",
    faqA4: "Yes, indeed! For Basic and Pro plan users, your customers can choose 'Dine-in' or 'Takeaway' directly in the public menu during checkout, and the incoming order will be marked with a dedicated badge.",
    faqQ5: "How does the notification sound alert work for new orders?",
    faqA5: "Every time a customer submits an order, your cashier/kitchen POS dashboard will instantly play a loud chime sound alert in real-time, ensuring your staff never misses an incoming order.",
    faqQ6: "Is there a sales analytics dashboard to track revenues?",
    faqA6: "Yes! Pro plan users get access to an advanced Sales Analytics Dashboard to view daily order trends, monthly revenues, track best-seller dishes, and average transaction values.",

    // Final CTA
    ctaTitle: "Boost Your Restaurant Revenue Today",
    ctaSubtitle: "Join hundreds of culinary entrepreneurs who have digitized their operations. Start from $0, completely risk-free.",
    ctaButton: "Try MenuQR Now",

    // Footer
    footerProduct: "Product",
    footerResources: "Resources",
    footerCompany: "Company",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerRefund: "Refund Policy",
    footerContact: "Contact",
    footerText: "Made with ❤️ for Culinary SMEs.",
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("id");
  const [activeSlide, setActiveSlide] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("menuqr-lang") as Language;
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("menuqr-lang", newLang);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 64; // Header height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth"
      });
    }
  };

  const t = translations[lang];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Owner Warkop Sahabat",
      quote: lang === "id"
        ? "Setelah pakai MenuQR, antrean kasir berkurang drastis. Notifikasi suara ping-nya sangat membantu dapur! Omzet naik karena turn-over meja lebih cepat."
        : "After using MenuQR, cashier queues dropped drastically. The ping sound alert helps our kitchen! Revenue increased due to faster table turnover.",
      stars: 5,
    },
    {
      name: "Sarah Wijaya",
      role: "Manager Sarah Cafe",
      quote: lang === "id"
        ? "Fitur lacak pesanan membuat pelanggan tenang. Cetak massal QR mejanya super cepat. Gak perlu lagi bolak-balik meja cuma buat catat pesanan."
        : "The order tracking reassures customers. Batch QR printing is super fast. No more running back and forth to tables just to take orders.",
      stars: 5,
    },
    {
      name: "Rian Hidayat",
      role: "Owner Resto Sederhana",
      quote: lang === "id"
        ? "Kami beralih dari menu cetak yang mahal ke MenuQR. Update harga tinggal klik, hemat biaya cetak jutaan rupiah per bulan! Sangat worth it."
        : "We switched from expensive printed menus. Updating prices takes one click, saving millions of rupiah in print costs monthly! Very worth it.",
      stars: 5,
    },
    {
      name: "Amanda Putri",
      role: "Founder Kopi Senja",
      quote: lang === "id"
        ? "Tampilan menunya sangat mobile-friendly. Pelanggan milenial kami sangat suka memesan kopi lewat scan QR ini. Modern dan praktis."
        : "The menu UI is very mobile-friendly. Our millennial customers love ordering their coffee by scanning the QR. Modern and practical.",
      stars: 5,
    },
    {
      name: "David Kurnia",
      role: "Owner David Steakhouse",
      quote: lang === "id"
        ? "Sistem POS terintegrasi dapur membuat pesanan terkirim instan tanpa salah catat. Human error turun drastis, komplain pelanggan hilang."
        : "The integrated kitchen POS delivers orders instantly without typos. Human error dropped drastically, customer complaints disappeared.",
      stars: 5,
    },
    {
      name: "Linda Lestari",
      role: "Owner Dapur Nenek",
      quote: lang === "id"
        ? "Paket langganannya sangat terjangkau dibanding efisiensi yang didapat. Sama seperti mempekerjakan asisten kasir 24 jam tapi nyaris gratis!"
        : "The subscription is very affordable compared to the efficiency gained. It's like hiring a 24-hour cashier assistant but almost for free!",
      stars: 5,
    }
  ];

  const testimonialsGroups = [
    [testimonials[0], testimonials[1], testimonials[2]],
    [testimonials[3], testimonials[4], testimonials[5]]
  ];

  // Auto-play testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonialsGroups.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonialsGroups.length]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-neutral-950 font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100 overflow-x-hidden">

      {/* Background Decorators */}
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] max-w-full bg-gradient-to-br from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-[100px] opacity-80" />
      <div className="absolute top-[800px] left-0 -z-10 h-[400px] w-[400px] max-w-full bg-gradient-to-tr from-purple-500/10 via-orange-500/5 to-transparent rounded-full blur-[100px] opacity-60" />

      {/* Modern Navigation Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-neutral-200/50 dark:border-neutral-800/50 shadow-sm"
          : "bg-transparent border-transparent"
          }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-50">
            <div className="relative h-9 w-32 shrink-0">
              <Image src="/lightmode.webp" alt="MenuQR Logo" fill sizes="128px" className="object-contain dark:hidden" />
              <Image src="/darkmode.webp" alt="MenuQR Logo" fill sizes="128px" className="object-contain hidden dark:block" />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-sm font-semibold text-neutral-600 hover:text-orange-500 dark:text-neutral-300 dark:hover:text-orange-400 transition-colors">
              {t.navFeatures}
            </a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-sm font-semibold text-neutral-600 hover:text-orange-500 dark:text-neutral-300 dark:hover:text-orange-400 transition-colors">
              {t.navHowItWorks}
            </a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="text-sm font-semibold text-neutral-600 hover:text-orange-500 dark:text-neutral-300 dark:hover:text-orange-400 transition-colors">
              {t.navPricing}
            </a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, "testimonials")} className="text-sm font-semibold text-neutral-600 hover:text-orange-500 dark:text-neutral-300 dark:hover:text-orange-400 transition-colors">
              {t.navTestimonials}
            </a>
          </nav>

          {/* Actions & Lang Switcher */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all shadow-sm group"
            >
              <Globe className="h-3.5 w-3.5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
              <span className="uppercase">{lang}</span>
            </button>

            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

            <Link href="/login" className="text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:text-orange-500 transition-colors">
              {t.signIn}
            </Link>
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-bold px-5 h-9 shadow-md shadow-orange-500/20 hover:shadow-lg transition-all">
                {t.getStarted}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 text-neutral-900 dark:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`md:hidden absolute top-16 left-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-[400px] opacity-100 shadow-xl" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col p-5 space-y-4">
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-base font-semibold text-neutral-900 dark:text-white py-2 border-b border-neutral-100 dark:border-neutral-900">
              {t.navFeatures}
            </a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-base font-semibold text-neutral-900 dark:text-white py-2 border-b border-neutral-100 dark:border-neutral-900">
              {t.navHowItWorks}
            </a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="text-base font-semibold text-neutral-900 dark:text-white py-2 border-b border-neutral-100 dark:border-neutral-900">
              {t.navPricing}
            </a>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => handleLangChange(lang === "id" ? "en" : "id")}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm font-bold"
              >
                <Globe className="h-4 w-4 text-orange-500" />
                <span className="uppercase">Language: {lang}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-xl h-12 font-bold text-base">
                  {t.signIn}
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold text-base shadow-md shadow-orange-500/20">
                  {t.getStarted}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Sales-Oriented Hero Section */}
        <section className="relative px-5 pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="mx-auto max-w-5xl text-center space-y-8 relative z-10">
            {/* Animated Badge */}
            <div className="inline-flex animate-in slide-in-from-bottom-4 fade-in duration-700">
              <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest backdrop-blur-sm">
                {t.heroBadge}
              </Badge>
            </div>

            {/* Pain-Agitating Headline */}
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-7xl max-w-4xl mx-auto leading-[1.15] sm:leading-[1.1] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
              {t.heroTitle}
              <span className="relative inline-block px-2">
                <span className="relative z-10 text-orange-500 dark:text-orange-400">
                  {t.heroTitleHighlight}
                </span>
                <span className="absolute bottom-1.5 left-0 w-full h-3 sm:h-5 bg-orange-500/20 -z-10 -rotate-1 skew-x-12 rounded-sm" />
              </span>
            </h1>

            {/* Benefit-Driven Subtitle */}
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
              {t.heroSubtitle}
            </p>

            {/* High-Conversion CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-14 text-base font-black shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all group">
                  {t.heroCtaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-bold border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                  {t.heroCtaSecondary}
                </Button>
              </a>
            </div>

            {/* Trust Signal */}
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2 animate-in fade-in duration-1000 delay-500">
              <Check className="h-3.5 w-3.5 text-green-500" />
              {t.heroNoCreditCard}
            </p>
          </div>

          {/* Social Proof / Trust Bar - VERY IMPORTANT FOR SALES */}
          <div className="mx-auto max-w-5xl mt-20 pt-10 border-t border-neutral-200/50 dark:border-neutral-800/50 animate-in fade-in duration-1000 delay-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/50 dark:divide-neutral-800/50">
              <div className="flex flex-col items-center justify-center py-4 sm:py-0 space-y-2">
                <Store className="h-6 w-6 text-orange-500" />
                <p className="text-2xl font-black text-neutral-900 dark:text-white">{t.stat1.split(' ')[0]}</p>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{t.stat1.split(' ').slice(1).join(' ')}</p>
              </div>
              <div className="flex flex-col items-center justify-center py-4 sm:py-0 space-y-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <p className="text-2xl font-black text-neutral-900 dark:text-white">{t.stat2.split(' ')[0]}</p>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{t.stat2.split(' ').slice(1).join(' ')}</p>
              </div>
              <div className="flex flex-col items-center justify-center py-4 sm:py-0 space-y-2">
                <div className="flex gap-1 text-orange-500"><Star className="h-6 w-6 fill-orange-500" /></div>
                <p className="text-2xl font-black text-neutral-900 dark:text-white">{t.stat3.split(' ')[0]}</p>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{t.stat3.split(' ').slice(1).join(' ')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Agitation Section (PAS Formula) */}
        <section className="bg-neutral-900 dark:bg-neutral-950 py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
          <div className="mx-auto max-w-5xl px-5 relative z-10">
            <FadeIn direction="up" className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {t.problemTitle}
              </h2>
              <p className="text-base text-neutral-400 font-medium">
                {t.problemSubtitle}
              </p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Clock, title: t.pain1Title, desc: t.pain1Desc },
                { icon: Ban, title: t.pain2Title, desc: t.pain2Desc },
                { icon: Check, title: t.pain3Title, desc: t.pain3Desc },
                { icon: Volume2, title: t.pain4Title, desc: t.pain4Desc },
              ].map((pain, idx) => (
                <FadeIn key={idx} delay={idx * 120} direction="up">
                  <div className="h-full bg-neutral-800/50 border border-neutral-700/50 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 hover:bg-neutral-800 transition-colors">
                    <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                      <pain.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">{pain.title}</h3>
                    <p className="text-sm text-neutral-400">{pain.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section (Solution) */}
        <section id="features" className="py-20 lg:py-28 bg-white dark:bg-neutral-900/20 relative">
          <div className="mx-auto max-w-6xl px-5">
            <FadeIn direction="up" className="text-center max-w-3xl mx-auto space-y-5 mb-16">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 hover:bg-orange-100 hover:text-orange-700 border-none px-3 py-1 text-xs font-bold uppercase tracking-widest">
                {t.featuresBadge}
              </Badge>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.featuresTitle}
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                {t.featuresSubtitle}
              </p>
            </FadeIn>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Volume2, title: t.feat1Title, desc: t.feat1Desc, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "hover:border-blue-500/30" },
                { icon: LayoutDashboard, title: t.feat2Title, desc: t.feat2Desc, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", border: "hover:border-orange-500/30" },
                { icon: Smartphone, title: t.feat3Title, desc: t.feat3Desc, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", border: "hover:border-purple-500/30" },
                { icon: QrCode, title: t.feat4Title, desc: t.feat4Desc, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-500/30" },
                { icon: Smartphone, title: t.feat5Title, desc: t.feat5Desc, color: "bg-green-500/10 text-green-600 dark:text-green-400", border: "hover:border-green-500/30" },
                { icon: TrendingUp, title: t.feat6Title, desc: t.feat6Desc, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "hover:border-rose-500/30" },
              ].map((f, idx) => (
                <FadeIn key={idx} delay={idx * 100} direction="up">
                  <Card
                    className={`h-full bg-white dark:bg-neutral-900/80 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 group ${f.border}`}
                  >
                    <CardHeader className="p-0 space-y-5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.color} transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                        <f.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-2.5">
                        <CardTitle className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                          {f.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                          {f.desc}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 relative">
          <div className="mx-auto max-w-5xl px-5">
            <FadeIn direction="up" className="text-center max-w-2xl mx-auto space-y-5 mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.howItWorksTitle}
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400">
                {t.howItWorksSubtitle}
              </p>
            </FadeIn>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
              {/* Connector line for desktop */}
              <div className="absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/50 to-orange-500/20 -z-10 hidden lg:block rounded-full" />

              {[
                { step: "1", title: t.step1Title, desc: t.step1Desc },
                { step: "2", title: t.step2Title, desc: t.step2Desc },
                { step: "3", title: t.step3Title, desc: t.step3Desc },
                { step: "4", title: t.step4Title, desc: t.step4Desc },
              ].map((s, i) => (
                <FadeIn key={i} delay={i * 150} direction="up">
                  <div className="h-full relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl p-6 text-center space-y-5 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 group">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xl font-black shadow-lg shadow-orange-500/25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 relative z-10">
                      {s.step}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-neutral-900 dark:text-white">
                        {s.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - Highly Optimized for Sales */}
        <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-900 relative">
          <div className="absolute top-0 right-1/2 translate-x-1/2 -z-10 h-[600px] w-[800px] bg-orange-500/5 rounded-full blur-[100px]" />

          <div className="mx-auto max-w-6xl px-5">
            <FadeIn direction="up" className="text-center max-w-3xl mx-auto space-y-6 mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.pricingTitle}
              </h2>
              <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400">
                {t.pricingSubtitle}
              </p>

              {/* Advanced Toggle Switch */}
              <div className="inline-flex items-center p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-inner mt-4">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${billingPeriod === "monthly"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                  {t.pricingToggleMonthly}
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billingPeriod === "yearly"
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                >
                  {t.pricingToggleYearly}
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider animate-pulse">
                    {t.pricingSave}
                  </span>
                </button>
              </div>
            </FadeIn>

            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto items-center">
              {/* Free Plan */}
              <FadeIn direction="up" delay={0}>
              <div className="bg-gradient-to-br from-white to-white hover:from-white hover:to-orange-500/5 dark:from-neutral-900 dark:to-neutral-900 dark:hover:from-neutral-900 dark:hover:to-orange-500/5 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 h-fit cursor-pointer">
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white">{t.freeName}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-neutral-900 dark:text-white">{t.freePrice}</span>
                  </div>
                  <p className="text-sm text-neutral-500 font-medium">{t.freeDesc}</p>
                </div>
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl py-6 text-sm font-bold border-2 mb-8 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    {t.getStarted}
                  </Button>
                </Link>
                <ul className="space-y-4">
                  {t.freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                      <Check className="h-5 w-5 text-neutral-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              </FadeIn>

              {/* Basic Plan (Popular) */}
              <FadeIn direction="up" delay={150}>
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-900 hover:from-neutral-900 hover:to-orange-950/20 border-2 border-orange-500 rounded-[2rem] p-8 shadow-2xl shadow-orange-500/25 relative transform lg:-translate-y-4 hover:-translate-y-6 hover:scale-[1.03] z-10 text-white transition-all duration-300 cursor-pointer hover:shadow-orange-500/35">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  {t.basicBadge}
                </div>
                <div className="space-y-4 mb-8 pt-2">
                  <h3 className="text-xl font-black text-white">{t.basicName}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">
                      {billingPeriod === "yearly" ? t.basicPriceYearly : t.basicPrice}
                    </span>
                    <span className="text-neutral-400 font-bold">{t.basicPeriod}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <div className="text-sm font-bold text-orange-400 line-through opacity-80">
                      {t.basicPrice} / bln
                    </div>
                  )}
                  <p className="text-sm text-neutral-400 font-medium">{t.basicDesc}</p>
                </div>
                <Link href="/register">
                  <Button className="w-full rounded-xl py-6 text-sm font-black bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all mb-8">
                    {t.getStarted}
                  </Button>
                </Link>
                <ul className="space-y-4">
                  {t.basicFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-200 font-medium">
                      <Check className="h-5 w-5 text-orange-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              </FadeIn>

              {/* Pro Plan */}
              <FadeIn direction="up" delay={300}>
              <div className="bg-gradient-to-br from-white to-white hover:from-white hover:to-orange-500/5 dark:from-neutral-900 dark:to-neutral-900 dark:hover:from-neutral-900 dark:hover:to-orange-500/5 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 h-fit relative cursor-pointer">
                <div className="absolute top-6 right-6">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-none px-2.5 py-0.5">{t.proBadge}</Badge>
                </div>
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white">{t.proName}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-neutral-900 dark:text-white">
                      {billingPeriod === "yearly" ? t.proPriceYearly : t.proPrice}
                    </span>
                    <span className="text-neutral-500 font-bold">{t.proPeriod}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <div className="text-sm font-bold text-neutral-400 line-through">
                      {t.proPrice} / bln
                    </div>
                  )}
                  <p className="text-sm text-neutral-500 font-medium">{t.proDesc}</p>
                </div>
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl py-6 text-sm font-bold border-2 mb-8 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    {t.getStarted}
                  </Button>
                </Link>
                <ul className="space-y-4">
                  {t.proFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-300 font-medium">
                      <Check className="h-5 w-5 text-neutral-900 dark:text-white shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Testimonials Slider */}
        <section id="testimonials" className="py-20 lg:py-28 bg-slate-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900">
          <div className="mx-auto max-w-6xl px-5">
            <FadeIn direction="up" className="text-center max-w-2xl mx-auto space-y-5 mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.testiTitle}
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400">
                {t.testiSubtitle}
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={100} className="relative">
              <div className="grid gap-6 md:grid-cols-3 transition-all duration-500">
                {testimonialsGroups[activeSlide].map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex gap-1">
                        {Array.from({ length: item.stars }).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic">
                        "{item.quote}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-inner">
                        {item.name[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-neutral-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-10">
                {testimonialsGroups.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide ? "w-8 bg-orange-500" : "w-2.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                      }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-28 bg-white dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-900">
          <div className="mx-auto max-w-4xl px-5">
            <FadeIn direction="up" className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                {t.faqTitle}
              </h2>
              <p className="text-base text-neutral-500 dark:text-neutral-400">
                {t.faqSubtitle}
              </p>
            </FadeIn>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { q: t.faqQ1, a: t.faqA1 },
                { q: t.faqQ2, a: t.faqA2 },
                { q: t.faqQ3, a: t.faqA3 },
                { q: t.faqQ4, a: t.faqA4 },
                { q: t.faqQ5, a: t.faqA5 },
                { q: t.faqQ6, a: t.faqA6 },
              ].map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-slate-50 dark:bg-neutral-900/50 border rounded-3xl p-6 transition-all duration-300 ${
                      isOpen
                        ? "border-orange-500/50 bg-white dark:bg-neutral-900 shadow-md"
                        : "border-neutral-200/60 dark:border-neutral-800/60 hover:bg-white dark:hover:bg-neutral-900/80 hover:border-neutral-300"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-base font-black text-neutral-900 dark:text-white group focus:outline-none cursor-pointer"
                    >
                      <span className="flex items-start gap-3">
                        <span className="text-orange-500 text-lg font-black">Q.</span>
                        <span className="pt-0.5 group-hover:text-orange-500 transition-colors">{item.q}</span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-neutral-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? "transform rotate-180 text-orange-500" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium pl-8 border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final Hard CTA Section */}
        <section className="px-5 py-24 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black dark:from-neutral-950 dark:to-black text-white text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-orange-500/20 rounded-full blur-[120px] -z-10" />

          <FadeIn direction="up" className="mx-auto max-w-3xl space-y-8 relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-lg md:text-xl text-neutral-400 font-medium max-w-2xl mx-auto">
              {t.ctaSubtitle}
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-10 h-16 text-lg font-black shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all">
                  {t.ctaButton}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest mt-6">
              {t.heroNoCreditCard}
            </p>
          </FadeIn>
        </section>
      </main>

      {/* Comprehensive Footer */}
      <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 pt-16 pb-8 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {/* Brand Col */}
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative h-10 w-36 shrink-0">
                  <Image src="/lightmode.webp" alt="MenuQR Logo" fill sizes="144px" className="object-contain dark:hidden" />
                  <Image src="/darkmode.webp" alt="MenuQR Logo" fill sizes="144px" className="object-contain hidden dark:block" />
                </div>
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-xs leading-relaxed">
                Platform digitalisasi menu dan kasir terbaik untuk UMKM kuliner. Mudah, cepat, dan terjangkau.
              </p>
              <div className="flex items-center gap-4">
                {/* Social placeholders */}
                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-orange-100 hover:text-orange-500 cursor-pointer transition-colors">X</div>
                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-orange-100 hover:text-orange-500 cursor-pointer transition-colors">IG</div>
                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-orange-100 hover:text-orange-500 cursor-pointer transition-colors">FB</div>
              </div>
            </div>

            {/* Links Cols */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{t.footerProduct}</h4>
              <ul className="space-y-3">
                <li><a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.navFeatures}</a></li>
                <li><a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.navPricing}</a></li>
                <li><a href="#testimonials" onClick={(e) => scrollToSection(e, "testimonials")} className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.navTestimonials}</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{t.footerResources}</h4>
              <ul className="space-y-3">
                <li><a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.navHowItWorks}</a></li>
                <li><a href="#faq" onClick={(e) => scrollToSection(e, "faq")} className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.navFAQ}</a></li>
                <li><Link href="/login" className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.signIn}</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{t.footerCompany}</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.footerTerms}</Link></li>
                <li><Link href="/privacy" className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.footerPrivacy}</Link></li>
                <li><Link href="/refund" className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.footerRefund}</Link></li>
                <li><Link href="/contact" className="text-sm text-neutral-500 hover:text-orange-500 font-medium transition-colors">{t.footerContact}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500 font-semibold">
              &copy; {new Date().getFullYear()} MenuQR. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500 font-semibold flex items-center gap-1.5">
              {t.footerText.split('❤️')[0]}
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              {t.footerText.split('❤️')[1]}
            </p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 animate-in fade-in zoom-in-75 duration-200 border border-orange-400/20"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
