import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceScanner } from "@/components/attendance-scanner";
import { LogoutButton } from "@/components/logout-button";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendancePageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: {
        select: { name: true },
      },
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const isOrganizer =
    session.user.role === "ORGANIZER" && event.organizerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOrganizer && !isAdmin) {
    redirect("/organizer");
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-xs">
              <Link href="/organizer">
                <ArrowLeft className="h-4 w-4" /> Back to Events
              </Link>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-base font-semibold text-slate-900 truncate max-w-sm sm:max-w-md">
              Check-in & Attendance
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {session.user.name} ({session.user.role})
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AttendanceScanner
          eventId={event.id}
          eventTitle={event.title}
          eventCategory={event.category}
          startsAt={event.startsAt}
          endsAt={event.endsAt}
          venueName={event.venue.name}
          registrations={event.registrations}
        />
      </main>
    </div>
  );
}
