import { Suspense } from "react";
import { cookies } from "next/headers";
import { formatPrice, resolveCountry } from "@/lib/pricing";

async function Price() {
  const store = await cookies();
  const country = resolveCountry(store.get("country")?.value);

  return (
    <>
      <p className="mt-4 text-xl">Price: {formatPrice(country)}</p>
      <p className="mt-2 text-sm text-gray-500">Country: {country}</p>
    </>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-3xl font-bold">Resume rewrite</h1>
      <Suspense fallback={<p className="mt-4 text-xl">Price: …</p>}>
        <Price />
      </Suspense>
    </main>
  );
}