"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Globe,
  Store,
  ShoppingBag,
  Grid3X3,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  QrCode,
  Users,
  Settings2,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const helpTranslations = {
  id: {
    title: "Pusat Bantuan",
    subtitle: "Temukan jawaban dan panduan untuk menggunakan MenuQR.",
    searchPlaceholder: "Cari bantuan...",
    quickStart: "Panduan Memulai",
    quickStartDesc: "Langkah-langkah cepat untuk mulai menggunakan MenuQR.",
    features: "Panduan Fitur",
    featuresDesc: "Pelajari cara menggunakan setiap fitur MenuQR.",
    faq: "Pertanyaan Umum",
    faqDesc: "Jawaban untuk pertanyaan yang sering ditanyakan.",
    plans: "Paket & Fitur",
    plansDesc: "Bandingkan fitur setiap paket/langganan.",
    contact: "Hubungi Kami",
    contactDesc: "Butuh bantuan tambahan? Hubungi tim kami.",
    step1Title: "Buat Outlet Pertama",
    step1Desc: "Buka menu Outlet, klik 'Buat Outlet Baru', isi nama, slug, dan deskripsi restoran Anda.",
    step2Title: "Tambah Kategori Menu",
    step2Desc: "Di menu Kategori, buat kategori seperti 'Makanan', 'Minuman', atau 'Dessert' untuk mengorganisir menu.",
    step3Title: "Tambah Item Menu",
    step3Desc: "Di menu Menu Makanan, tambahkan item dengan nama, harga, deskripsi, dan gambar. Atur ke kategori yang sesuai.",
    step4Title: "Generate QR Code",
    step4Desc: "Buka halaman QR di Outlet Anda, sesuaikan desain, lalu cetak atau unduh QR code untuk ditempel di meja.",
    featureOutlets: "Outlet / Restoran",
    featureOutletsDesc: "Kelola restoran Anda: lihat daftar, edit info, ubah paket, dan buka QR code.",
    featureCategories: "Kategori",
    featureCategoriesDesc: "Buat dan kelola kategori menu untuk mengorganisir makanan & minuman Anda.",
    featureMenu: "Menu Makanan",
    featureMenuDesc: "Tambah, edit, hapus item menu. Atur tampilan, harga, dan статус (aktif/nonaktif).",
    featureOrders: "Pesanan POS",
    featureOrdersDesc: "Terima pesanan langsung via QR table. Hanya tersedia untuk paket Basic & Pro.",
    featureBilling: "Billing & Paket",
    featureBillingDesc: "Lihat dan ubah paketlangganan (Free, Basic, Pro). Upgrade kapan saja.",
    featureAnalytics: "Dashboard Analitik",
    featureAnalyticsDesc: "Lihat statistik views, scan QR, dan item populer. Hanya untuk paket Pro.",
    featureDomain: "Domain Kustom",
    featureDomainDesc: "Hubungkan domain kustom untuk restoran Anda. Hanya untuk paket Pro.",
    featureQr: "QR Code Generator",
    featureQrDesc: "Generate dan custom QR code untuk menu atau meja. Paket Basic+ bisa tambahkan nomor meja.",
    faqQ1: "Apa itu MenuQR?",
    faqA1: "MenuQR adalah platform menu digital berbasis QR code. Restoran dapat membuat menu digital, menghasilkan QR code, dan pelanggan dapat melihat menu serta memesan langsung via QR table.",
    faqQ2: "Bagaimana cara memulai?",
    faqA2: "Buat outlet/restoran terlebih dahulu di menu Outlet. Lalu tambahkan kategori dan item menu. Terakhir, generate QR code dan tempelkan di meja pelanggan.",
    faqQ3: "Apakah saya perlu bayar?",
    faqA3: "Tidak! Paket Free tersedia gratis dengan fitur dasar. Kami juga menyediakan paket Basic (Rp 50.000/bulan) dan Pro (Rp 150.000/bulan) dengan fitur lebih lengkap.",
    faqQ4: "Bagaimana cara upgrade paket?",
    faqA4: "Buka menu Billing, pilih restoran, lalu klik paket yang diinginkan. Sistem saat ini dalam mode uji coba — semua upgrade langsung dan gratis.",
    faqQ5: "Apakah data saya aman?",
    faqA5: "Ya. Semua data disimpan dengan aman di database kami. Kami tidak membagikan data restoran kepada pihak ketiga.",
    faqQ6: "Bagaimana jika saya lupa password?",
    faqA6: "Klik 'Lupa Password' di halaman login. Kami akan kirim link reset ke email Anda.",
    planFree: "Paket Free",
    planFreeFeatures: ["1 Restoran", "5 Kategori", "20 Item Menu", "QR Code Dasar", "WhatsApp Checkout"],
    planBasic: "Paket Basic",
    planBasicFeatures: ["3 Restoran", "Kategori Unlimited", "Menu Unlimited", "QR Table + Nomor Meja", "Custom QR Design", "Analitik Dasar"],
    planPro: "Paket Pro",
    planProFeatures: ["Restoran Unlimited", "Kategori & Menu Unlimited", "QR Table + Nomor Meja", "Custom QR Design", "Analitik Lanjutan", "Domain Kustom", "Dukungan Prioritas"],
    contactEmail: "Email",
    contactEmailDesc: "Kirimi kami email di hello@menuqr.my.id",
    contactWhatsapp: "WhatsApp",
    contactWhatsappDesc: "Chat langsung dengan tim kami",
    contactDocs: "Dokumentasi",
    contactDocsDesc: "Pelajari lebih lanjut di dokumentasi kami",
    copied: "Disalin!",
    relatedLinks: "Tautan Terkait",
  },
  en: {
    title: "Help Center",
    subtitle: "Find answers and guides for using MenuQR.",
    searchPlaceholder: "Search help...",
    quickStart: "Getting Started",
    quickStartDesc: "Quick steps to start using MenuQR.",
    features: "Feature Guides",
    featuresDesc: "Learn how to use each MenuQR feature.",
    faq: "Frequently Asked Questions",
    faqDesc: "Answers to common questions.",
    plans: "Plans & Features",
    plansDesc: "Compare features across subscription plans.",
    contact: "Contact Us",
    contactDesc: "Need more help? Reach out to our team.",
    step1Title: "Create Your First Outlet",
    step1Desc: "Go to Outlets menu, click 'Create New Outlet', fill in name, slug, and restaurant description.",
    step2Title: "Add Menu Categories",
    step2Desc: "In Categories menu, create categories like 'Food', 'Drinks', or 'Desserts' to organize your menu.",
    step3Title: "Add Menu Items",
    step3Desc: "In Menus menu, add items with name, price, description, and image. Assign to appropriate category.",
    step4Title: "Generate QR Code",
    step4Desc: "Open QR page in your Outlet, customize design, then print or download the QR code to place on tables.",
    featureOutlets: "Outlets / Restaurants",
    featureOutletsDesc: "Manage your restaurants: view list, edit info, change plans, and access QR codes.",
    featureCategories: "Categories",
    featureCategoriesDesc: "Create and manage menu categories to organize your food & drinks.",
    featureMenu: "Food Menus",
    featureMenuDesc: "Add, edit, delete menu items. Arrange display, prices, and status (active/inactive).",
    featureOrders: "POS Orders",
    featureOrdersDesc: "Receive orders directly via QR table. Only available for Basic & Pro plans.",
    featureBilling: "Billing & Plans",
    featureBillingDesc: "View and change subscription plans (Free, Basic, Pro). Upgrade anytime.",
    featureAnalytics: "Analytics Dashboard",
    featureAnalyticsDesc: "View stats on views, QR scans, and popular items. Only for Pro plan.",
    featureDomain: "Custom Domain",
    featureDomainDesc: "Connect a custom domain for your restaurant. Only for Pro plan.",
    featureQr: "QR Code Generator",
    featureQrDesc: "Generate and customize QR codes for menu or tables. Basic+ plans can add table numbers.",
    faqQ1: "What is MenuQR?",
    faqA1: "MenuQR is a QR code-based digital menu platform. Restaurants can create digital menus, generate QR codes, and customers can view menus and order directly via QR table.",
    faqQ2: "How do I get started?",
    faqA2: "First create an outlet/restaurant in the Outlets menu. Then add categories and menu items. Finally, generate QR codes and place them on customer tables.",
    faqQ3: "Do I need to pay?",
    faqA3: "No! The Free plan is available for free with basic features. We also offer Basic (Rp 50,000/month) and Pro (Rp 150,000/month) plans with more features.",
    faqQ4: "How do I upgrade my plan?",
    faqA4: "Go to Billing menu, select your restaurant, then click the desired plan. The current system is in trial mode — all upgrades are instant and free.",
    faqQ5: "Is my data safe?",
    faqA5: "Yes. All data is securely stored in our database. We do not share restaurant data with third parties.",
    faqQ6: "What if I forget my password?",
    faqA6: "Click 'Forgot Password' on the login page. We'll send a reset link to your email.",
    planFree: "Free Plan",
    planFreeFeatures: ["1 Restaurant", "5 Categories", "20 Menu Items", "Basic QR Code", "WhatsApp Checkout"],
    planBasic: "Basic Plan",
    planBasicFeatures: ["3 Restaurants", "Unlimited Categories", "Unlimited Menu", "QR Table + Table Number", "Custom QR Design", "Basic Analytics"],
    planPro: "Pro Plan",
    planProFeatures: ["Unlimited Restaurants", "Unlimited Categories & Menu", "QR Table + Table Number", "Custom QR Design", "Advanced Analytics", "Custom Domain", "Priority Support"],
    contactEmail: "Email",
    contactEmailDesc: "Send us an email at hello@menuqr.my.id",
    contactWhatsapp: "WhatsApp",
    contactWhatsappDesc: "Chat directly with our team",
    contactDocs: "Documentation",
    contactDocsDesc: "Learn more in our documentation",
    copied: "Copied!",
    relatedLinks: "Related Links",
  },
};

