import { neon } from "@neondatabase/serverless";
import { ENV } from "../config/env";

let singleton: ReturnType<typeof neon> | null = null;

export function getSqlClient(): ReturnType<typeof neon> {
  if (!ENV.databaseUrl) {
    throw new Error("DATABASE_URL is required for Neon repository");
  }

  if (!singleton) {
    singleton = neon(ENV.databaseUrl);
  }

  return singleton;
}
