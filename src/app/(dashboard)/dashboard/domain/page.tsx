import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";
import { DomainContent } from "./_components/domain-content";
import { redirect } from "next/navigation";

export default async function DomainPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";

  let isPro = false;
  const restaurants = await getRestaurantsByOwner(session.user.id);

  if (!isSuperAdmin) {
    isPro = restaurants.some((r) => r.plan === "pro");
  }

  if (!isSuperAdmin && !isPro) redirect("/dashboard");

  return (
    <DomainContent
      initialRestaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        customDomain: r.customDomain,
      }))}
    />
  );
}
