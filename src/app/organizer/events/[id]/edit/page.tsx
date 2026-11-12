import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { AppNavbar } from "@/components/app-navbar";
import { Folder } from "@/components/ui-theme/folder";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import { notFound, redirect } from "next/navigation";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  if (event.organizerId !== session.user.id) {
    redirect("/organizer");
  }

  // Edit is allowed only while status is DRAFT or REJECTED
  if (event.status !== "DRAFT" && event.status !== "REJECTED") {
    redirect("/organizer");
  }

  const venues = await prisma.venue.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Organizer"}
        role="ORGANIZER"
        subtitle="Edit Proposal"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <PixelHeading
          title="EDIT EVENT PROPOSAL"
          caption={`updating draft/revision for "${event.title}"`}
        />

        <Folder
          tabTitle="EDIT PROPOSAL"
          tabPosition="left"
          color="paper"
          contentClassName="p-6 sm:p-10"
        >
          <EventForm
            venues={venues}
            eventId={event.id}
            initialData={{
              title: event.title,
              description: event.description,
              category: event.category,
              venueId: event.venueId,
              startsAt: event.startsAt.toISOString(),
              endsAt: event.endsAt.toISOString(),
              capacity: event.capacity,
              posterUrl: event.posterUrl,
              status: event.status,
              reviewRemark: event.reviewRemark,
            }}
          />
        </Folder>
      </main>
    </div>
  );
}

