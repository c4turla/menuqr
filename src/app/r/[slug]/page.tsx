import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/server/queries/restaurant-queries";
import { getMenuItemsPublic } from "@/server/queries/menu-queries";
import { PublicMenuContent } from "./_components/public-menu-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const items = await getMenuItemsPublic(slug);

  return (
    <PublicMenuContent
      restaurant={{
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        logoUrl: restaurant.logoUrl,
        coverUrl: restaurant.coverUrl,
        whatsappNumber: restaurant.whatsappNumber,
        slug: restaurant.slug,
        plan: restaurant.plan,
        themePrimaryColor: restaurant.themePrimaryColor,
      }}
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        available: item.available,
        featured: item.featured,
        categoryName: item.categoryName,
      }))}
    />
  );
}
