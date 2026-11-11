import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { LogoutButton } from "@/components/logout-button";
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
    <div className="min-h-screen bg-slate-50/50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wider">
              U
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Edit Event
              </h1>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Event Organizer Portal
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Edit Event Proposal
            </h2>
            <p className="text-sm text-muted-foreground">
              Update the details of &quot;{event.title}&quot;. Resubmitting will
              place the event back into Pending review.
            </p>
          </div>
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
        </div>
      </main>
    </div>
  );
}
