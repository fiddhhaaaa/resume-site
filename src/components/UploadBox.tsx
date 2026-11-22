"use client";

import { useRef, useState } from "react";
import type { Level, Market } from "@/lib/types";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = [".pdf", ".docx"];

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mt-5 text-left">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex gap-3">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 ${
              value === o.value
                ? "border-indigo-600 bg-indigo-50 font-medium"
                : "border-gray-300 bg-white"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function UploadBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [applyingTo, setApplyingTo] = useState<Market | null>(null);
  const [loading, setLoading] = useState(false); // moved inside the component
  const [result, setResult] = useState<unknown>(null); // moved inside the component

  const ready = Boolean(file && level && applyingTo);

  function pick(f: File | undefined) {
    if (!f) return;
    const okType = ALLOWED.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!okType) {
      setFile(null);
      setError("Please upload a PDF or Word (.docx) file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setError("That file is too large. The maximum size is 4 MB.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function handleCheck() {
    if (!file || !level || !applyingTo) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("level", level);
      body.append("applyingTo", applyingTo);

      const res = await fetch("/api/check", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="check" className="mx-auto mt-10 max-w-xl scroll-mt-24">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white"
        }`}
      >
        <p className="font-semibold">
          {file ? file.name : "Drop your resume here"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {file
            ? `${(file.size / 1024).toFixed(0)} KB`
            : "or click to choose a file · PDF or Word · up to 4 MB"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ChoiceGroup<Level>
        legend="Where are you in your career?"
        name="level"
        value={level}
        onChange={setLevel}
        options={[
          { value: "fresher", label: "Fresher (0 to 1 year)" },
          { value: "experienced", label: "I have work experience" },
        ]}
      />

      <ChoiceGroup<Market>
        legend="Which country are you applying for jobs in?"
        name="applyingTo"
        value={applyingTo}
        onChange={setApplyingTo}
        options={[
          { value: "IN", label: "India" },
          { value: "AE", label: "UAE" },
        ]}
      />

      <button
        onClick={handleCheck}
        disabled={!ready || loading}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Checking…" : "Check my resume free"}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        {ready
          ? "Free. No card needed. We never sell your resume."
          : "Add your file and choose both options to continue."}
      </p>

      {/* Temporary debug view, replaced by the real results screen later */}
      {result !== null && (
        <pre className="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-left text-xs text-green-300">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}