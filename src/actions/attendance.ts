"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export async function markAttendance(
  registrationId: string,
  eventId: string
): Promise<
  | { success: true; studentName: string; department: string | null }
  | { error: string }
> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

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

  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, eventId },
    include: { user: { select: { name: true, department: true } } },
  });

  if (!reg) {
    return { error: "Invalid QR code — registration not found for this event." };
  }

  if (reg.attendedAt) {
    return {
      error: `Already checked in at ${format(reg.attendedAt, "h:mm a")}.`,
    };
  }

  const now = new Date();
  const windowStart = new Date(event.startsAt.getTime() - 60 * 60 * 1000);
  const windowEnd = event.endsAt;

  if (now < windowStart || now > windowEnd) {
    return {
      error: `Outside the check-in window. Scanning opens 1 hour before the event starts.`,
    };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: { attendedAt: now },
  });

  revalidatePath(`/organizer/events/${eventId}/attendance`);
  revalidatePath(`/student/registrations`);

  return {
    success: true,
    studentName: reg.user.name,
    department: reg.user.department,
  };
}

export async function toggleAttendance(
  registrationId: string,
  eventId: string,
  attended: boolean
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized." };

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

  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, eventId },
  });

  if (!reg) return { error: "Registration not found." };

  await prisma.registration.update({
    where: { id: registrationId },
    data: { attendedAt: attended ? new Date() : null },
  });

  revalidatePath(`/organizer/events/${eventId}/attendance`);
  return { success: true };
}

