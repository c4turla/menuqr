"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getCategoriesByRestaurant(restaurantId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.restaurantId, restaurantId))
    .orderBy(categories.sortOrder);
}

export async function getCategoryById(id: string, restaurantId: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)))
    .limit(1);

  return category ?? null;
}
