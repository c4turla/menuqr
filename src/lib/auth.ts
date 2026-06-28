import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/mail";

export const auth = betterAuth({
  // Eksplisit set secret dan baseURL dari env vars
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    // Otomatis trust BETTER_AUTH_URL & APP_URL jika di-set (VPS/production)
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendEmail({
              to: user.email,
              subject: "Selamat Bergabung di MenuQR!",
              html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #333333;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #f97316; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.05em;">MenuQR</h1>
                    <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Solusi Menu Digital & POS Outlet Anda</p>
                  </div>
                  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;">
                  <p style="font-size: 16px; line-height: 1.6;">Halo <strong>${user.name}</strong>,</p>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Terima kasih telah mendaftar di MenuQR. Akun Anda berhasil dibuat dengan alamat email: <strong>${user.email}</strong>.</p>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Sekarang Anda sudah bisa mulai mendigitalisasi menu restoran, membuat QR Code meja, dan mengelola pesanan masuk secara real-time dari dashboard.</p>
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.BETTER_AUTH_URL || 'https://menuqr.my.id'}/login" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">Masuk ke Dashboard</a>
                  </div>
                  <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin tautan berikut ke browser Anda:</p>
                  <p style="font-size: 14px; line-height: 1.6; color: #3b82f6; word-break: break-all; margin-bottom: 30px;">
                    ${process.env.BETTER_AUTH_URL || 'https://menuqr.my.id'}/login
                  </p>
                  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 20px 0;">
                  <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
                    Email ini dikirim secara otomatis oleh sistem MenuQR.<br>Jika Anda tidak merasa mendaftar untuk layanan ini, harap abaikan email ini.
                  </p>
                </div>
              `,
            });
            console.log(`[AUTH HOOK] Welcome email sent to: ${user.email}`);
          } catch (hookErr) {
            console.error("[AUTH HOOK] Failed to send welcome email:", hookErr);
          }
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
