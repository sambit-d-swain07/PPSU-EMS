import nodemailer from "nodemailer";
import { env } from "@/env";
import { render } from "@react-email/render";
import * as React from "react";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
});

export async function sendMail({
  to,
  bcc,
  subject,
  react,
}: {
  to?: string | string[];
  bcc?: string | string[];
  subject: string;
  react: React.ReactElement;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn(
        `[Mail Skipped] SMTP credentials not set. Subject: "${subject}" to: ${JSON.stringify(to || bcc)}`
      );
      return { success: false, error: "SMTP not configured" };
    }

    const html = await render(react);

    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      bcc,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mail Error] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown mail error",
    };
  }
}

