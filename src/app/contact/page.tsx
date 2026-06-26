"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Mail, MessageSquare, MapPin, Send, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Language = "id" | "en";

const t = {
  id: {
    title: "Hubungi Kami",
    subtitle: "Ada pertanyaan atau butuh bantuan integrasi? Tim kami siap melayani Anda.",
    backHome: "Kembali ke Beranda",
    signIn: "Masuk",
    getStarted: "Daftar Sekarang",
    cardEmailTitle: "Kirim Email",
    cardEmailDesc: "Hubungi tim penjualan atau bantuan teknis.",
    cardWaTitle: "Chat WhatsApp",
    cardWaDesc: "Layanan konsultasi cepat via WhatsApp.",
    cardAddrTitle: "Kantor Pusat",
    cardAddrDesc: "Kota Jakarta, DKI Jakarta, Indonesia",
    formTitle: "Kirim Pesan Langsung",
    formName: "Nama Lengkap",
    formEmail: "Alamat Email",
    formResto: "Nama Restoran (Opsional)",
    formMsg: "Pesan Anda",
    formSubmit: "Kirim Pesan",
    formSending: "Mengirim...",
    successToast: "Pesan berhasil dikirim! Tim kami akan menghubungi Anda segera.",
    errorToast: "Mohon isi semua bidang formulir.",
    footerText: "Dibuat dengan ❤️ untuk UMKM Kuliner Indonesia."
  },
  en: {
    title: "Contact Us",
    subtitle: "Have questions or need integration help? Our team is here to assist you.",
    backHome: "Back to Home",
    signIn: "Sign In",
    getStarted: "Sign Up Now",
    cardEmailTitle: "Email Us",
    cardEmailDesc: "Contact sales or support departments.",
    cardWaTitle: "WhatsApp Support",
    cardWaDesc: "Fast-track consulting via WhatsApp.",
    cardAddrTitle: "Headquarters",
    cardAddrDesc: "Jakarta City, DKI Jakarta, Indonesia",
    formTitle: "Send a Direct Message",
    formName: "Full Name",
    formEmail: "Email Address",
    formResto: "Restaurant Name (Optional)",
    formMsg: "Your Message",
    formSubmit: "Send Message",
    formSending: "Sending...",
    successToast: "Message sent successfully! Our team will contact you shortly.",
    errorToast: "Please fill in all the form fields.",
    footerText: "Made with ❤️ for Culinary SMEs."
  }
};

export default function ContactPage() {
  const [lang, setLang] = useState<Language>("id");
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resto: "",
    message: ""
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t[lang].errorToast);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(t[lang].successToast);
      setFormData({ name: "", email: "", resto: "", message: "" });
    }, 1200);
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
        <div className="mx-auto max-w-5xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-orange-500 mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            {currentT.backHome}
          </Link>

          {/* Heading */}
          <div className="space-y-4 mb-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-orange-600 dark:text-orange-400 mx-auto">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">Hubungi Kami</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
              {currentT.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium">
              {currentT.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            {/* Contact cards info */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card Email */}
              <div className="bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-orange-500/35 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    {currentT.cardEmailTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {currentT.cardEmailDesc}
                  </p>
                  <a href="mailto:hello@menuqr.com" className="text-xs font-bold text-orange-500 block mt-2 hover:underline">
                    hello@menuqr.com
                  </a>
                </div>
              </div>

              {/* Card WA */}
              <div className="bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-orange-500/35 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white group-hover:text-green-500 transition-colors">
                    {currentT.cardWaTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {currentT.cardWaDesc}
                  </p>
                  <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-green-500 block mt-2 hover:underline">
                    +62 812-3456-789
                  </a>
                </div>
              </div>

              {/* Card Address */}
              <div className="bg-white dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    {currentT.cardAddrTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {currentT.cardAddrDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Message form */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white mb-6">
                {currentT.formTitle}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {currentT.formName}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {currentT.formEmail}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {currentT.formResto}
                  </label>
                  <input
                    type="text"
                    value={formData.resto}
                    onChange={(e) => setFormData({ ...formData, resto: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {currentT.formMsg}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 font-bold shadow-md shadow-orange-500/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? currentT.formSending : currentT.formSubmit}
                </Button>
              </form>
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
