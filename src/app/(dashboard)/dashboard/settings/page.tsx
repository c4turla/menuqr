import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";
import { SettingsContent } from "./_components/settings-content";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq, inArray } from "drizzle-orm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  // Retrieve the full user record directly from the database
  const dbUsers = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const dbUser = dbUsers[0];

  if (!dbUser) return null;

  const restaurants = await getRestaurantsByOwner(session.user.id);

  // Fetch subscriptions for owner's restaurants
  let dbSubscriptions: any[] = [];
  if (restaurants.length > 0) {
    dbSubscriptions = await db.select().from(subscriptions).where(
      inArray(subscriptions.restaurantId, restaurants.map(r => r.id))
    );
  }

  const serializedRestaurants = restaurants.map(r => {
    const sub = dbSubscriptions.find(s => s.restaurantId === r.id);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      plan: r.plan,
      phone: r.phone,
      address: r.address,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      subscription: sub ? {
        id: sub.id,
        provider: sub.provider || null,
        externalSubscriptionId: sub.externalSubscriptionId || null,
        status: sub.status || null,
        currentPeriodStart: sub.currentPeriodStart ? sub.currentPeriodStart.toISOString() : null,
        currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
        createdAt: sub.createdAt.toISOString(),
      } : null,
    };
  });

  return (
    <SettingsContent 
      user={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        emailVerified: dbUser.emailVerified,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
        role: dbUser.role,
        phone: dbUser.phone,
        occupation: dbUser.occupation,
        address: dbUser.address,
        country: dbUser.country,
        province: dbUser.province,
        postalCode: dbUser.postalCode,
      }} 
      restaurants={serializedRestaurants} 
    />
  );
}
