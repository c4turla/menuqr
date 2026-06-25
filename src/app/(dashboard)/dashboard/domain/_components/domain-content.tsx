"use client";

import { useState, useEffect } from "react";
import { Globe, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateRestaurantCustomDomain } from "@/server/actions/restaurant-actions";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
}

interface DomainContentProps {
  initialRestaurants: Restaurant[];
}

const domainTranslations = {
  id: {
    title: "Domain Kustom",
    subtitle: "Hubungkan domain kustom untuk restoran Anda.",
    selectResto: "Pilih Restoran",
    selectRestoPlaceholder: "Pilih restoran...",
    domainLabel: "Nama Domain",
    domainPlaceholder: "contoh: menu.restoransaya.id",
    dnsGuideTitle: "Panduan Pengaturan DNS",
    dnsStep1: "Buka penyedia domain Anda (Niagahoster, Cloudflare, dsb).",
    dnsStep2: 'Tambahkan CNAME record dengan nama "{host}" dan target "{target}".',
    dnsStep3: "Tunggu propagasi DNS (bisa 5 menit s.d 48 jam).",
    dnsStep4: "Setelah propagasi selesai, domain kustom Anda siap digunakan.",
    cnameHost: "Host CNAME",
    cnameTarget: "Target CNAME",
    noDomain: "Belum diatur",
    saveBtn: "Simpan Domain",
    removeBtn: "Hapus Domain",
    saving: "Menyimpan...",
    successMsg: 'Domain kustom untuk "{name}" berhasil disimpan.',
    errorMsg: "Gagal menyimpan domain",
    copyDns: "Salin DNS",
    copied: "Disalin!",
    domainFormat: "Domain hanya boleh terdiri dari huruf kecil, angka, titik, dan strip.",
    currentDomain: "Domain Saat Ini",
  },
  en: {
    title: "Custom Domain",
    subtitle: "Connect a custom domain for your restaurant.",
    selectResto: "Select Restaurant",
    selectRestoPlaceholder: "Select restaurant...",
    domainLabel: "Domain Name",
    domainPlaceholder: "e.g. menu.myrestaurant.com",
    dnsGuideTitle: "DNS Setup Guide",
    dnsStep1: "Open your domain provider (Cloudflare, Namecheap, etc.).",
    dnsStep2: 'Add a CNAME record with name "{host}" and target "{target}".',
    dnsStep3: "Wait for DNS propagation (5 min to 48 hours).",
    dnsStep4: "Once propagated, your custom domain is ready to use.",
    cnameHost: "CNAME Host",
    cnameTarget: "CNAME Target",
    noDomain: "Not set",
    saveBtn: "Save Domain",
    removeBtn: "Remove Domain",
    saving: "Saving...",
    successMsg: 'Custom domain for "{name}" saved successfully.',
    errorMsg: "Failed to save domain",
    copyDns: "Copy DNS",
    copied: "Copied!",
    domainFormat: "Domain may only contain lowercase letters, numbers, dots, and hyphens.",
    currentDomain: "Current Domain",
  },
};

export function DomainContent({ initialRestaurants }: DomainContentProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedId, setSelectedId] = useState(initialRestaurants[0]?.id || "");
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");
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

  useEffect(() => {
    const r = restaurants.find((r) => r.id === selectedId);
    setDomainInput(r?.customDomain || "");
  }, [selectedId, restaurants]);

  const t = domainTranslations[lang];
  const selected = restaurants.find((r) => r.id === selectedId);
  const cnameHost = selected?.slug ? `${selected.slug}.menuqr.com` : "slug.menuqr.com";

  async function handleSave() {
    if (!selectedId) return;

    const val = domainInput.trim();
    if (val && !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(val)) {
      toast.error(t.domainFormat);
      return;
    }

    setSaving(true);
    try {
      const res = await updateRestaurantCustomDomain(selectedId, val || null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setRestaurants((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, customDomain: val || null } : r))
      );
      toast.success(t.successMsg.replace("{name}", selected?.name || ""));
    } catch {
      toast.error(t.errorMsg);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setDomainInput("");
    setSaving(true);
    try {
      const res = await updateRestaurantCustomDomain(selectedId, null);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setRestaurants((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, customDomain: null } : r))
      );
      toast.success(t.successMsg.replace("{name}", selected?.name || ""));
    } catch {
      toast.error(t.errorMsg);
    } finally {
      setSaving(false);
    }
  }

  function copyDnsInfo() {
    const text = `${t.cnameHost}: ${cnameHost}\n${t.cnameTarget}: cname.vercel-dns.com`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{t.title}</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm text-center">
          <AlertTriangle className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-500">
            {lang === "id" ? "Belum ada restoran." : "No restaurants yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{t.title}</h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-6 space-y-5 max-w-xl">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {t.selectResto}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t.domainLabel}
            </label>
            <span className="text-[10px] font-semibold text-neutral-400">
              {t.currentDomain}: {selected?.customDomain || t.noDomain}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder={t.domainPlaceholder}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
            >
              {saving ? t.saving : t.saveBtn}
            </Button>
            {selected?.customDomain && (
              <Button
                onClick={handleRemove}
                disabled={saving}
                variant="outline"
                className="rounded-xl text-xs font-bold border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
              >
                {t.removeBtn}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden max-w-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <p className="font-extrabold text-sm text-neutral-900 dark:text-white">{t.dnsGuideTitle}</p>
          </div>
          <button
            onClick={copyDnsInfo}
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {t.copyDns}
              </>
            )}
          </button>
        </div>
        <div className="p-5 space-y-3">
          {[t.dnsStep1, t.dnsStep2, t.dnsStep3, t.dnsStep4].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 font-extrabold text-[11px] mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                {step.replace("{host}", cnameHost).replace("{target}", "cname.vercel-dns.com")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
