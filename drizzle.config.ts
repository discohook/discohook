import process from "node:process";
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: "./packages/bot/.dev.vars" });

if (!process.env.DATABASE_URL) {
  throw Error("Must provide DATABASE_URL");
}

export default {
  schema: [
    "./packages/store/src/schema/schema.ts",
    "./packages/store/src/schema/schema-v1.ts",
  ],
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;
