import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/event-form";
import { AppNavbar } from "@/components/app-navbar";
import { Folder } from "@/components/ui-theme/folder";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
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
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Organizer"}
        role="ORGANIZER"
        subtitle="New Event Proposal"
        activeNav="new"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <PixelHeading
          title="PROPOSE NEW EVENT"
          caption="fill out event details for administrative review"
        />

        <Folder
          tabTitle="PROPOSAL FORM"
          tabPosition="left"
          color="paper"
          contentClassName="p-6 sm:p-10"
        >
          <EventForm venues={venues} />
        </Folder>
      </main>
    </div>
  );
}

