import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL not set. Using dummy db for build.");
}

export const db = drizzle(databaseUrl || "postgresql://dummy:dummy@localhost/dummy");
