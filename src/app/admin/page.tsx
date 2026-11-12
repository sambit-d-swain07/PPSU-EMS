import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { PendingApprovalsTable } from "@/components/pending-approvals-table";
import { VenuesManager } from "@/components/venues-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="min-h-screen bg-slate-50/50">
      <AppNavbar
        userName={session.user.name || "Administrator"}
        role="ADMIN"
        subtitle="Administrator Dashboard"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Analytics Header & Date Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Campus-wide event metrics, student engagement, and venue utilization.
            </p>
          </div>
          <DateRangeFilter />
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            description={`${stats.approvedEvents} approved • ${stats.pendingEvents} pending`}
            icon={Calendar}
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingEvents}
            description="Requires admin decision"
            icon={Clock}
          />
          <StatCard
            title="Registrations"
            value={stats.totalRegistrations}
            description="All active bookings"
            icon={Users}
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendanceRate}%`}
            description={`${stats.totalAttended} attended of ${stats.totalRegistrations}`}
            icon={UserCheck}
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
            description={`${stats.feedbackCount} attendee reviews`}
            icon={Star}
          />
          <StatCard
            title="Venues"
            value={venues.length}
            description="Active campus venues"
            icon={Building2}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChartCard
            title="Registrations per Event"
            description="Top approved events by student registrations"
            data={registrationsPerEvent}
            dataKeys={[{ key: "registrations", name: "Registrations", color: "#3b82f6" }]}
            emptyMessage="No approved events with registrations"
          />

          <BarChartCard
            title="Events by Category"
            description="Distribution of campus activities across categories"
            data={eventsPerCategory}
            dataKeys={[{ key: "count", name: "Events", color: "#8b5cf6" }]}
            emptyMessage="No events found for this filter"
          />

          <LineChartCard
            title="Events Trend (Last 6 Months)"
            description="Monthly cadence of campus events scheduled"
            data={eventsPerMonth}
            dataKeys={[{ key: "events", name: "Events Scheduled", color: "#06b6d4" }]}
          />

          <BarChartCard
            title="Attendance Rate by Event"
            description="Percentage of registered students who checked in"
            data={attendanceRateByEvent}
            dataKeys={[{ key: "rate", name: "Attendance Rate (%)", color: "#10b981" }]}
            emptyMessage="No completed events to show attendance for"
          />
        </div>

        {/* Top Organizers Leaderboard */}
        <Card className="border border-slate-200 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" /> Top Event Organizers
                </CardTitle>
                <CardDescription className="text-xs">
                  Most active university organizers by total student registrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-100 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Organizer Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs text-center">Approved Events</TableHead>
                    <TableHead className="text-xs text-right">Total Registrations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOrganizers.length > 0 ? (
                    topOrganizers.map((org, idx) => (
                      <TableRow key={org.id}>
                        <TableCell className="text-xs font-medium text-slate-900 flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                          {org.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {org.department}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <Badge variant="outline" className="font-medium text-slate-700">
                            {org.approvedEvents}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right font-semibold text-slate-900">
                          {org.totalRegistrations}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-xs text-muted-foreground">
                        No organizers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Existing Admin Management Tabs */}
        <div className="pt-4 border-t border-slate-200">
          <Tabs defaultValue="approvals" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Platform Management</h2>
                <p className="text-xs text-muted-foreground">
                  Review pending proposals and configure campus event venues.
                </p>
              </div>
              <TabsList className="bg-slate-100 p-1 w-full sm:w-auto">
                <TabsTrigger value="approvals" className="text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-initial">
                  Pending Approvals
                  {pendingEvents.length > 0 && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0 h-4">
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
