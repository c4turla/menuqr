"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  QrCode,
  Plus,
  Store,
  ExternalLink,
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
  });

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
    setForm({ name: "", description: "", phone: "", whatsapp_number: "", address: "" });
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
    });
    setDialogOpen(true);
  }

  function openDelete(restaurant: Restaurant) {
    setDeleting(restaurant);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const result = await updateRestaurant(editing.id, form);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t.restoUpdated);
          setRestaurants((prev) =>
            prev.map((r) => (r.id === editing.id ? { ...r, ...result.data } : r))
          );
        }
      } else {
        const result = await createRestaurant(form);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          toast.success(t.restoCreated);
          setRestaurants((prev) => [...prev, result.data!]);
        }
      }
      setDialogOpen(false);
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
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-sm shadow-sm">
                    {restaurant.name[0].toUpperCase()}
                  </div>
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
                <p className="text-xs text-neutral-505 dark:text-neutral-400 mb-3 line-clamp-2">
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
        <DialogContent className="rounded-2xl">
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
