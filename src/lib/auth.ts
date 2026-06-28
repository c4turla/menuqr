import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/mail";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset Kata Sandi Akun MenuQR Anda",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #333333; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="cid:logo" alt="MenuQR Logo" style="height: 48px; width: auto; display: inline-block;" />
                <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0; font-weight: 500;">Solusi Menu Digital & POS Outlet Anda</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">Halo <strong>${user.name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                Kami menerima permintaan untuk mereset kata sandi akun MenuQR Anda. Jika Anda tidak merasa mengajukan permintaan ini, harap abaikan email ini dengan aman.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                Silakan klik tombol di bawah ini untuk mengatur kata sandi baru Anda:
              </p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${url}" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2); transition: background-color 0.2s;">Reset Kata Sandi Saya</a>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 8px;">Tautan reset kata sandi ini hanya berlaku selama 24 jam. Jika tombol di atas tidak dapat diklik, Anda dapat menyalin dan membuka tautan berikut di browser Anda:</p>
              <p style="font-size: 13px; line-height: 1.6; color: #2563eb; word-break: break-all; margin-bottom: 30px; font-family: monospace; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
                ${url}
              </p>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 20px 0;">
              <p style="font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Butuh bantuan? Hubungi tim kami di <a href="mailto:support@menuqr.my.id" style="color: #f97316; text-decoration: none; font-weight: 600;">support@menuqr.my.id</a>
              </p>
              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 10px; line-height: 1.5;">
                Email ini dikirim secara otomatis oleh sistem MenuQR. Jika Anda tidak merasa melakukan pendaftaran ini, harap abaikan email ini dengan aman.
              </p>
            </div>
          `,
        });
        console.log(`[AUTH] Reset password email sent to: ${user.email}`);
      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verifikasi Alamat Email Akun MenuQR Anda",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #333333; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="cid:logo" alt="MenuQR Logo" style="height: 48px; width: auto; display: inline-block;" />
                <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0; font-weight: 500;">Solusi Menu Digital & POS Outlet Anda</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">Halo <strong>${user.name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                Terima kasih telah mendaftar di MenuQR. Untuk memastikan keamanan akun Anda serta mengaktifkan akses penuh ke seluruh fitur dashboard MenuQR, silakan lakukan verifikasi alamat email Anda dengan menekan tombol di bawah ini:
              </p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${url}" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2); transition: background-color 0.2s;">Verifikasi Email Saya</a>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 8px;">Tautan verifikasi ini hanya berlaku selama 24 jam. Jika tombol di atas tidak dapat diklik, Anda dapat menyalin dan membuka tautan berikut di browser Anda:</p>
              <p style="font-size: 13px; line-height: 1.6; color: #2563eb; word-break: break-all; margin-bottom: 30px; font-family: monospace; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
                ${url}
              </p>
              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 20px 0;">
              <p style="font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                Butuh bantuan? Hubungi tim kami di <a href="mailto:support@menuqr.my.id" style="color: #f97316; text-decoration: none; font-weight: 600;">support@menuqr.my.id</a>
              </p>
              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 10px; line-height: 1.5;">
                Email ini dikirim secara otomatis oleh sistem MenuQR. Jika Anda tidak merasa melakukan pendaftaran ini, harap abaikan email ini dengan aman.
              </p>
            </div>
          `,
        });
        console.log(`[AUTH] Verification email sent to: ${user.email}`);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
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
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; color: #333333; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <img src="cid:logo" alt="MenuQR Logo" style="height: 48px; width: auto; display: inline-block;" />
                    <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0; font-weight: 500;">Solusi Menu Digital & POS Outlet Anda</p>
                  </div>
                  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;">
                  <p style="font-size: 16px; line-height: 1.6; color: #1f2937;">Halo <strong>${user.name}</strong>,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 16px;">
                    Selamat bergabung di keluarga besar MenuQR! Kami sangat senang bisa menjadi bagian dari perjalanan Anda dalam mengembangkan dan mendigitalisasi bisnis kuliner Anda.
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                    MenuQR hadir untuk memberikan solusi praktis dalam mengelola menu digital berbasis QR Code, mencatat pesanan pelanggan secara real-time, hingga memudahkan transaksi POS (Point of Sale) langsung dari outlet Anda.
                  </p>
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.BETTER_AUTH_URL || 'https://menuqr.my.id'}/login" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2); transition: background-color 0.2s;">Mulai Buat Menu Pertama</a>
                  </div>
                  <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 24px;">
                    Silakan masuk ke dashboard untuk melengkapi data outlet Anda, menambahkan kategori menu, hidangan, serta mendownload desain QR Code meja untuk dipajang.
                  </p>
                  <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0 20px 0;">
                  <p style="font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                    Jika Anda menemui kendala dalam pengaturan awal atau memiliki pertanyaan seputar fitur MenuQR, tim kami selalu siap membantu Anda melalui email di <a href="mailto:support@menuqr.my.id" style="color: #f97316; text-decoration: none; font-weight: 600;">support@menuqr.my.id</a>.
                  </p>
                  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 10px; line-height: 1.5;">
                    Email ini dikirim secara resmi kepada pengguna baru MenuQR. Terima kasih atas kepercayaan Anda menggunakan layanan kami.
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
