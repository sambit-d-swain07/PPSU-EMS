import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { sendMail } from "@/lib/mail";
import { EventReminderEmail } from "@/components/emails/event-reminder";
import * as React from "react";

// Note: Vercel automatically passes the CRON_SECRET in the Authorization header.
// If self-hosting, any external cron runner (e.g. crontab, GitHub Actions) can trigger
// this route by sending: "Authorization: Bearer <CRON_SECRET>".
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const pending = await prisma.registration.findMany({
    where: {
      reminderSentAt: null,
      event: {
        status: "APPROVED",
        startsAt: {
          gt: now,
          lte: next24Hours,
        },
      },
    },
    include: {
      user: { select: { email: true, name: true } },
      event: {
        select: {
          title: true,
          startsAt: true,
          venue: { select: { name: true } },
        },
      },
    },
  });

  let sent = 0;
  for (const reg of pending) {
    await sendMail({
      to: reg.user.email,
      subject: `Reminder: ${reg.event.title} is taking place soon!`,
      react: React.createElement(EventReminderEmail, {
        studentName: reg.user.name,
        eventTitle: reg.event.title,
        startsAt: reg.event.startsAt,
        venueName: reg.event.venue.name,
        ticketUrl: `${env.APP_URL}/student/registrations`,
      }),
    });

    await prisma.registration.update({
      where: { id: reg.id },
      data: { reminderSentAt: new Date() },
    });
    sent++;
  }

  return NextResponse.json({
    success: true,
    candidates: pending.length,
    sent,
  });
}

