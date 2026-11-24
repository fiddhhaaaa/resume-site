import postgres from "postgres";

// Reuse one connection while developing, so hot reloads don't pile up connections
const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

export function db() {
  if (!g.__sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    g.__sql = postgres(url, {
      ssl: "require",
      prepare: false, // needed for connection poolers
      max: 1,
      idle_timeout: 20,
    });
  }
  return g.__sql;
}