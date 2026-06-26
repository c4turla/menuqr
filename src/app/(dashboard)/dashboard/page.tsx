import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner, getAllRestaurants } from "@/server/queries/restaurant-queries";
import { getCategoriesByRestaurant } from "@/server/queries/category-queries";
import { getMenuItemsByRestaurant } from "@/server/queries/menu-queries";
import { getAllUsers } from "@/server/queries/user-queries";
import { DashboardContent } from "./_components/dashboard-content";
import { db } from "@/db";
import { orders } from "@/db/schema/orders";
import { inArray } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";

  const restaurants = isSuperAdmin
    ? await getAllRestaurants()
    : await getRestaurantsByOwner(session.user.id);

  const users = isSuperAdmin ? await getAllUsers() : [];

  let totalCategories = 0;
  let totalMenuItems = 0;

  if (restaurants.length > 0) {
    const counts = await Promise.all(
      restaurants.map(async (r) => {
        const [cats, items] = await Promise.all([
          getCategoriesByRestaurant(r.id),
          getMenuItemsByRestaurant(r.id),
        ]);
        return { cats: cats.length, items: items.length };
      })
    );
    totalCategories = counts.reduce((sum, c) => sum + c.cats, 0);
    totalMenuItems = counts.reduce((sum, c) => sum + c.items, 0);
  }

  // Fetch all orders — the client component handles period filtering
  let rawOrders: { id: string; restaurantId: string; customerName: string | null; status: string; totalPrice: string; createdAt: Date }[] = [];
  if (restaurants.length > 0) {
    rawOrders = await db
      .select({
        id: orders.id,
        restaurantId: orders.restaurantId,
        customerName: orders.customerName,
        status: orders.status,
        totalPrice: orders.totalPrice,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(inArray(orders.restaurantId, restaurants.map((r) => r.id)));
  }

  return (
    <DashboardContent
      user={session.user}
      restaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        plan: r.plan,
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }))}
      stats={{
        totalRestaurants: restaurants.length,
        totalCategories,
        totalMenuItems,
        totalUsers: users.length,
      }}
      rawOrders={rawOrders}
    />
  );
}
