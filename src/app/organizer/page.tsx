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
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  Star,
  CheckCircle,
  PlusCircle,
  BarChart3,
  CalendarCheck,
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
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Organizer"}
        role="ORGANIZER"
        subtitle="Organizer Desk"
        activeNav="events"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Header & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PixelHeading
            title="ORGANIZER DESK"
            caption="manage campus events, track attendance & review turnout metrics"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="yellow"
              size="sm"
              asChild
              className="gap-2 font-mono-label text-xs h-10 px-4 shadow-hard-sm"
            >
              <Link href="/organizer/events/new">
                <PlusCircle className="h-4 w-4" />
                <span>CREATE NEW EVENT</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Separated Sections via Tabs */}
        <Tabs defaultValue="events" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-3">
            <TabsList className="bg-paper p-1 border-2 border-ink rounded-[3px] shadow-hard-sm">
              <TabsTrigger
                value="events"
                className="gap-2 font-mono-label text-xs px-4 py-1.5 data-[state=active]:bg-[#F6C945] data-[state=active]:text-ink data-[state=active]:shadow-hard-sm"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>My Events ({events.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 font-mono-label text-xs px-4 py-1.5 data-[state=active]:bg-[#F6C945] data-[state=active]:text-ink data-[state=active]:shadow-hard-sm"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Analytics & Progress</span>
              </TabsTrigger>
            </TabsList>

            <span className="font-hand text-sm text-muted-ink hidden sm:inline-block">
              {events.length} event proposals recorded
            </span>
          </div>

          {/* SECTION 1: Events Directory */}
          <TabsContent value="events" className="space-y-6">
            {/* Quick Stat Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border-2 border-ink rounded-[3px] p-3 shadow-hard-sm flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-muted-ink uppercase block">
                    Total Events
                  </span>
                  <span className="font-pixel text-2xl font-bold text-ink">
                    {stats.totalEvents}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-[3px] border border-ink bg-[#F6C945] flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-ink" />
                </div>
              </div>

              <div className="bg-white border-2 border-ink rounded-[3px] p-3 shadow-hard-sm flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-muted-ink uppercase block">
                    Approved
                  </span>
                  <span className="font-pixel text-2xl font-bold text-ink">
                    {stats.approvedEvents}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-[3px] border border-ink bg-[#BFE5CF] flex items-center justify-center">
                  <CalendarCheck className="h-4 w-4 text-ink" />
                </div>
              </div>

              <div className="bg-white border-2 border-ink rounded-[3px] p-3 shadow-hard-sm flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-muted-ink uppercase block">
                    Awaiting Review
                  </span>
                  <span className="font-pixel text-2xl font-bold text-ink">
                    {stats.pendingEvents}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-[3px] border border-ink bg-[#F3E6B8] flex items-center justify-center">
                  <Clock className="h-4 w-4 text-ink" />
                </div>
              </div>

              <div className="bg-white border-2 border-ink rounded-[3px] p-3 shadow-hard-sm flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-muted-ink uppercase block">
                    Total Attendees
                  </span>
                  <span className="font-pixel text-2xl font-bold text-ink">
                    {stats.totalRegistrations}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-[3px] border border-ink bg-[#F0508C]/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-ink" />
                </div>
              </div>
            </div>

            {/* Events Management Table */}
            <OrganizerEventsTable data={events} />
          </TabsContent>

          {/* SECTION 2: Analytics & Progress */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-ink rounded-[3px] p-4 shadow-hard-sm">
              <div>
                <h3 className="font-pixel text-base sm:text-lg font-bold text-ink uppercase tracking-tight">
                  PROGRESS & ENGAGEMENT METRICS
                </h3>
                <p className="font-hand text-sm text-muted-ink">
                  Filter turnout rates and attendee ratings by date window
                </p>
              </div>
              <div>
                <DateRangeFilter />
              </div>
            </div>

            {/* Overview Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <StatCard
                title="My Events"
                value={stats.totalEvents}
                description={`${stats.approvedEvents} approved • ${stats.draftEvents} drafts`}
                icon={Calendar}
                color="yellow"
              />
              <StatCard
                title="Approved"
                value={stats.approvedEvents}
                description="Live or completed"
                icon={CheckCircle}
                color="mint"
              />
              <StatCard
                title="In Review"
                value={stats.pendingEvents}
                description="Awaiting admin approval"
                icon={Clock}
                color="cream"
              />
              <StatCard
                title="Registrations"
                value={stats.totalRegistrations}
                description="Total sign-ups"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Attendance"
                value={`${stats.attendanceRate}%`}
                description={`${stats.totalAttended} checked in`}
                icon={UserCheck}
                color="mint"
              />
              <StatCard
                title="Avg Rating"
                value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
                description={`${stats.feedbackCount} ratings`}
                icon={Star}
                color="pink"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BarChartCard
                title="Registrations by Event"
                description="Total student registrations across your approved events"
                data={registrationsPerEvent}
                dataKeys={[{ key: "registrations", name: "Registrations", color: "#2347D6" }]}
                emptyMessage="No approved events with registrations"
              />

              <BarChartCard
                title="Attendance Rate"
                description="Percentage of checked-in students for completed events"
                data={attendanceRateByEvent}
                dataKeys={[{ key: "rate", name: "Attendance Rate (%)", color: "#19A860" }]}
                emptyMessage="No completed events yet"
              />

              <LineChartCard
                title="Events Created (Last 6 Months)"
                description="Monthly cadence of organized campus events"
                data={eventsPerMonth}
                dataKeys={[{ key: "events", name: "Events", color: "#F0508C" }]}
              />

              <BarChartCard
                title="Events by Status"
                description="Current pipeline status of all your proposed events"
                data={eventsByStatus}
                dataKeys={[{ key: "count", name: "Events", color: "#F6C945" }]}
                emptyMessage="No events found"
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
