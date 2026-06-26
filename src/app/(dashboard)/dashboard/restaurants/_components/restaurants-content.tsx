"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  QrCode,
  Plus,
  Store,
  ExternalLink,
  Upload,
  X,
  Loader2,
  Crown,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "@/server/actions/restaurant-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  themePrimaryColor?: string | null;
  plan: "free" | "basic" | "pro";
};

interface RestaurantsContentProps {
  initialRestaurants: Restaurant[];
}

const planColors: Record<string, string> = {
  free: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  basic: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  pro: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
};

const restaurantsTranslations = {
  id: {
    pageTitle: "Outlets",
    pageSubtitle: "Kelola profil restoran dan outlet digital Anda.",
    addRestaurant: "Tambah Outlet",
    noRestoTitle: "Belum Ada Restoran",
    noRestoDesc: "Buat restoran pertama Anda untuk mulai menyusun menu digital dan generate QR code.",
    createRestoBtn: "Buat Restoran",
    formName: "Nama *",
    formDesc: "Deskripsi",
    formPhone: "Nomor Telepon",
    formWhatsapp: "Nomor WhatsApp",
    formAddress: "Alamat",
    formLogo: "Logo Restoran",
    formCover: "Cover / Banner",
    lockedFeature: "Fitur Premium",
    upgradeForLogo: "Fitur Upload Logo & Cover hanya tersedia untuk paket Basic dan Pro. Silakan upgrade paket Anda di menu Billing.",
    uploadLabel: "Pilih / Unggah Gambar",
    uploadSpecs: "PNG, JPG, WebP maks 5MB",
    removeImage: "Hapus gambar",
    restoUpdated: "Restoran berhasil diperbarui",
    restoCreated: "Restoran berhasil dibuat",
    restoDeleted: "Restoran berhasil dihapus",
    somethingWrong: "Terjadi kesalahan",
    editTitle: "Edit Restoran",
    createTitle: "Buat Restoran",
    deleteTitle: "Hapus Restoran",
    deleteWarning: "Apakah Anda yakin ingin menghapus {name}? Tindakan ini tidak dapat dibatalkan.",
    saving: "Menyimpan...",
    deleting: "Menghapus...",
    cancel: "Batal",
    deleteBtn: "Hapus",
    updateBtn: "Perbarui",
    createBtn: "Buat",
    errLimitOutlet: "Batas paket tercapai: Paket Gratis dan Basic hanya dapat memiliki 1 outlet. Harap tingkatkan outlet yang ada ke paket Pro untuk membuat lebih banyak cabang.",
    errLogoCoverLocked: "Fitur Upload Logo & Cover hanya tersedia untuk paket Basic dan Pro. Silakan upgrade di menu Billing.",
    errImageFormat: "Format file harus berupa gambar",
    errImageSize: "Ukuran gambar maksimal 5MB",
    uploadError: "Gagal mengunggah gambar",
    uploading: "Mengunggah...",
    formTheme: "Warna Tema (Custom Theme)",
    formThemeDesc: "Warna aksen utama untuk halaman menu publik Anda. Hanya tersedia untuk paket Pro.",
    themeLocked: "Custom Theme hanya tersedia untuk paket Pro.",
    errThemeProOnly: "Fitur Custom Theme hanya tersedia untuk paket Pro. Silakan upgrade di menu Billing.",
    resetTheme: "Reset ke Default",
    previewLabel: "Preview:",
  },
  en: {
    pageTitle: "Outlets",
    pageSubtitle: "Manage your restaurant profiles and digital outlets.",
    addRestaurant: "Add Outlet",
    noRestoTitle: "No Restaurants Yet",
    noRestoDesc: "Create your first restaurant to start building a digital menu and generate QR codes.",
    createRestoBtn: "Create Restaurant",
    formName: "Name *",
    formDesc: "Description",
    formPhone: "Phone",
    formWhatsapp: "WhatsApp Number",
    formAddress: "Address",
    formLogo: "Restaurant Logo",
    formCover: "Cover / Banner",
    lockedFeature: "Premium Feature",
    upgradeForLogo: "Logo & Cover upload is only available for Basic and Pro plans. Please upgrade your plan in the Billing menu.",
    uploadLabel: "Choose / Upload Image",
    uploadSpecs: "PNG, JPG, WebP max 5MB",
    removeImage: "Remove image",
    restoUpdated: "Restaurant updated successfully",
    restoCreated: "Restaurant created successfully",
    restoDeleted: "Restaurant deleted successfully",
    somethingWrong: "Something went wrong",
    editTitle: "Edit Restaurant",
    createTitle: "Create Restaurant",
    deleteTitle: "Delete Restaurant",
    deleteWarning: "Are you sure you want to delete {name}? This action cannot be undone.",
    saving: "Saving...",
    deleting: "Deleting...",
    cancel: "Cancel",
    deleteBtn: "Delete",
    updateBtn: "Update",
    createBtn: "Create",
    errLimitOutlet: "Plan limit reached: Free and Basic plans can only have 1 outlet. Please upgrade an existing outlet to Pro to create more branches.",
    errLogoCoverLocked: "Logo & Cover upload is only available for Basic and Pro plans. Please upgrade in the Billing menu.",
    errImageFormat: "File format must be an image",
    errImageSize: "Maximum image size is 5MB",
    uploadError: "Failed to upload image",
    uploading: "Uploading...",
    formTheme: "Theme Color (Custom Theme)",
    formThemeDesc: "Primary accent color for your public menu page. Only available for Pro plan.",
    themeLocked: "Custom Theme is only available for the Pro plan.",
    errThemeProOnly: "Custom Theme feature is only available for the Pro plan. Please upgrade in the Billing menu.",
    resetTheme: "Reset to Default",
    previewLabel: "Preview:",
  }
};

