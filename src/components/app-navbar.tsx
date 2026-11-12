"use client";

import * as React from "react";
import { LogoutButton } from "@/components/logout-button";
import { Sticker } from "@/components/ui-theme/sticker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  CalendarPlus,
  Calendar,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const homeHref =
    role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/student/events";

  const roleStickerColor =
    role === "ADMIN" ? "pink" : role === "ORGANIZER" ? "yellow" : "mint";

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-ink shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href={homeHref}
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
                {subtitle || (role === "ORGANIZER" ? "organizer desk" : role === "ADMIN" ? "admin console" : "campus portal")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {role === "ADMIN" && (
            <nav className="hidden md:flex items-center space-x-2">
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
            <nav className="hidden md:flex items-center space-x-2">
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

        {children && <div className="hidden lg:flex items-center gap-3">{children}</div>}

        {/* Desktop User Info & Actions */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="font-hand text-base sm:text-lg text-ink font-bold truncate max-w-[160px]">
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
              <span>PASS</span>
            </Link>
          </Button>

          <LogoutButton />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Sticker color={roleStickerColor} className="text-[10px]">
            {role}
          </Sticker>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 border-2 border-ink bg-paper rounded-[3px] flex items-center justify-center text-ink shadow-hard-sm active:translate-y-0.5 cursor-pointer"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Tray */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-paper p-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-hard">
          {/* User profile row on mobile */}
          <div className="flex items-center justify-between pb-3 border-b border-ink/20">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-ink block">
                Signed in as
              </span>
              <span className="font-hand text-lg text-ink font-bold block leading-snug">
                {userName}
              </span>
            </div>
            <Sticker color={roleStickerColor}>
              {role}
            </Sticker>
          </div>

          {/* Role specific mobile navigation links */}
          <nav className="flex flex-col gap-2">
            {role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs ${
                    activeNav === "dashboard" || activeNav === "analytics"
                      ? "bg-[#F6C945] text-ink font-bold shadow-hard-sm"
                      : "bg-white text-ink"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs ${
                    activeNav === "users"
                      ? "bg-[#F6C945] text-ink font-bold shadow-hard-sm"
                      : "bg-white text-ink"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>User Accounts</span>
                </Link>
              </>
            )}

            {role === "ORGANIZER" && (
              <>
                <Link
                  href="/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs ${
                    activeNav === "dashboard" || activeNav === "events"
                      ? "bg-[#F6C945] text-ink font-bold shadow-hard-sm"
                      : "bg-white text-ink"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>My Events & Turnouts</span>
                </Link>
                <Link
                  href="/organizer/events/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs ${
                    activeNav === "new"
                      ? "bg-[#F6C945] text-ink font-bold shadow-hard-sm"
                      : "bg-white text-ink"
                  }`}
                >
                  <CalendarPlus className="h-4 w-4 text-[#E8573A]" />
                  <span>Propose New Event</span>
                </Link>
              </>
            )}

            {role === "STUDENT" && (
              <>
                <Link
                  href="/student/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs bg-white text-ink"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Browse Events Catalog</span>
                </Link>
                <Link
                  href="/student/registrations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-[3px] border-2 border-ink font-mono-label text-xs bg-white text-ink"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>My Passes & History</span>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Bottom Actions */}
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
