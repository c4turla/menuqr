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
