import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";
import { BillingContent } from "./_components/billing-content";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userRestaurants = await getRestaurantsByOwner(session.user.id);

  return (
    <BillingContent 
      initialRestaurants={userRestaurants.map(r => ({
        id: r.id,
        name: r.name,
        plan: r.plan,
        slug: r.slug,
      }))}
    />
  );
}
