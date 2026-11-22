
import { CAP } from "./caps";
import type { Cap, Issue, ModuleResult, ScoreInput } from "./types";


export type SectionId =
  | "experience"
  | "internships"
  | "education"
  | "skills"
  | "summary"
  | "projects"
  | "certifications";

// Heading names we accept. We extend these after testing real resumes.
const HEADINGS: Record<SectionId, string[]> = {
  experience: [
    "experience", "work experience", "professional experience",
    "employment history", "work history", "career history",
    "relevant experience", "employment", "professional background",
  ],
  internships: [
    "internship", "internships", "internship experience",
    "industrial training", "training",
  ],
  education: [
    "education", "educational qualification", "educational qualifications",
    "academic qualification", "academic qualifications", "academic background",
    "educational background", "qualifications", "academics",
    "education and qualifications", "education and training",
  ],
  skills: [
    "skills", "technical skills", "key skills", "core competencies",
    "skills and tools", "it skills", "technical proficiency", "skill set",
    "areas of expertise", "competencies", "core skills",
  ],
  summary: [
    "summary", "professional summary", "profile", "professional profile",
    "career objective", "objective", "about me", "career summary",
    "personal statement", "executive summary",
  ],
  projects: [
    "projects", "academic projects", "personal projects", "key projects",
    "project work", "major project", "project experience", "selected projects",
  ],
  certifications: [
    "certifications", "certification", "certificates", "courses",
    "courses and certifications", "training and certifications",
    "licenses and certifications", "licences and certifications",
    "professional certifications",
  ],
};

const LOOKUP = new Map<string, SectionId>();
for (const [id, aliases] of Object.entries(HEADINGS) as [SectionId, string[]][]) {
  for (const alias of aliases) LOOKUP.set(alias, id);
}

// Lowercase, turn & into "and", drop punctuation and digits
function normalise(line: string): string {
  return line
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findSections(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const found = new Set<SectionId>();
  const bodies = new Map<SectionId, string>();

  // A heading is a short line that matches one of the accepted names
  const marks: { id: SectionId; line: number }[] = [];
  lines.forEach((line, i) => {
    if (!line || line.length > 45) return;
    const id = LOOKUP.get(normalise(line));
    if (id) {
      marks.push({ id, line: i });
      found.add(id);
    }
  });

  // The text between one heading and the next belongs to the first heading
  marks.forEach((m, k) => {
    const end = k + 1 < marks.length ? marks[k + 1].line : lines.length;
    const body = lines.slice(m.line + 1, end).join("\n");
    bodies.set(m.id, (bodies.get(m.id) ?? "") + "\n" + body);
  });

  // Some PDFs come out as one long line. Then we search for the words anywhere.
  const nonEmpty = lines.filter(Boolean).length;
  if (nonEmpty < 8) {
    for (const [alias, id] of LOOKUP) {
      if (new RegExp(`\\b${alias}\\b`, "i").test(text)) found.add(id);
    }
  }

  return { found, bodies };
}

// Date ranges such as "Jan 2020 – Present", "2019 - 2022", "03/2019 to 05/2021"
const MONTH =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const DATE = `(?:${MONTH}\\.?\\s*,?\\s*(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])[\\/.-](?:19|20)\\d{2}|(?:19|20)\\d{2})`;
const RANGE_RE = new RegExp(
  `${DATE}\\s*(?:-|–|—|to|till|until)\\s*(?:${DATE}|present|current|now|date|ongoing)`,
  "gi"
);
const YEAR_RE = /\b(?:19|20)\d{2}\b/g;

export function scoreSections({ parsed, level, applyingTo }: ScoreInput): ModuleResult {
  const text = parsed.text;
  const { found, bodies } = findSections(text);
  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];
  let points = 0;

  function check(ok: boolean, pts: number, okMsg: string, badMsg: string) {
    if (ok) {
      points += pts;
      passed.push(okMsg);
    } else {
      issues.push({ message: badMsg, lost: pts });
    }
  }

  if (level === "experienced") {
    check(
      found.has("experience"), 5,
      "Experience section found",
      "No “Experience” heading found. Add a section called “Work Experience” so software can find your jobs."
    );
    check(
      found.has("education"), 3,
      "Education section found",
      "No “Education” heading found. Add a section called “Education”."
    );
    check(
      found.has("skills"), 3,
      "Skills section found",
      "No “Skills” heading found. Add a section called “Skills”, with the tools and skills for your target role."
    );
    check(
      found.has("summary"), 1,
      "Summary found",
      "Add a short summary (2 to 3 lines) at the top that names the role you want."
    );

    // Look for dates inside the experience section when we can find it
    const expText = bodies.get("experience") ?? text;
    const ranges = expText.match(RANGE_RE)?.length ?? 0;
    check(
      ranges >= 1, 3,
      "Job dates found",
      "We couldn't find job dates in a clear format. Write them like “Jan 2021 – Mar 2024” next to each job."
    );
  } else {
    check(
      found.has("education"), 5,
      "Education section found",
      "No “Education” heading found. As a fresher, education is the first thing employers look for."
    );
    check(
      found.has("skills"), 3,
      "Skills section found",
      "No “Skills” heading found. Add a section called “Skills”."
    );
    check(
      found.has("projects") || found.has("internships") || found.has("experience"), 4,
      "Projects or internships found",
      "No “Projects” or “Internships” section found. Freshers need to show practical work, such as academic projects, internships or training."
    );
    check(
      found.has("summary"), 1,
      "Objective found",
      "Add a short career objective (2 lines) that names the role you want."
    );

    const eduText = bodies.get("education") ?? text;
    check(
      (eduText.match(YEAR_RE)?.length ?? 0) >= 1, 2,
      "Years of study found",
      "Add your years of study next to your degree, for example “2022 – 2026”."
    );

    // Tips: advice only, no points
    if (applyingTo === "IN" && !/cgpa|gpa|percentage|\d\s?%|\/\s?10\b/i.test(text)) {
      tips.push("Add your CGPA or percentage next to your degree. Indian employers often ask for it.");
    }
  }
    const caps: Cap[] = [];
    if (level === "experienced" && !found.has("experience")) {
      caps.push({ max: CAP.majorGap, reason: "We couldn't find an Experience section." });
   }
   if (level === "fresher" && !found.has("education")) {
     caps.push({ max: CAP.majorGap, reason: "We couldn't find an Education section." });
   }
    return { id: "sections", label: "Sections and dates", points, max: 15, issues, passed, tips, caps };
}