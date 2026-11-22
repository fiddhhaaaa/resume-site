import { findSections } from "./sections";
import { extractStatements, hasNumber } from "./bullets";
import type { Issue, ModuleResult, ScoreInput } from "./types";

const MAX = 25;

const STRONG_VERBS = new Set([
  "led", "built", "grew", "won", "wrote", "drove", "ran", "sold", "cut",
  "taught", "made", "set", "began", "lead", "manage", "build", "develop",
  "design", "implement", "create", "drive", "deliver", "own", "run",
  "handle", "maintain", "coordinate", "analyse", "analyze", "optimize",
  "optimise", "automate", "architect", "oversee", "spearhead", "launch",
]);

// Words that end in "ed" but don't describe a result
const WEAK_STARTS = new Set([
  "worked", "assisted", "helped", "involved", "participated", "attended",
  "tasked", "used", "experienced", "skilled", "motivated", "dedicated",
  "seasoned", "accomplished", "committed", "based",
]);

const STOCK_PHRASES = [
  "responsible for", "duties included", "duties include", "in charge of",
  "team player", "hard-working", "hardworking", "hard working",
  "results-driven", "results driven", "detail-oriented", "detail oriented",
  "self-motivated", "go-getter", "dynamic professional", "passionate about",
];

const TOOLS_RE =
  /\b(?:tech(?:nology|nologies)?\s*stack|technologies|tools?|(?:built|developed|created|designed|analy[sz]ed)\s+(?:with|using)|using|software|platform)\b/i;

const OUTCOME_RE =
  /\b(?:improv|reduc|increas|achiev|won\b|ranked|prize|award|deploy|launch|publish|accuracy|users|customers|saved|automat)/i;

const CERT_RE =
  /\b(?:certified|certification|certificate|course|workshop|hackathon|award|scholarship|training|nptel|coursera|udemy)\b/i;

function startsWithAction(statement: string): boolean {
  const first = statement.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, "");
  if (WEAK_STARTS.has(first)) return false;
  return STRONG_VERBS.has(first) || (first.length > 3 && first.endsWith("ed"));
}

function scoreExperienced(text: string): ModuleResult {
  const { bodies } = findSections(text);
  const statements = extractStatements(bodies.get("experience") ?? text);
  const total = statements.length;

  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];
  let points = 0;

  if (total === 0) {
    issues.push({
      message:
        "We couldn't find bullet points describing your work. Add 3 to 5 bullets under each job, each showing something you achieved.",
      lost: 21,
    });
  } else {
    // Enough content (3)
    if (total >= 5) {
      points += 3;
      passed.push("Enough detail about your work");
    } else {
      issues.push({
        message: `Only ${total} achievement statement${total === 1 ? "" : "s"} found. Add 3 to 5 bullets under each job.`,
        lost: 3,
      });
    }

    // Numbers (12)
    const withNumbers = statements.filter(hasNumber).length;
    const numPts = Math.round(Math.min(1, withNumbers / total / 0.5) * 12);
    points += numPts;
    if (numPts < 12) {
      issues.push({
        message: `Only ${withNumbers} of ${total} bullet points include a number. Add figures such as %, amounts, team size or time saved, for example “Grew regional sales by 22% in 12 months”.`,
        lost: 12 - numPts,
      });
      tips.push(
        "If your results are confidential, use ranges or relative numbers, such as “more than 20 clients”."
      );
    } else {
      passed.push("Bullet points include measurable results");
    }

    // Action verbs (6)
    const withVerbs = statements.filter(startsWithAction).length;
    const verbPts = Math.round(Math.min(1, withVerbs / total / 0.6) * 6);
    points += verbPts;
    if (verbPts < 6) {
      issues.push({
        message: `${total - withVerbs} of ${total} bullet points don't start with an action verb. Start with words like “Led”, “Built”, “Reduced” or “Delivered”.`,
        lost: 6 - verbPts,
      });
    } else {
      passed.push("Bullet points start with action verbs");
    }
  }

  // Overused phrases (4), checked across the whole resume
  const lower = text.toLowerCase();
  const foundPhrases = STOCK_PHRASES.filter((p) => lower.includes(p));
  if (foundPhrases.length === 0) {
    points += 4;
    passed.push("No overused phrases");
  } else {
    const lost = Math.min(4, foundPhrases.length);
    points += 4 - lost;
    issues.push({
      message: `Overused phrases found: ${foundPhrases
        .slice(0, 3)
        .map((p) => `“${p}”`)
        .join(", ")}. Replace them with specific results.`,
      lost,
    });
  }

  return { id: "achievements", label: "Achievements and results", points, max: MAX, issues, passed, tips };
}

function scoreFresher(text: string): ModuleResult {
  const { found, bodies } = findSections(text);
  const ids = ["projects", "internships", "experience"] as const;

  let body = ids.map((id) => bodies.get(id) ?? "").join("\n");
  if (!body.trim() && ids.some((id) => found.has(id))) body = text;

  const statements = extractStatements(body);
  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];
  let points = 0;

  if (statements.length === 0) {
    issues.push({
      message:
        "We couldn't find project or internship descriptions. Describe 2 or 3 projects in 2 to 3 lines each: what you built, the tools you used, and the result.",
      lost: 22,
    });
  } else {
    // Enough detail (9)
    const subPts = Math.round(Math.min(1, statements.length / 4) * 9);
    points += subPts;
    if (subPts < 9) {
      issues.push({
        message:
          "Your projects and internships need more detail. Add 2 to 3 lines for each, covering what you did, the tools you used, and the result.",
        lost: 9 - subPts,
      });
    } else {
      passed.push("Projects and internships are described in detail");
    }

    // Tools named (6)
    if (TOOLS_RE.test(body)) {
      points += 6;
      passed.push("Tools or methods are named");
    } else {
      issues.push({
        message:
          "Name the tools, languages or methods you used in each project, for example “Built with React and Node.js” or “Analysed data using Excel”.",
        lost: 6,
      });
    }

    // Results shown (7)
    const withOutcome = statements.filter(
      (s) => hasNumber(s) || OUTCOME_RE.test(s)
    ).length;
    const outPts = withOutcome >= 2 ? 7 : withOutcome === 1 ? 4 : 0;
    points += outPts;
    if (outPts < 7) {
      issues.push({
        message:
          "Show the result of your projects: numbers, users, accuracy, rankings or awards. For example “Built a billing app used by 40 students”.",
        lost: 7 - outPts,
      });
    } else {
      passed.push("Project results are shown");
    }
  }

  // Certifications, courses or achievements (3)
  if (found.has("certifications") || CERT_RE.test(text)) {
    points += 3;
    passed.push("Certifications, courses or achievements found");
  } else {
    issues.push({
      message:
        "Add certifications, courses, workshops or achievements that support the role you want.",
      lost: 3,
    });
  }

  if (!/github\.com|gitlab\.com|behance\.net|portfolio/i.test(text)) {
    tips.push("If your projects are online, add a GitHub or portfolio link.");
  }

  return { id: "practical", label: "Projects and practical work", points, max: MAX, issues, passed, tips };
}

export function scoreAchievements({ parsed, level }: ScoreInput): ModuleResult {
  return level === "fresher"
    ? scoreFresher(parsed.text)
    : scoreExperienced(parsed.text);
}