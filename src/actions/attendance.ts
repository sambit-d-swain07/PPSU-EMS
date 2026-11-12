"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { z } from "zod";

const markAttendanceSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  eventId: z.string().min(1, "Event ID is required."),
});

export async function markAttendance(
  registrationId: string,
  eventId: string
): Promise<
  | { success: true; studentName: string; department: string | null }
  | { error: string }
> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

  const parsed = markAttendanceSchema.safeParse({ registrationId, eventId });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid QR code payload." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true, startsAt: true, endsAt: true, title: true },
  });

  if (!event) return { error: "Event not found." };

  const isOrganizer =
    session.user.role === "ORGANIZER" &&
    event.organizerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOrganizer && !isAdmin) {
    return { error: "Only the event organizer or an admin can mark attendance." };
  }

  const now = new Date();
  const windowStart = new Date(event.startsAt.getTime() - 60 * 60 * 1000);
  const windowEnd = event.endsAt;

  if (now < windowStart || now > windowEnd) {
    return {
      error: "Outside the check-in window. Scanning opens 1 hour before the event starts.",
    };
  }

  try {
    // Run atomic check and update inside transaction to prevent double check-in concurrency race
    const reg = await prisma.$transaction(async (tx) => {
      const record = await tx.registration.findFirst({
        where: { id: registrationId, eventId },
        include: { user: { select: { name: true, department: true } } },
      });

      if (!record) {
        throw new Error("Invalid QR code — registration not found for this event.");
      }

      if (record.attendedAt) {
        throw new Error(`Already checked in at ${format(record.attendedAt, "h:mm a")}.`);
      }

      await tx.registration.update({
        where: { id: registrationId },
        data: { attendedAt: now },
      });

      return record;
    });

    revalidatePath(`/organizer/events/${eventId}/attendance`);
    revalidatePath(`/student/registrations`);

    return {
      success: true,
      studentName: reg.user.name,
      department: reg.user.department,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to record attendance.",
    };
  }
}

export async function toggleAttendance(
  registrationId: string,
  eventId: string,
  attended: boolean
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

  const parsed = markAttendanceSchema.safeParse({ registrationId, eventId });
  if (!parsed.success) {
    return { error: "Invalid registration parameters." };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  });

  if (!event) return { error: "Event not found." };

  const isOrganizer =
    session.user.role === "ORGANIZER" &&
    event.organizerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOrganizer && !isAdmin) {
    return { error: "Unauthorized." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findFirst({
        where: { id: registrationId, eventId },
      });

      if (!reg) throw new Error("Registration not found.");

      await tx.registration.update({
        where: { id: registrationId },
        data: { attendedAt: attended ? new Date() : null },
      });
    });

    revalidatePath(`/organizer/events/${eventId}/attendance`);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update attendance.",
    };
  }
}
