"use server";

import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";
import { getSession } from "@/server/services/auth-service";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "@/features/menu/menu.schema";
import { eq, and, sql } from "drizzle-orm";

async function verifyRestaurantOwnership(restaurantId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found");
  
  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && restaurant.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  return restaurant;
}

async function getMenuItemOrThrow(id: string, restaurantId: string) {
  const [item] = await db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.restaurantId, restaurantId)))
    .limit(1);

  if (!item) throw new Error("Menu item not found");
  return item;
}

export async function createMenuItem(restaurantId: string, data: unknown) {
  await verifyRestaurantOwnership(restaurantId);

  const parsed = createMenuItemSchema.parse(data);

  const [result] = await db
    .insert(menuItems)
    .values({
      restaurantId,
      categoryId: parsed.categoryId,
      name: parsed.name,
      description: parsed.description,
      price: String(parsed.price),
      imageUrl: parsed.imageUrl,
      available: parsed.available,
      featured: parsed.featured,
    })
    .returning();

  return result;
}

export async function updateMenuItem(
  id: string,
  restaurantId: string,
  data: unknown
) {
  await verifyRestaurantOwnership(restaurantId);
  await getMenuItemOrThrow(id, restaurantId);

  const parsed = updateMenuItemSchema.parse(data);

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.price !== undefined) updateData.price = String(parsed.price);
  if (parsed.categoryId !== undefined) updateData.categoryId = parsed.categoryId;
  if (parsed.imageUrl !== undefined) updateData.imageUrl = parsed.imageUrl;
  if (parsed.available !== undefined) updateData.available = parsed.available;
  if (parsed.featured !== undefined) updateData.featured = parsed.featured;

  const [updated] = await db
    .update(menuItems)
    .set(updateData)
    .where(eq(menuItems.id, id))
    .returning();

  return updated;
}

export async function deleteMenuItem(id: string, restaurantId: string) {
  await verifyRestaurantOwnership(restaurantId);
  await getMenuItemOrThrow(id, restaurantId);

  await db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function toggleAvailability(id: string, restaurantId: string) {
  await verifyRestaurantOwnership(restaurantId);
  await getMenuItemOrThrow(id, restaurantId);

  const [updated] = await db
    .update(menuItems)
    .set({
      available: sql`NOT ${menuItems.available}`,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id))
    .returning();

  return updated;
}

export async function toggleFeatured(id: string, restaurantId: string) {
  await verifyRestaurantOwnership(restaurantId);
  await getMenuItemOrThrow(id, restaurantId);

  const [updated] = await db
    .update(menuItems)
    .set({
      featured: sql`NOT ${menuItems.featured}`,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id))
    .returning();

  return updated;
}
