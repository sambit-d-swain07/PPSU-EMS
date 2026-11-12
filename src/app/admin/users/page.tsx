import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { UsersTable } from "@/components/users/users-table";
import { UserFilters } from "@/components/users/user-filters";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { ImportCsvDialog } from "@/components/users/import-csv-dialog";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";
import { Prisma, Role } from "@prisma/client";

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { q, role, page } = await searchParams;

  const where: Prisma.UserWhereInput = {};
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { email: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL" && ["ADMIN", "ORGANIZER", "STUDENT"].includes(role)) {
    where.role = role as Role;
  }

  const pageSize = 12;
  const pageNumber = Math.max(1, parseInt(page || "1", 10));
  const skip = (pageNumber - 1) * pageSize;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "Administrator"}
        role="ADMIN"
        subtitle="User Administration"
        activeNav="users"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PixelHeading
            title="USER DIRECTORY"
            caption="manage student, organizer & administrator accounts"
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <ImportCsvDialog />
            <CreateUserDialog />
          </div>
        </div>

        <UserFilters />

        <UsersTable
          data={users}
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={pageNumber}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}

