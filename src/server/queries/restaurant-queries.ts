import { db } from "@/db";
import { restaurants } from "@/db/schema/restaurants";
import { eq, and } from "drizzle-orm";

export async function getRestaurantById(id: string, userId: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: and(eq(restaurants.id, id), eq(restaurants.ownerId, userId)),
  });
  return restaurant;
}

export async function getRestaurantBySlug(slug: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });
  return restaurant;
}

export async function getRestaurantsByOwner(ownerId: string) {
  const results = await db.query.restaurants.findMany({
    where: eq(restaurants.ownerId, ownerId),
  });
  return results;
}

export async function getAllRestaurants() {
  const results = await db.query.restaurants.findMany();
  return results;
}

