import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { RegistrationButton } from "@/components/registration-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
  User as UserIcon,
} from "lucide-react";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      organizer: {
        select: {
          name: true,
          email: true,
          department: true,
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event || event.status !== "APPROVED") {
    notFound();
  }

  // Check if current user is registered
  const userRegistration = await prisma.registration.findUnique({
    where: {
      eventId_userId: {
        eventId: id,
        userId: session.user.id,
      },
    },
  });

  const seatsLeft = Math.max(0, event.capacity - event._count.registrations);
  const isRegistered = !!userRegistration;
  const isFull = seatsLeft === 0;
  const hasStarted = new Date(event.startsAt).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <StudentNav userName={session.user.name || "Student"} />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/student/events">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to all events
            </Link>
          </Button>
        </div>

        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Header Poster */}
          {event.posterUrl ? (
            <div className="relative w-full h-64 sm:h-80 bg-slate-100">
              <Image
                src={event.posterUrl}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-slate-900 text-white flex items-center justify-center p-6 text-center">
              <div>
                <span className="text-3xl font-black tracking-widest text-white/20 select-none block">
                  CAMPUS EVENT
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-slate-300 mt-1 inline-block">
                  {event.category}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{event.category}</Badge>
                {hasStarted ? (
                  <Badge variant="outline">Concluded</Badge>
                ) : isFull ? (
                  <Badge variant="destructive">Full Capacity</Badge>
                ) : (
                  <Badge variant="success">{seatsLeft} seats remaining</Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {event.title}
              </h1>
            </div>

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Schedule
                </span>
                <p className="font-semibold text-slate-900">
                  {format(new Date(event.startsAt), "EEE, MMM d, yyyy")}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.startsAt), "h:mm a")} –{" "}
                  {format(new Date(event.endsAt), "h:mm a")}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </span>
                <p className="font-semibold text-slate-900">
                  {event.venue.name}
                </p>
                <p className="text-xs text-slate-600">
                  Max venue capacity: {event.venue.capacity}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                  <Users className="h-3.5 w-3.5" /> Seats & Availability
                </span>
                <p className="font-semibold text-slate-900">
                  {event._count.registrations} / {event.capacity} Filled
                </p>
                <p className="text-xs text-slate-600">
                  {seatsLeft > 0 ? `${seatsLeft} spots open` : "No seats left"}
                </p>
              </div>
            </div>

            {/* Call to Action Bar */}
            <div className="pt-2 pb-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  Registration Status
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {isRegistered
                    ? "You are confirmed for this event."
                    : isFull
                    ? "All seats for this event are currently booked."
                    : "Seats are currently available for university students."}
                </p>
              </div>

              <RegistrationButton
                eventId={event.id}
                eventTitle={event.title}
                isRegistered={isRegistered}
                isFull={isFull}
                hasStarted={hasStarted}
                seatsLeft={seatsLeft}
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                About this Event
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Organizer Note */}
            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span>
                Organized by{" "}
                <strong className="text-slate-700">
                  {event.organizer.name}
                </strong>{" "}
                ({event.organizer.department || "Faculty of Student Affairs"})
              </span>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

