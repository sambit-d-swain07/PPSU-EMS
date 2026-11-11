import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function StudentPage() {
  const session = await auth();

  return (
    <main className="min-h-screen p-8 flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">
        Welcome, {session?.user?.name} ({session?.user?.role})
      </h1>
      <LogoutButton />
    </main>
  );
}

