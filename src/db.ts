import { drizzle } from "drizzle-orm/d1";
import { Env } from "./types/env.js";
import * as schema from "./db-schema.js";

export const getDb = (db: Env['DB']) => drizzle(db, { schema });
