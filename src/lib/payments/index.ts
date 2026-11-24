import { markOrderPaid } from "@/lib/orders";

export type PaymentOrder = {
  id: string;
  token: string;
  email: string;
  currency: string;
  amount: number; // smallest unit
};

export async function createCheckout(order: PaymentOrder): Promise<{ url: string }> {
  const provider = process.env.PAYMENT_PROVIDER ?? "dev";
  const base = process.env.SITE_URL;
  if (!base) throw new Error("SITE_URL is not set");

  if (provider === "dev") return devCheckout(order, base);

  // Stripe or Razorpay get added here in the next step
  throw new Error(`Payment provider "${provider}" is not set up yet`);
}

// Test payment: marks the order as paid straight away. It only runs on your
// own computer, never on Vercel.
async function devCheckout(order: PaymentOrder, base: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The test payment is disabled in production");
  }
  await markOrderPaid({ orderId: order.id, providerRef: `dev-${order.id}` });
  return { url: `${base}/order/${order.token}` };
}