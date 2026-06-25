import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner, getAllRestaurants } from "@/server/queries/restaurant-queries";
import { RestaurantsContent } from "./_components/restaurants-content";

export default async function RestaurantsPage() {
  const session = await getSession();
  if (!session) return null;

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  const restaurants = isSuperAdmin
    ? await getAllRestaurants()
    : await getRestaurantsByOwner(session.user.id);

  return (
    <RestaurantsContent
      initialRestaurants={restaurants}
    />
  );
}
