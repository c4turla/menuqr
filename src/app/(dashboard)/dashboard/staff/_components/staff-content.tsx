"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, ShieldAlert, Check, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  addStaffAction,
  getStaffListAction,
  removeStaffAction,
  updateStaffRoleAction,
} from "@/server/actions/staff-actions";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "basic" | "pro";
}

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface StaffContentProps {
  initialRestaurants: Restaurant[];
  planTier: "free" | "basic" | "pro" | "super_admin";
}

const staffTranslations = {
  id: {
    title: "Kelola Staff",
    subtitle: "Tambahkan dan kelola hak akses staf untuk operasional outlet Anda.",
    selectResto: "Pilih Outlet / Restoran",
    proLockedTitle: "Fitur Kelola Staff Terkunci",
    proLockedDesc: "Fitur Multiple Staff hanya tersedia bagi pengguna paket PRO. Upgrade sekarang untuk mengizinkan kasir, manager, atau koki Anda mengakses dashboard dapur & POS secara mandiri.",
    upgradeBtn: "Upgrade ke Paket PRO",
    addStaffBtn: "Tambah Staff Baru",
    cancelBtn: "Batal",
    nameLabel: "Nama Lengkap Staf",
    namePlaceholder: "Contoh: Budi Santoso",
    emailLabel: "Alamat Email Staf",
    emailPlaceholder: "Contoh: budi@outlet.com",
    passLabel: "Password Akses",
    passPlaceholder: "Minimal 6 karakter",
    roleLabel: "Peran / Hak Akses",
    roleManager: "Manager (Akses Penuh Kelola Menu & Pesanan)",
    roleCashier: "Kasir (Hanya Akses Pesanan POS & Pembayaran)",
    roleKitchen: "Koki / Dapur (Hanya Layar Kitchen Display)",
    saveBtn: "Simpan Staff",
    saving: "Menyimpan...",
    noStaff: "Belum ada staff terdaftar di outlet ini.",
    addedSuccess: "Staff berhasil ditambahkan!",
    removedSuccess: "Staff berhasil dihapus!",
    roleUpdatedSuccess: "Peran staff berhasil diperbarui!",
    removeConfirm: "Apakah Anda yakin ingin menghapus staf ini?",
    tableName: "Nama Staf",
    tableEmail: "Email",
    tableRole: "Peran",
    tableDate: "Bergabung",
    tableActions: "Aksi",
    noRestos: "Belum ada outlet terdaftar.",
  },
  en: {
    title: "Manage Staff",
    subtitle: "Add and manage staff access permissions for your outlet operations.",
    selectResto: "Select Outlet / Restaurant",
    proLockedTitle: "Manage Staff Feature Locked",
    proLockedDesc: "Multiple Staff features are only available on the PRO plan. Upgrade now to allow cashiers, managers, or kitchen chefs to access the POS & kitchen dashboards independently.",
    upgradeBtn: "Upgrade to PRO Plan",
    addStaffBtn: "Add New Staff",
    cancelBtn: "Cancel",
    nameLabel: "Staff Full Name",
    namePlaceholder: "e.g. John Doe",
    emailLabel: "Staff Email Address",
    emailPlaceholder: "e.g. john@outlet.com",
    passLabel: "Access Password",
    passPlaceholder: "Minimum 6 characters",
    roleLabel: "Role / Permission",
    roleManager: "Manager (Full Access to Menus & Orders)",
    roleCashier: "Cashier (POS Orders & Payment Screen Only)",
    roleKitchen: "Chef / Kitchen (Kitchen Display Screen Only)",
    saveBtn: "Save Staff Member",
    saving: "Saving...",
    noStaff: "No staff registered for this outlet yet.",
    addedSuccess: "Staff successfully added!",
    removedSuccess: "Staff successfully removed!",
    roleUpdatedSuccess: "Staff role successfully updated!",
    removeConfirm: "Are you sure you want to remove this staff member?",
    tableName: "Staff Name",
    tableEmail: "Email",
    tableRole: "Role",
    tableDate: "Joined Date",
    tableActions: "Actions",
    noRestos: "No restaurants registered yet.",
  },
};

