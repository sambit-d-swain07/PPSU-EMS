import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { subDays, startOfMonth, format } from "date-fns";

export interface DateFilter {
  from?: Date;
  to?: Date;
}

export function parseDateRangePreset(preset?: string): DateFilter {
  const now = new Date();
  if (preset === "30d") {
    return { from: subDays(now, 30), to: now };
  }
  if (preset === "90d") {
    return { from: subDays(now, 90), to: now };
  }
  return {};
}

export async function getOverviewStats(organizerId?: string, filter?: DateFilter) {
  const eventWhere: Prisma.EventWhereInput = {};
  if (organizerId) {
    eventWhere.organizerId = organizerId;
  }
  if (filter?.from || filter?.to) {
    eventWhere.startsAt = {};
    if (filter.from) eventWhere.startsAt.gte = filter.from;
    if (filter.to) eventWhere.startsAt.lte = filter.to;
  }

  const [
    totalEvents,
    approvedEvents,
    pendingEvents,
    draftEvents,
    rejectedEvents,
    registrations,
    feedbacks,
  ] = await Promise.all([
    prisma.event.count({ where: eventWhere }),
    prisma.event.count({ where: { ...eventWhere, status: "APPROVED" } }),
    prisma.event.count({ where: { ...eventWhere, status: "PENDING" } }),
    prisma.event.count({ where: { ...eventWhere, status: "DRAFT" } }),
    prisma.event.count({ where: { ...eventWhere, status: "REJECTED" } }),
    prisma.registration.findMany({
      where: {
        event: eventWhere,
      },
      select: {
        id: true,
        attendedAt: true,
      },
    }),
    prisma.feedback.findMany({
      where: {
        registration: {
          event: eventWhere,
        },
      },
      select: {
        rating: true,
      },
    }),
  ]);

  const totalRegistrations = registrations.length;
  const totalAttended = registrations.filter((r) => r.attendedAt !== null).length;
  const attendanceRate =
    totalRegistrations > 0
      ? Math.round((totalAttended / totalRegistrations) * 100)
      : 0;

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : null;

  return {
    totalEvents,
    approvedEvents,
    pendingEvents,
    draftEvents,
    rejectedEvents,
    totalRegistrations,
    totalAttended,
    attendanceRate,
    avgRating,
    feedbackCount: feedbacks.length,
  };
}

export async function getRegistrationsPerEvent(
  organizerId?: string,
  limit = 8,
  filter?: DateFilter
) {
  const where: Prisma.EventWhereInput = {
    status: "APPROVED",
  };
  if (organizerId) where.organizerId = organizerId;
  if (filter?.from || filter?.to) {
    where.startsAt = {};
    if (filter.from) where.startsAt.gte = filter.from;
    if (filter.to) where.startsAt.lte = filter.to;
  }

  const events = await prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      capacity: true,
      _count: {
        select: { registrations: true },
      },
    },
    orderBy: {
      registrations: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return events.map((e) => ({
    name: e.title.length > 20 ? e.title.substring(0, 18) + "…" : e.title,
    registrations: e._count.registrations,
    capacity: e.capacity,
  }));
}

export async function getEventsPerCategory(
  organizerId?: string,
  filter?: DateFilter
) {
  const where: Prisma.EventWhereInput = {};
  if (organizerId) where.organizerId = organizerId;
  if (filter?.from || filter?.to) {
    where.startsAt = {};
    if (filter.from) where.startsAt.gte = filter.from;
    if (filter.to) where.startsAt.lte = filter.to;
  }

  const grouped = await prisma.event.groupBy({
    by: ["category"],
    where,
    _count: {
      _all: true,
    },
  });

  return grouped.map((g) => ({
    name: g.category.charAt(0) + g.category.slice(1).toLowerCase(),
    count: g._count._all,
  }));
}

export async function getEventsPerMonth(organizerId?: string) {
  const sixMonthsAgo = startOfMonth(subDays(new Date(), 180));
  const where: Prisma.EventWhereInput = {
    startsAt: { gte: sixMonthsAgo },
  };
  if (organizerId) where.organizerId = organizerId;

  const events = await prisma.event.findMany({
    where,
    select: { startsAt: true },
    orderBy: { startsAt: "asc" },
  });

  const monthCounts: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = subDays(new Date(), i * 30);
    const key = format(d, "MMM yyyy");
    monthCounts[key] = 0;
  }

  for (const e of events) {
    const key = format(e.startsAt, "MMM yyyy");
    if (monthCounts[key] !== undefined) {
      monthCounts[key]++;
    }
  }

  return Object.entries(monthCounts).map(([month, count]) => ({
    name: month,
    events: count,
  }));
}

