import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner, getAllRestaurants } from "@/server/queries/restaurant-queries";
import { getCategoriesByRestaurant } from "@/server/queries/category-queries";
import { getMenuItemsByRestaurant } from "@/server/queries/menu-queries";
import { getAllUsers } from "@/server/queries/user-queries";
import { DashboardContent } from "./_components/dashboard-content";

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

  return (
    <DashboardContent
      user={session.user}
      restaurants={restaurants}
      users={users}
      stats={{
        totalRestaurants: restaurants.length,
        totalCategories,
        totalMenuItems,
        totalUsers: users.length,
      }}
    />
  );
}
