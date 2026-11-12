"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Ticket, KeyRound } from "lucide-react";

interface StudentNavProps {
  userName: string;
}

export function StudentNav({ userName }: StudentNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Browse Events",
      href: "/student/events",
      icon: Calendar,
      active: pathname.startsWith("/student/events"),
    },
    {
      label: "My Registrations",
      href: "/student/registrations",
      icon: Ticket,
      active: pathname.startsWith("/student/registrations"),
    },
  ];

  return (
    <header className="border-b bg-white sticky top-0 z-40 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/student/events"
            className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight"
          >
            <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              U
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold block leading-none">
                Campus Events
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Student Portal
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors",
                    item.active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 hidden md:inline">
            Signed in as <strong>{userName}</strong>
          </span>
          <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900">
            <Link href="/account/password" title="Change Password">
              <KeyRound className="h-3.5 w-3.5 mr-1 text-slate-500" />
              <span className="hidden sm:inline">Password</span>
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

