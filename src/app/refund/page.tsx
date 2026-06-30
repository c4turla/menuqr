"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Coins, FileText, Globe } from "lucide-react";

type Language = "id" | "en";

const t = {
  id: {
    title: "Kebijakan Refund",
    subtitle: "Prosedur, kriteria, dan ketentuan pengembalian dana kepada pelanggan MenuQR.",
    lastUpdated: "Terakhir diperbarui: 30 Juni 2026",
    backHome: "Kembali ke Beranda",
    signIn: "Masuk",
    getStarted: "Daftar Sekarang",
    toc: "Daftar Isi",
    sections: [
      {
        id: "general",
        title: "1. Ketentuan Umum",
        content: "MenuQR berkomitmen untuk memberikan transparansi penuh mengenai kebijakan pengembalian dana (refund) untuk setiap langganan berbayar (Basic dan Pro). Sebagai platform perangkat lunak sebagai layanan (SaaS), biaya langganan yang sudah dibayarkan umumnya bersifat tidak dapat dikembalikan (non-refundable) kecuali dalam kondisi tertentu yang diatur dalam dokumen ini."
      },
      {
        id: "eligibility",
        title: "2. Kriteria Kelayakan Refund",
        content: "Pengguna dapat mengajukan pengembalian dana apabila memenuhi salah satu kriteria berikut: (a) Terjadi kesalahan penagihan ganda (double charging) pada transaksi yang sama, (b) Gangguan teknis fatal dari pihak MenuQR yang menyebabkan layanan tidak dapat diakses sama sekali selama lebih dari 48 jam berturut-turut, atau (c) Pengajuan dilakukan dalam waktu 7 (tujuh) hari pertama sejak langganan pertama kali diaktifkan jika pengguna baru merasa layanan tidak sesuai dengan deskripsi produk."
      },
      {
        id: "procedure",
        title: "3. Prosedur Pengajuan Pengembalian",
        content: "Untuk mengajukan refund, pengguna wajib mengirimkan permohonan tertulis ke email dukungan kami di support@menuqr.com dengan menyertakan: (a) Nama akun dan email yang terdaftar, (b) Salinan bukti pembayaran atau nomor invoice transaksi resmi, serta (c) Penjelasan detail mengenai alasan pengajuan pengembalian dana."
      },
      {
        id: "review",
        title: "4. Proses Peninjauan dan Persetujuan",
        content: "Setiap permohonan pengembalian dana yang masuk akan ditinjau oleh tim keuangan dan teknis MenuQR. Proses analisis kelayakan refund memakan waktu 3 hingga 5 hari kerja sejak dokumen pengajuan diterima secara lengkap. Hasil keputusan persetujuan atau penolakan akan dikirimkan secara tertulis via email."
      },
      {
        id: "processing",
        title: "5. Metode dan Estimasi Pencairan",
        content: "Jika pengajuan refund disetujui, dana akan dikembalikan ke metode pembayaran asal yang digunakan saat transaksi (misalnya kartu kredit, e-wallet, atau transfer bank). Proses pencairan dana membutuhkan waktu 5 hingga 10 hari kerja, tergantung pada kebijakan bank penerbit atau penyedia gerbang pembayaran. Biaya admin transaksi yang dikenakan oleh penyedia pembayaran pihak ketiga tidak dapat dikembalikan."
      },
      {
        id: "changes",
        title: "6. Perubahan Kebijakan",
        content: "MenuQR berhak mengubah atau memperbarui Kebijakan Refund ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan kebijakan akan langsung berlaku setelah diunggah ke halaman ini. Pengguna disarankan untuk memeriksa halaman kebijakan ini secara berkala."
      }
    ],
    footerText: "Dibuat dengan ❤️ untuk UMKM Kuliner Indonesia."
  },
  en: {
    title: "Refund Policy",
    subtitle: "Procedures, criteria, and guidelines for refunding MenuQR customers.",
    lastUpdated: "Last updated: June 30, 2026",
    backHome: "Back to Home",
    signIn: "Sign In",
    getStarted: "Sign Up Now",
    toc: "Table of Contents",
    sections: [
      {
        id: "general",
        title: "1. General Conditions",
        content: "MenuQR is committed to providing full transparency regarding the refund policy for paid subscriptions (Basic and Pro). As a Software-as-a-Service (SaaS) platform, subscription fees paid are generally non-refundable unless specified under the particular conditions outlined in this document."
      },
      {
        id: "eligibility",
        title: "2. Refund Eligibility Criteria",
        content: "Users may request a refund if they meet one of the following criteria: (a) Double charging occurred on the same transaction, (b) A fatal technical outage on MenuQR's side makes the service completely inaccessible for more than 48 consecutive hours, or (c) The request is made within the first 7 (seven) days of the initial subscription activation if the new user finds the service does not match the product description."
      },
      {
        id: "procedure",
        title: "3. Request Submission Procedure",
        content: "To apply for a refund, users must submit a written request to our support email at support@menuqr.com including: (a) Registered account name and email, (b) Copy of payment receipt or official invoice number, and (c) A detailed explanation of the reason for the refund request."
      },
      {
        id: "review",
        title: "4. Review and Approval Process",
        content: "Each refund request will be reviewed by the MenuQR finance and technical teams. The evaluation process takes 3 to 5 business days after all required details are submitted. The decision of approval or rejection will be communicated in writing via email."
      },
      {
        id: "processing",
        title: "5. Payout Method and Timeline",
        content: "If approved, the refund will be credited back to the original payment method used for the purchase (e.g., credit card, e-wallet, or bank transfer). Payout processing takes 5 to 10 business days depending on the issuing bank or payment gateway provider. Any transaction administration fees charged by third-party payment providers are non-refundable."
      },
      {
        id: "changes",
        title: "6. Policy Changes",
        content: "MenuQR reserves the right to modify or update this Refund Policy at any time without prior notice. Changes take effect immediately upon being posted to this page. Users are encouraged to review this policy page periodically."
      }
    ],
    footerText: "Made with ❤️ for Culinary SMEs."
  }
};

export default function RefundPage() {
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
              <Coins className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">MenuQR Finance</span>
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
