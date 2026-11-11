import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  ORGANIZER: "/organizer",
  FACULTY: "/faculty",
  STUDENT: "/student",
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const target = role ? ROLE_DASHBOARDS[role] : "/login";
  redirect(target || "/login");
}
