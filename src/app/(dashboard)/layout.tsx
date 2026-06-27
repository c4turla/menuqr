import { Toaster } from "@/components/ui/sonner";
import { DashboardLayoutShell } from "@/components/DashboardLayoutShell";
import { getSession } from "@/server/services/auth-service";
import { getRestaurantsByOwner } from "@/server/queries/restaurant-queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  let planTier: "free" | "basic" | "pro" | "super_admin" = "free";

  if (session) {
    const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
    if (isSuperAdmin) {
      planTier = "super_admin";
    } else {
      const userRestaurants = await getRestaurantsByOwner(session.user.id);
      const plans = userRestaurants.map((r) => r.plan);
      if (plans.includes("pro")) {
        planTier = "pro";
      } else if (plans.includes("basic")) {
        planTier = "basic";
      } else {
        planTier = "free";
      }
    }
  }

  return (
    <DashboardLayoutShell planTier={planTier}>
      {children}
      <Toaster />
    </DashboardLayoutShell>
  );
}

