import { db } from "@/db";
import { users, accounts } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { randomBytes, scrypt } from "node:crypto";

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

async function seed() {
  const name = "Super Admin";
  const email = "admin@menuqr.com";
  const password = "Admin123!";

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`User ${email} already exists, skipping.`);
    process.exit(0);
  }

  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    name,
    email,
    emailVerified: true,
  });

  const hashedPassword = await hashPassword(password);

  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    userId,
    providerId: "credential",
    accountId: email,
    password: hashedPassword,
  });

  console.log(`Super admin created: ${email} / ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
