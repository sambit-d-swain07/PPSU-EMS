import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/student-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TicketDialog } from "@/components/ticket-dialog";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { CancelRegistrationButton } from "@/components/cancel-registration-button";
import { Folder, type FolderColor } from "@/components/ui-theme/folder";
import { Sticker } from "@/components/ui-theme/sticker";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  ArrowRight,
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
    <div className="min-h-screen flex flex-col">
      <StudentNav userName={studentName} />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 space-y-8">
        <PixelHeading
          title="MY TICKETS & PASSES"
          caption="✦ confirmed bookings and event records ✦"
          tagline="Open any ticket folder to view your entry QR code, certificate, or review."
        />

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="p-1 w-full sm:w-auto flex">
            <TabsTrigger value="upcoming">
              Upcoming Passes ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past History ({past.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcoming.map((reg, idx) => (
                  <RegistrationFolderCard
                    key={reg.id}
                    reg={reg}
                    isPast={false}
                    studentName={studentName}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[3px] border-2 border-ink shadow-hard p-8 space-y-3">
                <Sticker color="cream" rotate={-2}>NO UPCOMING TICKETS</Sticker>
                <p className="font-hand text-2xl text-ink">
                  You haven&apos;t booked any upcoming events yet.
                </p>
                <p className="text-xs font-mono text-muted-ink max-w-sm mx-auto">
                  Browse the campus events catalog to reserve your seat!
                </p>
                <div className="pt-2">
                  <Button asChild size="sm">
                    <Link href="/student/events">Browse Events ↗</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Past Events Tab */}
          <TabsContent value="past" className="space-y-4">
            {past.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {past.map((reg, idx) => (
                  <RegistrationFolderCard
                    key={reg.id}
                    reg={reg}
                    isPast={true}
                    studentName={studentName}
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-[3px] border-2 border-ink shadow-hard p-8 space-y-3">
                <Sticker color="cream">EMPTY ARCHIVE</Sticker>
                <p className="font-hand text-2xl text-ink">
                  No completed event registrations recorded.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const folderColors: FolderColor[] = ["paper", "cream", "yellow"];

function RegistrationFolderCard({
  reg,
  isPast,
  studentName,
  index = 0,
}: {
  reg: {
    id: string;
    createdAt: Date;
    attendedAt: Date | null;
    feedback: { rating: number; comment: string | null } | null;
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
  index: number;
}) {
  const isEnded = new Date(reg.event.endsAt).getTime() <= Date.now();
  const isEligibleForCert = Boolean(reg.attendedAt && isEnded);
  const color = folderColors[index % folderColors.length];
  const dateTab = format(new Date(reg.event.startsAt), "MMM d, yyyy").toUpperCase();

  return (
    <Folder
      tab={dateTab}
      tabSide={index % 2 === 0 ? "left" : "right"}
      color={color}
      className="h-full hover-tilt"
      contentClassName="flex flex-col justify-between h-full space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Sticker color="yellow">{reg.event.category}</Sticker>
            {isPast ? (
              reg.attendedAt ? (
                <Sticker color="mint">ATTENDED ✓</Sticker>
              ) : (
                <Sticker color="pink">ABSENT</Sticker>
              )
            ) : (
              <Sticker color="mint">CONFIRMED</Sticker>
            )}
          </div>
          <span className="font-mono text-[10px] text-muted-ink">
            #{reg.id.slice(-6)}
          </span>
        </div>

        <h3 className="font-pixel text-lg sm:text-xl font-bold text-ink line-clamp-1 leading-snug">
          {reg.event.title}
        </h3>

        <div className="space-y-1 font-mono text-xs text-ink/80 pt-2 border-t border-ink/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-ink shrink-0" />
            <span>
              {format(new Date(reg.event.startsAt), "EEE, MMM d, yyyy • h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-muted-ink shrink-0" />
            <span className="truncate">{reg.event.venue.name}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-ink/20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {!isPast && (
            <>
              <TicketDialog
                registrationId={reg.id}
                eventTitle={reg.event.title}
                startsAt={reg.event.startsAt}
                venueName={reg.event.venue.name}
                studentName={studentName}
                attendedAt={reg.attendedAt}
              />
              <CancelRegistrationButton
                eventId={reg.event.id}
                eventTitle={reg.event.title}
              />
            </>
          )}

          {isPast && isEligibleForCert && (
            <Button size="sm" variant="yellow" asChild className="text-xs h-8 gap-1.5 font-mono-label">
              <a
                href={`/api/certificates/${reg.id}`}
                download
                title="Download Certificate of Participation"
              >
                <Award className="h-3.5 w-3.5 text-ink" />
                CERTIFICATE
              </a>
            </Button>
          )}

          {isPast && isEligibleForCert && (
            reg.feedback ? (
              <Sticker color="mint" className="text-[10px] gap-1 py-1">
                <Check className="h-3 w-3 text-[#19A860]" />
                REVIEWED ({reg.feedback.rating}★)
              </Sticker>
            ) : (
              <FeedbackDialog
                registrationId={reg.id}
                eventTitle={reg.event.title}
              />
            )
          )}
        </div>

        <Button size="sm" variant="ghost" asChild className="text-xs font-mono-label ml-auto">
          <Link href={`/student/events/${reg.event.id}`}>
            DETAILS <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </Folder>
  );
}
