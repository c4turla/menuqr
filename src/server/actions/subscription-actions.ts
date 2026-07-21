"use server";

import { getSession } from "@/server/services/auth-service";
import {
  createPayment,
  getPaymentHistory as getPaymentHistoryService,
  getActiveSubscription as getActiveSubscriptionService,
} from "@/server/services/payment-service";
import { updateRestaurantPlan } from "@/server/actions/restaurant-actions";
import { db } from "@/db";
import { restaurants } from "@/db/schema/restaurants";
import { eq } from "drizzle-orm";

// ── Create Subscription Payment ─────────────────────────
export async function createSubscriptionPayment(
  restaurantId: string,
  plan: "basic" | "pro",
  billingPeriod: "monthly" | "yearly"
): Promise<{ paymentLinkUrl?: string; orderId?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Verify ownership
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  if (restaurant.ownerId !== session.user.id) {
    return { error: "Tidak memiliki akses ke restoran ini" };
  }

  // Cannot upgrade to same plan
  // if (restaurant.plan === plan) {
  //   return { error: `Restoran sudah menggunakan paket ${plan.toUpperCase()}` };
  // }

  const result = await createPayment(restaurantId, plan, billingPeriod);
  return result;
}

// ── Downgrade to Free ───────────────────────────────────
export async function downgradeToFree(
  restaurantId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  if (restaurant.ownerId !== session.user.id) {
    return { error: "Tidak memiliki akses ke restoran ini" };
  }

  if (restaurant.plan === "free") {
    return { error: "Restoran sudah menggunakan paket Gratis" };
  }

  // Downgrade via existing action
  const res = await updateRestaurantPlan(restaurantId, "free");
  return res.error ? { error: res.error } : {};
}

// ── Get Payment History ─────────────────────────────────
export async function getPaymentHistoryAction(restaurantId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return [];
  }

  // Verify ownership
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurant || restaurant.ownerId !== session.user.id) {
    return [];
  }

  return getPaymentHistoryService(restaurantId);
}

// ── Get Subscription Status ─────────────────────────────
export async function getSubscriptionStatusAction(restaurantId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurant || restaurant.ownerId !== session.user.id) {
    return null;
  }

  return getActiveSubscriptionService(restaurantId);
}
