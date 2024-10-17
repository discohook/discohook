import process from "node:process";
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: "./packages/bot/.dev.vars" });

if (!process.env.DATABASE_URL) {
  throw Error("Must provide DATABASE_URL in packages/bot/.dev.vars");
}

export default {
  schema: [
    "./packages/store/src/schema/schema.ts",
    "./packages/store/src/schema/schema-v1.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  migrations: { schema: "public" },
} satisfies Config;