export function RestaurantsContent({
  initialRestaurants,
}: RestaurantsContentProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [deleting, setDeleting] = useState<Restaurant | null>(null);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp_number: "",
    address: "",
    logoUrl: "",
    coverUrl: "",
    themePrimaryColor: "#f97316",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

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

  const t = restaurantsTranslations[lang];

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", phone: "", whatsapp_number: "", address: "", logoUrl: "", coverUrl: "", themePrimaryColor: "#f97316" });
    setDialogOpen(true);
  }

  function openEdit(restaurant: Restaurant) {
    setEditing(restaurant);
    setForm({
      name: restaurant.name,
      description: restaurant.description ?? "",
      phone: restaurant.phone ?? "",
      whatsapp_number: restaurant.whatsappNumber ?? "",
      address: restaurant.address ?? "",
      logoUrl: restaurant.logoUrl ?? "",
      coverUrl: restaurant.coverUrl ?? "",
      themePrimaryColor: restaurant.themePrimaryColor ?? "#f97316",
    });
    setDialogOpen(true);
  }

  function openDelete(restaurant: Restaurant) {
    setDeleting(restaurant);
    setDeleteDialogOpen(true);
  }

  async function handleImageUpload(
    file: File,
    target: "logo" | "cover"
  ): Promise<void> {
    if (!file.type.startsWith("image/")) {
      toast.error(t.errImageFormat);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.errImageSize);
      return;
    }

    const setter = target === "logo" ? setUploadingLogo : setUploadingCover;
    setter(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t.uploadError);
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        [target === "logo" ? "logoUrl" : "coverUrl"]: data.url,
      }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.uploadError);
    } finally {
      setter(false);
    }
  }

  function removeImage(target: "logo" | "cover") {
    setForm((prev) => ({
      ...prev,
      [target === "logo" ? "logoUrl" : "coverUrl"]: "",
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          description: form.description,
          phone: form.phone,
          whatsapp_number: form.whatsapp_number,
          address: form.address,
        };

        // Only send logo/cover if changed or the restaurant is premium
        if (editing.logoUrl !== form.logoUrl || editing.coverUrl !== form.coverUrl) {
          payload.logo_url = form.logoUrl || null;
          payload.cover_url = form.coverUrl || null;
        }

        // Always send theme color if changed (Pro feature)
        if (editing.themePrimaryColor !== form.themePrimaryColor) {
          payload.theme_primary_color = form.themePrimaryColor || null;
        }

        const result = await updateRestaurant(editing.id, payload);
        if (result.error) {
          if (result.error === "ERR_LIMIT_OUTLET") {
            toast.error(t.errLimitOutlet);
          } else if (result.error === "ERR_LOGOCOVER_FEATURE_LOCKED") {
            toast.error(t.errLogoCoverLocked);
          } else if (result.error === "ERR_THEME_PRO_ONLY") {
            toast.error(t.errThemeProOnly);
          } else {
            toast.error(result.error);
          }
        } else {
          toast.success(t.restoUpdated);
          setRestaurants((prev) =>
            prev.map((r) => (r.id === editing.id ? { ...r, ...result.data } : r))
          );
          setDialogOpen(false);
        }
      } else {
        const result = await createRestaurant(form);
        if (result.error) {
          if (result.error === "ERR_LIMIT_OUTLET") {
            toast.error(t.errLimitOutlet);
          } else {
            toast.error(result.error);
          }
        } else if (result.data) {
          toast.success(t.restoCreated);
          setRestaurants((prev) => [...prev, result.data!]);
          setDialogOpen(false);
        }
      }
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      const result = await deleteRestaurant(deleting.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.restoDeleted);
        setRestaurants((prev) => prev.filter((r) => r.id !== deleting.id));
      }
      setDeleteDialogOpen(false);
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setSaving(false);
    }
  }

  function ImageUploadField({
    label,
    imageUrl,
    target,
    uploading,
    disabled,
  }: {
    label: string;
    imageUrl: string;
    target: "logo" | "cover";
    uploading: boolean;
    disabled: boolean;
  }) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{label}</Label>

        {disabled ? (
          <div className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/50 dark:bg-neutral-900/50">
            <Crown className="h-6 w-6 text-amber-500 mb-2" />
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 text-center">
              {t.lockedFeature}
            </p>
            <p className="text-[10px] text-neutral-400 mt-1 text-center max-w-xs">
              {t.upgradeForLogo}
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-900/50 min-h-[140px]">
            {imageUrl ? (
              <div className="relative w-full h-[120px] rounded-xl overflow-hidden group">
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(target)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-4">
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-2" />
                    <span className="text-xs font-semibold text-neutral-500">{t.uploading}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mb-2" />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{t.uploadLabel}</span>
                    <span className="text-[10px] text-neutral-400 mt-1">{t.uploadSpecs}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, target);
                  }}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {t.pageTitle}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {t.pageSubtitle}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm shadow-md shadow-orange-500/20"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t.addRestaurant}
        </Button>
      </div>

      {/* Restaurant Grid */}
      {restaurants.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 mb-4">
            <Store className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            {t.noRestoTitle}
          </h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-5 max-w-sm">
            {t.noRestoDesc}
          </p>
          <Button
            onClick={openCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.createRestoBtn}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Cover Image */}
              {restaurant.coverUrl && (
                <div className="relative h-24 -mx-5 -mt-5 mb-4 rounded-t-2xl overflow-hidden">
                  <Image src={restaurant.coverUrl} alt="Cover" fill className="object-cover" />
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {restaurant.logoUrl ? (
                    <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0">
                      <Image src={restaurant.logoUrl} alt="Logo" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-sm shadow-sm">
                      {restaurant.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {restaurant.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400">/{restaurant.slug}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${planColors[restaurant.plan]}`}
                >
                  {restaurant.plan}
                </span>
              </div>

              {restaurant.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                  {restaurant.description}
                </p>
              )}

              <div className="flex items-center gap-1.5 pt-3 border-t border-neutral-50 dark:border-neutral-800">
                <Link href={`/r/${restaurant.slug}`} target="_blank">
                  <button className="p-2 rounded-lg text-neutral-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </Link>
                <Link href={`/dashboard/restaurants/${restaurant.id}/qr`}>
                  <button className="p-2 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                </Link>
                <button
                  onClick={() => openEdit(restaurant)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => openDelete(restaurant)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {editing ? t.editTitle : t.createTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.formName}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.formDesc}</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Logo & Cover — only show on Edit, not Create */}
            {editing && (
              <>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <ImageUploadField
                    label={t.formLogo}
                    imageUrl={form.logoUrl}
                    target="logo"
                    uploading={uploadingLogo}
                    disabled={editing.plan === "free"}
                  />
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <ImageUploadField
                    label={t.formCover}
                    imageUrl={form.coverUrl}
                    target="cover"
                    uploading={uploadingCover}
                    disabled={editing.plan === "free"}
                  />
                </div>

                {/* Custom Theme Color — Pro only */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-purple-500" />
                    <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      {t.formTheme}
                    </Label>
                    {editing.plan !== "pro" && (
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full ml-auto">
                        Pro
                      </span>
                    )}
                  </div>

                  {editing.plan !== "pro" ? (
                    <div className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/50 dark:bg-neutral-900/50">
                      <Crown className="h-6 w-6 text-amber-500 mb-2" />
                      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 text-center">
                        {t.themeLocked}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {t.formThemeDesc}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="color"
                            value={form.themePrimaryColor}
                            onChange={(e) => setForm({ ...form, themePrimaryColor: e.target.value })}
                            className="h-10 w-14 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer bg-transparent"
                          />
                        </div>
                        <Input
                          value={form.themePrimaryColor}
                          onChange={(e) => setForm({ ...form, themePrimaryColor: e.target.value })}
                          className="rounded-xl font-mono text-sm w-32"
                          placeholder="#f97316"
                        />
                        {form.themePrimaryColor !== "#f97316" && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, themePrimaryColor: "#f97316" })}
                            className="text-[10px] font-bold text-neutral-400 hover:text-orange-500 transition-colors shrink-0"
                          >
                            {t.resetTheme}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-neutral-400">{t.previewLabel}</span>
                        <div className="flex gap-1">
                          {["#f97316", "#3b82f6", "#22c55e", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setForm({ ...form, themePrimaryColor: c })}
                              className={`h-5 w-5 rounded-full border-2 transition-all ${
                                form.themePrimaryColor === c
                                  ? "border-neutral-900 dark:border-white scale-110"
                                  : "border-transparent hover:scale-105"
                              }`}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.formPhone}</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.formWhatsapp}</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.formAddress}</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              {saving ? t.saving : editing ? t.updateBtn : t.createBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">{t.deleteTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t.deleteWarning.replace("{name}", deleting?.name || "")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving} className="rounded-xl">
              {saving ? t.deleting : t.deleteBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
