import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Folder } from "@/components/ui-theme/folder";
import { PixelHeading } from "@/components/ui-theme/pixel-heading";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const roleDashboard =
    role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/student/events";

  return (
    <div className="min-h-screen">
      <AppNavbar
        userName={session.user.name || "User"}
        role={session.user.role}
        subtitle="Account Settings"
      />

      <main className="max-w-md mx-auto px-4 py-12 space-y-6">
        <PixelHeading
          title="SECURITY SETTINGS"
          caption="update account credentials & secure access"
        />

        <Folder
          tabTitle="CREDENTIALS"
          tabPosition="left"
          color="paper"
          className="p-6"
        >
          <ChangePasswordForm
            mustChangePassword={session.user.mustChangePassword}
            roleDashboard={roleDashboard}
          />
        </Folder>
      </main>
    </div>
  );
}

