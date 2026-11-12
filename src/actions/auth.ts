"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import {
  loginSchema,
  type LoginInput,
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/schemas";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes
});

export type LoginResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(values: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please provide valid credentials." };
  }

  const emailKey = parsed.data.email.trim().toLowerCase();

  try {
    const limitRes = await loginRateLimiter.get(emailKey);
    if (limitRes && limitRes.remainingPoints <= 0) {
      const minutes = Math.ceil(limitRes.msBeforeNext / 60000) || 15;
      return {
        error: `Too many failed login attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`,
      };
    }
  } catch {
    // fallback
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    try {
      await loginRateLimiter.delete(emailKey);
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    try {
      await loginRateLimiter.consume(emailKey, 1);
    } catch (rateErr: unknown) {
      const ms = (rateErr as { msBeforeNext?: number })?.msBeforeNext || 15 * 60 * 1000;
      const minutes = Math.ceil(ms / 60000) || 15;
      return {
        error: `Too many failed login attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`,
      };
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Authentication failed. Please verify your details." };
      }
    }
    return { error: "An unexpected error occurred during sign in." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(values: ChangePasswordInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to change your password." };
  }

  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.isActive) {
    return { error: "User not found or account deactivated." };
  }

  const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!match) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  return { success: true };
}


