"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/services/auth-service";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: {
  name?: string;
  phone?: string | null;
  occupation?: string | null;
  address?: string | null;
  country?: string | null;
  province?: string | null;
  postalCode?: string | null;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await db
    .update(users)
    .set({
      name: data.name,
      phone: data.phone,
      occupation: data.occupation,
      address: data.address,
      country: data.country,
      province: data.province,
      postalCode: data.postalCode,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard/settings");
  
  return { success: true };
}


