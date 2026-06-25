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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${baseUrl}/r/${restaurant.slug}`;

  return (
    <TableQRCodeGenerator
      restaurantName={restaurant.name}
      menuUrl={menuUrl}
      plan={restaurant.plan}
    />
  );
}
