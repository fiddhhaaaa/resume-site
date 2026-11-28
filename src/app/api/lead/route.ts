import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildReportEmail } from "@/lib/email/report-email";
import { sendEmail } from "@/lib/email/send";
import type { CheckResult } from "@/lib/scoring/types";
import type { Level, Market } from "@/lib/types";
import { allow } from "@/lib/rate-limit";
import { RETENTION } from "@/config/retention";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[A-Za-z0-9_-]{20,64}$/;

type ReportRow = {
  id: string;
  token: string;
  result: CheckResult;
  meta: { applyingTo: Market; level: Level };
  send_count: number;
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

  const claimId = typeof body?.claimId === "string" ? body.claimId : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const marketing = body?.marketing === true;

  // Hidden trap field: real people never fill it in, bots usually do
  if (typeof body?.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Rate limiting
  if (!(await allow(req, "lead", 6, 3600))) {
    return fail("Too many requests. Please try again later.", 429);
  }

  // Cloudflare Turnstile spam protection
  if (!(await verifyTurnstile(body?.turnstileToken))) {
    return fail("Please complete the spam check and try again.", 400);
  }

  if (!ID_RE.test(claimId)) {
    return fail(
      "Something went wrong. Please check your resume again.",
      400
    );
  }

  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return fail(
      "Please enter a valid email address.",
      400
    );
  }

  const sql = db();

  try {
    const rows = await sql<ReportRow[]>`
      select id, token, result, meta, send_count
      from reports
      where claim_id = ${claimId} and expires_at > now()
      limit 1`;

    const report = rows[0];

    if (!report) {
      return fail(
        "This check has expired. Please upload your resume again.",
        404
      );
    }

    // Limits against abuse
    if (report.send_count >= 2) {
      return fail(
        "We've already emailed this report. Please check your inbox and spam folder.",
        429
      );
    }

    const recent = await sql<{ n: number }[]>`
      select count(*)::int as n
      from reports r join leads l on l.id = r.lead_id
      where l.email = ${email}
      and r.emailed_at > now() - interval '1 hour'`;

    if (recent[0].n >= 3) {
      return fail(
        "Too many requests for this email address. Please try again later.",
        429
      );
    }

    const lead = await sql<{ id: string }[]>`
      insert into leads (email, country, level, consent_marketing)
      values (
        ${email},
        ${report.meta.applyingTo},
        ${report.meta.level},
        ${marketing}
      )
      on conflict (email) do update set
        country = excluded.country,
        level = excluded.level,
        consent_marketing = leads.consent_marketing or excluded.consent_marketing
      returning id`;

    await sql`
      update reports
      set lead_id = ${lead[0].id}
      where id = ${report.id}`;

    const base = process.env.SITE_URL;

    if (!base) throw new Error("SITE_URL is not set");

    const mail = buildReportEmail({
      result: report.result,
      reportUrl: `${base}/report/${report.token}`,
      siteUrl: base,
    });

    await sendEmail({ to: email, ...mail });

    await sql`
      update reports
      set send_count = send_count + 1,
          emailed_at = now(),
          expires_at = now() + ${RETENTION.emailedReportDays} * interval '1 day'
      where id = ${report.id}`;

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error(
      "lead error:",
      e instanceof Error ? e.message : "unknown"
    );

    return fail(
      "We couldn't send the email. Please try again in a moment.",
      502
    );
  }
}