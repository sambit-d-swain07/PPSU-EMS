import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { PendingApprovalsTable } from "@/components/pending-approvals-table";
import { redirect } from "next/navigation";

export default async function FacultyPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "FACULTY") {
    redirect("/login");
  }

  const pendingEvents = await prisma.event.findMany({
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
                Welcome, {session.user.name}
              </h1>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Faculty Review Portal
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <PendingApprovalsTable data={pendingEvents} />
      </main>
    </div>
  );
}
