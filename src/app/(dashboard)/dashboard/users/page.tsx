import { getSession } from "@/server/services/auth-service";
import { getAllUsers } from "@/server/queries/user-queries";
import { UsersContent } from "./_components/users-content";
import { notFound } from "next/navigation";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return null;

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin) {
    notFound();
  }

  const users = await getAllUsers();

  return <UsersContent users={users} />;
}
