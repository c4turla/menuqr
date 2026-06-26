"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ShoppingCart,
  Info,
  AlertTriangle,
  Settings2,
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/server/actions/notification-actions";
import type { Notification } from "@/server/actions/notification-actions";

/* ── Icon helpers ──────────────────────────────────────────────────── */
function NotifIcon({ type }: { type: string }) {
  const base = "h-3.5 w-3.5";
  if (type === "order")   return <ShoppingCart className={`${base} text-orange-500`} />;
  if (type === "warning") return <AlertTriangle className={`${base} text-amber-500`} />;
  if (type === "system")  return <Settings2    className={`${base} text-blue-500`} />;
  return                         <Info         className={`${base} text-emerald-500`} />;
}

function typeBg(type: string) {
  if (type === "order")   return "bg-orange-50 dark:bg-orange-900/20";
  if (type === "warning") return "bg-amber-50 dark:bg-amber-900/20";
  if (type === "system")  return "bg-blue-50 dark:bg-blue-900/20";
  return                         "bg-emerald-50 dark:bg-emerald-900/20";
}

function relativeTime(date: Date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

/* ── Main Component ────────────────────────────────────────────────── */
export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Load notifications when panel opens */
  const load = async () => {
    setLoading(true);
    const res = await getNotifications();
    setNotifs(res.data);
    setUnread(res.unreadCount);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    });
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    });
  }

  function handleDelete(id: string) {
    const target = notifs.find((n) => n.id === id);
    startTransition(async () => {
      await deleteNotification(id);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) setUnread((c) => Math.max(0, c - 1));
    });
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
        aria-label="Notifikasi"
      >
        <Bell className={`h-4 w-4 ${open ? "text-orange-500" : "text-neutral-500"} transition-colors`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-neutral-900 dark:text-white">Notifikasi</p>
                {unread > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    {unread} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={isPending}
                    title="Tandai semua sudah dibaca"
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-emerald-500"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-800">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-xs">Memuat notifikasi...</p>
                </div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                  <Bell className="h-10 w-10 opacity-20 mb-3" />
                  <p className="text-sm font-semibold">Belum ada notifikasi</p>
                  <p className="text-xs mt-1 text-neutral-400">Notifikasi baru akan muncul di sini</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative flex gap-3 px-4 py-3 transition-colors cursor-default ${
                      n.isRead
                        ? "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        : "bg-orange-50/40 dark:bg-orange-900/5 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                    }`}
                  >
                    {/* Type icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5 ${typeBg(n.type)}`}>
                      <NotifIcon type={n.type} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {n.href ? (
                        <Link
                          href={n.href}
                          onClick={() => { if (!n.isRead) handleMarkRead(n.id); setOpen(false); }}
                          className="text-xs font-bold text-neutral-900 dark:text-white hover:text-orange-500 transition-colors line-clamp-1"
                        >
                          {n.title}
                        </Link>
                      ) : (
                        <p className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{n.title}</p>
                      )}
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">{relativeTime(n.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                    )}

                    {/* Actions (hover) */}
                    <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          disabled={isPending}
                          title="Tandai sudah dibaca"
                          className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-neutral-300 hover:text-emerald-500 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={isPending}
                        title="Hapus notifikasi"
                        className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                <p className="text-[10px] text-neutral-400 text-center">
                  Menampilkan {notifs.length} notifikasi terbaru
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
