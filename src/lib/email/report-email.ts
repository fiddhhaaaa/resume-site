import { site } from "@/config/site";
import type { CheckResult } from "@/lib/scoring/types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LABEL = { good: "Strong", fair: "Needs work", poor: "Needs a lot of work" } as const;
const COLOR = { good: "#16a34a", fair: "#d97706", poor: "#dc2626" } as const;

export function buildReportEmail({
  result,
  reportUrl,
  siteUrl,
}: {
  result: CheckResult;
  reportUrl: string;
  siteUrl: string;
}) {
  const top = result.topIssues.slice(0, 3);
  const subject = `Your resume score: ${result.total}/100`;

  const text = [
    `Your ATS readiness score: ${result.total}/100 (${LABEL[result.band]})`,
    ...(result.caps.length > 0
      ? ["", "Your score is held down by:", ...result.caps.map((c) => `- ${c.reason}`)]
      : []),
    "",
    "Fix these first:",
    ...top.map((i, n) => `${n + 1}. ${i.message}`),
    "",
    `Your full report: ${reportUrl}`,
    "",
    `Want a professional to rewrite it? ${siteUrl}/#pricing`,
  ].join("\n");

  const capsHtml =
    result.caps.length > 0
      ? `<div style="margin:16px 0;padding:12px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:14px;color:#78350f">
           <strong>Your score is held at ${result.total} until you fix:</strong>
           <ul style="margin:8px 0 0;padding-left:20px">${result.caps
             .map((c) => `<li>${esc(c.reason)}</li>`)
             .join("")}</ul>
         </div>`
      : "";

  const issuesHtml = top
    .map(
      (i, n) =>
        `<li style="margin-bottom:10px"><strong>${n + 1}. ${esc(i.module)}:</strong> ${esc(i.message)}</li>`
    )
    .join("");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <p style="margin:0;font-size:14px;color:#6b7280">${esc(site.name)}</p>
      <h1 style="margin:8px 0 0;font-size:22px">Your resume report is ready</h1>

      <div style="margin:24px 0;text-align:center">
        <div style="font-size:56px;font-weight:bold;color:${COLOR[result.band]};line-height:1">${result.total}</div>
        <div style="font-size:14px;color:#6b7280">out of 100 · ${LABEL[result.band]}</div>
      </div>

      ${capsHtml}

      <h2 style="font-size:16px;margin:24px 0 8px">Fix these first</h2>
      <ul style="padding-left:0;list-style:none;font-size:14px;line-height:1.5;margin:0">${issuesHtml}</ul>

      <p style="margin:28px 0;text-align:center">
        <a href="${esc(reportUrl)}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block">View my full report</a>
      </p>

      <p style="font-size:14px;color:#374151">
        Want a professional to fix everything for you?
        <a href="${esc(siteUrl)}/#pricing" style="color:#4f46e5">See our resume rewrite</a>.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:12px;color:#9ca3af;margin:0">
        You are receiving this one-time email because you requested your resume report on ${esc(site.name)}.
        Questions? ${esc(site.supportEmail)}
      </p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}