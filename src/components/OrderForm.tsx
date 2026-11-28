"use client";

import { useState } from "react";
import type { CountryCode } from "@/config/prices";
import Turnstile from "./Turnstile";

export default function OrderForm({
  country,
  priceText,
}: {
  country: CountryCode;
  priceText: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cloudflare Turnstile
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const needsCheck = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          country,
          agreed,
          turnstileToken: token,
        }),
      });

      // The token is used up now, so ask for a new one
      setToken(null);
      setResetKey((k) => k + 1);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      window.location.href = data.url; // to the payment page

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 text-left">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="font-semibold">Professional resume rewrite</p>
        <p className="mt-1 text-3xl font-bold">{priceText}</p>
        <p className="mt-1 text-sm text-gray-600">
          One-time payment. After paying, you upload your resume and tell us
          the job you want.
        </p>
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="name"
          required
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Your receipt and your private order link are sent here.
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          I agree to the{" "}
          <a href="/terms" target="_blank" className="underline">
            Terms
          </a>{" "}
          and the{" "}
          <a href="/refund-policy" target="_blank" className="underline">
            Refund Policy
          </a>.
        </span>
      </label>

      {/* Cloudflare Turnstile spam protection */}
      <Turnstile onToken={setToken} resetKey={resetKey} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || (needsCheck && !token)}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Please wait…" : `Pay ${priceText}`}
      </button>
    </form>
  );
}