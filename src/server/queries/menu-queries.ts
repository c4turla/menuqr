"use server";

import { db } from "@/db";
import { menuItems, categories, restaurants } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

export async function getMenuItemsByRestaurant(restaurantId: string) {
  return db
    .select({
      id: menuItems.id,
      restaurantId: menuItems.restaurantId,
      categoryId: menuItems.categoryId,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      available: menuItems.available,
      featured: menuItems.featured,
      modifiers: menuItems.modifiers,
      createdAt: menuItems.createdAt,
      updatedAt: menuItems.updatedAt,
      categoryName: categories.name,
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(categories.sortOrder, asc(menuItems.name));
}

export async function getMenuItemsByCategory(categoryId: string) {
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId))
    .orderBy(asc(menuItems.name));
}

export async function getMenuItemsPublic(restaurantSlug: string) {
  return db
    .select({
      id: menuItems.id,
      restaurantId: menuItems.restaurantId,
      categoryId: menuItems.categoryId,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      imageUrl: menuItems.imageUrl,
      available: menuItems.available,
      featured: menuItems.featured,
      modifiers: menuItems.modifiers,
      createdAt: menuItems.createdAt,
      updatedAt: menuItems.updatedAt,
      categoryName: categories.name,
    })
    .from(menuItems)
    .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(eq(restaurants.slug, restaurantSlug))
    .orderBy(desc(menuItems.featured), desc(menuItems.available), asc(menuItems.name));
}
