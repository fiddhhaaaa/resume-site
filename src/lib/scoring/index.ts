import { scoreAchievements } from "./achievements";
import { scoreContact } from "./contact";
import { scoreKeywords } from "./keywords";
import { scoreReadability } from "./readability";
import { scoreSections } from "./sections";
import type { CheckResult, ModuleResult, ScoreInput } from "./types";

function bandFor(total: number): CheckResult["band"] {
  if (total >= 80) return "good";
  if (total >= 60) return "fair";
  return "poor";
}

export function runScoring(input: ScoreInput): CheckResult {
  const notes: string[] = [];
  const modules: ModuleResult[] = [
    scoreReadability(input),
    scoreContact(input),
    scoreSections(input),
    scoreAchievements(input),
  ];

  const keywords = scoreKeywords(input);
  if (keywords) {
    modules.push(keywords);
  } else {
    notes.push(
      "Keyword check skipped. Choose the job you are applying for, or paste a job ad, to include it in your score."
    );
  }

  const earned = modules.reduce((sum, m) => sum + m.points, 0);
  const possible = modules.reduce((sum, m) => sum + m.max, 0);
  const rawTotal = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  // Only caps that actually lower the score are applied and shown
  const caps = modules
    .flatMap((m) => m.caps ?? [])
    .filter((c) => c.max < rawTotal)
    .sort((a, b) => a.max - b.max);
  const total = caps.length > 0 ? Math.min(rawTotal, caps[0].max) : rawTotal;

  const topIssues = modules
    .flatMap((m) => m.issues.map((i) => ({ ...i, module: m.label })))
    .filter((i) => i.lost > 0)
    .sort((a, b) => b.lost - a.lost);

  return { total, rawTotal, band: bandFor(total), modules, topIssues, caps, notes };
}