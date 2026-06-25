"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Grid3X3,
} from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/server/actions/category-actions";
import { getCategoriesByRestaurant } from "@/server/queries/category-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  sortOrder: number;
};

interface CategoriesContentProps {
  restaurants: Restaurant[];
}

const categoriesTranslations = {
  id: {
    pageTitle: "Kategori",
    pageSubtitle: "Kelola dan kelompokkan menu makanan Anda ke dalam kategori.",
    addCategory: "Tambah Kategori",
    selectRestaurant: "Pilih restoran",
    selectRestoTitle: "Pilih restoran terlebih dahulu",
    selectRestoDesc: "Pilih salah satu restoran di atas untuk mengelola kategorinya.",
    loadingCategories: "Memuat kategori...",
    noCategoriesYet: "Belum ada kategori",
    addCategoriesToOrganize: "Tambahkan kategori baru untuk mengelompokkan menu hidangan Anda.",
    allCategories: "Semua Kategori",
    categoriesCount: "{count} kategori",
    editTitle: "Edit Kategori",
    createTitle: "Buat Kategori",
    deleteTitle: "Hapus Kategori",
    deleteWarning: "Apakah Anda yakin ingin menghapus kategori {name}?",
    nameLabel: "Nama Kategori",
    namePlaceholder: "Contoh: Makanan Utama, Minuman, Penutup...",
    cancel: "Batal",
    saving: "Menyimpan...",
    deleting: "Menghapus...",
    deleteBtn: "Hapus",
    updateBtn: "Perbarui",
    createBtn: "Buat",
    toastFailedLoad: "Gagal memuat kategori",
    toastUpdated: "Kategori berhasil diperbarui",
    toastCreated: "Kategori berhasil dibuat",
    toastDeleted: "Kategori berhasil dihapus",
    toastReorderFailed: "Gagal mengubah urutan",
    toastSomethingWrong: "Terjadi kesalahan",
  },
  en: {
    pageTitle: "Categories",
    pageSubtitle: "Organize your menu items into categories.",
    addCategory: "Add Category",
    selectRestaurant: "Select a restaurant",
    selectRestoTitle: "Select a restaurant",
    selectRestoDesc: "Choose a restaurant above to manage its categories.",
    loadingCategories: "Loading categories...",
    noCategoriesYet: "No categories yet",
    addCategoriesToOrganize: "Add categories to organize your menu items.",
    allCategories: "All Categories",
    categoriesCount: "{count} categories",
    editTitle: "Edit Category",
    createTitle: "Create Category",
    deleteTitle: "Delete Category",
    deleteWarning: "Are you sure you want to delete category {name}?",
    nameLabel: "Category Name",
    namePlaceholder: "e.g. Appetizers, Main Course, Drinks...",
    cancel: "Cancel",
    saving: "Saving...",
    deleting: "Deleting...",
    deleteBtn: "Delete",
    updateBtn: "Update",
    createBtn: "Create",
    toastFailedLoad: "Failed to load categories",
    toastUpdated: "Category updated successfully",
    toastCreated: "Category created successfully",
    toastDeleted: "Category deleted successfully",
    toastReorderFailed: "Failed to reorder",
    toastSomethingWrong: "Something went wrong",
  }
};

export function CategoriesContent({ restaurants }: CategoriesContentProps) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");

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

  const t = categoriesTranslations[lang];

  const loadCategories = useCallback(async (restaurantId: string) => {
    if (!restaurantId) {
      setCategories([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getCategoriesByRestaurant(restaurantId);
      setCategories(data);
    } catch {
      toast.error(t.toastFailedLoad);
    } finally {
      setLoading(false);
    }
  }, [t.toastFailedLoad]);

  function handleRestaurantChange(value: string) {
    setSelectedRestaurantId(value);
    setCategories([]);
    loadCategories(value);
  }

  function openCreate() {
    setEditing(null);
    setCategoryName("");
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setCategoryName(cat.name);
    setDialogOpen(true);
  }

  function openDelete(cat: Category) {
    setDeleting(cat);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!selectedRestaurantId) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, selectedRestaurantId, { name: categoryName });
        toast.success(t.toastUpdated);
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, name: categoryName } : c))
        );
      } else {
        const result = await createCategory(selectedRestaurantId, { name: categoryName });
        toast.success(t.toastCreated);
        setCategories((prev) => [...prev, { id: result.id, name: result.name, sortOrder: result.sortOrder }]);
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.toastSomethingWrong);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting || !selectedRestaurantId) return;
    setSaving(true);
    try {
      await deleteCategory(deleting.id, selectedRestaurantId);
      toast.success(t.toastDeleted);
      setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleteDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.toastSomethingWrong);
    } finally {
      setSaving(false);
    }
  }

  async function moveCategory(index: number, direction: "up" | "down") {
    if (!selectedRestaurantId) return;
    const newCategories = [...categories];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newCategories.length) return;
    [newCategories[index], newCategories[target]] = [newCategories[target], newCategories[index]];
    setCategories(newCategories);
    try {
      await reorderCategories(
        selectedRestaurantId,
        newCategories.map((c) => c.id)
      );
    } catch {
      toast.error(t.toastReorderFailed);
      setCategories([...categories]);
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
        {selectedRestaurantId && (
          <Button
            onClick={openCreate}
            className="bg-orange-505 hover:bg-orange-600 text-white rounded-xl text-sm shadow-md shadow-orange-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.addCategory}
          </Button>
        )}
      </div>

      {/* Restaurant Selector */}
      <div className="flex items-center gap-4">
        <div className="w-72">
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
      </div>

      {/* Content */}
      {!selectedRestaurantId ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-4">
            <Grid3X3 className="h-8 w-8 text-blue-500" />
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
            <span className="text-sm text-neutral-400 font-medium">{t.loadingCategories}</span>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 p-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-4">
            <Grid3X3 className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            {t.noCategoriesYet}
          </h3>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-5 max-w-sm">
            {t.addCategoriesToOrganize}
          </p>
          <Button
            onClick={openCreate}
            className="bg-orange-505 hover:bg-orange-600 text-white rounded-xl text-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t.addCategory}
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <p className="font-bold text-sm text-neutral-900 dark:text-white">{t.allCategories}</p>
              <p className="text-[11px] text-neutral-400">
                {t.categoriesCount.replace("{count}", categories.length.toString())}
              </p>
            </div>
          </div>
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-mono text-xs font-bold">
                    {cat.sortOrder}
                  </div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveCategory(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveCategory(index, "down")}
                    disabled={index === categories.length - 1}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openDelete(cat)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {t.nameLabel}
            </Label>
            <Input
              id="cat-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="rounded-xl"
              placeholder={t.namePlaceholder}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
              {t.cancel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !categoryName}
              className="bg-orange-505 hover:bg-orange-600 text-white rounded-xl"
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
