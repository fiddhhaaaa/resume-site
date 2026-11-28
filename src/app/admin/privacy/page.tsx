import { Suspense } from "react";
import type { Metadata } from "next";
import PrivacyTool from "@/components/PrivacyTool";
import { assertAdmin } from "@/lib/admin-guard";

export const metadata: Metadata = {
  title: "Privacy tools",
  robots: { index: false, follow: false },
};

async function Guarded() {
  await assertAdmin();
  return <PrivacyTool />;
}

export default function AdminPrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/admin/orders" className="text-sm text-indigo-600">
        ← All orders
      </a>
      <h1 className="mt-3 text-2xl font-bold">Delete a person&apos;s data</h1>
      <p className="mt-2 text-sm text-gray-600">
        Use this when someone asks you to delete their data. It removes their
        email record and saved reports, and erases the name, email, files and
        details on their orders. The payment record (amount, date, payment ID)
        is kept for accounting.
      </p>
      <Suspense fallback={<p className="mt-6 text-gray-500">Loading…</p>}>
        <Guarded />
      </Suspense>
    </main>
  );
}