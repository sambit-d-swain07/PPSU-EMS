"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendMail } from "@/lib/mail";
import { RegistrationConfirmedEmail } from "@/components/emails/registration-confirmed";
import { env } from "@/env";
import * as React from "react";

export async function registerForEventAction(eventId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Unauthorized. Only students can register for events." };
  }

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });

      if (!event) {
        throw new Error("Event not found.");
      }

      if (event.status !== "APPROVED") {
        throw new Error("This event is not approved for registration.");
      }

      if (new Date(event.startsAt).getTime() <= Date.now()) {
        throw new Error(
          "Cannot register for an event that has already started or concluded."
        );
      }

      if (event._count.registrations >= event.capacity) {
        throw new Error("This event has reached full capacity.");
      }

      const existing = await tx.registration.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });

      if (existing) {
        throw new Error("You are already registered for this event.");
      }

      const created = await tx.registration.create({
        data: {
          eventId,
          userId,
        },
        include: {
          user: { select: { name: true, email: true } },
          event: {
            select: {
              title: true,
              startsAt: true,
              venue: { select: { name: true } },
            },
          },
        },
      });

      return created;
    });

    after(async () => {
      await sendMail({
        to: result.user.email,
        subject: `Registration Confirmed: ${result.event.title}`,
        react: React.createElement(RegistrationConfirmedEmail, {
          studentName: result.user.name,
          eventTitle: result.event.title,
          startsAt: result.event.startsAt,
          venueName: result.event.venue.name,
          ticketUrl: `${env.APP_URL}/student/registrations`,
        }),
      });
    });

    revalidatePath("/student/events");
    revalidatePath(`/student/events/${eventId}`);
    revalidatePath("/student/registrations");
    revalidatePath("/organizer");
    return { success: true, registrationId: result.id };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === "P2002") {
      return { error: "You are already registered for this event." };
    }
    return {
      error: err?.message || "Registration failed. Please try again.",
    };
  }
}

export async function cancelRegistrationAction(eventId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Unauthorized. Only students can manage registrations." };
  }

  const userId = session.user.id;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { error: "Event not found." };
    }

    if (new Date(event.startsAt).getTime() <= Date.now()) {
      return {
        error:
          "Cannot cancel registration for an event that has already started.",
      };
    }

    await prisma.registration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    revalidatePath("/student/events");
    revalidatePath(`/student/events/${eventId}`);
    revalidatePath("/student/registrations");
    revalidatePath("/organizer");
    return { success: true };
  } catch {
    return { error: "Failed to cancel registration." };
  }
}

