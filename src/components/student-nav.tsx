"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui-theme/sticker";
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
      label: "My Tickets",
      href: "/student/registrations",
      icon: Ticket,
      active: pathname.startsWith("/student/registrations"),
    },
  ];

  return (
    <header className="border-b-2 border-ink bg-white sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link
            href="/student/events"
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
                student portal
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border-2 border-ink font-mono-label text-xs transition-all",
                    item.active
                      ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                      : "bg-white text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="font-hand text-lg text-ink font-bold">
              {userName}
            </span>
            <Sticker color="mint" rotate={1}>
              STUDENT
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
