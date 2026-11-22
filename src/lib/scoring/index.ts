import { scoreContact } from "./contact";
import { scoreReadability } from "./readability";
import { scoreSections } from "./sections";
import type { CheckResult, ModuleResult, ScoreInput } from "./types";

function bandFor(total: number): CheckResult["band"] {
  if (total >= 80) return "good";
  if (total >= 60) return "fair";
  return "poor";
}

export function runScoring(input: ScoreInput): CheckResult {
  // More modules are added to this list as we build them
  const modules: ModuleResult[] = [
  scoreReadability(input),
  scoreContact(input),
  scoreSections(input),
];
  const earned = modules.reduce((sum, m) => sum + m.points, 0);
  const possible = modules.reduce((sum, m) => sum + m.max, 0);
  const total = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  const topIssues = modules
    .flatMap((m) => m.issues.map((i) => ({ ...i, module: m.label })))
    .filter((i) => i.lost > 0)
    .sort((a, b) => b.lost - a.lost);

  return { total, band: bandFor(total), modules, topIssues };
}