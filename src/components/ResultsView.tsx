
import type { CheckResult, ModuleResult } from "@/lib/scoring/types";

const BAND = {
  good: {
    label: "Strong",
    ring: "stroke-green-600",
    chip: "border-green-200 bg-green-50 text-green-700",
  },
  fair: {
    label: "Needs work",
    ring: "stroke-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
  poor: {
    label: "Needs a lot of work",
    ring: "stroke-red-500",
    chip: "border-red-200 bg-red-50 text-red-700",
  },
} as const;

function ScoreRing({
  total,
  band,
}: {
  total: number;
  band: CheckResult["band"];
}) {
  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-36 w-36 shrink-0"
      role="img"
      aria-label={`Score ${total} out of 100`}
    >
      <circle
        cx="60"
        cy="60"
        r={R}
        fill="none"
        strokeWidth="10"
        className="stroke-gray-200"
      />

      <circle
        cx="60"
        cy="60"
        r={R}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(total / 100) * C} ${C}`}
        transform="rotate(-90 60 60)"
        className={BAND[band].ring}
      />

      <text
        x="60"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-900 text-3xl font-bold"
      >
        {total}
      </text>

      <text
        x="60"
        y="80"
        textAnchor="middle"
        className="fill-gray-500 text-[10px]"
      >
        out of 100
      </text>
    </svg>
  );
}

function ModuleCard({ m }: { m: ModuleResult }) {
  const pct = Math.round((m.points / m.max) * 100);

  const barColor =
    pct >= 80
      ? "bg-green-500"
      : pct >= 50
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{m.label}</h3>

        <span className="shrink-0 text-sm text-gray-600">
          {m.points} / {m.max}
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {m.issues.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            To fix
          </p>

          <ul className="mt-2 space-y-2 text-sm">
            {m.issues.map((i) => (
              <li key={i.message} className="flex gap-2">
                <span className="mt-0.5 text-red-500">✗</span>

                <span className="text-gray-700">
                  {i.message}

                  {i.lost > 0 && (
                    <span className="ml-2 whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
                      −{i.lost}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {m.passed.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Looks good
          </p>

          <ul className="mt-2 space-y-1 text-sm">
            {m.passed.map((p) => (
              <li key={p} className="flex gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {m.tips.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Tips
          </p>

          <ul className="mt-2 space-y-1 text-sm">
            {m.tips.map((t) => (
              <li key={t} className="flex gap-2 text-gray-600">
                <span className="text-indigo-500">›</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ResultsView({
  result,
  mode = "full",
  onReset,
  afterScore,
}: {
  result: CheckResult;
  mode?: "preview" | "full";
  onReset?: () => void;
  afterScore?: React.ReactNode;
}) {
  const band = BAND[result.band];
  const top = result.topIssues.slice(0, 3);

  // In preview mode, show only module scores and progress bars.
  // Full details are available in the emailed report.
  const cards =
    mode === "preview"
      ? result.modules.map((m) => ({
          ...m,
          issues: [],
          passed: [],
          tips: [],
        }))
      : result.modules;

  return (
    <section aria-live="polite" className="mt-10 text-left">
      {/* Score */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:gap-8">
        <ScoreRing total={result.total} band={result.band} />

        <div>
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${band.chip}`}
          >
            {band.label}
          </span>

          <h2 className="mt-2 text-2xl font-bold">
            Your ATS readiness score
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            An estimate of how well hiring software can read and match your
            resume. Real employer systems vary.
          </p>
        </div>
      </div>

      {/* Score limit */}
      {result.caps.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">
            Your score is held at {result.total} until you fix:
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
            {result.caps.map((c) => (
              <li key={c.reason}>{c.reason}</li>
            ))}
          </ul>

          <p className="mt-2 text-amber-800">
            Without this limit, your score would be {result.rawTotal}.
          </p>
        </div>
      )}

      {/* Notes about the whole check */}
      {result.notes.map((n) => (
        <div
          key={n}
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
        >
          {n}
        </div>
      ))}

      {/* Optional content, such as the email capture form */}
      {afterScore}

      {/* Biggest problems first */}
      {top.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold">Fix these first</h3>

          <ol className="mt-3 space-y-3 text-sm">
            {top.map((i, n) => (
              <li key={i.message} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {n + 1}
                </span>

                <span className="text-gray-700">
                  <span className="font-medium">{i.module}:</span>{" "}
                  {i.message}

                  <span className="ml-2 whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
                    −{i.lost}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* One card per module */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((m) => (
          <ModuleCard key={m.id} m={m} />
        ))}
      </div>

      {/* Preview mode message */}
      {mode === "preview" && (
        <p className="mt-3 text-center text-sm text-gray-500">
          Full details for every section are in your emailed report.
        </p>
      )}

      {/* Optional reset button */}
      {onReset && (
        <div className="mt-8 text-center">
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium"
          >
            Check another resume
          </button>
        </div>
      )}
    </section>
  );
}
