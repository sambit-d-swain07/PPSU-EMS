import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getSingleEventAnalytics } from "@/lib/analytics";
import { AppNavbar } from "@/components/app-navbar";
import { StatCard } from "@/components/analytics/stat-card";
import { BarChartCard } from "@/components/analytics/bar-chart-card";
import { LineChartCard } from "@/components/analytics/line-chart-card";
import { ExportCsvButton } from "@/components/analytics/export-csv-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";

interface EventAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventAnalyticsPage({ params }: EventAnalyticsPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const data = await getSingleEventAnalytics(id);

  if (!data) {
    notFound();
  }

  const isOwner = data.event.organizerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const { event, stats } = data;
  const fillRate =
    event.capacity > 0 ? Math.round((stats.registrations / event.capacity) * 100) : 0;
  const eventSlug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const csvRows = data.attendees.map((a) => ({
    "Student Name": a.name,
    Email: a.email,
    Department: a.department,
    "Registered At": format(new Date(a.registeredAt), "yyyy-MM-dd HH:mm"),
    "Attendance Status": a.attendedAt ? "Attended" : "Absent",
    "Checked In At": a.attendedAt ? format(new Date(a.attendedAt), "yyyy-MM-dd HH:mm") : "",
    Rating: a.rating !== null ? a.rating : "",
    Feedback: a.comment || "",
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AppNavbar
        userName={session.user.name || "User"}
        role={session.user.role}
        subtitle="Event Performance Report"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back navigation and Event Summary Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 -ml-2">
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4" /> Back to My Events
            </Link>
          </Button>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Badge variant="outline">{event.category}</Badge>
                  <Badge
                    variant={
                      event.status === "APPROVED"
                        ? "success"
                        : event.status === "PENDING"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {event.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild className="text-xs">
                  <Link href={`/organizer/events/${event.id}/attendance`}>
                    <UserCheck className="h-3.5 w-3.5 mr-1 text-slate-600" /> Scanner & Attendance
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {format(new Date(event.startsAt), "EEE, MMM d, yyyy • h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {event.venue.name} (Capacity: {event.venue.capacity})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Organized by {event.organizer.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Capacity & Filled"
            value={`${stats.registrations} / ${event.capacity}`}
            description={`${fillRate}% capacity filled`}
            icon={Users}
          />
          <StatCard
            title="Seats Remaining"
            value={stats.seatsLeft}
            description={stats.seatsLeft === 0 ? "Event is fully booked" : "Available slots"}
            icon={Clock}
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            description={`${stats.attendedCount} attended • ${stats.unattendedCount} absent`}
            icon={CheckCircle2}
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
            description={`${stats.feedbackCount} feedback submission${stats.feedbackCount === 1 ? "" : "s"}`}
            icon={Star}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <LineChartCard
              title="Registrations Over Time"
              description="Cumulative student registration sign-ups"
              data={data.registrationsTimeline}
              dataKeys={[
                { key: "total", name: "Cumulative Total", color: "#3b82f6" },
                { key: "newRegistrations", name: "Daily New", color: "#93c5fd" },
              ]}
              emptyMessage="No registrations timeline data available"
            />
          </div>

          <BarChartCard
            title="Attendance Check-In"
            description="Attended vs Absent"
            data={data.attendanceComparison}
            dataKeys={[{ key: "value", name: "Students", color: "#10b981" }]}
            emptyMessage="No registrations recorded yet"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BarChartCard
            title="Rating Distribution"
            description="Breakdown of 1 to 5 star ratings submitted by attendees"
            data={data.ratingDistribution}
            dataKeys={[{ key: "count", name: "Attendees", color: "#f59e0b" }]}
            emptyMessage="No ratings submitted for this event yet"
          />

          {/* Recent Feedback Reviews */}
          <Card className="border border-slate-200 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-500" /> Anonymous Feedback
              </CardTitle>
              <CardDescription className="text-xs">
                Feedback and suggestions from verified attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[240px] overflow-y-auto space-y-2.5 pr-1">
                {data.feedbackList.length > 0 ? (
                  data.feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(f.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-slate-700 italic">
                        {f.comment || <span className="text-slate-400">No written comment provided.</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-36 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg bg-slate-50/50">
                    No attendee feedback submitted yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Students Table */}
        <Card className="border border-slate-200 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Registered Attendees ({data.attendees.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Full list of registered students with attendance and feedback
                </CardDescription>
              </div>
              <ExportCsvButton data={csvRows} filename={`${eventSlug}-attendees.csv`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-100 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Registered</TableHead>
                    <TableHead className="text-xs text-center">Attendance</TableHead>
                    <TableHead className="text-xs text-right">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attendees.length > 0 ? (
                    data.attendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="text-xs font-medium text-slate-900">
                          {attendee.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {attendee.email}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {attendee.department}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {format(new Date(attendee.registeredAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {attendee.attendedAt ? (
                            <Badge variant="success" className="text-[10px] py-0 px-1.5 h-4">
                              Attended
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 text-slate-500">
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {attendee.rating ? (
                            <span className="font-semibold text-amber-600 flex items-center justify-end gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {attendee.rating}/5
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                        No students have registered for this event yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

