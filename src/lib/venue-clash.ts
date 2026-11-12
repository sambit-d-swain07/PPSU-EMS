import { prisma } from "@/lib/prisma";

export async function findVenueClash(
  venueId: string,
  startsAt: Date,
  endsAt: Date,
  excludeEventId?: string
) {
  return prisma.event.findFirst({
    where: {
      venueId,
      status: { in: ["PENDING", "APPROVED"] },
      id: excludeEventId ? { not: excludeEventId } : undefined,
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true, title: true, startsAt: true, endsAt: true },
  });
}

