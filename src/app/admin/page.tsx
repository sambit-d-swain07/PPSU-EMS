import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { PendingApprovalsTable } from "@/components/pending-approvals-table";
import { VenuesManager } from "@/components/venues-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [pendingEvents, venues] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PENDING" },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.venue.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

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
                Welcome, {session.user.name}
              </h1>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                University Administrator Portal
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="approvals" className="text-xs sm:text-sm">
              Pending Approvals ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="venues" className="text-xs sm:text-sm">
              Manage Venues ({venues.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <PendingApprovalsTable data={pendingEvents} />
          </TabsContent>

          <TabsContent value="venues" className="space-y-4">
            <VenuesManager venues={venues} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
