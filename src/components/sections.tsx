import { site } from "@/config/site";

export function HowItWorks() {
  const steps = [
    { n: "1", title: "Upload", text: "Add your resume as a PDF or Word file." },
    { n: "2", title: "See", text: "Get a score and see what software reads." },
    { n: "3", title: "Fix", text: "Fix it yourself, or let a writer do it." },
  ];
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-3xl font-bold">How it works</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl border border-gray-200 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
              {s.n}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-gray-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Comparison() {
  return (
    <section className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">
          Designed for people, or readable by software?
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Software reads text, not design. Example for illustration.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-white p-6">
            <p className="font-semibold text-red-600">Fancy layout, vague wording</p>
            <p className="mt-3 text-sm text-gray-600">
              Two columns, icons and skill bars. Text can be read out of order.
              Bullets like &quot;Responsible for sales tasks&quot; say nothing about
              results.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-red-600">
              <li>✗ Read out of order</li>
              <li>✗ Missing job keywords</li>
              <li>✗ No measurable results</li>
            </ul>
          </div>
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <p className="font-semibold text-green-700">Clean layout, clear results</p>
            <p className="mt-3 text-sm text-gray-600">
              One column, standard headings, the job&apos;s keywords, and bullets
              like &quot;Grew regional sales by 22% in 12 months&quot;.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-green-700">
              <li>✓ One clean column</li>
              <li>✓ The job&apos;s keywords</li>
              <li>✓ Measurable results</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "What is an ATS?",
    a: "An applicant tracking system is software many employers use to collect, search and rank resumes before a person reads them.",
  },
  {
    q: "Is the check really free?",
    a: "Yes. Upload your resume to see your score and biggest problems. No card or account is needed.",
  },
  {
    q: "Which file types can I upload?",
    a: "PDF and Word (.docx) files up to 4 MB. Scanned or image-only PDFs can't be read by software, so export a text PDF where you can.",
  },
  {
    q: "Is my resume kept private?",
    a: "We never sell your resume. [Client to add their exact storage and deletion policy here.]",
  },
  {
    q: "How long does a rewrite take?",
    a: "[Client to confirm the delivery time.]",
  },
  {
    q: "Does this work for jobs in India and the UAE?",
    a: "Yes. You tell us whether you're applying in India or the UAE, and whether you're a fresher or experienced. The checks change to match, for example phone format, the details we recommend, and which sections matter most.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="text-center text-3xl font-bold">Questions</h2>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-2 text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
      <p>
        {site.name} ·{" "}
        <a href={`mailto:${site.supportEmail}`} className="underline">
          {site.supportEmail}
        </a>
      </p>
      <p className="mt-3 space-x-4">
        <a href="/privacy" className="underline">Privacy</a>
        <a href="/terms" className="underline">Terms</a>
        <a href="/refund-policy" className="underline">Refund policy</a>
        <a href="/contact" className="underline">Contact</a>
      </p>
    </footer>
  );
}