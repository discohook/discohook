import * as schema from "./schema.server.js";
import { drizzle } from "drizzle-orm/d1";

export const getDb = (db: D1Database) => drizzle(db, { schema });
