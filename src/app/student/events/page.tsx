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
      include: {
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
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <StudentNav userName={session.user.name || "Student"} />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Discover Campus Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse upcoming workshops, cultural programs, hackathons, and
            seminars.
          </p>
        </div>

        <EventFilters />

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
            <p className="text-base font-semibold text-slate-800">
              No matching events found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              There are currently no approved future events matching your
              selected search criteria.
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
