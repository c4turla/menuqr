import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/mail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Extract the token query parameter from the verification URL
      try {
        const parsedUrl = new URL(url);
        const token = parsedUrl.searchParams.get("token");
        if (token) {
          // Write the token to the verifications table so the sandbox settings UI can read it
          await db.insert(schema.verification).values({
            id: crypto.randomUUID(),
            identifier: user.email,
            value: token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to store verification token in DB:", err);
      }

      await sendEmail({
        to: user.email,
        subject: "Verify your email - MenuQR",
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
    },
  },
  socialProviders: {},
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  trustedOrigins: ["http://localhost:3002", "http://localhost:3001", "http://localhost:3000"],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
