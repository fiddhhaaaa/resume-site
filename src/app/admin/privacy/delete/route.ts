import { NextResponse } from "next/server";
import { guardAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const blocked = guardAdminApi(req);
  if (blocked) return blocked;

  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const sql = db();

  // The email record. Their saved reports go with it.
  const leads = await sql`delete from leads where email = ${email}`;

  // Orders: erase name, email, files and details. Keep amount, dates and payment ID.
  const orders = await sql`
    update orders set
      name = 'Deleted',
      email = 'deleted-' || id::text || '@deleted.invalid',
      details = null,
      resume_name = null, resume_type = null, resume_data = null,
      delivery_name = null, delivery_type = null, delivery_data = null,
      delivery_note = null, delivery_token = null
    where email = ${email}`;

  return NextResponse.json({ ok: true, leads: leads.count, orders: orders.count });
}