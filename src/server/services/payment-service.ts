"use server";

import { db } from "@/db";
import { payments } from "@/db/schema/payments";
import { subscriptions } from "@/db/schema/subscriptions";
import { restaurants } from "@/db/schema/restaurants";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mail";
import { 
  getPaymentSuccessEmailHtml, 
  getPaymentFailedEmailHtml, 
  getPaymentExpiredEmailHtml 
} from "@/lib/mail-templates";

// ── Pricing Config ──────────────────────────────────────
const PLAN_PRICES: Record<string, Record<string, number>> = {
  basic: {
    monthly: 50000,
    yearly: 480000, // 40000 * 12
  },
  pro: {
    monthly: 150000,
    yearly: 1440000, // 120000 * 12
  },
};

// ── Generate Order ID ───────────────────────────────────
function generateOrderId(restaurantId: string): string {
  const prefix = restaurantId.slice(0, 8).toUpperCase();
  const timestamp = Date.now();
  return `MENUQR-${prefix}-${timestamp}`;
}

// ── Create Payment via SumoPod API ──────────────────────
export async function createPayment(
  restaurantId: string,
  plan: "basic" | "pro",
  billingPeriod: "monthly" | "yearly"
): Promise<{ paymentLinkUrl: string; orderId: string } | { error: string }> {
  const apiKey = process.env.SUMOPOD_API_KEY;
  const baseUrl = process.env.SUMOPOD_BASE_URL || "https://api-pay-sandbox.sumopod.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!apiKey) {
    return { error: "Payment gateway belum dikonfigurasi" };
  }

  const amount = PLAN_PRICES[plan]?.[billingPeriod];
  if (!amount) {
    return { error: "Plan atau periode billing tidak valid" };
  }

  const orderId = generateOrderId(restaurantId);

  // Step 1: Call SumoPod API
  let data: {
    payment_id: string;
    order_id: string;
    amount: number;
    fee: number;
    net_amount: number;
    payment_link_url: string;
    status: string;
    expires_at: string | null;
  };

  try {
    console.log("[SumoPod] Creating payment:", { orderId, amount, plan, billingPeriod, baseUrl });
    const response = await fetch(`${baseUrl}/api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        amount,
        currency: "IDR",
        expires_in_hours: 1,
        success_return_url: `${appUrl}/dashboard/billing?status=success&order_id=${orderId}`,
        cancel_return_url: `${appUrl}/dashboard/billing?status=cancelled`,
        payment_method_type_code: "QRIS",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SumoPod] API error:", response.status, errorText);
      return { error: `Gagal membuat pembayaran (${response.status}). Silakan coba lagi.` };
    }

    data = await response.json();
    console.log("[SumoPod] API response:", JSON.stringify(data));
  } catch (error) {
    console.error("[SumoPod] Network/fetch error:", error);
    return { error: "Gagal menghubungi payment gateway. Silakan coba lagi." };
  }

  // Step 2: Save payment record to database
  try {
    await db.insert(payments).values({
      restaurantId,
      orderId,
      paymentId: data.payment_id,
      amount,
      fee: data.fee || 0,
      netAmount: data.net_amount || 0,
      plan,
      billingPeriod,
      status: "pending",
      paymentLinkUrl: data.payment_link_url,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    });
    console.log("[SumoPod] Payment saved to DB:", orderId);
  } catch (dbError) {
    console.error("[SumoPod] Database insert error:", dbError);
    return { error: "Pembayaran dibuat tapi gagal menyimpan ke database." };
  }

  return {
    paymentLinkUrl: data.payment_link_url,
    orderId,
  };
}

// ── Get Payment by Order ID ─────────────────────────────
export async function getPaymentByOrderId(orderId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, orderId),
  });
  return payment;
}

// ── Get Payment History for Restaurant ──────────────────
export async function getPaymentHistory(restaurantId: string) {
  const results = await db.query.payments.findMany({
    where: eq(payments.restaurantId, restaurantId),
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });
  return results;
}

// ── Handle payment.completed Webhook ────────────────────
export async function handlePaymentCompleted(data: {
  payment_id: string;
  order_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  payment_method: string;
  completed_at: string;
}) {
  // Find the payment record
  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, data.order_id),
  });

  if (!payment) {
    console.error("[Webhook] Payment not found for order_id:", data.order_id);
    return;
  }

  // Update payment record
  await db
    .update(payments)
    .set({
      status: "completed",
      fee: data.fee,
      netAmount: data.net_amount,
      paymentMethod: data.payment_method || "qris",
      completedAt: data.completed_at ? new Date(data.completed_at) : new Date(),
    })
    .where(eq(payments.orderId, data.order_id));

  // Fetch existing subscription to check current expiry
  const existingSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.restaurantId, payment.restaurantId),
  });

  // Calculate subscription period
  const now = new Date();
  
  // Use existing currentPeriodEnd if it's in the future, otherwise use now
  const baseStartDate = 
    existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > now
      ? new Date(existingSub.currentPeriodEnd)
      : now;

  const periodEnd = new Date(baseStartDate);
  
  if (payment.billingPeriod === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Upsert subscription
  if (existingSub) {
    await db
      .update(subscriptions)
      .set({
        provider: "sumopod",
        externalSubscriptionId: data.payment_id,
        paymentId: payment.id,
        status: "active",
        // Do not update start date if they are just extending an active sub
        currentPeriodStart: existingSub.currentPeriodEnd && existingSub.currentPeriodEnd > now 
          ? existingSub.currentPeriodStart 
          : now,
        currentPeriodEnd: periodEnd,
      })
      .where(eq(subscriptions.restaurantId, payment.restaurantId));
  } else {
    await db.insert(subscriptions).values({
      restaurantId: payment.restaurantId,
      provider: "sumopod",
      externalSubscriptionId: data.payment_id,
      paymentId: payment.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });
  }

  // Update restaurant plan
  await db
    .update(restaurants)
    .set({
      plan: payment.plan as "basic" | "pro",
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, payment.restaurantId));

  console.log(
    `[Webhook] Payment completed: ${data.order_id} → plan ${payment.plan} for restaurant ${payment.restaurantId}`
  );

  // Send Email Notification
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, payment.restaurantId),
      with: {
        owner: true, // we assume you have relation set up, if not we will fetch user directly
      }
    });

    let owner = restaurant?.owner;
    // Fallback if relation is not set up
    if (!owner && restaurant?.ownerId) {
      owner = await db.query.users.findFirst({
        where: eq(users.id, restaurant.ownerId)
      });
    }

    if (owner?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      const html = getPaymentSuccessEmailHtml({
        userName: owner.name || "Pelanggan",
        orderId: payment.orderId,
        planName: payment.plan,
        billingPeriod: payment.billingPeriod,
        amount: payment.amount,
        periodEnd: periodEnd.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        appUrl
      });

      await sendEmail({
        to: owner.email,
        subject: `[MenuQR] Pembayaran Berhasil - Order ${payment.orderId}`,
        html,
      });
    }
  } catch (error) {
    console.error("[Webhook] Failed to send success email:", error);
  }
}

// ── Handle payment.failed Webhook ───────────────────────
export async function handlePaymentFailed(data: {
  order_id: string;
}) {
  const payment = await db
    .update(payments)
    .set({ status: "failed" })
    .where(eq(payments.orderId, data.order_id))
    .returning();

  console.log(`[Webhook] Payment failed: ${data.order_id}`);

  // Send Email Notification
  if (payment && payment[0]) {
    try {
      const restaurant = await db.query.restaurants.findFirst({
        where: eq(restaurants.id, payment[0].restaurantId),
      });

      if (restaurant?.ownerId) {
        const owner = await db.query.users.findFirst({
          where: eq(users.id, restaurant.ownerId)
        });

        if (owner?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const html = getPaymentFailedEmailHtml({
            userName: owner.name || "Pelanggan",
            orderId: payment[0].orderId,
            planName: payment[0].plan,
            billingPeriod: payment[0].billingPeriod,
            appUrl
          });

          await sendEmail({
            to: owner.email,
            subject: `[MenuQR] Pembayaran Gagal - Order ${payment[0].orderId}`,
            html,
          });
        }
      }
    } catch (error) {
      console.error("[Webhook] Failed to send failed email:", error);
    }
  }
}

// ── Handle payment.expired Webhook ──────────────────────
export async function handlePaymentExpired(data: {
  order_id: string;
}) {
  const payment = await db
    .update(payments)
    .set({ status: "expired" })
    .where(eq(payments.orderId, data.order_id))
    .returning();

  console.log(`[Webhook] Payment expired: ${data.order_id}`);

  // Send Email Notification
  if (payment && payment[0]) {
    try {
      const restaurant = await db.query.restaurants.findFirst({
        where: eq(restaurants.id, payment[0].restaurantId),
      });

      if (restaurant?.ownerId) {
        const owner = await db.query.users.findFirst({
          where: eq(users.id, restaurant.ownerId)
        });

        if (owner?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const html = getPaymentExpiredEmailHtml({
            userName: owner.name || "Pelanggan",
            orderId: payment[0].orderId,
            planName: payment[0].plan,
            billingPeriod: payment[0].billingPeriod,
            appUrl
          });

          await sendEmail({
            to: owner.email,
            subject: `[MenuQR] Pembayaran Kedaluwarsa - Order ${payment[0].orderId}`,
            html,
          });
        }
      }
    } catch (error) {
      console.error("[Webhook] Failed to send expired email:", error);
    }
  }
}

// ── Get Active Subscription ─────────────────────────────
export async function getActiveSubscription(restaurantId: string) {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.restaurantId, restaurantId),
  });
  return sub;
}
