"use server";

import { db } from "@/db";
import { categories, restaurants } from "@/db/schema";
import { getSession } from "@/server/services/auth-service";
import { createCategorySchema, updateCategorySchema } from "@/features/category/category.schema";
import { eq, count } from "drizzle-orm";
import { getCategoryById } from "@/server/queries/category-queries";

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

export async function createCategory(restaurantId: string, data: unknown) {
  await verifyRestaurantOwnership(restaurantId);

  const parsed = createCategorySchema.parse(data);

  const [result] = await db.transaction(async (tx) => {
    const [countResult] = await tx
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.restaurantId, restaurantId));

    const [category] = await tx
      .insert(categories)
      .values({
        restaurantId,
        name: parsed.name,
        sortOrder: countResult.value,
      })
      .returning();

    return [category];
  });

  return result;
}

export async function updateCategory(id: string, restaurantId: string, data: unknown) {
  await verifyRestaurantOwnership(restaurantId);

  const category = await getCategoryById(id, restaurantId);
  if (!category) throw new Error("Category not found");

  const parsed = updateCategorySchema.parse(data);

  const [updated] = await db
    .update(categories)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();

  return updated;
}

export async function deleteCategory(id: string, restaurantId: string) {
  await verifyRestaurantOwnership(restaurantId);

  const category = await getCategoryById(id, restaurantId);
  if (!category) throw new Error("Category not found");

  await db.delete(categories).where(eq(categories.id, id));
}

export async function reorderCategories(restaurantId: string, orderedIds: string[]) {
  await verifyRestaurantOwnership(restaurantId);

  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(categories)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(categories.id, orderedIds[i]));
    }
  });
}
