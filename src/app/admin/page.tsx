import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { PendingApprovalsTable } from "@/components/pending-approvals-table";
import { VenuesManager } from "@/components/venues-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import {
  parseDateRangePreset,
  getOverviewStats,
  getRegistrationsPerEvent,
  getEventsPerCategory,
  getEventsPerMonth,
  getAttendanceRateByEvent,
  getTopOrganizers,
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
  Building2,
  Trophy,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { range } = await searchParams;
  const dateFilter = parseDateRangePreset(range);

  const [
    stats,
    registrationsPerEvent,
    eventsPerCategory,
    eventsPerMonth,
    attendanceRateByEvent,
    topOrganizers,
    pendingEvents,
    venues,
  ] = await Promise.all([
    getOverviewStats(undefined, dateFilter),
    getRegistrationsPerEvent(undefined, 8, dateFilter),
    getEventsPerCategory(undefined, dateFilter),
    getEventsPerMonth(),
    getAttendanceRateByEvent(undefined, 8),
    getTopOrganizers(5),
    prisma.event.findMany({
      where: { status: "PENDING" },
      include: {
        venue: { select: { id: true, name: true, capacity: true } },
        organizer: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.venue.findMany({
      include: {
        _count: { select: { events: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Administrator"}
        role="ADMIN"
        subtitle="Administrator Desk"
        activeNav="analytics"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Analytics Header & Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PixelHeading
            title="CAMPUS ANALYTICS"
            caption="campus-wide event metrics, student engagement & venue utilization"
          />
          <div className="self-start sm:self-auto">
            <DateRangeFilter />
          </div>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            description={`${stats.approvedEvents} live • ${stats.pendingEvents} pending`}
            icon={Calendar}
            color="yellow"
            rotation="-rotate-1"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingEvents}
            description="Requires admin decision"
            icon={Clock}
            color="pink"
            rotation="rotate-1"
          />
          <StatCard
            title="Registrations"
            value={stats.totalRegistrations}
            description="All active bookings"
            icon={Users}
            color="blue"
            rotation="-rotate-0.5"
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendanceRate}%`}
            description={`${stats.totalAttended} of ${stats.totalRegistrations} turnouts`}
            icon={UserCheck}
            color="mint"
            rotation="rotate-0.5"
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
            description={`${stats.feedbackCount} attendee reviews`}
            icon={Star}
            color="cream"
            rotation="-rotate-1"
          />
          <StatCard
            title="Venues"
            value={venues.length}
            description="Active campus venues"
            icon={Building2}
            color="yellow"
            rotation="rotate-1"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BarChartCard
            title="Registrations per Event"
            description="Top approved events by student registrations"
            data={registrationsPerEvent}
            dataKeys={[{ key: "registrations", name: "Registrations", color: "#2347D6" }]}
            emptyMessage="No approved events with registrations"
          />

          <BarChartCard
            title="Events by Category"
            description="Distribution of campus activities across categories"
            data={eventsPerCategory}
            dataKeys={[{ key: "count", name: "Events", color: "#F0508C" }]}
            emptyMessage="No events found for this filter"
          />

          <LineChartCard
            title="Events Trend (Last 6 Months)"
            description="Monthly cadence of campus events scheduled"
            data={eventsPerMonth}
            dataKeys={[{ key: "events", name: "Events Scheduled", color: "#19A860" }]}
          />

          <BarChartCard
            title="Attendance Rate by Event"
            description="Percentage of registered students who checked in"
            data={attendanceRateByEvent}
            dataKeys={[{ key: "rate", name: "Attendance Rate (%)", color: "#F6C945" }]}
            emptyMessage="No completed events to show attendance for"
          />
        </div>

        {/* Top Organizers Leaderboard */}
        <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-hidden">
          <div className="p-4 border-b-2 border-ink bg-paper-cream flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-base text-ink uppercase tracking-tight flex items-center gap-1.5">
                <Trophy className="h-4 w-4" /> TOP EVENT ORGANIZERS
              </h3>
              <p className="font-hand text-sm text-muted-ink">
                most active university organizers by total student registrations
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Rank & Name</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs text-center">Approved Events</TableHead>
                  <TableHead className="text-xs text-right">Total Registrations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOrganizers.length > 0 ? (
                  topOrganizers.map((org, idx) => (
                    <TableRow key={org.id}>
                      <TableCell className="text-xs font-mono font-semibold text-ink flex items-center gap-2">
                        <span className="h-5 w-5 rounded-[2px] border border-ink bg-[#F6C945] text-ink flex items-center justify-center text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        {org.name}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-ink">
                        {org.department}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="outline" className="font-mono text-[10px] border border-ink bg-paper text-ink">
                          {org.approvedEvents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-ink">
                        {org.totalRegistrations}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-xs font-mono text-muted-ink">
                      No organizers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Existing Admin Management Tabs */}
        <div className="pt-2">
          <Tabs defaultValue="approvals" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-pixel text-xl tracking-tight text-ink uppercase">PLATFORM MANAGEMENT</h2>
                <p className="font-hand text-base text-muted-ink">
                  review pending proposals and configure campus event venues
                </p>
              </div>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="approvals" className="text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-initial">
                  Pending Approvals
                  {pendingEvents.length > 0 && (
                    <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-[#F0508C] text-white border-none font-bold">
                      {pendingEvents.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="venues" className="text-xs sm:text-sm flex-1 sm:flex-initial">
                  Manage Venues ({venues.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="approvals" className="space-y-4">
              <PendingApprovalsTable data={pendingEvents} />
            </TabsContent>

            <TabsContent value="venues" className="space-y-4">
              <VenuesManager venues={venues} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
