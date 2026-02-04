import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient, UserRole } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("123123123", 5);

  console.log("Seed started...");

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

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
