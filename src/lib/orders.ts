import { db } from "@/lib/db";
import { buildOrderConfirmationEmail } from "@/lib/email/order-emails";
import { sendEmail } from "@/lib/email/send";
import { formatMoney } from "@/lib/pricing";

type PaidOrder = {
  id: string;
  token: string;
  email: string;
  name: string;
  currency: string;
  amount: number;
};

// Safe to call more than once for the same order. Payment providers
// sometimes send the same event twice, and only the first call does anything.
export async function markOrderPaid({
  orderId,
  providerRef,
}: {
  orderId: string;
  providerRef: string;
}): Promise<boolean> {
  const sql = db();
  const rows = await sql<PaidOrder[]>`
    update orders
    set status = 'paid', paid_at = now(), provider_ref = ${providerRef}
    where id = ${orderId} and status = 'pending'
    returning id, token, email, name, currency, amount`;

  const order = rows[0];
  if (!order) return false;

  // A failed email never undoes a payment
  try {
    const base = process.env.SITE_URL;
    if (!base) throw new Error("SITE_URL is not set");
    const mail = buildOrderConfirmationEmail({
      name: order.name,
      amountText: formatMoney(order.currency, order.amount),
      orderUrl: `${base}/order/${order.token}`,
    });
    await sendEmail({ to: order.email, ...mail });
  } catch (e) {
    console.error("order email error:", e instanceof Error ? e.message : "unknown");
  }
  return true;
}