import { db } from "@/db";
import { users } from "@/db/schema/users";
import { desc } from "drizzle-orm";

export async function getAllUsers() {
  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
  return results;
}
