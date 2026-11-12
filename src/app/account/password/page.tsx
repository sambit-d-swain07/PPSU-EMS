import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const roleDashboard =
    role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/student/events";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AppNavbar
        userName={session.user.name || "User"}
        role={session.user.role}
        subtitle="Account Settings"
      />

      <main className="max-w-md mx-auto px-4 py-12">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">Change Password</CardTitle>
            <CardDescription className="text-xs">
              Update your account password to secure your portal access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm
              mustChangePassword={session.user.mustChangePassword}
              roleDashboard={roleDashboard}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

