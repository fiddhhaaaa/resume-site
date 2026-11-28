import { site } from "@/config/site";

export default function LegalLayout({
  title,
  showDate = true,
  children,
}: {
  title: string;
  showDate?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <a href="/" className="text-sm text-indigo-600">
        ← {site.name}
      </a>
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      {showDate && (
        <p className="mt-1 text-sm text-gray-500">Last updated: {site.legalUpdated}</p>
      )}
      <div className="mt-8 space-y-4 leading-relaxed text-gray-700 [&_a]:text-indigo-600 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        {children}
      </div>
    </main>
  );
}