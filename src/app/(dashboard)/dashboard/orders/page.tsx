import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";
import { OrdersContent } from "./_components/orders-content";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userRestaurants = await getRestaurantsByOwner(session.user.id);

  return (
    <OrdersContent
      initialRestaurants={userRestaurants.map((r) => ({
        id: r.id,
        name: r.name,
        plan: r.plan,
      }))}
    />
  );
}
