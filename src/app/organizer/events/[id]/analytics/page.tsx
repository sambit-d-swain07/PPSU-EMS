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
import { Folder } from "@/components/ui-theme/folder";
import { Sticker } from "@/components/ui-theme/sticker";
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
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "User"}
        role={session.user.role}
        subtitle="Event Performance Report"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back navigation and Event Summary Header */}
        <div className="space-y-4">
          <Button variant="outline" size="sm" asChild className="gap-1.5 font-mono text-xs">
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4" /> BACK TO MY EVENTS
            </Link>
          </Button>

          <Folder
            tabTitle="EVENT REPORT"
            tabPosition="left"
            color="paper"
            className="p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Sticker variant="cream">{event.category}</Sticker>
                  <Sticker
                    variant={
                      event.status === "APPROVED"
                        ? "approved"
                        : event.status === "PENDING"
                        ? "pending"
                        : "draft"
                    }
                  >
                    {event.status}
                  </Sticker>
                </div>
                <h1 className="font-pixel text-2xl sm:text-3xl tracking-tight text-ink uppercase">
                  {event.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="yellow" asChild className="text-xs">
                  <Link href={`/organizer/events/${event.id}/attendance`}>
                    <UserCheck className="h-3.5 w-3.5 mr-1" /> CHECK-IN SCANNER
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t-2 border-ink font-mono text-xs text-muted-ink">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-ink shrink-0" />
                <span>
                  {format(new Date(event.startsAt), "EEE, MMM d, yyyy • h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ink shrink-0" />
                <span>
                  {event.venue.name} (Cap: {event.venue.capacity})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ink shrink-0" />
                <span>By {event.organizer.name}</span>
              </div>
            </div>
          </Folder>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Capacity & Filled"
            value={`${stats.registrations} / ${event.capacity}`}
            description={`${fillRate}% capacity filled`}
            icon={Users}
            color="yellow"
            rotation="-rotate-1"
          />
          <StatCard
            title="Seats Remaining"
            value={stats.seatsLeft}
            description={stats.seatsLeft === 0 ? "Fully booked" : "Available slots"}
            icon={Clock}
            color="mint"
            rotation="rotate-1"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            description={`${stats.attendedCount} attended • ${stats.unattendedCount} absent`}
            icon={CheckCircle2}
            color="cream"
            rotation="-rotate-0.5"
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating ? `${stats.avgRating} / 5` : "N/A"}
            description={`${stats.feedbackCount} feedback review${stats.feedbackCount === 1 ? "" : "s"}`}
            icon={Star}
            color="pink"
            rotation="rotate-0.5"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <LineChartCard
              title="Registrations Over Time"
              description="Cumulative student registration sign-ups"
              data={data.registrationsTimeline}
              dataKeys={[
                { key: "total", name: "Cumulative Total", color: "#2347D6" },
                { key: "newRegistrations", name: "Daily New", color: "#F0508C" },
              ]}
              emptyMessage="No registrations timeline data available"
            />
          </div>

          <BarChartCard
            title="Attendance Check-In"
            description="Attended vs Absent"
            data={data.attendanceComparison}
            dataKeys={[{ key: "value", name: "Students", color: "#19A860" }]}
            emptyMessage="No registrations recorded yet"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BarChartCard
            title="Rating Distribution"
            description="Breakdown of 1 to 5 star ratings submitted by attendees"
            data={data.ratingDistribution}
            dataKeys={[{ key: "count", name: "Attendees", color: "#F6C945" }]}
            emptyMessage="No ratings submitted for this event yet"
          />

          {/* Recent Feedback Reviews */}
          <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-ink bg-paper-cream">
              <h3 className="font-pixel text-base text-ink uppercase tracking-tight flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> ANONYMOUS FEEDBACK
              </h3>
              <p className="font-hand text-sm text-muted-ink">
                reviews & suggestions from verified attendees
              </p>
            </div>
            <div className="p-4 flex-1">
              <div className="max-h-[240px] overflow-y-auto space-y-2.5 pr-1">
                {data.feedbackList.length > 0 ? (
                  data.feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-[3px] border-2 border-ink bg-paper shadow-hard-sm text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-[#F6C945] text-ink" />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-ink">
                          {format(new Date(f.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-ink italic">
                        {f.comment || <span className="text-muted-ink">No written comment provided.</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="h-36 flex items-center justify-center font-mono text-xs text-muted-ink border-2 border-dashed border-ink rounded-[3px] bg-paper-cream">
                    No attendee feedback submitted yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registered Students Table */}
        <div className="border-2 border-ink rounded-[3px] bg-paper shadow-hard overflow-hidden">
          <div className="p-4 border-b-2 border-ink bg-paper-cream flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-pixel text-base text-ink uppercase tracking-tight">
                REGISTERED ATTENDEES ({data.attendees.length})
              </h3>
              <p className="font-hand text-sm text-muted-ink">
                full list of registered students with attendance and feedback
              </p>
            </div>
            <ExportCsvButton data={csvRows} filename={`${eventSlug}-attendees.csv`} />
          </div>
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                        <TableCell className="font-mono text-xs font-semibold text-ink">
                          {attendee.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {attendee.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {attendee.department}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-ink">
                          {format(new Date(attendee.registeredAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          {attendee.attendedAt ? (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-5 bg-[#BFE5CF] border border-ink font-mono text-ink">
                              Attended
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 border border-ink font-mono text-muted-ink">
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          {attendee.rating ? (
                            <span className="font-mono font-bold text-ink flex items-center justify-end gap-1">
                              <Star className="h-3 w-3 fill-[#F6C945] text-ink" />
                              {attendee.rating}/5
                            </span>
                          ) : (
                            <span className="font-mono text-muted-ink">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center font-mono text-xs text-muted-ink">
                        No students have registered for this event yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

