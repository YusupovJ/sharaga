import dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 7777,
  nodeEnv: process.env.NODE_ENV || "dev",
  dbUrl: process.env.DATABASE_URL || "",
  secretKey: process.env.SECRET_KEY!,
};
