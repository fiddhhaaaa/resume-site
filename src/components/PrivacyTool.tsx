"use client";

import { useState } from "react";

export default function PrivacyTool() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm(`Permanently delete the data for ${email}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/privacy/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessage(
        `Done. Removed ${data.leads} email record(s) and erased ${data.orders} order(s) (name, email, files and details).`
      );
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-md">
      <label htmlFor="privacyEmail" className="text-sm font-medium">
        Email address of the person
      </label>
      <input
        id="privacyEmail"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Delete this person's data"}
      </button>
    </form>
  );
}