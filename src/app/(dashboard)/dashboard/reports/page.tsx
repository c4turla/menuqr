import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner, getAllRestaurants } from "@/server/queries/restaurant-queries";
import { ReportsContent } from "./_components/reports-content";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  const restaurants = isSuperAdmin
    ? await getAllRestaurants()
    : await getRestaurantsByOwner(session.user.id);

  // Determine planTier based on the user's restaurants
  let planTier: "free" | "basic" | "pro" | "super_admin" = "free";
  if (isSuperAdmin) {
    planTier = "super_admin";
  } else {
    const plans = restaurants.map((r) => r.plan);
    if (plans.includes("pro")) {
      planTier = "pro";
    } else if (plans.includes("basic")) {
      planTier = "basic";
    }
  }

  return (
    <ReportsContent
      initialRestaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        plan: r.plan,
      }))}
      planTier={planTier}
    />
  );
}
