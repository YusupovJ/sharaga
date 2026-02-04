import { defineConfig } from "prisma/config";
import { envConfig } from "./src/common/config/env.config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: envConfig.dbUrl,
  },
});
