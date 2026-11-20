"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED = [".pdf", ".docx"];

export default function UploadBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

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

      <button
        disabled={!file}
        className="mt-4 w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Check my resume free
      </button>
      <p className="mt-2 text-xs text-gray-500">
        Free. No card needed. We never sell your resume.
      </p>
    </div>
  );
}