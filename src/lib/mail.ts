"use server";

import nodemailer from "nodemailer";
import path from "path";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE !== "false", // Default to true (for port 465)
  auth: {
    user: process.env.SMTP_USER || "resend",
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  const fromEmail = from || process.env.SMTP_FROM || "support@menuqr.my.id";

  const attachments = [];
  // Automatis lampirkan logo jika di-reference menggunakan cid:logo
  if (html.includes("cid:logo")) {
    attachments.push({
      filename: "logo.png",
      path: path.join(process.cwd(), "public/logo.png"),
      cid: "logo",
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"MenuQR" <${fromEmail}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`[EMAIL] Sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error);
    return { success: false, error };
  }
}
