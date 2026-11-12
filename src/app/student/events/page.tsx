import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { EventFilters } from "@/components/event-filters";
import { EventCard } from "@/components/event-card";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import { Sticker } from "@/components/ui-theme/sticker";

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    dateRange?: string;
    page?: string;
  }>;
}

export default async function StudentEventsPage({
  searchParams,
}: EventsPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const { q, category, dateRange, page } = await searchParams;

  const pageNumber = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 9;

  const now = new Date();
  let dateFilter: Prisma.DateTimeFilter = { gt: now };

  if (dateRange === "TODAY") {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter = {
      gte: now,
      lte: endOfDay,
    };
  } else if (dateRange === "THIS_WEEK") {
    const endOfWeek = new Date();
    const daysUntilSunday = 7 - endOfWeek.getDay();
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    dateFilter = {
      gte: now,
      lte: endOfWeek,
    };
  } else if (dateRange === "THIS_MONTH") {
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    dateFilter = {
      gte: now,
      lte: endOfMonth,
    };
  }

  const where: Prisma.EventWhereInput = {
    status: "APPROVED",
    startsAt: dateFilter,
  };

  if (q && q.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  if (category && category !== "ALL") {
    where.category = category as Prisma.EnumEventCategoryFilter["equals"];
  }

  const [totalCount, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        posterUrl: true,
        startsAt: true,
        capacity: true,
        venue: {
          select: { name: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startsAt: "asc" },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to construct query string with updated page
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category && category !== "ALL") params.set("category", category);
    if (dateRange && dateRange !== "ALL") params.set("dateRange", dateRange);
    params.set("page", targetPage.toString());
    return `/student/events?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav userName={session.user.name || "Student"} />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* Title Header */}
        <PixelHeading
          title="UPCOMING EVENTS"
          caption="✦ explore what's happening on campus ✦"
          tagline="Pick a folder, reserve your seat, and get your digital QR ticket."
        />

        <EventFilters />

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {events.map((event, idx) => (
              <EventCard key={event.id} event={event} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-[3px] border-2 border-ink shadow-hard p-8 space-y-3">
            <Sticker color="yellow" rotate={-2}>
              EMPTY FOLDER
            </Sticker>
            <p className="font-hand text-2xl text-ink">
              No matching events found in the files.
            </p>
            <p className="text-xs font-mono text-muted-ink max-w-sm mx-auto">
              Try adjusting your search keywords or switching category filters.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs text-muted-foreground">
              Showing {(pageNumber - 1) * pageSize + 1}–
              {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} events
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild={pageNumber > 1}
                disabled={pageNumber <= 1}
              >
                {pageNumber > 1 ? (
                  <Link href={buildPageUrl(pageNumber - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </span>
                )}
              </Button>

              <span className="text-xs font-medium px-2">
                Page {pageNumber} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                asChild={pageNumber < totalPages}
                disabled={pageNumber >= totalPages}
              >
                {pageNumber < totalPages ? (
                  <Link href={buildPageUrl(pageNumber + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <span>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

