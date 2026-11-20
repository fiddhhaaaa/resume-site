"use client";

import { useRouter } from "next/navigation";
import type { CountryCode } from "@/config/prices";

export default function CountrySelector({ current }: { current: CountryCode }) {
  const router = useRouter();

  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `country=${e.target.value}; path=/; max-age=31536000`;
    router.refresh(); // reload server parts so the price updates
  }

  return (
    <select
      value={current}
      onChange={change}
      aria-label="Choose your country"
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
    >
      <option value="IN">India (₹)</option>
      <option value="AE">UAE (AED)</option>
    </select>
  );
}