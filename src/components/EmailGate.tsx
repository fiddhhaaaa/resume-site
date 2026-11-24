"use client";

import { useState } from "react";

export default function EmailGate({ claimId }: { claimId: string }) {
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState(""); // hidden trap field for bots
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, email, marketing, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
        <p className="font-semibold">Check your inbox</p>
        <p className="mt-1">
          We sent your full report to {email}. It can take a minute, and it
          may land in your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5"
    >
      <h3 className="font-semibold">Get your full report by email</h3>
      <p className="mt-1 text-sm text-gray-700">
        Every fix, what already works, and tips for your target job, in a
        private link.
      </p>

      <label htmlFor="report-email" className="sr-only">
        Email address
      </label>
      <input
        id="report-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      />

      {/* Trap field: hidden from people, filled in by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
      />

      <label className="mt-3 flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-0.5"
        />
        <span>Also send me occasional resume tips and offers (optional).</span>
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Email me my full report"}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        We use your email to send this report. We never sell your data.
      </p>
    </form>
  );
}