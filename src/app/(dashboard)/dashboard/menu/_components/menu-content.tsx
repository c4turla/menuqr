"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  Plus,
  UtensilsCrossed,
  Star,
  EyeOff,
  ImageIcon,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
} from "@/server/actions/menu-actions";
import { getMenuItemsByRestaurant } from "@/server/queries/menu-queries";
import { getCategoriesByRestaurant } from "@/server/queries/category-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ModifierGroup, ModifierOption } from "@/db/schema/menu-items";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Restaurant = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
  categoryName: string | null;
  modifiers?: ModifierGroup[] | null;
};

interface MenuContentProps {
  restaurants: Restaurant[];
}

const menuTranslations = {
  id: {
    pageTitle: "Menu Makanan",
    pageSubtitle: "Kelola menu hidangan restoran Anda.",
    addItem: "Tambah Menu",
    selectRestaurant: "Pilih restoran",
    allCategories: "Semua Kategori",
    selectRestoTitle: "Pilih restoran terlebih dahulu",
    selectRestoDesc: "Pilih salah satu restoran di atas untuk mengelola menu makanannya.",
    loadingItems: "Memuat menu makanan...",
    noItemsYet: "Belum ada menu makanan",
    addItemsToMenu: "Tambahkan menu hidangan ke restoran Anda untuk memulai.",
    featuredLabel: "Unggulan",
    hiddenLabel: "Habis",
    visibleLabel: "Tersedia",
    createTitle: "Buat Menu Makanan",
    editTitle: "Edit Menu Makanan",
    nameLabel: "Nama *",
    descLabel: "Deskripsi",
    priceLabel: "Harga *",
    categoryLabel: "Kategori *",
    selectCategoryPlaceholder: "Pilih kategori",
    imageLabel: "Gambar Menu",
    chooseImage: "Pilih / Unggah Gambar",
    imageSpecs: "PNG, JPG, WebP maksimal 5MB",
    urlPlaceholder: "Atau tempel URL gambar di sini...",
    availableLabel: "Tersedia",
    cancel: "Batal",
    saving: "Menyimpan...",
    deleting: "Menghapus...",
    deleteBtn: "Hapus",
    updateBtn: "Perbarui",
    createBtn: "Buat",
    deleteTitle: "Hapus Menu Makanan",
    deleteWarning: "Apakah Anda yakin ingin menghapus {name}?",
    toastImageFormat: "Format file harus berupa gambar",
    toastImageSize: "Ukuran gambar maksimal 5MB",
    toastImageUploaded: "Gambar berhasil diunggah",
    toastUploadError: "Terjadi kesalahan saat mengunggah",
    toastFailedUpload: "Gagal mengunggah gambar",
    toastUploading: "Mengunggah...",
    toastFailedLoad: "Gagal memuat data",
    toastUpdated: "Menu makanan berhasil diperbarui",
    toastCreated: "Menu makanan berhasil dibuat",
    toastDeleted: "Menu makanan berhasil dihapus",
    toastSomethingWrong: "Terjadi kesalahan",
    toastToggleAvailabilityError: "Gagal mengubah ketersediaan",
    toastToggleFeaturedError: "Gagal mengubah status unggulan",
    errLimitMenu: "Batas paket Gratis tercapai: Anda hanya dapat membuat hingga 5 menu makanan. Harap tingkatkan paket berlangganan Anda.",
    modifiersTitle: "Variasi & Kustomisasi",
    modifiersDesc: "Tambahkan pilihan kustomisasi untuk hidangan ini (misal: level pedas, topping, ukuran).",
    addModifierGroup: "Tambah Grup Variasi",
    groupNameLabel: "Nama Grup Variasi (misal: Level Pedas)",
    optionNameLabel: "Nama Opsi (misal: Level 1)",
    optionPriceLabel: "+ Harga (Rp)",
    addOption: "Tambah Opsi",
    requiredLabel: "Wajib diisi pelanggan",
    minSelect: "Min Pilihan",
    maxSelect: "Max Pilihan",
    optionsList: "Daftar Opsi",
  },
  en: {
    pageTitle: "Menu Items",
    pageSubtitle: "Manage your restaurant menus.",
    addItem: "Add Item",
    selectRestaurant: "Select a restaurant",
    allCategories: "All Categories",
    selectRestoTitle: "Select a restaurant",
    selectRestoDesc: "Choose a restaurant above to manage its menu items.",
    loadingItems: "Loading menu items...",
    noItemsYet: "No menu items yet",
    addItemsToMenu: "Add items to your restaurant menu.",
    featuredLabel: "Featured",
    hiddenLabel: "Sold Out",
    visibleLabel: "Available",
    createTitle: "Create Menu Item",
    editTitle: "Edit Menu Item",
    nameLabel: "Name *",
    descLabel: "Description",
    priceLabel: "Price *",
    categoryLabel: "Category *",
    selectCategoryPlaceholder: "Select category",
    imageLabel: "Menu Image",
    chooseImage: "Choose / Upload Image",
    imageSpecs: "PNG, JPG, WebP maximum 5MB",
    urlPlaceholder: "Or paste image URL here...",
    availableLabel: "Available",
    cancel: "Cancel",
    saving: "Saving...",
    deleting: "Deleting...",
    deleteBtn: "Delete",
    updateBtn: "Update",
    createBtn: "Create",
    deleteTitle: "Delete Menu Item",
    deleteWarning: "Are you sure you want to delete {name}?",
    toastImageFormat: "File format must be an image",
    toastImageSize: "Maximum image size is 5MB",
    toastImageUploaded: "Image uploaded successfully",
    toastUploadError: "An error occurred while uploading",
    toastFailedUpload: "Failed to upload image",
    toastUploading: "Uploading...",
    toastFailedLoad: "Failed to load data",
    toastUpdated: "Menu item updated successfully",
    toastCreated: "Menu item created successfully",
    toastDeleted: "Menu item deleted successfully",
    toastSomethingWrong: "Something went wrong",
    toastToggleAvailabilityError: "Failed to toggle availability",
    toastToggleFeaturedError: "Failed to toggle featured",
    errLimitMenu: "Free plan limit reached: You can only create up to 5 menu items. Please upgrade your plan.",
    modifiersTitle: "Modifiers & Customizations",
    modifiersDesc: "Add customization choices for this item (e.g., spiciness level, toppings, size).",
    addModifierGroup: "Add Variation Group",
    groupNameLabel: "Group Name (e.g., Spicy Level)",
    optionNameLabel: "Option Name (e.g., Level 1)",
    optionPriceLabel: "+ Price (Rp)",
    addOption: "Add Option",
    requiredLabel: "Required selection",
    minSelect: "Min Selection",
    maxSelect: "Max Selection",
    optionsList: "Options List",
  }
};