interface Section {
  id: string;
  icon: React.ElementType;
  titleKey: keyof typeof helpTranslations.id;
  descKey: keyof typeof helpTranslations.id;
  items?: { icon: React.ElementType; titleKey: keyof typeof helpTranslations.id; descKey: keyof typeof helpTranslations.id }[];
}

const sections: Section[] = [
  {
    id: "quickstart",
    icon: BookOpen,
    titleKey: "quickStart",
    descKey: "quickStartDesc",
    items: [
      { icon: Store, titleKey: "step1Title", descKey: "step1Desc" },
      { icon: Grid3X3, titleKey: "step2Title", descKey: "step2Desc" },
      { icon: UtensilsCrossed, titleKey: "step3Title", descKey: "step3Desc" },
      { icon: QrCode, titleKey: "step4Title", descKey: "step4Desc" },
    ],
  },
  {
    id: "features",
    icon: FileText,
    titleKey: "features",
    descKey: "featuresDesc",
    items: [
      { icon: ShoppingBag, titleKey: "featureOutlets", descKey: "featureOutletsDesc" },
      { icon: Grid3X3, titleKey: "featureCategories", descKey: "featureCategoriesDesc" },
      { icon: UtensilsCrossed, titleKey: "featureMenu", descKey: "featureMenuDesc" },
      { icon: MessageCircle, titleKey: "featureOrders", descKey: "featureOrdersDesc" },
      { icon: QrCode, titleKey: "featureQr", descKey: "featureQrDesc" },
      { icon: CreditCard, titleKey: "featureBilling", descKey: "featureBillingDesc" },
      { icon: BarChart3, titleKey: "featureAnalytics", descKey: "featureAnalyticsDesc" },
      { icon: Globe, titleKey: "featureDomain", descKey: "featureDomainDesc" },
    ],
  },
];

