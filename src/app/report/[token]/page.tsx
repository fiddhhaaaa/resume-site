import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsView from "@/components/ResultsView";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import type { CheckResult } from "@/lib/scoring/types";

export const metadata: Metadata = {
  title: "Your resume report",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

async function Report({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();

  const sql = db();
  const rows = await sql<{ result: CheckResult }[]>`
    select result from reports
    where token = ${token} and lead_id is not null and expires_at > now()
    limit 1`;
  if (rows.length === 0) notFound();

  return (
    <>
      <ResultsView result={rows[0].result} mode="full" />

      <div className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
        <h2 className="text-xl font-bold">Want a professional to fix it?</h2>
        <p className="mt-1 text-sm text-gray-700">
          A writer rewrites your resume so it reads well for people and for software.
        </p>
        <a
          href="/#pricing"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
        >
          See the resume rewrite
        </a>
        <p className="mt-4 text-sm">
          <a href="/#check" className="text-indigo-600 underline">
            Check another resume
          </a>
        </p>
      </div>
    </>
  );
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/" className="text-sm text-indigo-600">
        ← {site.name}
      </a>
      <Suspense fallback={<p className="mt-10 text-gray-500">Loading your report…</p>}>
        <Report params={params} />
      </Suspense>
    </main>
  );
}