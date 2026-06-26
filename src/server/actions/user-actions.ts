"use server";

import { db } from "@/db";
import { users, verifications } from "@/db/schema/users";
import { eq, desc } from "drizzle-orm";
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

export async function getLatestVerificationCode(email: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const records = await db
    .select()
    .from(verifications)
    .where(eq(verifications.identifier, email))
    .orderBy(desc(verifications.createdAt))
    .limit(1);

  if (records.length > 0) {
    return { success: true, code: records[0].value };
  }
  return { success: false };
}

export async function verifyUserEmailDirectly(token: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Look up the token in the verifications table
  const verificationRecord = await db
    .select()
    .from(verifications)
    .where(eq(verifications.value, token))
    .limit(1);

  if (verificationRecord.length === 0) {
    return { success: false, error: "Token/Kode tidak valid atau kedaluwarsa" };
  }

  const email = verificationRecord[0].identifier;

  // 2. Mark email as verified in users table
  await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.email, email));

  // 3. Delete the verification record
  await db
    .delete(verifications)
    .where(eq(verifications.id, verificationRecord[0].id));

  revalidatePath("/dashboard/settings");

  return { success: true };
}
