import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

interface UserRow {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
}

async function main() {
  const csvFilePath = path.join(__dirname, "users.csv");
  const fileContent = fs.readFileSync(csvFilePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as UserRow[];

  for (const record of records) {
    const passwordHash = await bcrypt.hash(record.password, 10);
    await prisma.user.upsert({
      where: { email: record.email },
      update: {
        name: record.name,
        passwordHash,
        role: record.role,
        department: record.department || null,
        isActive: true,
      },
      create: {
        name: record.name,
        email: record.email,
        passwordHash,
        role: record.role,
        department: record.department || null,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${records.length} users successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

