import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceScanner } from "@/components/attendance-scanner";
import { AppNavbar } from "@/components/app-navbar";
import { notFound, redirect } from "next/navigation";

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
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Organizer"}
        role={session.user.role}
        subtitle="Attendance & Check-in"
      />

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

