import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import OrderForm from "@/components/OrderForm";
import { formatPrice, resolveCountry } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Order your resume rewrite",
  robots: { index: false, follow: false },
};

async function Summary() {
  const store = await cookies();
  const country = resolveCountry(store.get("country")?.value);
  return <OrderForm country={country} priceText={formatPrice(country)} />;
}

export default function OrderPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-3xl font-bold">Order your resume rewrite</h1>
        <Suspense fallback={<p className="mt-8 text-gray-500">Loading…</p>}>
          <Summary />
        </Suspense>
      </main>
    </>
  );
}