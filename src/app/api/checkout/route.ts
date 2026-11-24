import { NextResponse } from "next/server";
import { prices } from "@/config/prices";
import { db } from "@/lib/db";
import { createCheckout } from "@/lib/payments";
import { minorAmount } from "@/lib/pricing";
import { randomToken } from "@/lib/tokens";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const country = body?.country === "IN" || body?.country === "AE" ? body.country : null;

  if (!name) return fail("Please enter your name.", 400);
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return fail("Please enter a valid email address.", 400);
  }
  if (!country) return fail("Please choose a country.", 400);
  if (body?.agreed !== true) return fail("Please accept the Terms and Refund Policy.", 400);

  const sql = db();
  try {
    // Limit unpaid orders per email
    const recent = await sql<{ n: number }[]>`
      select count(*)::int as n from orders
      where email = ${email} and status = 'pending' and created_at > now() - interval '1 hour'`;
    if (recent[0].n >= 5) {
      return fail("Too many attempts. Please try again later.", 429);
    }

    // The price comes from our config, never from the browser
    const currency = prices[country].currency;
    const amount = minorAmount(country);
    const token = randomToken();

    const rows = await sql<{ id: string }[]>`
      insert into orders (token, email, name, country, currency, amount, provider, terms_accepted_at)
      values (${token}, ${email}, ${name}, ${country}, ${currency}, ${amount},
              ${process.env.PAYMENT_PROVIDER ?? "dev"}, now())
      returning id`;

    const checkout = await createCheckout({
      id: rows[0].id,
      token,
      email,
      currency,
      amount,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    console.error("checkout error:", e instanceof Error ? e.message : "unknown");
    return fail("Payments aren't available right now. Please try again later.", 503);
  }
}