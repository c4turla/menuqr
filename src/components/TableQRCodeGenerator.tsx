"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Lock, Printer, QrCode, Sparkles, Wand2, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TableQRCodeGeneratorProps {
  restaurantName: string;
  menuUrl: string;
  plan: string;
}

const qrTranslations = {
  id: {
    backToRestaurants: "Kembali ke Outlets",
    pageTitle: "Generator QR Code",
    pageSubtitle: "Kelola QR code utama atau generate per nomor meja untuk {name}.",
    singleTable: "Satu Meja",
    bulkPrint: "Cetak Massal",
    singleSettings: "Pengaturan QR Code Tunggal",
    bulkSettings: "Pengaturan QR Code Massal",
    tableNumberLabel: "Nomor / ID Meja",
    exampleTable: "Contoh: 05, VIP-01",
    targetUrlPreview: "Preview URL Target",
    tablePrefixLabel: "Awalan Meja (Opsional)",
    examplePrefix: "Contoh: A-, VIP-",
    fromNumber: "Dari Nomor",
    toNumber: "Sampai Nomor",
    bulkPrintBtn: "Cetak Massal Meja ({start} - {end})",
    premiumLocked: "Fitur Premium Terkunci",
    premiumLockedDesc: "Fitur QR Code khusus nomor meja (table-based ordering) serta Cetak Massal Meja Sekaligus hanya tersedia untuk pelanggan paket Basic dan Pro. Tingkatkan plan Anda untuk menikmati kemudahan ini.",
    upgradeNow: "Upgrade Sekarang",
    mainMenu: "Menu Utama",
    scanToOrder: "PINDAI QR UNTUK MEMESAN",
    scanToViewMenu: "Scan dengan handphone Anda untuk melihat menu",
    downloadPng: "Download PNG",
    printCard: "Cetak Kartu",
    printTitleSingle: "Cetak QR Code - Meja {table}",
    printInstructions: "PINDAI QR UNTUK MEMESAN",
    printSub: "Silakan scan menggunakan smartphone Anda",
    documentReady: "Dokumen siap dicetak!",
    errorPrefix: "Nomor awal tidak boleh lebih besar dari nomor akhir",
    errorMaxLimit: "Maksimal cetak massal adalah 50 meja sekali cetak",
    preparingBulk: "Menyiapkan cetak massal...",
    bulkPrintTitle: "Cetak Massal QR Code - {name}",
    bulkError: "Gagal menyiapkan cetak massal",
    popupError: "Gagal membuka jendela cetak. Pastikan pop-up diperbolehkan.",
    tableText: "Meja",
    previewTableText: "Preview Meja",
  },
  en: {
    backToRestaurants: "Back to Outlets",
    pageTitle: "QR Code Generator",
    pageSubtitle: "Manage main QR code or generate per table number for {name}.",
    singleTable: "Single Table",
    bulkPrint: "Bulk Print",
    singleSettings: "Single QR Code Settings",
    bulkSettings: "Bulk QR Codes Settings",
    tableNumberLabel: "Table Number / ID",
    exampleTable: "Example: 05, VIP-01",
    targetUrlPreview: "Target URL Preview",
    tablePrefixLabel: "Table Prefix (Optional)",
    examplePrefix: "Example: A-, VIP-",
    fromNumber: "From Number",
    toNumber: "To Number",
    bulkPrintBtn: "Bulk Print Tables ({start} - {end})",
    premiumLocked: "Premium Feature Locked",
    premiumLockedDesc: "Table-based QR codes and Bulk Print Tables are only available for Basic and Pro subscribers. Upgrade your plan to unlock this feature.",
    upgradeNow: "Upgrade Now",
    mainMenu: "Main Menu",
    scanToOrder: "SCAN QR TO ORDER",
    scanToViewMenu: "Scan with your smartphone to view the menu",
    downloadPng: "Download PNG",
    printCard: "Print Card",
    printTitleSingle: "Print QR Code - Table {table}",
    printInstructions: "SCAN QR TO ORDER",
    printSub: "Please scan using your smartphone",
    documentReady: "Document ready to print!",
    errorPrefix: "Start number cannot be greater than end number",
    errorMaxLimit: "Maximum bulk print is 50 tables per print",
    preparingBulk: "Preparing bulk print...",
    bulkPrintTitle: "Bulk Print QR Code - {name}",
    bulkError: "Failed to prepare bulk print",
    popupError: "Failed to open print window. Please make sure pop-ups are allowed.",
    tableText: "Table",
    previewTableText: "Preview Table",
  }
};

