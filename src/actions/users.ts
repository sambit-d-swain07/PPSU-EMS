"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createUserSchema,
  type CreateUserInput,
  editUserSchema,
  type EditUserInput,
  resetUserPasswordSchema,
  type ResetUserPasswordInput,
  csvUserRowSchema,
  type CsvUserRow,
} from "@/lib/schemas";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Administrator access required.");
  }
  return session;
}

export async function createUserAction(input: CreateUserInput) {
  try {
    await requireAdmin();
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid user data." };
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: `A user with email "${email}" already exists.` };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        role: parsed.data.role,
        department: parsed.data.department?.trim() || null,
        passwordHash,
        isActive: true,
        mustChangePassword: true,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: error instanceof Error ? error.message : "Failed to create user." };
  }
}

export async function editUserAction(userId: string, input: EditUserInput) {
  try {
    const session = await requireAdmin();
    const parsed = editUserSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid user data." };
    }

    if (userId === session.user.id && parsed.data.role !== "ADMIN") {
      return { error: "You cannot change your own admin role." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name.trim(),
        role: parsed.data.role,
        department: parsed.data.department?.trim() || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Edit user error:", error);
    return { error: error instanceof Error ? error.message : "Failed to edit user." };
  }
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  try {
    const session = await requireAdmin();
    if (userId === session.user.id && !isActive) {
      return { error: "You cannot deactivate your own admin account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle user active error:", error);
    return { error: error instanceof Error ? error.message : "Failed to update user status." };
  }
}

export async function resetUserPasswordAction(
  userId: string,
  input: ResetUserPasswordInput
) {
  try {
    await requireAdmin();
    const parsed = resetUserPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid password." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Reset user password error:", error);
    return { error: error instanceof Error ? error.message : "Failed to reset password." };
  }
}

export async function bulkImportUsersAction(rows: CsvUserRow[]) {
  try {
    await requireAdmin();
    const parsed = z.array(csvUserRowSchema).safeParse(rows);
    if (!parsed.success) {
      return { error: "CSV validation failed. Please check row data." };
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Run inside a single database transaction
    await prisma.$transaction(
      async (tx) => {
        for (const row of parsed.data) {
          const email = row.email.trim().toLowerCase();
          if (!email) {
            skipped++;
            continue;
          }

          const existing = await tx.user.findUnique({ where: { email } });
          const passwordHash = await bcrypt.hash(row.password, 10);

          if (existing) {
            await tx.user.update({
              where: { id: existing.id },
              data: {
                name: row.name.trim(),
                role: row.role,
                department: row.department?.trim() || null,
                passwordHash,
                mustChangePassword: true,
              },
            });
            updated++;
          } else {
            await tx.user.create({
              data: {
                name: row.name.trim(),
                email,
                role: row.role,
                department: row.department?.trim() || null,
                passwordHash,
                isActive: true,
                mustChangePassword: true,
              },
            });
            created++;
          }
        }
      },
      { timeout: 30000 }
    );

    revalidatePath("/admin/users");
    return {
      success: true,
      summary: { created, updated, skipped },
    };
  } catch (error) {
    console.error("Bulk import error:", error);
    return { error: error instanceof Error ? error.message : "Failed to import users." };
  }
}