export async function getAttendanceRateByEvent(
  organizerId?: string,
  limit = 8
) {
  const now = new Date();
  const where: Prisma.EventWhereInput = {
    status: "APPROVED",
    endsAt: { lte: now },
  };
  if (organizerId) where.organizerId = organizerId;

  const events = await prisma.event.findMany({
    where,
    select: {
      id: true,
      title: true,
      registrations: {
        select: { attendedAt: true },
      },
    },
    orderBy: { endsAt: "desc" },
    take: limit,
  });

  return events
    .filter((e) => e.registrations.length > 0)
    .map((e) => {
      const total = e.registrations.length;
      const attended = e.registrations.filter((r) => r.attendedAt !== null).length;
      const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
      return {
        name: e.title.length > 20 ? e.title.substring(0, 18) + "…" : e.title,
        attended,
        total,
        rate,
      };
    });
}

export async function getEventsByStatus(
  organizerId: string,
  filter?: DateFilter
) {
  const where: Prisma.EventWhereInput = { organizerId };
  if (filter?.from || filter?.to) {
    where.startsAt = {};
    if (filter.from) where.startsAt.gte = filter.from;
    if (filter.to) where.startsAt.lte = filter.to;
  }

  const grouped = await prisma.event.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
  });

  return grouped.map((g) => ({
    name: g.status.charAt(0) + g.status.slice(1).toLowerCase(),
    count: g._count._all,
  }));
}

export async function getTopOrganizers(limit = 5) {
  const organizers = await prisma.user.findMany({
    where: { role: "ORGANIZER", isActive: true },
    select: {
      id: true,
      name: true,
      department: true,
      organizedEvents: {
        select: {
          status: true,
          _count: {
            select: { registrations: true },
          },
        },
      },
    },
  });

  const ranked = organizers.map((org) => {
    const approvedEvents = org.organizedEvents.filter(
      (e) => e.status === "APPROVED"
    ).length;
    const totalRegistrations = org.organizedEvents.reduce(
      (acc, e) => acc + e._count.registrations,
      0
    );
    return {
      id: org.id,
      name: org.name,
      department: org.department || "General",
      approvedEvents,
      totalRegistrations,
    };
  });

  ranked.sort((a, b) => b.totalRegistrations - a.totalRegistrations);
  return ranked.slice(0, limit);
}

export async function getSingleEventAnalytics(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venue: { select: { name: true, capacity: true } },
      organizer: { select: { id: true, name: true, email: true, department: true } },
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true },
          },
          feedback: {
            select: { id: true, rating: true, comment: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) return null;

  const totalRegistrations = event.registrations.length;
  const attendedCount = event.registrations.filter((r) => r.attendedAt !== null).length;
  const unattendedCount = totalRegistrations - attendedCount;
  const attendanceRate =
    totalRegistrations > 0
      ? Math.round((attendedCount / totalRegistrations) * 100)
      : 0;
  const seatsLeft = Math.max(0, event.capacity - totalRegistrations);

  // Registrations over time (by day)
  const regByDate: Record<string, number> = {};
  for (const r of event.registrations) {
    const day = format(r.createdAt, "MMM d");
    regByDate[day] = (regByDate[day] || 0) + 1;
  }
  let cumulative = 0;
  const registrationsTimeline = Object.entries(regByDate).map(([date, count]) => {
    cumulative += count;
    return {
      name: date,
      newRegistrations: count,
      total: cumulative,
    };
  });

  // Ratings distribution
  const feedbacks = event.registrations
    .map((r) => r.feedback)
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const f of feedbacks) {
    ratingCounts[f.rating] = (ratingCounts[f.rating] || 0) + 1;
  }
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    name: `${star} Star${star > 1 ? "s" : ""}`,
    count: ratingCounts[star],
  }));

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : null;

  return {
    event,
    stats: {
      capacity: event.capacity,
      registrations: totalRegistrations,
      seatsLeft,
      attendedCount,
      unattendedCount,
      attendanceRate,
      avgRating,
      feedbackCount: feedbacks.length,
    },
    registrationsTimeline,
    attendanceComparison: [
      { name: "Attended", value: attendedCount },
      { name: "Absent", value: unattendedCount },
    ],
    ratingDistribution,
    attendees: event.registrations.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      department: r.user.department || "General",
      registeredAt: r.createdAt,
      attendedAt: r.attendedAt,
      rating: r.feedback?.rating ?? null,
      comment: r.feedback?.comment ?? null,
    })),
    feedbackList: feedbacks.map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
    })),
  };
}

