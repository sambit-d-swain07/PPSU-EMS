import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    redirect("/login");
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
                Create Event
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
              New Event Proposal
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill out the event details. You can save as draft or submit
              directly for administrative review.
            </p>
          </div>
          <EventForm venues={venues} />
        </div>
      </main>
    </div>
  );
}

