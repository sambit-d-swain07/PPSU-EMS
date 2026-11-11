"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { venueFormSchema, type VenueFormInput } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createVenueAction(data: VenueFormInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized. Only admins can manage venues." };
  }

  const parsed = venueFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid venue data." };
  }

  try {
    const existing = await prisma.venue.findUnique({
      where: { name: parsed.data.name.trim() },
    });
    if (existing) {
      return { error: "A venue with this name already exists." };
    }

    await prisma.venue.create({
      data: {
        name: parsed.data.name.trim(),
        capacity: parsed.data.capacity,
      },
    });

    revalidatePath("/admin/venues");
    revalidatePath("/organizer/events/new");
    return { success: true };
  } catch (error) {
    console.error("Create venue error:", error);
    return { error: "Failed to create venue." };
  }
}

export async function deleteVenueAction(venueId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized. Only admins can manage venues." };
  }

  try {
    const eventCount = await prisma.event.count({
      where: { venueId },
    });

    if (eventCount > 0) {
      return {
        error: `Cannot delete venue. It has ${eventCount} associated event(s).`,
      };
    }

    await prisma.venue.delete({
      where: { id: venueId },
    });

    revalidatePath("/admin/venues");
    revalidatePath("/organizer/events/new");
    return { success: true };
  } catch (error) {
    console.error("Delete venue error:", error);
    return { error: "Failed to delete venue." };
  }
}

