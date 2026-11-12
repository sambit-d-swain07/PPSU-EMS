import { LogoutButton } from "@/components/logout-button";
import { Sticker } from "@/components/ui-theme/sticker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Users, KeyRound, CalendarPlus, Calendar } from "lucide-react";

interface AppNavbarProps {
  userName: string;
  role: "ADMIN" | "ORGANIZER" | "STUDENT" | string;
  subtitle?: string;
  activeNav?: "dashboard" | "users" | "analytics" | "events" | "new" | string;
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
    <header className="sticky top-0 z-40 bg-white border-b-2 border-ink shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Brand & Nav */}
        <div className="flex items-center gap-8">
          <Link
            href={homeHref}
            className="flex items-center gap-3 group select-none hover:opacity-90 transition-opacity"
          >
            <div className="h-9 w-9 rounded-[3px] border-2 border-ink bg-[#111111] text-white flex items-center justify-center font-pixel text-base font-bold shadow-hard-sm">
              U
            </div>
            <div>
              <span className="font-pixel text-base sm:text-lg font-bold block leading-tight tracking-tight text-ink">
                PPSU.EVENTS
              </span>
              <span className="font-hand text-xs sm:text-sm text-muted-ink">
                {subtitle || (role === "ORGANIZER" ? "organizer desk" : role === "ADMIN" ? "admin console" : "campus portal")}
              </span>
            </div>
          </Link>

          {role === "ADMIN" && (
            <nav className="hidden sm:flex items-center space-x-2">
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border-2 border-ink font-mono-label text-xs transition-all ${
                  activeNav === "dashboard" || activeNav === "analytics"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border-2 border-ink font-mono-label text-xs transition-all ${
                  activeNav === "users"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Users</span>
              </Link>
            </nav>
          )}

          {role === "ORGANIZER" && (
            <nav className="hidden sm:flex items-center space-x-2">
              <Link
                href="/organizer"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border-2 border-ink font-mono-label text-xs transition-all ${
                  activeNav === "dashboard" || activeNav === "events"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>My Events</span>
              </Link>
              <Link
                href="/organizer/events/new"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border-2 border-ink font-mono-label text-xs transition-all ${
                  activeNav === "new"
                    ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                    : "bg-white text-ink hover:bg-paper"
                }`}
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#E8573A]" />
                <span>Propose Event</span>
              </Link>
            </nav>
          )}
        </div>

        {children && <div className="hidden md:flex items-center gap-3">{children}</div>}

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="font-hand text-lg text-ink font-bold">
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
            className="h-8.5 px-3 text-xs font-mono-label border-ink shadow-hard-sm"
          >
            <Link href="/account/password" title="Change Password">
              <KeyRound className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">PASS</span>
            </Link>
          </Button>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
