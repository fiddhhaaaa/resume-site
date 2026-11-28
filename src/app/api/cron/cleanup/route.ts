import { NextResponse } from "next/server";
import { RETENTION } from "@/config/retention";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  // Only Vercel's scheduler knows this secret
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sql = db();

  // Reports past their expiry date
  const reports = await sql`delete from reports where expires_at < now()`;

  // Anonymous abuse-limit records
  const events = await sql`delete from rate_events where at < now() - interval '2 days'`;

  // Orders nobody paid for
  const unpaid = await sql`
    delete from orders
    where status = 'pending'
      and created_at < now() - ${RETENTION.unpaidOrderDays} * interval '1 day'`;

  // Resume and delivered files, a set time after delivery. The order record stays.
  const files = await sql`
    update orders set resume_data = null, delivery_data = null
    where status = 'delivered'
      and delivered_at < now() - ${RETENTION.filesAfterDeliveryDays} * interval '1 day'
      and (resume_data is not null or delivery_data is not null)`;

  return NextResponse.json({
    reports: reports.count,
    rateEvents: events.count,
    unpaidOrders: unpaid.count,
    files: files.count,
  });
}