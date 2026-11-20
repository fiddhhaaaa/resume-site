import UploadBox from "./UploadBox";

export default function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-sm font-medium text-indigo-600">
        Free · 30 seconds · No account
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Can hiring software actually read your resume?
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Upload your resume to see what an applicant tracking system (ATS)
        reads, get a score out of 100, and find out what to fix first.
      </p>
      <UploadBox />
    </section>
  );
}