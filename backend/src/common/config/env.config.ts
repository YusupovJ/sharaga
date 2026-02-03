import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 7777,
};