export function TableQRCodeGenerator({ restaurantName, menuUrl, plan }: TableQRCodeGeneratorProps) {
  const isPremium = plan === "basic" || plan === "pro";
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [lang, setLang] = useState<"id" | "en">("id");

  // Single mode states
  const [tableNumber, setTableNumber] = useState("1");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  
  // Bulk mode states
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(10);

  useEffect(() => {
    const loadLang = () => {
      const savedLang = localStorage.getItem("menuqr-lang") as "id" | "en";
      if (savedLang && (savedLang === "id" || savedLang === "en")) {
        setLang(savedLang);
      }
    };
    loadLang();
    window.addEventListener("menuqr-lang-change", loadLang);
    return () => window.removeEventListener("menuqr-lang-change", loadLang);
  }, []);

  const t = qrTranslations[lang];

  // Generate target URL for the single QR code preview
  const targetUrl = isPremium && tableNumber.trim() 
    ? `${menuUrl}?table=${encodeURIComponent(tableNumber.trim())}`
    : menuUrl;

  useEffect(() => {
    QRCode.toDataURL(targetUrl, { width: 300, margin: 2 }).then(setDataUrl);
  }, [targetUrl]);

  const downloadPNG = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `menu-qr-${tableNumber.trim() || "general"}.png`;
    a.click();
  };

  const handlePrintSingle = () => {
    const printContent = dataUrl;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t.popupError);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${t.printTitleSingle.replace("{table}", tableNumber)}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              background: #fff;
              color: #000;
            }
            .card {
              border: 3px solid #000;
              border-radius: 24px;
              padding: 40px;
              text-align: center;
              max-width: 400px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .restaurant-name {
              font-size: 28px;
              font-weight: 900;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .table-badge {
              background: #000;
              color: #fff;
              font-size: 20px;
              font-weight: 800;
              padding: 6px 20px;
              border-radius: 9999px;
              display: inline-block;
              margin-bottom: 25px;
            }
            .qr-image {
              width: 280px;
              height: 280px;
              display: block;
              margin: 0 auto 25px auto;
            }
            .scan-instructions {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .scan-sub {
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="restaurant-name">${restaurantName}</div>
            <div class="table-badge">${t.tableText.toUpperCase()} ${tableNumber}</div>
            <img class="qr-image" src="${dataUrl}" alt="QR" />
            <div class="scan-instructions">${t.printInstructions}</div>
            <div class="scan-sub">${t.printSub}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleBulkPrint = async () => {
    if (bulkStart > bulkEnd) {
      toast.error(t.errorPrefix);
      return;
    }
    
    if (bulkEnd - bulkStart > 50) {
      toast.error(t.errorMaxLimit);
      return;
    }

    const toastId = toast.loading(t.preparingBulk);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error(t.popupError);
        return;
      }

      let cardsHtml = "";
      for (let i = bulkStart; i <= bulkEnd; i++) {
        const tableId = `${bulkPrefix}${i}`;
        const tUrl = `${menuUrl}?table=${encodeURIComponent(tableId)}`;
        const qrDataUrl = await QRCode.toDataURL(tUrl, { width: 300, margin: 2 });
        
        cardsHtml += `
          <div class="card">
            <div class="restaurant-name">${restaurantName}</div>
            <div class="table-badge">${t.tableText.toUpperCase()} ${tableId}</div>
            <img class="qr-image" src="${qrDataUrl}" alt="QR" />
            <div class="scan-instructions">${t.printInstructions}</div>
            <div class="scan-sub font-semibold">${t.printSub}</div>
          </div>
        `;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${t.bulkPrintTitle.replace("{name}", restaurantName)}</title>
            <style>
              @media print {
                body {
                  margin: 0;
                  background: #fff;
                }
                .card {
                  page-break-after: always;
                  box-shadow: none !important;
                  border: 3px solid #000 !important;
                }
              }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 40px;
                padding: 40px 0;
                background: #f9f9f9;
                color: #000;
              }
              .card {
                background: #fff;
                border: 3px solid #000;
                border-radius: 24px;
                padding: 40px;
                text-align: center;
                width: 320px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              }
              .restaurant-name {
                font-size: 26px;
                font-weight: 900;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .table-badge {
                background: #000;
                color: #fff;
                font-size: 18px;
                font-weight: 800;
                padding: 6px 20px;
                border-radius: 9999px;
                display: inline-block;
                margin-bottom: 25px;
              }
              .qr-image {
                width: 240px;
                height: 240px;
                display: block;
                margin: 0 auto 25px auto;
              }
              .scan-instructions {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 5px;
              }
              .scan-sub {
                font-size: 11px;
                color: #666;
              }
            </style>
          </head>
          <body>
            ${cardsHtml}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success(t.documentReady, { id: toastId });
    } catch (e) {
      toast.error(t.bulkError, { id: toastId });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link + Header */}
      <div>
        <Link
          href="/dashboard/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.backToRestaurants}
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {t.pageSubtitle.replace("{name}", restaurantName)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Form */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Mode Tabs */}
            <div className="flex gap-1.5 p-1 bg-neutral-50 dark:bg-neutral-950 rounded-xl">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === "single"
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                {t.singleTable}
              </button>
              <button
                onClick={() => {
                  if (!isPremium) {
                    toast.error(t.premiumLockedDesc);
                    return;
                  }
                  setMode("bulk");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === "bulk"
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                {t.bulkPrint}
              </button>
            </div>

            <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white flex items-center gap-2 pt-1 border-t border-neutral-50 dark:border-neutral-950">
              <Wand2 className="h-4 w-4 text-orange-500" />
              {mode === "single" ? t.singleSettings : t.bulkSettings}
            </h2>
            
            <div className="space-y-4">
              {mode === "single" ? (
                /* Single Table Form */
                <div className="space-y-4">
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        {t.tableNumberLabel}
                      </label>
                      {!isPremium && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase">
                          <Sparkles className="h-3 w-3 fill-orange-500" />
                          Pro & Basic
                        </span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t.exampleTable}
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        disabled={!isPremium}
                        className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500 pr-10"
                      />
                      {!isPremium && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                          <Lock className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated URL Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.targetUrlPreview}
                    </span>
                    <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 break-all leading-normal">
                      {targetUrl}
                    </p>
                  </div>
                </div>
              ) : (
                /* Bulk Mode Form */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.tablePrefixLabel}
                    </label>
                    <Input
                      type="text"
                      placeholder={t.examplePrefix}
                      value={bulkPrefix}
                      onChange={(e) => setBulkPrefix(e.target.value)}
                      className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        {t.fromNumber}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={bulkStart}
                        onChange={(e) => setBulkStart(Number(e.target.value))}
                        className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        {t.toNumber}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={bulkEnd}
                        onChange={(e) => setBulkEnd(Number(e.target.value))}
                        className="rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleBulkPrint}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold py-5 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Printer className="h-4 w-4" />
                      {t.bulkPrintBtn.replace("{start}", `${bulkPrefix}${bulkStart}`).replace("{end}", `${bulkPrefix}${bulkEnd}`)}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Free Plan Lock Warning Card */}
          {!isPremium && (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-500/20 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <Lock className="h-20 w-20 text-orange-500" />
              </div>
              <div className="flex items-center gap-2 text-orange-500">
                <Lock className="h-4 w-4 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider">{t.premiumLocked}</h3>
              </div>
              <p className="text-[11px] text-neutral-505 dark:text-neutral-400 leading-relaxed font-medium">
                {t.premiumLockedDesc}
              </p>
              <Link
                href="/dashboard/billing"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold px-4 py-2 inline-block text-center shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t.upgradeNow}
              </Link>
            </div>
          )}
        </div>

        {/* Visual Card Display & Download actions (For Single Mode Preview) */}
        <div className="flex flex-col items-center">
          {/* Physical Table Card Mockup (Print Target) */}
          <div 
            className="bg-white dark:bg-neutral-900 border-3 border-neutral-900 dark:border-neutral-800 rounded-3xl p-6 shadow-md w-full max-w-[280px] text-center flex flex-col items-center gap-4 relative"
          >
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider truncate max-w-[220px]">
                {restaurantName}
              </h3>
              {isPremium ? (
                <span className="inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {mode === "single" ? `${t.tableText} ${tableNumber}` : `${t.previewTableText} ${bulkPrefix}${bulkStart}`}
                </span>
              ) : (
                <span className="inline-block bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-[9px] font-bold px-3 py-1 rounded-full uppercase">
                  {t.mainMenu}
                </span>
              )}
            </div>

            <div className="relative p-2.5 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl bg-white shadow-inner flex items-center justify-center">
              {dataUrl ? (
                <img src={dataUrl} alt="QR Code" width={180} height={180} className="rounded-xl" />
              ) : (
                <div className="animate-pulse bg-neutral-100 rounded-xl h-[180px] w-[180px]" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                {t.scanToOrder}
              </p>
              <p className="text-[8px] text-neutral-400 dark:text-neutral-500 font-medium">
                {t.scanToViewMenu}
              </p>
            </div>
          </div>

          {/* Action Buttons for Single Preview */}
          <div className="flex gap-2.5 mt-5">
            <Button
              variant="outline"
              onClick={downloadPNG}
              disabled={!dataUrl}
              className="rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t.downloadPng}
            </Button>
            <Button
              onClick={handlePrintSingle}
              disabled={!dataUrl}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              {t.printCard}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
