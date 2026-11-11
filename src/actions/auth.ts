"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";

export type LoginResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(values: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please provide valid credentials." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
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

