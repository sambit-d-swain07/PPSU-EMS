import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid university email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const eventCategories = [
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "WORKSHOP",
  "SEMINAR",
  "OTHER",
] as const;

export const eventStatuses = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export const eventFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long."),
    category: z.enum(eventCategories, {
      errorMap: () => ({ message: "Please select a valid event category." }),
    }),
    venueId: z.string().min(1, "Please select a venue."),
    startsAt: z.string().min(1, "Start date and time are required."),
    endsAt: z.string().min(1, "End date and time are required."),
    capacity: z.coerce
      .number({ invalid_type_error: "Capacity must be a number." })
      .int()
      .positive("Capacity must be greater than zero."),
    posterUrl: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      const end = new Date(data.endsAt);
      return end > start;
    },
    {
      message: "End time must be after start time.",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      // Give a 2-minute buffer so filling the form doesn't fail if time passes
      return start.getTime() > Date.now() - 2 * 60 * 1000;
    },
    {
      message: "Start time must be in the future.",
      path: ["startsAt"],
    }
  );

export type EventFormInput = z.infer<typeof eventFormSchema>;

export const venueFormSchema = z.object({
  name: z.string().min(2, "Venue name must be at least 2 characters."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number." })
    .int()
    .positive("Capacity must be greater than zero."),
});

export type VenueFormInput = z.infer<typeof venueFormSchema>;

export const reviewEventSchema = z.object({
  eventId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
  remark: z.string().optional(),
}).refine(
  (data) => {
    if (data.action === "REJECT") {
      return !!data.remark && data.remark.trim().length > 0;
    }
    return true;
  },
  {
    message: "A review remark is required when rejecting an event.",
    path: ["remark"],
  }
);

export type ReviewEventInput = z.infer<typeof reviewEventSchema>;
