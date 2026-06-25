import { Toaster } from "@/components/ui/sonner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  let isPro = false;

  if (session) {
    const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
    if (!isSuperAdmin) {
      const userRestaurants = await getRestaurantsByOwner(session.user.id);
      isPro = userRestaurants.some((r) => r.plan === "pro");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <DashboardSidebar isPro={isPro} />
      <main className="ml-[220px] min-h-screen px-8 py-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

