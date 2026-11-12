import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface AppNavbarProps {
  userName: string;
  role: "ADMIN" | "ORGANIZER" | "STUDENT" | string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AppNavbar({ userName, role, subtitle, children }: AppNavbarProps) {
  const roleBadgeVariant =
    role === "ADMIN"
      ? "destructive"
      : role === "ORGANIZER"
      ? "warning"
      : "secondary";

  const homeHref =
    role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/student/events";

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xs shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <GraduationCap className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                PPSU Events
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {subtitle || "Campus Portal"}
              </div>
            </div>
          </Link>
        </div>

        {children && <div className="hidden md:flex items-center gap-2">{children}</div>}

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {userName}
            </p>
            <Badge variant={roleBadgeVariant} className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4">
              {role}
            </Badge>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

