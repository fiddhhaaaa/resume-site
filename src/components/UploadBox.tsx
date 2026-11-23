"use client";

import { useEffect, useRef, useState } from "react";
import type { Level, Market } from "@/lib/types";
import type { CheckResult } from "@/lib/scoring/types";
import { ROLES } from "@/data/roles";
import ResultsView from "./ResultsView";

const MAX_BYTES = 4 * 1024 * 1024;
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
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 ${
              value === option.value
                ? "border-indigo-600 bg-indigo-50 font-medium"
                : "border-gray-300 bg-white"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function UploadBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [applyingTo, setApplyingTo] = useState<Market | null>(null);
  const [role, setRole] = useState("");
  const [jobAd, setJobAd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  function reset() {
    setResult(null);
    setFile(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const ready = Boolean(file && level && applyingTo);

  function pick(selectedFile: File | undefined) {
    if (!selectedFile) return;

    const okType = ALLOWED.some((extension) =>
      selectedFile.name.toLowerCase().endsWith(extension)
    );

    if (!okType) {
      setFile(null);
      setError("Please upload a PDF or Word (.docx) file.");
      return;
    }

    if (selectedFile.size > MAX_BYTES) {
      setFile(null);
      setError("That file is too large. The maximum size is 4 MB.");
      return;
    }

    setError("");
    setFile(selectedFile);
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
      body.append("role", role);
      body.append("jobAd", jobAd);

      const res = await fetch("/api/check", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setResult(data.result as CheckResult);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="check" className="mx-auto mt-10 max-w-xl scroll-mt-24">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files[0]);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-white"
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
          onChange={(event) => pick(event.target.files?.[0])}
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
          {
            value: "experienced",
            label: "I have work experience",
          },
        ]}
      />

      <div className="mt-5 text-left">
        <label htmlFor="role" className="text-sm font-medium">
          Which job are you applying for?{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>

        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Not listed, skip</option>
          {ROLES.map((roleOption) => (
            <option key={roleOption.id} value={roleOption.id}>
              {roleOption.title}
            </option>
          ))}
        </select>
      </div>

      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-sm font-medium">
          Paste the job ad for a more accurate keyword check (optional)
        </summary>

        <textarea
          value={jobAd}
          onChange={(event) => setJobAd(event.target.value)}
          maxLength={8000}
          rows={6}
          placeholder="Paste the job description here"
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm"
        />
      </details>

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

      <div ref={resultRef} className="scroll-mt-6">
        {result && <ResultsView result={result} onReset={reset} />}
      </div>
    </div>
  );
}