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
    <header className="border-b-2 border-ink bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/student/events"
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
                student portal
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-[3px] border-2 border-ink font-mono-label transition-all",
                    item.active
                      ? "bg-[#F6C945] text-ink shadow-hard-sm font-bold"
                      : "bg-white text-ink hover:bg-paper"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-hand text-base text-ink font-bold">
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
