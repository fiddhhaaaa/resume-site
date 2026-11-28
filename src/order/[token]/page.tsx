import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import IntakeForm from "@/components/IntakeForm";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { RETENTION } from "@/config/retention";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Row = {
  status: string;
  name: string;
  delivery_token: string | null;
  delivery_note: string | null;
  has_file: boolean;
};

async function OrderStatus({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();

  const sql = db();

  const rows = await sql<Row[]>`
    select status, name, delivery_token, delivery_note,
           (delivery_data is not null) as has_file
    from orders where token = ${token} limit 1`;

  const order = rows[0];

  if (!order) notFound();

  const first = order.name.split(" ")[0];

  if (order.status === "pending") {
    return (
      <>
        <AutoRefresh />
        <h1 className="text-3xl font-bold">
          Confirming your payment…
        </h1>
        <p className="mt-3 text-gray-600">
          This usually takes a few seconds. This page updates by itself.
        </p>
      </>
    );
  }

  if (order.status === "paid") {
    return (
      <>
        <h1 className="text-3xl font-bold">
          Thank you, {first}
        </h1>
        <p className="mt-3 text-gray-600">
          Your payment is confirmed. Send us your resume and the job you want,
          and we&apos;ll get started.
        </p>
        <IntakeForm token={token} />
      </>
    );
  }

  if (order.status === "delivered" && order.delivery_token) {
    // Show a message if the delivered file has expired
    if (!order.has_file) {
      return (
        <>
          <h1 className="text-3xl font-bold">
            Your resume was delivered, {first}
          </h1>
          <p className="mt-3 text-gray-600">
            For your privacy, files are deleted{" "}
            {RETENTION.filesAfterDeliveryDays} days after delivery,
            so this download has expired. Need another copy? Write
            to {site.supportEmail}.
          </p>
        </>
      );
    }

    return (
      <>
        <h1 className="text-3xl font-bold">
          Your resume is ready, {first}
        </h1>
        <p className="mt-3 text-gray-600">
          Download your finished resume below.
        </p>
        <a
          href={`/api/download/${order.delivery_token}`}
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
        >
          Download my resume
        </a>
      </>
    );
  }

  // submitted or in_progress
  return (
    <>
      <h1 className="text-3xl font-bold">
        We have your details, {first}
      </h1>
      <p className="mt-3 text-gray-600">
        A writer is working on your resume. We&apos;ll email you when it&apos;s ready.
        [Client to add the delivery time here.]
      </p>
      <p className="mt-6 text-sm text-gray-500">
        Questions? Write to {site.supportEmail}.
      </p>
    </>
  );
}

export default function OrderTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <a href="/" className="text-sm text-indigo-600">
        ← {site.name}
      </a>
      <div className="mt-6">
        <Suspense
          fallback={<p className="text-gray-500">Loading your order…</p>}
        >
          <OrderStatus params={params} />
        </Suspense>
      </div>
    </main>
  );
}