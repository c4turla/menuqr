"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Search, Mail, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
};

interface UsersContentProps {
  users: UserRecord[];
}

const usersTranslations = {
  id: {
    pageTitle: "Direktori Pengguna",
    pageSubtitle: "Kelola dan lihat semua akun pengguna yang terdaftar di platform Anda.",
    totalUsersLabel: "Total Pengguna",
    superAdminsLabel: "Super Admin",
    regularOwnersLabel: "Pemilik Restoran",
    searchPlaceholder: "Cari user berdasarkan nama, email, atau role...",
    registerLabel: "Daftar:",
    noUsersFound: "Pengguna tidak ditemukan",
  },
  en: {
    pageTitle: "User Directory",
    pageSubtitle: "Manage and view all registered user accounts on your platform.",
    totalUsersLabel: "Total Users",
    superAdminsLabel: "Super Admins",
    regularOwnersLabel: "Restaurant Owners",
    searchPlaceholder: "Search users by name, email, or role...",
    registerLabel: "Registered:",
    noUsersFound: "No users found",
  }
};

export function UsersContent({ users }: UsersContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  const t = usersTranslations[lang];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t.totalUsersLabel}</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t.superAdminsLabel}</span>
          <p className="text-2xl font-black text-red-500 mt-1">
            {users.filter((u) => u.role === "super_admin").length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t.regularOwnersLabel}</span>
          <p className="text-2xl font-black text-blue-500 mt-1">
            {users.filter((u) => u.role !== "super_admin").length}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder={t.searchPlaceholder}
          className="pl-10 pr-4 py-5 rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs shadow-sm focus-visible:ring-orange-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* User List Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map((u) => {
          const isSuperAdmin = u.role === "super_admin";
          const formattedDate = new Date(u.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={u.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-sm">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {u.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{u.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-50 dark:border-neutral-800">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Calendar className="h-3 w-3" />
                  <span>{t.registerLabel} {formattedDate}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-extrabold capitalize px-2 py-0.5 rounded-full border-none
                    ${isSuperAdmin ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"}`}
                >
                  {u.role || "owner"}
                </Badge>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 dark:text-neutral-600">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">{t.noUsersFound}</p>
          </div>
        )}
      </div>
    </div>
  );
}
