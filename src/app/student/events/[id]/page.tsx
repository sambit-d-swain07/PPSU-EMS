import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { RegistrationButton } from "@/components/registration-button";
import { Folder } from "@/components/ui-theme/folder";
import { Polaroid } from "@/components/ui-theme/polaroid";
import { Sticker } from "@/components/ui-theme/sticker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

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

  const statusLabel = hasStarted
    ? "CONCLUDED"
    : isFull
    ? "FULL CAPACITY"
    : `${seatsLeft} SEATS OPEN`;

  const statusColor = hasStarted ? "cream" : isFull ? "pink" : "mint";

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav userName={session.user.name || "Student"} />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mb-2"
          >
            <Link href="/student/events">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> BACK TO EVENTS
            </Link>
          </Button>
        </div>

        {/* Signature Event Folder */}
        <Folder
          tab={statusLabel}
          tabSide="right"
          color="paper"
          className="w-full"
        >
          <div className="space-y-6">
            {/* Header / Title */}
            <div className="space-y-2 border-b-2 border-ink/20 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Sticker color="yellow">{event.category}</Sticker>
                <Sticker color={statusColor}>{statusLabel}</Sticker>
                {isRegistered && (
                  <Sticker color="mint" rotate={1}>
                    ✓ YOU ARE REGISTERED
                  </Sticker>
                )}
              </div>

              <h1 className="font-pixel text-2xl sm:text-4xl font-bold text-ink tracking-tight pt-1">
                {event.title}
              </h1>
            </div>

            {/* Poster & Mono-label details layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Polaroid Frame */}
              <div className="md:col-span-5 flex justify-center">
                <Polaroid
                  src={event.posterUrl}
                  alt={event.title}
                  caption={event.category}
                  rotate={-2}
                  tapeColor="blue"
                  className="w-full max-w-[320px]"
                  imageClassName="h-56 sm:h-64"
                />
              </div>

              {/* Right: Meta Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-[#EFE6D2]/60 p-4 rounded-[3px] border-2 border-ink space-y-3 font-mono text-xs">
                  <div className="flex items-start justify-between border-b border-ink/20 pb-2">
                    <span className="font-mono-label text-muted-ink">SCHEDULE</span>
                    <div className="text-right font-bold text-ink">
                      <p>{format(new Date(event.startsAt), "EEE, MMM d, yyyy")}</p>
                      <p className="text-[11px] font-normal text-muted-ink">
                        {format(new Date(event.startsAt), "h:mm a")} – {format(new Date(event.endsAt), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between border-b border-ink/20 pb-2">
                    <span className="font-mono-label text-muted-ink">LOCATION</span>
                    <div className="text-right font-bold text-ink">
                      <p>{event.venue.name}</p>
                      <p className="text-[11px] font-normal text-muted-ink">
                        Venue Capacity: {event.venue.capacity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between border-b border-ink/20 pb-2">
                    <span className="font-mono-label text-muted-ink">AVAILABILITY</span>
                    <div className="text-right font-bold text-ink">
                      <p>{event._count.registrations} / {event.capacity} Filled</p>
                      <p className="text-[11px] font-normal text-muted-ink">
                        {seatsLeft > 0 ? `${seatsLeft} seats remaining` : "Full capacity"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="font-mono-label text-muted-ink">ORGANIZER</span>
                    <div className="text-right font-bold text-ink">
                      <p>{event.organizer.name}</p>
                      <p className="text-[11px] font-normal text-muted-ink">
                        {event.organizer.department || "Student Affairs"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Action Box */}
                <div className="p-4 bg-white border-2 border-ink rounded-[3px] shadow-hard-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono-label text-ink">REGISTRATION STATUS</span>
                    <span className="font-hand text-sm text-ink">
                      {isRegistered ? "Ticket confirmed" : isFull ? "Sold out" : "Open for booking"}
                    </span>
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
              </div>
            </div>

            {/* About / Description */}
            <div className="pt-4 border-t-2 border-ink/20 space-y-2">
              <h2 className="font-pixel text-lg sm:text-xl font-bold text-ink">
                ABOUT THIS EVENT
              </h2>
              <div className="p-4 bg-paper border border-ink/30 rounded-[3px] text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                {event.description}
              </div>
            </div>
          </div>
        </Folder>
      </main>
    </div>
  );
}
