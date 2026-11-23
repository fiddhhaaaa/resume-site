import { SKILLS, type SkillId } from "@/data/skills";

export function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ");
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One pattern per skill. Longest spellings come first, so "react.js"
// is counted once and not twice. Partial words never match
// ("java" in "javascript", "excel" in "excellent").
const ENTRIES = Object.entries(SKILLS).map(([skill, aliases]) => {
  const alts = [skill, ...aliases]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join("|");
  return {
    skill: skill as SkillId,
    re: new RegExp(`(?<![a-z0-9+#.])(?:${alts})(?![a-z0-9+#])`, "g"),
  };
});

// Which skills appear in the text, and how many times
export function countSkills(text: string): Map<SkillId, number> {
  const t = normalise(text);
  const counts = new Map<SkillId, number>();
  for (const { skill, re } of ENTRIES) {
    const n = t.match(re)?.length ?? 0;
    if (n > 0) counts.set(skill, n);
  }
  return counts;
}