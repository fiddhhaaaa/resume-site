import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildTeamEmail } from "@/lib/email/order-emails";
import { sendEmail } from "@/lib/email/send";

const MAX_BYTES = 4 * 1024 * 1024;
const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const text = (v: FormDataEntryValue | null, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = text(form.get("token"), 64);
  const file = form.get("file");
  const jobTitle = text(form.get("jobTitle"), 120);
  const level = form.get("level");
  const market = form.get("market");
  const jobAd = text(form.get("jobAd"), 8000);
  const notes = text(form.get("notes"), 1500);

  if (!TOKEN_RE.test(token)) return fail("This link isn't valid.", 400);
  if (!(file instanceof File)) return fail("Please choose your resume file.", 400);
  if (file.size > MAX_BYTES) return fail("That file is too large (4 MB max).", 413);
  if (!jobTitle) return fail("Please tell us the job you are applying for.", 400);
  if (level !== "fresher" && level !== "experienced") return fail("Choose your career level.", 400);
  if (market !== "IN" && market !== "AE") return fail("Choose a country.", 400);

  // Check the real file type from its first bytes
  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = buffer.subarray(0, 4).toString() === "%PDF";
  const isZip = buffer.subarray(0, 2).toString() === "PK";
  const nameOk = /\.(pdf|docx)$/i.test(file.name);
  if (!nameOk || (!isPdf && !isZip)) {
    return fail("Please upload a PDF or Word (.docx) file.", 400);
  }
  const type = isPdf
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const fileName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100);

  const sql = db();
  try {
    // Only works once, and only for paid orders
    const rows = await sql<{ id: string; email: string; name: string }[]>`
      update orders
      set details = ${sql.json({ jobTitle, level, market, jobAd, notes })},
          resume_name = ${fileName},
          resume_type = ${type},
          resume_data = ${buffer},
          status = 'submitted',
          submitted_at = now()
      where token = ${token} and status = 'paid'
      returning id, email, name`;

    const order = rows[0];
    if (!order) {
      return fail("This order isn't ready for details, or they were already sent.", 409);
    }

    // Tell your team (best effort)
    try {
      const to = process.env.ADMIN_EMAIL;
      const base = process.env.SITE_URL;
      if (to && base) {
        const mail = buildTeamEmail({
          name: order.name,
          email: order.email,
          jobTitle,
          market: market === "IN" ? "India" : "UAE",
          level: level === "fresher" ? "Fresher" : "Experienced",
          adminUrl: `${base}/admin/orders/${order.id}`,
        });
        await sendEmail({ to, ...mail });
      }
    } catch (e) {
      console.error("team email error:", e instanceof Error ? e.message : "unknown");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("details error:", e instanceof Error ? e.message : "unknown");
    return fail("We couldn't save your details. Please try again.", 500);
  }
}