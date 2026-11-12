"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui-theme/sticker";
import { cn } from "@/lib/utils";
import { Calendar, Ticket, KeyRound, Menu, X } from "lucide-react";

interface StudentNavProps {
  userName: string;
}

export function StudentNav({ userName }: StudentNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Desktop Links */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/student/events"
            className="flex items-center gap-2.5 sm:gap-3 group select-none hover:opacity-90 transition-opacity"
          >
            <div className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-[3px] border-2 border-ink bg-[#111111] text-white flex items-center justify-center font-pixel text-sm sm:text-base font-bold shadow-hard-sm shrink-0">
              U
            </div>
            <div>
              <span className="font-pixel text-sm sm:text-lg font-bold block leading-tight tracking-tight text-ink">
                PPSU.EVENTS
              </span>
              <span className="font-hand text-xs sm:text-sm text-muted-ink block leading-none">
                student portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-2">
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

        {/* Desktop User Info & Actions */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="font-hand text-base sm:text-lg text-ink font-bold truncate max-w-[160px]">
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
              <span>PASS</span>
            </Link>
          </Button>

          <LogoutButton />
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Sticker color="mint" className="text-[10px]">
            STUDENT
          </Sticker>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 border-2 border-ink bg-paper rounded-[3px] flex items-center justify-center text-ink shadow-hard-sm active:translate-y-0.5 cursor-pointer"
            aria-label="Toggle student menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-paper p-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-hard">
          <div className="flex items-center justify-between pb-3 border-b border-ink/20">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-ink block">
                Signed in as student
              </span>
              <span className="font-hand text-lg text-ink font-bold block leading-snug">
                {userName}
              </span>
            </div>
            <Sticker color="mint">
              STUDENT
            </Sticker>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs",
                    item.active
                      ? "bg-[#F6C945] text-ink font-bold shadow-hard-sm"
                      : "bg-white text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-ink/20 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 h-9 text-xs font-mono-label border-ink"
            >
              <Link href="/account/password" onClick={() => setMobileMenuOpen(false)}>
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                Change Password
              </Link>
            </Button>
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
