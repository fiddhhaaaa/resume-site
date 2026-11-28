import { createHash } from "node:crypto";
import { db } from "@/lib/db";

// A scrambled code instead of the real address, so we never store IPs
function visitorKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(`${process.env.RATE_SALT ?? ""}|${ip}`)
    .digest("hex")
    .slice(0, 32);
}

// true: go ahead. false: this visitor has used up their allowance.
export async function allow(
  req: Request,
  kind: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const sql = db();
    const key = visitorKey(req);
    const rows = await sql<{ n: number }[]>`
      with added as (
        insert into rate_events (kind, key) values (${kind}, ${key})
      )
      select count(*)::int as n from rate_events
      where kind = ${kind} and key = ${key}
        and at > now() - ${windowSeconds} * interval '1 second'`;
    return rows[0].n < max;
  } catch (e) {
    // If the limiter itself breaks, do not block real customers
    console.error("rate limit error:", e instanceof Error ? e.message : "unknown");
    return true;
  }
}