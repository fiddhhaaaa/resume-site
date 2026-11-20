import { Suspense } from "react";
import { cookies } from "next/headers";
import { formatPrice, resolveCountry } from "@/lib/pricing";

async function PriceText() {
  const store = await cookies();
  return <>{formatPrice(resolveCountry(store.get("country")?.value))}</>;
}

// Placeholder features: client to confirm
const features = [
  "ATS-friendly resume (PDF and Word)",
  "Written by a professional writer",
  "Cover letter",
  "Free changes for 7 days",
];

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Professional resume rewrite</h2>
        <p className="mt-4 text-5xl font-bold">
          <Suspense fallback="…">
            <PriceText />
          </Suspense>
        </p>
        <p className="mt-1 text-sm text-gray-500">one-time payment</p>
        <ul className="mt-6 space-y-2 text-left text-gray-700">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-green-600">✓</span> {f}
            </li>
          ))}
        </ul>
        {/* /order is built in Phase 4, so this link shows a 404 for now */}
        <a
          href="/order"
          className="mt-8 block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
        >
          Get my resume rewritten
        </a>
        <a href="#check" className="mt-3 block text-sm text-indigo-600">
          Or check yours free first
        </a>
      </div>
    </section>
  );
}