import { Resend } from "resend";

let client: Resend | null = null;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("Email is not configured");

  client ??= new Resend(key);
  const { error } = await client.emails.send({ from, to: [to], subject, html, text });
  if (error) throw new Error(error.message);
}