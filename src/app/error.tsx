"use client";

import { site } from "@/config/site";

export default function ErrorPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-gray-600">
        We could not load this page. Please try again. If it keeps happening,
        write to {site.supportEmail}.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
      >
        Try again
      </button>
      <p className="mt-4 text-sm">
        <a href="/" className="text-indigo-600 underline">
          Back to home
        </a>
      </p>
    </main>
  );
}