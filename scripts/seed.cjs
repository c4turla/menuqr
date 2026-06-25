const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { randomBytes, scrypt } = require("node:crypto");
require("dotenv").config({ path: ".env.local" });

const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function generateKey(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      SCRYPT_CONFIG.dkLen,
      {
        N: SCRYPT_CONFIG.N,
        r: SCRYPT_CONFIG.r,
        p: SCRYPT_CONFIG.p,
        maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
      },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      }
    );
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

async function seed() {
  const sql = postgres(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const name = "Super Admin";
  const email = "admin@menuqr.com";
  const password = "Admin123!";

  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

  if (existing.length > 0) {
    console.log(`User ${email} already exists, skipping.`);
    await sql.end();
    process.exit(0);
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(password);
  const now = new Date().toISOString();

  await sql`
    INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
    VALUES (${userId}, ${name}, ${email}, true, ${now}, ${now})
  `;

  const accountId = crypto.randomUUID();

  await sql`
    INSERT INTO accounts (id, user_id, provider_id, account_id, password, created_at, updated_at)
    VALUES (${accountId}, ${userId}, 'credential', ${email}, ${hashedPassword}, ${now}, ${now})
  `;

  console.log(`Super admin created: ${email} / ${password}`);
  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
