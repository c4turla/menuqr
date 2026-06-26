"use server";

import { db } from "@/db";
import { users as usersTable, accounts as accountsTable } from "@/db/schema/users";
import { restaurants as restaurantsTable } from "@/db/schema/restaurants";
import { staff as staffTable } from "@/db/schema/staff";
import { getSession } from "@/server/services/auth-service";
import { eq, and } from "drizzle-orm";
import { randomBytes, scrypt } from "node:crypto";
import { revalidatePath } from "next/cache";

const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      SCRYPT_CONFIG.dkLen,
      { N: SCRYPT_CONFIG.N, r: SCRYPT_CONFIG.r, p: SCRYPT_CONFIG.p, maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2 },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      }
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

export async function addStaffAction(
  restaurantId: string,
  data: { email: string; name: string; password?: string; role: string }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurantsTable.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && restaurant.ownerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  if (!isSuperAdmin && restaurant.plan !== "pro") {
    return { error: "ERR_PLAN_REQUIRED_PRO" }; // Multiple staff requires Pro plan
  }

  const emailLower = data.email.toLowerCase().trim();

  // Check if staff member already linked to this restaurant
  const existingStaffUser = await db.query.user.findFirst({
    where: eq(usersTable.email, emailLower),
  });

  let userId = existingStaffUser?.id;

  if (existingStaffUser) {
    const isAlreadyLinked = await db.query.staff.findFirst({
      where: and(
        eq(staffTable.restaurantId, restaurantId),
        eq(staffTable.userId, existingStaffUser.id)
      ),
    });

    if (isAlreadyLinked) {
      return { error: "User tersebut sudah terdaftar sebagai staff di outlet ini" };
    }
  } else {
    // Check if password is provided
    if (!data.password || data.password.length < 6) {
      return { error: "Password minimal 6 karakter untuk staff baru" };
    }

    userId = crypto.randomUUID();

    // Create new user
    await db.insert(usersTable).values({
      id: userId,
      name: data.name,
      email: emailLower,
      role: "staff",
      emailVerified: true,
    });

    // Create credential account
    const hashedPassword = await hashPassword(data.password);
    await db.insert(accountsTable).values({
      id: crypto.randomUUID(),
      userId,
      providerId: "credential",
      accountId: emailLower,
      password: hashedPassword,
    });
  }

  // Insert into staff table
  await db.insert(staffTable).values({
    id: crypto.randomUUID(),
    restaurantId,
    userId: userId!,
    role: data.role,
  });

  revalidatePath(`/dashboard/staff`);
  return { success: true };
}

export async function getStaffListAction(restaurantId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurantsTable.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  
  // Verify ownership or check if this user is a staff member themselves
  let hasAccess = isSuperAdmin || restaurant.ownerId === session.user.id;
  if (!hasAccess) {
    const selfStaff = await db.query.staff.findFirst({
      where: and(
        eq(staffTable.restaurantId, restaurantId),
        eq(staffTable.userId, session.user.id)
      ),
    });
    if (selfStaff) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return { error: "Unauthorized" };
  }

  // Query staff entries joined with user info
  const list = await db
    .select({
      id: staffTable.id,
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: staffTable.role,
      createdAt: staffTable.createdAt,
    })
    .from(staffTable)
    .innerJoin(usersTable, eq(staffTable.userId, usersTable.id))
    .where(eq(staffTable.restaurantId, restaurantId));

  return { data: list };
}

export async function removeStaffAction(restaurantId: string, staffId: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurantsTable.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && restaurant.ownerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await db.delete(staffTable).where(eq(staffTable.id, staffId));

  revalidatePath(`/dashboard/staff`);
  return { success: true };
}

export async function updateStaffRoleAction(
  restaurantId: string,
  staffId: string,
  role: string
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurantsTable.id, restaurantId),
  });

  if (!restaurant) {
    return { error: "Restoran tidak ditemukan" };
  }

  const isSuperAdmin = (session.user as { role?: string })?.role === "super_admin";
  if (!isSuperAdmin && restaurant.ownerId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await db
    .update(staffTable)
    .set({ role, updatedAt: new Date() })
    .where(eq(staffTable.id, staffId));

  revalidatePath(`/dashboard/staff`);
  return { success: true };
}

export async function isStaffOfAction(restaurantId: string, userId: string) {
  const check = await db.query.staff.findFirst({
    where: and(
      eq(staffTable.restaurantId, restaurantId),
      eq(staffTable.userId, userId)
    ),
  });
  return !!check;
}
