import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight, Ticket } from "lucide-react";

export default async function MyRegistrationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: {
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

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <StudentNav userName={session.user.name || "Student"} />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Event Registrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your confirmed event bookings and registration history.
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
                  <RegistrationCard key={reg.id} reg={reg} isPast={false} />
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
                  <RegistrationCard key={reg.id} reg={reg} isPast={true} />
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
}: {
  reg: {
    id: string;
    createdAt: Date;
    event: {
      id: string;
      title: string;
      category: string;
      startsAt: Date;
      venue: { name: string };
    };
  };
  isPast: boolean;
}) {
  return (
    <Card className="bg-white border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge variant={isPast ? "outline" : "secondary"}>
            {reg.event.category}
          </Badge>
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
              {format(
                new Date(reg.event.startsAt),
                "EEE, MMM d, yyyy • h:mm a"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{reg.event.venue.name}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm" variant="ghost" asChild className="text-xs">
            <Link href={`/student/events/${reg.event.id}`}>
              View details <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
