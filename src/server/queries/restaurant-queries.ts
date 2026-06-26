import { db } from "@/db";
import { restaurants } from "@/db/schema/restaurants";
import { staff } from "@/db/schema/staff";
import { eq, and, inArray } from "drizzle-orm";

export async function getRestaurantById(id: string, userId: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, id),
  });
  if (!restaurant) return null;
  if (restaurant.ownerId === userId) return restaurant;

  const staffCheck = await db.query.staff.findFirst({
    where: and(eq(staff.restaurantId, id), eq(staff.userId, userId)),
  });
  if (staffCheck) return restaurant;

  return null;
}

export async function getRestaurantBySlug(slug: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });
  return restaurant;
}

export async function getRestaurantsByOwner(ownerId: string) {
  const owned = await db.query.restaurants.findMany({
    where: eq(restaurants.ownerId, ownerId),
  });

  const staffRelations = await db.query.staff.findMany({
    where: eq(staff.userId, ownerId),
  });

  if (staffRelations.length > 0) {
    const staffRestoIds = staffRelations.map((sr) => sr.restaurantId);
    const staffRestos = await db.query.restaurants.findMany({
      where: inArray(restaurants.id, staffRestoIds),
    });

    const combined = [...owned];
    for (const r of staffRestos) {
      if (!combined.some((cr) => cr.id === r.id)) {
        combined.push(r);
      }
    }
    return combined;
  }

  return owned;
}

export async function getAllRestaurants() {
  const results = await db.query.restaurants.findMany();
  return results;
}

