import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.mustChangePassword !== undefined) {
          token.mustChangePassword = session.user.mustChangePassword;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as Role;
        session.user.isActive = (token.isActive as boolean) ?? true;
        session.user.mustChangePassword = (token.mustChangePassword as boolean) ?? false;
      }
      return session;
    },
  },
  providers: [],
};
