"use server";

import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { restaurants } from "@/db/schema/restaurants";
import { getSession } from "@/server/services/auth-service";
import { eq, desc, and } from "drizzle-orm";

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

export async function createOrderAction(
  restaurantId: string,
  data: {
    tableNumber?: string;
    customerName?: string;
    items: {
      menuItemId: string;
      name: string;
      price: string;
      quantity: number;
    }[];
  }
) {
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
    });

    if (!restaurant) {
      return { error: "Restoran tidak ditemukan" };
    }

    if (restaurant.plan !== "basic" && restaurant.plan !== "pro") {
      return { error: "Pemesanan langsung hanya tersedia pada paket Basic & Pro" };
    }

    if (!data.items || data.items.length === 0) {
      return { error: "Pesanan tidak boleh kosong" };
    }

    // Calculate total price
    const totalPriceNum = data.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    const [newOrder] = await db
      .insert(orders)
      .values({
        restaurantId,
        tableNumber: data.tableNumber || null,
        customerName: data.customerName || "Pelanggan",
        status: "pending",
        totalPrice: totalPriceNum.toString(),
        items: data.items,
      })
      .returning();

    return { data: newOrder };
  } catch (err: any) {
    return { error: err.message || "Gagal membuat pesanan" };
  }
}

export async function getOrdersAction(restaurantId: string) {
  try {
    await verifyRestaurantOwnership(restaurantId);

    const results = await db.query.orders.findMany({
      where: eq(orders.restaurantId, restaurantId),
      orderBy: [desc(orders.createdAt)],
    });

    return { data: results };
  } catch (err: any) {
    return { error: err.message || "Gagal mengambil data pesanan" };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: "pending" | "processing" | "completed" | "cancelled"
) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return { error: "Pesanan tidak ditemukan" };
    }

    await verifyRestaurantOwnership(order.restaurantId);

    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return { data: updatedOrder };
  } catch (err: any) {
    return { error: err.message || "Gagal memperbarui status pesanan" };
  }
}

export async function getOrderAction(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    if (!order) {
      return { error: "Pesanan tidak ditemukan" };
    }
    return { data: order };
  } catch (err: any) {
    return { error: err.message || "Gagal mengambil data pesanan" };
  }
}
