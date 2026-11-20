import { Suspense } from "react";
import { cookies } from "next/headers";
import CountrySelector from "./CountrySelector";
import { resolveCountry } from "@/lib/pricing";
import { site } from "@/config/site";

async function Selector() {
  const store = await cookies();
  return (
    <CountrySelector current={resolveCountry(store.get("country")?.value)} />
  );
}

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-bold">
          {site.name}
        </a>
        <div className="flex items-center gap-4">
          <a href="#pricing" className="hidden text-sm text-gray-600 sm:block">
            Pricing
          </a>
          <Suspense fallback={<div className="h-9 w-32" />}>
            <Selector />
          </Suspense>
        </div>
      </div>
    </header>
  );
}