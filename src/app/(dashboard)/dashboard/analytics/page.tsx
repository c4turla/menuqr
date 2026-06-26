import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";
import { AnalyticsContent } from "./_components/analytics-content";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const restaurants = await getRestaurantsByOwner(session.user.id);
  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";

  let isPro = isSuperAdmin;
  if (!isSuperAdmin) {
    isPro = restaurants.some((r) => r.plan === "pro");
  }

  if (!isPro) redirect("/dashboard");

  return <AnalyticsContent initialRestaurants={restaurants} />;
}
