import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection(); // always runs when asked, never frozen at build time
  try {
    const sql = db();
    await sql`select 1`;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { ok: false },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}