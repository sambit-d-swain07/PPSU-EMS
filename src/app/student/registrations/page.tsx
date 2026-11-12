import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketDialog } from "@/components/ticket-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Ticket,
  CheckCircle2,
  Award,
  Check,
} from "lucide-react";

export default async function MyRegistrationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: {
      feedback: {
        select: { rating: true, comment: true },
      },
      event: {
        include: {
          venue: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      event: {
        startsAt: "asc",
      },
    },
  });

  const now = new Date();
  const upcoming = registrations.filter(
    (reg) => new Date(reg.event.startsAt).getTime() > now.getTime()
  );
  const past = registrations.filter(
    (reg) => new Date(reg.event.startsAt).getTime() <= now.getTime()
  );

  const studentName = session.user.name || "Student";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <StudentNav userName={studentName} />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Event Registrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your confirmed event bookings, digital passes, attendance, and certificates.
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs sm:text-sm">
              Past Events ({past.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    isPast={false}
                    studentName={studentName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8 space-y-3">
                <Ticket className="h-10 w-10 text-slate-400 mx-auto" />
                <p className="text-base font-semibold text-slate-800">
                  No upcoming registrations
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You haven&apos;t registered for any future events yet.
                  Discover campus events and secure your seat!
                </p>
                <Button size="sm" asChild className="mt-2">
                  <Link href="/student/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Past Tab */}
          <TabsContent value="past" className="space-y-4">
            {past.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    isPast={true}
                    studentName={studentName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
                <p className="text-base font-semibold text-slate-800">
                  No past registrations
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You have not attended any events yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function RegistrationCard({
  reg,
  isPast,
  studentName,
}: {
  reg: {
    id: string;
    createdAt: Date;
    attendedAt: Date | null;
    feedback?: { rating: number; comment?: string | null } | null;
    event: {
      id: string;
      title: string;
      category: string;
      startsAt: Date;
      endsAt: Date;
      venue: { name: string };
    };
  };
  isPast: boolean;
  studentName: string;
}) {
  const isEnded = new Date(reg.event.endsAt).getTime() <= Date.now();
  const isEligibleForCert = Boolean(reg.attendedAt && isEnded);

  return (
    <Card className="bg-white border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isPast ? "outline" : "secondary"}>
              {reg.event.category}
            </Badge>
            {isPast && (
              reg.attendedAt ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Attended
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-400 border-slate-300">
                  Not Attended
                </Badge>
              )
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Booked {format(new Date(reg.createdAt), "MMM d, yyyy")}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1">
            {reg.event.title}
          </h3>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              {format(new Date(reg.event.startsAt), "EEE, MMM d, yyyy • h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{reg.event.venue.name}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {!isPast && (
              <TicketDialog
                registrationId={reg.id}
                eventTitle={reg.event.title}
                startsAt={reg.event.startsAt}
                venueName={reg.event.venue.name}
                studentName={studentName}
                attendedAt={reg.attendedAt}
              />
            )}

            {isPast && isEligibleForCert && (
              <Button size="sm" variant="outline" asChild className="text-xs h-8 gap-1.5 font-medium">
                <a
                  href={`/api/certificates/${reg.id}`}
                  download
                  title="Download Certificate of Participation"
                >
                  <Award className="h-3.5 w-3.5 text-amber-600" />
                  Certificate
                </a>
              </Button>
            )}

            {isPast && isEligibleForCert && (
              reg.feedback ? (
                <Badge variant="outline" className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border-emerald-200 gap-1 py-1">
                  <Check className="h-3 w-3 text-emerald-600" />
                  Feedback submitted ({reg.feedback.rating}★)
                </Badge>
              ) : (
                <FeedbackDialog
                  registrationId={reg.id}
                  eventTitle={reg.event.title}
                />
              )
            )}
          </div>

          <Button size="sm" variant="ghost" asChild className="text-xs ml-auto">
            <Link href={`/student/events/${reg.event.id}`}>
              Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
