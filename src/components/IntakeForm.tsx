"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MAX_BYTES = 4 * 1024 * 1024;

export default function IntakeForm({ token }: { token: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function pick(f: File | undefined) {
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) {
      setFile(null);
      setError("Please upload a PDF or Word (.docx) file.");
    } else if (f.size > MAX_BYTES) {
      setFile(null);
      setError("That file is too large. The maximum size is 4 MB.");
    } else {
      setError("");
      setFile(f);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Please choose your resume file.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body = new FormData(e.currentTarget);
      body.set("token", token);
      body.set("file", file);
      const res = await fetch("/api/orders/details", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.refresh(); // shows the "details received" page
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const field = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

  return (
    <form onSubmit={submit} className="mt-6 space-y-5 text-left">
      <div>
        <label htmlFor="file" className="text-sm font-medium">
          Your current resume (PDF or Word, up to 4 MB)
        </label>
        <input
          id="file"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => pick(e.target.files?.[0])}
          className="mt-1 block w-full text-sm"
        />
        {file && <p className="mt-1 text-xs text-gray-500">{file.name}</p>}
      </div>

      <div>
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job you are applying for
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          required
          maxLength={120}
          placeholder="For example: Backend Developer"
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="level" className="text-sm font-medium">
            Career level
          </label>
          <select id="level" name="level" required defaultValue="" className={field}>
            <option value="" disabled>
              Choose
            </option>
            <option value="fresher">Fresher (0 to 1 year)</option>
            <option value="experienced">I have work experience</option>
          </select>
        </div>
        <div>
          <label htmlFor="market" className="text-sm font-medium">
            Applying for jobs in
          </label>
          <select id="market" name="market" required defaultValue="" className={field}>
            <option value="" disabled>
              Choose
            </option>
            <option value="IN">India</option>
            <option value="AE">UAE</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="jobAd" className="text-sm font-medium">
          Job ad or link <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea id="jobAd" name="jobAd" rows={4} maxLength={8000} className={field} />
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium">
          Anything else we should know?{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea id="notes" name="notes" rows={3} maxLength={1500} className={field} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send my details"}
      </button>
    </form>
  );
}