import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import * as path from "path";
import { Pool } from "pg";
import * as XLSX from "xlsx";
import { PrismaClient, UserRole } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("123123123", 5);

  console.log("🚀 Seed started...");

  await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      login: "admin",
      password: passwordHash,
      role: UserRole.admin,
    },
  });

  await prisma.user.upsert({
    where: { login: "moderator" },
    update: {},
    create: {
      login: "moderator",
      password: passwordHash,
      role: UserRole.moderator,
    },
  });

  const filePath = path.resolve(process.cwd(), "prisma", "students.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const excelData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Total rows in Excel: ${excelData.length}`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const row of excelData as any[]) {
    const fullName = row["To‘liq ismi"];
    const passport = row["Pasport raqami"];
    const faculty = row["Fakultet"];

    if (!passport || !fullName) continue;

    const existingStudent = await prisma.students.findFirst({
      where: { passport: String(passport).trim() },
    });

    if (existingStudent) {
      await prisma.students.update({
        where: { id: existingStudent.id },
        data: {
          fullName: String(fullName).trim(),
          faculty: String(faculty).trim(),
        },
      });
      updatedCount++;
    } else {
      await prisma.students.create({
        data: {
          fullName: String(fullName).trim(),
          passport: String(passport).trim(),
          faculty: String(faculty).trim(),
        },
      });
      createdCount++;
    }
  }

  console.log(`🏁 Seed completed!`);
  console.log(`✅ Created: ${createdCount} students`);
  console.log(`🔄 Updated: ${updatedCount} students`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
