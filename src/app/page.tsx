import { cookies } from "next/headers";
import { formatPrice, resolveCountry } from "@/lib/pricing";

export default async function Home() {
  const store = await cookies();
  const country = resolveCountry(store.get("country")?.value);

  return (
    <main className="mx-auto max-w-2xl p-10">
      <h1 className="text-3xl font-bold">Resume rewrite</h1>
      <p className="mt-4 text-xl">Price: {formatPrice(country)}</p>
      <p className="mt-2 text-sm text-gray-500">Country: {country}</p>
    </main>
  );
}