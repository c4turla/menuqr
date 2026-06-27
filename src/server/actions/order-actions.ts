"use server";

import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { restaurants } from "@/db/schema/restaurants";
import { staff } from "@/db/schema/staff";
import { getSession } from "@/server/services/auth-service";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";

async function verifyRestaurantOwnership(restaurantId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!restaurant) throw new Error("Restaurant not found");

  const staffCheck = await db.query.staff.findFirst({
    where: and(eq(staff.restaurantId, restaurantId), eq(staff.userId, session.user.id)),
  });

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && restaurant.ownerId !== session.user.id && !staffCheck) {
    throw new Error("Forbidden");
  }

  return restaurant;
}

export async function createOrderAction(
  restaurantId: string,
  data: {
    tableNumber?: string;
    customerName?: string;
    orderType?: "dine_in" | "takeaway";
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
        orderType: data.orderType || "dine_in",
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

export async function getOrdersAction(
  restaurantId: string,
  options?: {
    /** ISO date string – only fetch orders created on/after this moment */
    dateFrom?: string;
    /** ISO date string – only fetch orders created on/before this moment */
    dateTo?: string;
    /**
     * When true, only return orders that are still "actionable" in POS:
     * status IN ('pending', 'processing')
     */
    activeOnly?: boolean;
  }
) {
  try {
    await verifyRestaurantOwnership(restaurantId);

    const conditions = [eq(orders.restaurantId, restaurantId)];

    if (options?.dateFrom) {
      conditions.push(gte(orders.createdAt, new Date(options.dateFrom)));
    }
    if (options?.dateTo) {
      conditions.push(lte(orders.createdAt, new Date(options.dateTo)));
    }
    if (options?.activeOnly) {
      conditions.push(inArray(orders.status, ["pending", "processing"]));
    }

    const results = await db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(200); // safety cap

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

export async function getAnalyticsAction(restaurantId: string) {
  try {
    await verifyRestaurantOwnership(restaurantId);

    const allOrders = await db.query.orders.findMany({
      where: eq(orders.restaurantId, restaurantId),
      orderBy: [desc(orders.createdAt)],
    });

    let totalRevenue = 0;
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter((o) => o.status === "completed");

    completedOrders.forEach((o) => {
      totalRevenue += Number(o.totalPrice);
    });

    const itemMap: Record<string, { quantity: number; revenue: number }> = {};
    allOrders.forEach((o) => {
      if (o.status !== "cancelled") {
        o.items.forEach((item) => {
          if (!itemMap[item.name]) {
            itemMap[item.name] = { quantity: 0, revenue: 0 };
          }
          itemMap[item.name].quantity += item.quantity;
          itemMap[item.name].revenue += Number(item.price) * item.quantity;
        });
      }
    });

    const popularItems = Object.entries(itemMap)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const bestSeller = popularItems[0]?.name || "-";

    const dailyMap: Record<string, { count: number; revenue: number }> = {};
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * oneDay);
      const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dailyMap[dateStr] = { count: 0, revenue: 0 };
    }

    allOrders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr].count += 1;
        if (o.status === "completed") {
          dailyMap[dateStr].revenue += Number(o.totalPrice);
        }
      }
    });

    const dailyOrdersData = Object.entries(dailyMap).map(([date, stats]) => ({
      date,
      orders: stats.count,
      revenue: stats.revenue,
    }));

    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      monthlyMap[monthStr] = 0;
    }

    completedOrders.forEach((o) => {
      const monthStr = new Date(o.createdAt).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      if (monthlyMap[monthStr] !== undefined) {
        monthlyMap[monthStr] += Number(o.totalPrice);
      }
    });

    const monthlyRevenueData = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      data: {
        totalRevenue,
        totalOrders,
        bestSeller,
        popularItems,
        dailyOrdersData,
        monthlyRevenueData,
      },
    };
  } catch (err: any) {
    return { error: err.message || "Gagal mengambil data analitik" };
  }
}
