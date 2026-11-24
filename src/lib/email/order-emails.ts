import { site } from "@/config/site";
import { esc } from "./html";

function wrap(body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;font-size:14px;line-height:1.6">
      <p style="margin:0;color:#6b7280">${esc(site.name)}</p>
      ${body}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:12px;color:#9ca3af;margin:0">Questions? ${esc(site.supportEmail)}</p>
    </div>
  </body>
</html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0;text-align:center"><a href="${esc(href)}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block">${esc(label)}</a></p>`;

// To the customer, right after payment
export function buildOrderConfirmationEmail({
  name,
  amountText,
  orderUrl,
}: {
  name: string;
  amountText: string;
  orderUrl: string;
}) {
  const first = name.split(" ")[0];
  const subject = "Payment received: send us your resume details";
  const text = [
    `Hi ${first},`,
    "",
    `Thank you. We received your payment of ${amountText}.`,
    "Next step: upload your current resume and tell us the job you want.",
    "",
    `Your order page: ${orderUrl}`,
    "",
    "Keep this link. You can use it to see your order status and, later, to download your finished resume.",
  ].join("\n");

  const html = wrap(`
      <h1 style="margin:8px 0 16px;font-size:22px">Thank you, ${esc(first)}</h1>
      <p>We received your payment of <strong>${esc(amountText)}</strong>.</p>
      <p>Next step: upload your current resume and tell us the job you want.</p>
      ${button(orderUrl, "Send my resume details")}
      <p style="color:#6b7280">Keep this email. The same link shows your order status and, later, your finished resume.</p>`);

  return { subject, html, text };
}

// To your team, when the customer has sent their details
export function buildTeamEmail({
  name,
  email,
  jobTitle,
  market,
  level,
  adminUrl,
}: {
  name: string;
  email: string;
  jobTitle: string;
  market: string;
  level: string;
  adminUrl: string;
}) {
  const subject = `New resume order: ${jobTitle} (${market})`;
  const text = [
    "A customer has sent their details.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Target job: ${jobTitle}`,
    `Market: ${market}`,
    `Level: ${level}`,
    "",
    `Open the order: ${adminUrl}`,
  ].join("\n");

  const html = wrap(`
      <h1 style="margin:8px 0 16px;font-size:20px">New resume order</h1>
      <p><strong>${esc(name)}</strong> (${esc(email)})<br/>
      Target job: ${esc(jobTitle)}<br/>
      Market: ${esc(market)} · Level: ${esc(level)}</p>
      ${button(adminUrl, "Open the order")}`);

  return { subject, html, text };
}