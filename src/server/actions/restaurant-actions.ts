"use server";

import { db } from "@/db";
import { restaurants } from "@/db/schema/restaurants";
import { getSession } from "@/server/services/auth-service";
import { createRestaurantSchema, updateRestaurantSchema } from "@/features/restaurant/restaurant.schema";
import { eq, and } from "drizzle-orm";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createRestaurant(
  data: unknown
): Promise<{ data?: typeof restaurants.$inferSelect; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parsed = createRestaurantSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { name, description, phone, whatsapp_number, address } = parsed.data;

  const slug = generateSlug(name);

  const [restaurant] = await db
    .insert(restaurants)
    .values({
      ownerId: session.user.id,
      name,
      slug,
      description,
      phone,
      whatsappNumber: whatsapp_number,
      address,
    })
    .returning();

  return { data: restaurant };
}

export async function updateRestaurant(
  id: string,
  data: unknown
): Promise<{ data?: typeof restaurants.$inferSelect; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });

  if (!existing) {
    return { error: "Restaurant not found" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && existing.ownerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const parsed = updateRestaurantSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.whatsapp_number !== undefined) updateData.whatsappNumber = parsed.data.whatsapp_number;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address;

  if (Object.keys(updateData).length === 0) {
    return { error: "No fields to update" };
  }

  const [restaurant] = await db
    .update(restaurants)
    .set(updateData)
    .where(eq(restaurants.id, id))
    .returning();

  return { data: restaurant };
}

export async function deleteRestaurant(
  id: string
): Promise<{ data?: typeof restaurants.$inferSelect; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });

  if (!existing) {
    return { error: "Restaurant not found" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && existing.ownerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const [restaurant] = await db
    .delete(restaurants)
    .where(eq(restaurants.id, id))
    .returning();

  return { data: restaurant };
}

export async function updateRestaurantPlan(
  id: string,
  plan: "free" | "basic" | "pro"
): Promise<{ data?: typeof restaurants.$inferSelect; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });

  if (!existing) {
    return { error: "Restaurant not found" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && existing.ownerId !== session.user.id) {
    return { error: "Forbidden" };
  }

  const [restaurant] = await db
    .update(restaurants)
    .set({ plan, updatedAt: new Date() })
    .where(eq(restaurants.id, id))
    .returning();

  return { data: restaurant };
}

export async function updateRestaurantCustomDomain(
  id: string,
  customDomain: string | null
): Promise<{ data?: typeof restaurants.$inferSelect; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });

  if (!existing) {
    return { error: "Restaurant not found" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && existing.ownerId !== session.user.id) {
    return { error: "Forbidden" };
  }

  if (existing.plan !== "pro" && !isSuperAdmin) {
    return { error: "Custom domain hanya tersedia untuk paket Pro" };
  }

  const [restaurant] = await db
    .update(restaurants)
    .set({ customDomain, updatedAt: new Date() })
    .where(eq(restaurants.id, id))
    .returning();

  return { data: restaurant };
}

