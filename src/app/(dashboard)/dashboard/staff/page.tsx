import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner, getAllRestaurants } from "@/server/queries/restaurant-queries";
import { redirect } from "next/navigation";
import { StaffContent } from "./_components/staff-content";

export default async function StaffPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  const restaurants = isSuperAdmin
    ? await getAllRestaurants()
    : await getRestaurantsByOwner(session.user.id);

  const planTier = isSuperAdmin
    ? "super_admin"
    : restaurants.some((r) => r.plan === "pro")
    ? "pro"
    : restaurants.some((r) => r.plan === "basic")
    ? "basic"
    : "free";

  return (
    <StaffContent
      initialRestaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        plan: r.plan,
      }))}
      planTier={planTier}
    />
  );
}