const faqs = [
  { q: "faqQ1", a: "faqA1" },
  { q: "faqQ2", a: "faqA2" },
  { q: "faqQ3", a: "faqA3" },
  { q: "faqQ4", a: "faqA4" },
  { q: "faqQ5", a: "faqA5" },
  { q: "faqQ6", a: "faqA6" },
];

const plans = [
  {
    id: "free",
    nameKey: "planFree" as const,
    featuresKey: "planFreeFeatures" as const,
    color: "neutral",
    gradient: "from-neutral-400 to-neutral-600",
  },
  {
    id: "basic",
    nameKey: "planBasic" as const,
    featuresKey: "planBasicFeatures" as const,
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "pro",
    nameKey: "planPro" as const,
    featuresKey: "planProFeatures" as const,
    color: "orange",
    gradient: "from-orange-500 to-amber-600",
  },
];

export function HelpContent() {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLang(savedLang);
    }
    const handler = () => {
      const l = localStorage.getItem("menuqr-lang") as "id" | "en";
      if (l) setLang(l);
    };
    window.addEventListener("menuqr-lang-change", handler);
    return () => window.removeEventListener("menuqr-lang-change", handler);
  }, []);

  const t = helpTranslations[lang];

  function copyEmail() {
    navigator.clipboard.writeText("hello@menuqr.my.id");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
      </div>

      {/* Quick Start Guide */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
            <BookOpen className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.quickStart}</p>
            <p className="text-[11px] text-neutral-400">{t.quickStartDesc}</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {sections[0].items?.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20 mt-0.5">
                  <Icon className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {t[item.titleKey]}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 leading-relaxed">
                    {t[item.descKey]}
                  </p>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-500 font-extrabold text-[10px]">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Guides */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <FileText className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.features}</p>
            <p className="text-[11px] text-neutral-400">{t.featuresDesc}</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {sections[1].items?.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 mt-0.5">
                  <Icon className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    {t[item.titleKey]}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 leading-relaxed">
                    {t[item.descKey]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <MessageCircle className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.faq}</p>
            <p className="text-[11px] text-neutral-400">{t.faqDesc}</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <span className="text-sm font-semibold text-neutral-900 dark:text-white pr-4">
                  {t[faq.q as keyof typeof t]}
                </span>
                {openFaq === idx ? (
                  <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pl-4 border-l-2 border-orange-500">
                    {t[faq.a as keyof typeof t]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <CreditCard className="h-4.5 w-4.5 text-purple-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.plans}</p>
            <p className="text-[11px] text-neutral-400">{t.plansDesc}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-50 dark:divide-neutral-800">
          {plans.map((plan) => (
            <div key={plan.id} className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white font-extrabold text-sm mb-3`}>
                {plan.id === "free" ? "F" : plan.id === "basic" ? "B" : "P"}
              </div>
              <p className="text-sm font-extrabold text-neutral-900 dark:text-white mb-3">
                {t[plan.nameKey]}
              </p>
              <ul className="space-y-2">
                {(t[plan.featuresKey] as string[]).map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
            <Phone className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.contact}</p>
            <p className="text-[11px] text-neutral-400">{t.contactDesc}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-50 dark:divide-neutral-800">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{t.contactEmail}</p>
            </div>
            <p className="text-xs text-neutral-400 mb-3">{t.contactEmailDesc}</p>
            <button
              onClick={copyEmail}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? t.copied : "hello@menuqr.my.id"}
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{t.contactWhatsapp}</p>
            </div>
            <p className="text-xs text-neutral-400 mb-3">{t.contactWhatsappDesc}</p>
            <a
              href="https://wa.me/6285340517686"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              +62 853 4051 7686
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{t.contactDocs}</p>
            </div>
            <p className="text-xs text-neutral-400 mb-3">{t.contactDocsDesc}</p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              docs.menuqr.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