export function MenuContent({ restaurants }: MenuContentProps) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantItems, setRestaurantItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"id" | "en">("id");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    available: true,
    featured: false,
    modifiers: [] as ModifierGroup[],
  });

  const [uploading, setUploading] = useState(false);

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

  const t = menuTranslations[lang];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.toastImageFormat);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.toastImageSize);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t.toastFailedUpload);
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success(t.toastImageUploaded);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.toastUploadError);
    } finally {
      setUploading(false);
    }
  }

  const loadData = useCallback(async (restaurantId: string) => {
    if (!restaurantId) {
      setCategories([]);
      setRestaurantItems([]);
      return;
    }
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        getCategoriesByRestaurant(restaurantId),
        getMenuItemsByRestaurant(restaurantId),
      ]);
      setCategories(cats);
      setRestaurantItems(items);
    } catch {
      toast.error(t.toastFailedLoad);
    } finally {
      setLoading(false);
    }
  }, [t.toastFailedLoad]);

  function handleRestaurantChange(value: string) {
    setSelectedRestaurantId(value);
    setSelectedCategoryId("all");
    setCategories([]);
    setRestaurantItems([]);
    loadData(value);
  }

  const menuItems = useMemo(() => {
    if (selectedCategoryId === "all") return restaurantItems;
    return restaurantItems.filter((item) => item.categoryId === selectedCategoryId);
  }, [selectedCategoryId, restaurantItems]);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      categoryId: categories[0]?.id ?? "",
      imageUrl: "",
      available: true,
      featured: false,
      modifiers: [],
    });
    setDialogOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? "",
      available: item.available,
      featured: item.featured,
      modifiers: item.modifiers ? JSON.parse(JSON.stringify(item.modifiers)) : [],
    });
    setDialogOpen(true);
  }

  function openDelete(item: MenuItem) {
    setDeleting(item);
    setDeleteDialogOpen(true);
  }

  function addModifierGroup() {
    setForm((prev) => ({
      ...prev,
      modifiers: [
        ...(prev.modifiers || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          name: "",
          required: false,
          minSelection: 0,
          maxSelection: 1,
          options: [{ name: "", price: 0 }],
        },
      ],
    }));
  }

  function removeModifierGroup(idx: number) {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((_, i) => i !== idx),
    }));
  }

  function updateGroupField(idx: number, field: keyof ModifierGroup, value: any) {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((g, i) => (i === idx ? { ...g, [field]: value } : g)),
    }));
  }

  function addOptionToGroup(groupIdx: number) {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((g, i) =>
        i === groupIdx ? { ...g, options: [...g.options, { name: "", price: 0 }] } : g
      ),
    }));
  }

  function removeOptionFromGroup(groupIdx: number, optIdx: number) {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              options: g.options.filter((_, j) => j !== optIdx),
            }
          : g
      ),
    }));
  }

  function updateOptionField(groupIdx: number, optIdx: number, field: keyof ModifierOption, value: any) {
    setForm((prev) => ({
      ...prev,
      modifiers: prev.modifiers.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              options: g.options.map((o, j) => (j === optIdx ? { ...o, [field]: value } : o)),
            }
          : g
      ),
    }));
  }

  async function handleSave() {
    if (!selectedRestaurantId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateMenuItem(editing.id, selectedRestaurantId, {
          ...form,
          price: Number(form.price),
        });
        toast.success(t.toastUpdated);
      } else {
        await createMenuItem(selectedRestaurantId, {
          ...form,
          price: Number(form.price),
        });
        toast.success(t.toastCreated);
      }
      setDialogOpen(false);
      loadData(selectedRestaurantId);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "ERR_LIMIT_MENU_FREE") {
        toast.error(t.errLimitMenu);
      } else {
        toast.error(err instanceof Error ? err.message : t.toastSomethingWrong);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting || !selectedRestaurantId) return;
    setSaving(true);
    try {
      await deleteMenuItem(deleting.id, selectedRestaurantId);
      toast.success(t.toastDeleted);
      setDeleteDialogOpen(false);
      loadData(selectedRestaurantId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.toastSomethingWrong);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    const original = item.available;
    setRestaurantItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i))
    );
    try {
      await toggleAvailability(item.id, selectedRestaurantId);
    } catch {
      setRestaurantItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: original } : i))
      );
      toast.error(t.toastToggleAvailabilityError);
    }
  }

  async function handleToggleFeatured(item: MenuItem) {
    const original = item.featured;
    setRestaurantItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, featured: !i.featured } : i))
    );
    try {
      await toggleFeatured(item.id, selectedRestaurantId);
    } catch {
      setRestaurantItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, featured: original } : i))
      );
      toast.error(t.toastToggleFeaturedError);
    }
  }

  function formatPrice(price: string) {
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {t.pageTitle}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {t.pageSubtitle}
          </p>
        </div>
        {selectedRestaurantId && (
          <Button
            onClick={openCreate}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm shadow-md shadow-orange-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.addItem}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        <div className="w-full sm:w-72">
          <Select value={selectedRestaurantId} onValueChange={handleRestaurantChange}>
            <SelectTrigger className="rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <SelectValue placeholder={t.selectRestaurant} />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedRestaurantId && (
          <div className="w-full sm:w-52">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <SelectValue placeholder={t.allCategories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedRestaurantId ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            {t.selectRestoTitle}
          </h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-sm">
            {t.selectRestoDesc}
          </p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-16 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <span className="text-sm text-neutral-400 font-medium">{t.loadingItems}</span>
          </div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            {t.noItemsYet}
          </h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-5 max-w-sm">
            {t.addItemsToMenu}
          </p>
          <Button
            onClick={openCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.addItem}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`group rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                !item.available ? "opacity-60" : ""
              }`}
            >
              {/* Image area */}
              <div className="relative h-36 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                {/* Badges overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  {item.featured && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      {t.featuredLabel}
                    </span>
                  )}
                  {!item.available && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold backdrop-blur-sm">
                      <EyeOff className="h-2.5 w-2.5" />
                      {t.hiddenLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    {item.categoryName && (
                      <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                        {item.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-orange-505 shrink-0 ml-2">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {item.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-neutral-50 dark:border-neutral-800">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailable(item)}
                        className="scale-75"
                      />
                      <span className="text-[10px] font-medium text-neutral-400">
                        {item.available ? t.visibleLabel : t.hiddenLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={item.featured}
                        onCheckedChange={() => handleToggleFeatured(item)}
                        className="scale-75"
                      />
                      <span className="text-[10px] font-medium text-neutral-400">
                        {t.featuredLabel}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openDelete(item)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
              <Label htmlFor="m-name" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.nameLabel}</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.descLabel}</Label>
              <Textarea
                id="m-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-price" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.priceLabel}</Label>
              <Input
                id="m-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-category" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.categoryLabel}</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger id="m-category" className="rounded-xl">
                  <SelectValue placeholder={t.selectCategoryPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.imageLabel}</Label>
              <div className="flex flex-col gap-3">
                {/* Upload Box */}
                <div className="relative flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-900/50 min-h-[140px] transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/80">
                  {form.imageUrl ? (
                    <div className="relative w-full h-[120px] rounded-xl overflow-hidden group">
                      <Image
                        src={form.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
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
                          <Loader2 className="h-8 w-8 text-orange-505 animate-spin mb-2" />
                          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{t.toastUploading}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mb-2" />
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{t.chooseImage}</span>
                          <span className="text-[10px] text-neutral-400 mt-1">{t.imageSpecs}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* Direct URL input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">URL</span>
                  </div>
                  <Input
                    id="m-image"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="rounded-xl pl-12 text-xs"
                    placeholder={t.urlPlaceholder}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-800 px-4 py-3">
              <Label htmlFor="m-available" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.availableLabel}</Label>
              <Switch
                id="m-available"
                checked={form.available}
                onCheckedChange={(v) => setForm({ ...form, available: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-55 dark:bg-neutral-800 px-4 py-3">
              <Label htmlFor="m-featured" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.featuredLabel}</Label>
              <Switch
                id="m-featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
            </div>

            {/* Modifiers Section */}
            <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {t.modifiersTitle}
                  </h4>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {t.modifiersDesc}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addModifierGroup}
                  className="rounded-xl text-xs h-8 border-orange-500/20 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t.addModifierGroup}
                </Button>
              </div>

              <div className="space-y-4 mt-3">
                {form.modifiers?.map((group, groupIdx) => (
                  <div
                    key={group.id || groupIdx}
                    className="p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 space-y-3 relative group/item"
                  >
                    <button
                      type="button"
                      onClick={() => removeModifierGroup(groupIdx)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                          {t.groupNameLabel}
                        </Label>
                        <Input
                          value={group.name}
                          onChange={(e) => updateGroupField(groupIdx, "name", e.target.value)}
                          placeholder="Contoh: Level Pedas, Topping"
                          className="rounded-xl text-xs h-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        />
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={group.required}
                            onCheckedChange={(checked) => {
                              updateGroupField(groupIdx, "required", checked);
                              if (checked) {
                                updateGroupField(groupIdx, "minSelection", 1);
                              } else {
                                updateGroupField(groupIdx, "minSelection", 0);
                              }
                            }}
                            className="scale-75"
                          />
                          <span className="text-xs text-neutral-605 dark:text-neutral-350">{t.requiredLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-[240px]">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                          {t.minSelect}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={group.minSelection}
                          onChange={(e) => updateGroupField(groupIdx, "minSelection", parseInt(e.target.value) || 0)}
                          className="rounded-xl text-xs h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                          {t.maxSelect}
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          value={group.maxSelection}
                          onChange={(e) => updateGroupField(groupIdx, "maxSelection", parseInt(e.target.value) || 1)}
                          className="rounded-xl text-xs h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        />
                      </div>
                    </div>

                    {/* Options list inside group */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <Label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                        {t.optionsList}
                      </Label>
                      <div className="space-y-1.5">
                        {group.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <Input
                              value={option.name}
                              onChange={(e) => updateOptionField(groupIdx, optIdx, "name", e.target.value)}
                              placeholder={t.optionNameLabel}
                              className="rounded-xl text-xs h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 flex-1"
                            />
                            <div className="w-28 relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-semibold">Rp</span>
                              <Input
                                type="number"
                                value={option.price || ""}
                                onChange={(e) => updateOptionField(groupIdx, optIdx, "price", parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="rounded-xl text-xs h-8 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 pl-7"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOptionFromGroup(groupIdx, optIdx)}
                              className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOptionToGroup(groupIdx)}
                        className="rounded-xl text-xs h-7 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t.addOption}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.price || !form.categoryId}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
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
