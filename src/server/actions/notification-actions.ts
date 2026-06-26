"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema/notifications";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/server/services/auth-service";
import { revalidatePath } from "next/cache";

export type Notification = typeof notifications.$inferSelect;

/** Fetch all notifications for the current user (most recent first, limit 30) */
export async function getNotifications(): Promise<{
  data: Notification[];
  unreadCount: number;
  error?: string;
}> {
  const session = await getSession();
  if (!session) return { data: [], unreadCount: 0, error: "Unauthorized" };

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  const unreadCount = rows.filter((n) => !n.isRead).length;
  return { data: rows, unreadCount };
}

/** Mark a single notification as read */
export async function markNotificationRead(notifId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notifId), eq(notifications.userId, session.user.id)));

  revalidatePath("/dashboard");
  return {};
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, session.user.id));

  revalidatePath("/dashboard");
  return {};
}

/** Delete a single notification */
export async function deleteNotification(notifId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db
    .delete(notifications)
    .where(and(eq(notifications.id, notifId), eq(notifications.userId, session.user.id)));

  revalidatePath("/dashboard");
  return {};
}

/** Create a notification (called server-side, e.g. on new order) */
export async function createNotification(payload: {
  userId: string;
  type: "info" | "order" | "system" | "warning";
  title: string;
  message: string;
  href?: string;
}): Promise<{ error?: string }> {
  await db.insert(notifications).values({
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    href: payload.href ?? null,
  });
  revalidatePath("/dashboard");
  return {};
}
