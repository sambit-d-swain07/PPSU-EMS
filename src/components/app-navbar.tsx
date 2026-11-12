import { LogoutButton } from "@/components/logout-button";
import { Sticker } from "@/components/ui-theme/sticker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Users, KeyRound } from "lucide-react";

interface AppNavbarProps {
  userName: string;
  role: "ADMIN" | "ORGANIZER" | "STUDENT" | string;
  subtitle?: string;
  activeNav?: "dashboard" | "users" | "analytics" | string;
  children?: React.ReactNode;
}

export function AppNavbar({
  userName,
  role,
  subtitle,
  activeNav = "dashboard",
  children,
}: AppNavbarProps) {
  const homeHref =
    role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/student/events";

  const roleStickerColor =
    role === "ADMIN" ? "pink" : role === "ORGANIZER" ? "yellow" : "mint";

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className="flex items-center gap-2 group select-none"
          >
            <div className="h-8 w-8 rounded-[3px] border-2 border-ink bg-[#111111] text-white flex items-center justify-center font-pixel text-sm font-bold shadow-hard-sm">
              U
            </div>
            <div>
              <span className="font-pixel text-sm font-bold block leading-none tracking-tight text-ink">
                PPSU.EVENTS
              </span>
              <span className="font-hand text-xs text-muted-ink">
                {subtitle || "campus portal"}
              </span>
            </div>
          </Link>

          {role === "ADMIN" && (
            <nav className="flex items-center space-x-1.5">
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[3px] border-2 border-ink font-mono-label transition-all ${
                  activeNav === "dashboard"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <LayoutDashboard className="h-3 w-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[3px] border-2 border-ink font-mono-label transition-all ${
                  activeNav === "users"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <Users className="h-3 w-3" />
                <span>Users</span>
              </Link>
            </nav>
          )}
        </div>

        {children && <div className="hidden md:flex items-center gap-2">{children}</div>}

        {/* User Info & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-hand text-base text-ink font-bold">
              {userName}
            </span>
            <Sticker color={roleStickerColor} rotate={-1}>
              {role}
            </Sticker>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-2.5 text-[11px] font-mono-label"
          >
            <Link href="/account/password" title="Change Password">
              <KeyRound className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">PASS</span>
            </Link>
          </Button>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
