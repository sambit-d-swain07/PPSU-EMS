import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { OrganizerEventsTable } from "@/components/organizer-events-table";
import {
  parseDateRangePreset,
  getOverviewStats,
  getRegistrationsPerEvent,
  getAttendanceRateByEvent,
  getEventsPerMonth,
  getEventsByStatus,
} from "@/lib/analytics";
import { StatCard } from "@/components/analytics/stat-card";
import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { LineChartCard } from "@/components/analytics/line-chart-card";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  Star,
  CheckCircle,
} from "lucide-react";

interface OrganizerPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function OrganizerPage({ searchParams }: OrganizerPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const { range } = await searchParams;
  const dateFilter = parseDateRangePreset(range);

  const [
    stats,
    registrationsPerEvent,
    attendanceRateByEvent,
    eventsPerMonth,
    eventsByStatus,
    events,
  ] = await Promise.all([
    getOverviewStats(session.user.id, dateFilter),
    getRegistrationsPerEvent(session.user.id, 8, dateFilter),
    getAttendanceRateByEvent(session.user.id, 8),
    getEventsPerMonth(session.user.id),
    getEventsByStatus(session.user.id, dateFilter),
    prisma.event.findMany({
      where: { organizerId: session.user.id },
      include: {
        venue: {
          select: {
            name: true,
            capacity: true,
          },
        },
        registrations: {
          include: {
            feedback: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AppNavbar
        userName={session.user.name || "Organizer"}
        role="ORGANIZER"
        subtitle="Organizer Portal"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Organizer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Performance metrics, attendee turnouts, and event proposals.
            </p>
          </div>
          <DateRangeFilter />
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="My Events"
            value={stats.totalEvents}
            description={`${stats.approvedEvents} approved • ${stats.draftEvents} drafts`}
            icon={Calendar}
          />
          <StatCard
            title="Approved"
            value={stats.approvedEvents}
            description="Live or completed"
            icon={CheckCircle}
          />
          <StatCard
            title="In Review"
            value={stats.pendingEvents}
            description="Awaiting admin approval"
            icon={Clock}
          />
          <StatCard
            title="Registrations"
            value={stats.totalRegistrations}
            description="Total sign-ups"
            icon={Users}
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendanceRate}%`}
            description={`${stats.totalAttended} attendees checked in`}
            icon={UserCheck}
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
            description={`${stats.feedbackCount} feedback ratings`}
            icon={Star}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChartCard
            title="Registrations by Event"
            description="Total student registrations across your approved events"
            data={registrationsPerEvent}
            dataKeys={[{ key: "registrations", name: "Registrations", color: "#3b82f6" }]}
            emptyMessage="No approved events with registrations"
          />

          <BarChartCard
            title="Attendance Rate"
            description="Percentage of checked-in students for completed events"
            data={attendanceRateByEvent}
            dataKeys={[{ key: "rate", name: "Attendance Rate (%)", color: "#10b981" }]}
            emptyMessage="No completed events yet"
          />

          <LineChartCard
            title="Events Created (Last 6 Months)"
            description="Monthly history of organized campus events"
            data={eventsPerMonth}
            dataKeys={[{ key: "events", name: "Events", color: "#6366f1" }]}
          />

          <BarChartCard
            title="Events by Status"
            description="Current pipeline status of all your proposed events"
            data={eventsByStatus}
            dataKeys={[{ key: "count", name: "Events", color: "#f59e0b" }]}
            emptyMessage="No events found"
          />
        </div>

        {/* Events Table */}
        <div className="pt-4 border-t border-slate-200">
          <OrganizerEventsTable data={events} />
        </div>
      </main>
    </div>
  );
}
