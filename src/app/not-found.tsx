import { site } from "@/config/site";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-600">
        We could not find that page. The link may be wrong or may have expired.
      </p>
      <a
        href="/"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
      >
        Back to {site.name}
      </a>
    </main>
  );
}