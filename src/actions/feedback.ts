"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const feedbackSchema = z.object({
  registrationId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function submitFeedbackAction(
  registrationId: string,
  rating: number,
  comment?: string
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Unauthorized. Only students can submit feedback." };
  }

  const parsed = feedbackSchema.safeParse({ registrationId, rating, comment });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid feedback data." };
  }

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true, feedback: true },
  });

  if (!reg) {
    return { error: "Registration record not found." };
  }

  if (reg.userId !== session.user.id) {
    return { error: "You can only submit feedback for your own registration." };
  }

  if (!reg.attendedAt) {
    return { error: "You can only submit feedback for events you attended." };
  }

  if (new Date(reg.event.endsAt) > new Date()) {
    return { error: "Feedback can only be submitted after the event has concluded." };
  }

  if (reg.feedback) {
    return { error: "You have already submitted feedback for this event." };
  }

  try {
    await prisma.feedback.create({
      data: {
        registrationId,
        rating: parsed.data.rating,
        comment: parsed.data.comment?.trim() || null,
      },
    });

    revalidatePath("/student/registrations");
    return { success: true };
  } catch (err) {
    console.error("Submit feedback error:", err);
    return { error: "Failed to submit feedback. You may have already reviewed this event." };
  }
}
