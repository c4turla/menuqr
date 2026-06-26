import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getRestaurantById } from "@/server/queries/restaurant-queries";
import { TableQRCodeGenerator } from "@/components/TableQRCodeGenerator";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QrPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const restaurant = await getRestaurantById(id, session.user.id);

  if (!restaurant) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  
  // Gunakan APP_URL/BETTER_AUTH_URL runtime, atau fallback ke host dari request headers
  const baseUrlRaw = process.env.APP_URL || process.env.BETTER_AUTH_URL || `${protocol}://${host}`;
  const baseUrl = baseUrlRaw.endsWith('/') ? baseUrlRaw.slice(0, -1) : baseUrlRaw;
  const menuUrl = `${baseUrl}/r/${restaurant.slug}`;

  return (
    <TableQRCodeGenerator
      restaurantName={restaurant.name}
      menuUrl={menuUrl}
      plan={restaurant.plan}
    />
  );
}
