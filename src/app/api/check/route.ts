import { NextResponse } from "next/server";
import { extractResumeText } from "@/lib/parsers";
import { runScoring } from "@/lib/scoring";
import { ROLES } from "@/data/roles";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const level = form.get("level");
  const applyingTo = form.get("applyingTo");

  const roleId =
    typeof form.get("role") === "string" && ROLES.some((r) => r.id === form.get("role"))
      ? (form.get("role") as string)
      : null;
  const rawAd = form.get("jobAd");
  const jobAd = typeof rawAd === "string" ? rawAd.slice(0, 8000) : "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (4 MB max)." }, { status: 413 });
  }
  if (level !== "fresher" && level !== "experienced") {
    return NextResponse.json({ error: "Choose your career level." }, { status: 400 });
  }
  if (applyingTo !== "IN" && applyingTo !== "AE") {
    return NextResponse.json({ error: "Choose a country." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await extractResumeText(buffer);

    return NextResponse.json({
      kind: parsed.kind,
      pages: parsed.pages,
      characters: parsed.text.length,
      hasReadableText: parsed.text.trim().length > 100,
      layout: parsed.layout,
      result: runScoring({ parsed, level, applyingTo, role: roleId, jobAd }),
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't read this file. Try exporting it again as a PDF." },
      { status: 422 }
    );
  }
}