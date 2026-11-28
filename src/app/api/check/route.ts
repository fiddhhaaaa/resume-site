import { NextResponse } from "next/server";
import type postgres from "postgres";
import { ROLES } from "@/data/roles";
import { db } from "@/lib/db";
import { extractResumeText } from "@/lib/parsers";
import { runScoring } from "@/lib/scoring";
import { randomToken } from "@/lib/tokens";
import { allow } from "@/lib/rate-limit";
import { RETENTION } from "@/config/retention";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  // Rate limiting
  if (!(await allow(req, "check", 20, 3600))) {
    return NextResponse.json(
      { error: "You have checked a lot of resumes. Please try again in an hour." },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const level = form.get("level");
  const applyingTo = form.get("applyingTo");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file uploaded." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large (4 MB max)." },
      { status: 413 }
    );
  }

  if (level !== "fresher" && level !== "experienced") {
    return NextResponse.json(
      { error: "Choose your career level." },
      { status: 400 }
    );
  }

  if (applyingTo !== "IN" && applyingTo !== "AE") {
    return NextResponse.json(
      { error: "Choose a country." },
      { status: 400 }
    );
  }

  const roleId =
    typeof form.get("role") === "string" &&
    ROLES.some((r) => r.id === form.get("role"))
      ? (form.get("role") as string)
      : null;

  const rawAd = form.get("jobAd");
  const jobAd =
    typeof rawAd === "string" ? rawAd.slice(0, 8000) : "";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await extractResumeText(buffer);

    const result = runScoring({
      parsed,
      level,
      applyingTo,
      role: roleId,
      jobAd,
    });

    // Save the result (never the resume or job ad text)
    // so it can be emailed later.
    // If saving fails, the visitor still gets their score.
    let claimId: string | null = null;

    try {
      const sql = db();
      const id = randomToken();

      await sql`
        insert into reports (claim_id, token, result, meta, expires_at)
        values (
          ${id},
          ${randomToken()},
          ${sql.json(result as unknown as postgres.JSONValue)},
          ${sql.json({ applyingTo, level, role: roleId })},
          now() + ${RETENTION.unclaimedReportDays} * interval '1 day'
        )`;

      claimId = id;
    } catch (e) {
      console.error(
        "save error:",
        e instanceof Error ? e.message : "unknown"
      );
    }

    return NextResponse.json({
      kind: parsed.kind,
      pages: parsed.pages,
      hasReadableText: parsed.text.trim().length > 100,
      layout: parsed.layout,
      result,
      claimId,
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't read this file. Try exporting it again as a PDF." },
      { status: 422 }
    );
  }
}