export function StaffContent({ initialRestaurants, planTier }: StaffContentProps) {
  const [restaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedId, setSelectedId] = useState(initialRestaurants[0]?.id || "");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  const [lang, setLang] = useState<"id" | "en">("id");

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

  const selectedResto = restaurants.find((r) => r.id === selectedId);
  const isSuperAdmin = planTier === "super_admin";
  const isPro = isSuperAdmin || selectedResto?.plan === "pro";

  // Fetch staff list when selected outlet changes
  useEffect(() => {
    if (!selectedId || !isPro) {
      setStaffList([]);
      return;
    }

    async function loadStaff() {
      setLoadingList(true);
      try {
        const res = await getStaffListAction(selectedId);
        if (res.data) {
          setStaffList(res.data);
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch {
        toast.error("Gagal memuat staff");
      } finally {
        setLoadingList(false);
      }
    }

    loadStaff();
  }, [selectedId, isPro]);

  const t = staffTranslations[lang];

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    if (!formData.name || !formData.email || !formData.role) {
      toast.error(lang === "id" ? "Mohon isi semua bidang formulir" : "Please fill in all form fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addStaffAction(selectedId, formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(t.addedSuccess);
      setShowAddForm(false);
      setFormData({ name: "", email: "", password: "", role: "cashier" });

      // Refresh list
      const updatedList = await getStaffListAction(selectedId);
      if (updatedList.data) {
        setStaffList(updatedList.data);
      }
    } catch {
      toast.error(lang === "id" ? "Gagal menambahkan staf" : "Failed to add staff member");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveStaff(staffId: string) {
    if (!confirm(t.removeConfirm)) return;

    try {
      const res = await removeStaffAction(selectedId, staffId);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(t.removedSuccess);
      setStaffList((prev) => prev.filter((item) => item.id !== staffId));
    } catch {
      toast.error(lang === "id" ? "Gagal menghapus staf" : "Failed to remove staff member");
    }
  }

  async function handleRoleChange(staffId: string, newRole: string) {
    try {
      const res = await updateStaffRoleAction(selectedId, staffId, newRole);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(t.roleUpdatedSuccess);
      setStaffList((prev) =>
        prev.map((item) => (item.id === staffId ? { ...item, role: newRole } : item))
      );
    } catch {
      toast.error("Gagal mengupdate role");
    }
  }

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
          <p className="text-sm font-semibold text-neutral-500">{t.noRestos}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            {t.title}
            <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{t.subtitle}</p>
        </div>

        {isPro && !showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md shadow-orange-500/20 py-5 px-4 cursor-pointer"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t.addStaffBtn}
          </Button>
        )}
      </div>

      {/* Outlet Selector Card */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 max-w-xl">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {t.selectResto}
          </label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setShowAddForm(false);
            }}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.plan.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pro Locked Screen Banner */}
      {!isPro ? (
        <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 border border-neutral-800 p-8 text-center text-white relative overflow-hidden shadow-2xl max-w-3xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] bg-orange-500/10 rounded-full blur-[100px] -z-10" />
          
          <div className="mx-auto max-w-lg space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mx-auto text-orange-500 animate-bounce">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t.proLockedTitle}</h2>
              <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                {t.proLockedDesc}
              </p>
            </div>

            <div className="pt-2">
              <Link href="/dashboard/billing">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs py-5 px-6 shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  {t.upgradeBtn}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Add Staff Collapse Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white mb-4">
                {t.addStaffBtn}
              </h3>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.emailLabel}
                    </label>
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.passLabel}
                    </label>
                    <input
                      type="password"
                      placeholder={t.passPlaceholder}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      {t.roleLabel}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    >
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                      <option value="kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {t.cancelBtn}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      t.saveBtn
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Staff List Table */}
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
            {loadingList ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-neutral-400 font-semibold">
                  {lang === "id" ? "Memuat staf..." : "Loading staff members..."}
                </p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-neutral-500 mb-1">{t.noStaff}</p>
                <p className="text-xs text-neutral-400 font-medium">
                  {lang === "id"
                    ? "Daftarkan kasir, chef, atau manager untuk mempermudah operasional."
                    : "Add cashiers, chefs, or managers to streamline operations."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                      <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t.tableName}</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t.tableEmail}</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t.tableRole}</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider">{t.tableDate}</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-neutral-400 uppercase tracking-wider text-right">{t.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {staffList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{item.name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{item.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                          >
                            <option value="manager">Manager</option>
                            <option value="cashier">Cashier</option>
                            <option value="kitchen">Kitchen</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-neutral-400 font-semibold">{formatDate(item.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleRemoveStaff(item.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
