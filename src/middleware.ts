import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  ORGANIZER: "/organizer",
  STUDENT: "/student",
};

const ROLE_PATHS = ["/admin", "/organizer", "/student"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const userRole = user?.role as string | undefined;
  const isActive = user?.isActive ?? true;
  const mustChangePassword = user?.mustChangePassword ?? false;
  const targetDashboard = userRole ? ROLE_DASHBOARDS[userRole] : undefined;

  const isLoginPage = nextUrl.pathname === "/login";
  const isChangePasswordPage = nextUrl.pathname === "/account/password";

  if (!isLoggedIn) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  // Deactivated user
  if (!isActive) {
    return NextResponse.redirect(new URL("/login?error=deactivated", nextUrl.origin));
  }

  // Force password change
  if (mustChangePassword) {
    if (!isChangePasswordPage) {
      return NextResponse.redirect(new URL("/account/password", nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isLoginPage || nextUrl.pathname === "/") {
    if (targetDashboard) {
      return NextResponse.redirect(new URL(targetDashboard, nextUrl.origin));
    }
  }

  for (const rolePath of ROLE_PATHS) {
    if (nextUrl.pathname.startsWith(rolePath)) {
      if (targetDashboard && !nextUrl.pathname.startsWith(targetDashboard)) {
        return NextResponse.redirect(new URL(targetDashboard, nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
