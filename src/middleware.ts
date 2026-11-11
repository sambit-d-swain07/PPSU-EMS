import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  ORGANIZER: "/organizer",
  FACULTY: "/faculty",
  STUDENT: "/student",
};

const ROLE_PATHS = ["/admin", "/organizer", "/faculty", "/student"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;
  const targetDashboard = userRole ? ROLE_DASHBOARDS[userRole] : undefined;

  const isLoginPage = nextUrl.pathname === "/login";

  if (!isLoggedIn) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
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
