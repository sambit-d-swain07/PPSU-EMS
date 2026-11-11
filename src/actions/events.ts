"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  eventFormSchema,
  type EventFormInput,
  reviewEventSchema,
  type ReviewEventInput,
} from "@/lib/schemas";
import { EventStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createEventAction(
  data: EventFormInput,
  submitForApproval: boolean
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    return { error: "Unauthorized. Only organizers can create events." };
  }

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid event data." };
  }

  const venue = await prisma.venue.findUnique({
    where: { id: parsed.data.venueId },
  });

  if (!venue) {
    return { error: "Selected venue does not exist." };
  }

  if (parsed.data.capacity > venue.capacity) {
    return {
      error: `Event capacity (${parsed.data.capacity}) exceeds venue capacity (${venue.capacity}).`,
    };
  }

  const status: EventStatus = submitForApproval ? "PENDING" : "DRAFT";

  try {
    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        venueId: parsed.data.venueId,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
        capacity: parsed.data.capacity,
        posterUrl: parsed.data.posterUrl || null,
        status,
        organizerId: session.user.id,
      },
    });

    revalidatePath("/organizer");
    revalidatePath("/faculty");
    revalidatePath("/admin");
    return { success: true, eventId: event.id };
  } catch (error) {
    console.error("Create event error:", error);
    return { error: "Failed to create event." };
  }
}

export async function updateEventAction(
  eventId: string,
  data: EventFormInput,
  submitForApproval: boolean
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    return { error: "Unauthorized. Only organizers can update events." };
  }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existing) {
    return { error: "Event not found." };
  }

  if (existing.organizerId !== session.user.id) {
    return { error: "You can only edit events you organized." };
  }

  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return { error: "Only events in DRAFT or REJECTED status can be edited." };
  }

  const parsed = eventFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid event data." };
  }

  const venue = await prisma.venue.findUnique({
    where: { id: parsed.data.venueId },
  });

  if (!venue) {
    return { error: "Selected venue does not exist." };
  }

  if (parsed.data.capacity > venue.capacity) {
    return {
      error: `Event capacity (${parsed.data.capacity}) exceeds venue capacity (${venue.capacity}).`,
    };
  }

  const status: EventStatus = submitForApproval ? "PENDING" : "DRAFT";

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        venueId: parsed.data.venueId,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
        capacity: parsed.data.capacity,
        posterUrl: parsed.data.posterUrl || null,
        status,
        reviewRemark: null,
      },
    });

    revalidatePath("/organizer");
    revalidatePath(`/organizer/events/${eventId}/edit`);
    revalidatePath("/faculty");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Update event error:", error);
    return { error: "Failed to update event." };
  }
}

export async function reviewEventAction(input: ReviewEventInput) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")
  ) {
    return {
      error: "Unauthorized. Only faculty and admins can review events.",
    };
  }

  const parsed = reviewEventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid review data." };
  }

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
  });

  if (!event) {
    return { error: "Event not found." };
  }

  if (event.status !== "PENDING") {
    return { error: "Only pending events can be reviewed." };
  }

  const newStatus: EventStatus =
    parsed.data.action === "APPROVE" ? "APPROVED" : "REJECTED";

  try {
    await prisma.event.update({
      where: { id: parsed.data.eventId },
      data: {
        status: newStatus,
        reviewRemark:
          parsed.data.action === "REJECT" ? parsed.data.remark : null,
        reviewedById: session.user.id,
      },
    });

    revalidatePath("/faculty");
    revalidatePath("/admin");
    revalidatePath("/organizer");
    return { success: true };
  } catch (error) {
    console.error("Review event error:", error);
    return { error: "Failed to submit review." };
  }
}

