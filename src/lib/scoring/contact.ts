import { scorePhone } from "./phone";
import type { Issue, ModuleResult, ScoreInput } from "./types";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// A starter list. We extend it after testing real resumes.
const PLACES = [
  // India
  "mumbai", "delhi", "new delhi", "bengaluru", "bangalore", "hyderabad",
  "chennai", "kolkata", "pune", "ahmedabad", "kochi", "cochin",
  "thiruvananthapuram", "trivandrum", "kozhikode", "calicut", "thrissur",
  "kannur", "malappuram", "kollam", "coimbatore", "jaipur", "lucknow",
  "noida", "gurgaon", "gurugram", "chandigarh", "indore", "nagpur", "surat",
  "bhopal", "visakhapatnam", "kerala", "karnataka", "tamil nadu",
  "maharashtra", "india",
  // UAE
  "dubai", "abu dhabi", "sharjah", "ajman", "ras al khaimah", "fujairah",
  "umm al quwain", "al ain", "uae", "united arab emirates",
];
const PLACE_RE = new RegExp(`\\b(${PLACES.join("|")})\\b`, "i");

// Looks for a short line of 2 to 5 words made only of letters near the top
function hasName(text: string): boolean {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5);

  return lines.some((line) => {
    if (line.length > 40) return false;
    if (/[0-9@/\\:,]/.test(line)) return false;
    if (/resume|curriculum vitae|\bcv\b/i.test(line)) return false;
    const words = line.split(/\s+/);
    return (
      words.length >= 2 &&
      words.length <= 5 &&
      words.every((w) => /^[A-Za-z\u00C0-\u024F.'’-]+$/.test(w))
    );
  });
}

export function scoreContact({ parsed, level, applyingTo }: ScoreInput): ModuleResult {
  const text = parsed.text;
  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];
  let points = 0;

  // Email (3)
  if (EMAIL_RE.test(text)) {
    points += 3;
    passed.push("Email address found");
  } else {
    issues.push({
      message: "No email address found. Employers need one to contact you.",
      lost: 3,
    });
  }

  // Phone (3), with the India/UAE rules from phone.ts
  const phone = scorePhone(text, applyingTo);
  points += phone.points;
  if (phone.issues.length === 0) passed.push("Valid phone number with country code");
  phone.issues.forEach((message, i) =>
    issues.push({ message, lost: i === 0 ? phone.max - phone.points : 0 })
  );

  // Name (2)
  if (hasName(text)) {
    points += 2;
    passed.push("Name found at the top");
  } else {
    issues.push({
      message: "We couldn't find your name at the top of the resume.",
      lost: 2,
    });
  }

  // Location (2): look only in the top part of the resume
  if (PLACE_RE.test(text.slice(0, 1000))) {
    points += 2;
    passed.push("Location found near the top");
  } else {
    issues.push({
      message:
        applyingTo === "AE"
          ? "Add your city and country near the top, for example “Kochi, India (open to relocate to UAE)” or “Dubai, UAE”."
          : "Add your city and state near the top, for example “Kochi, Kerala”.",
      lost: 2,
    });
  }

  // Tips: advice only, no points
  const has = (re: RegExp) => re.test(text);

  if (!has(/linkedin\.com/i)) tips.push("Add your LinkedIn profile link.");

  if (applyingTo === "AE") {
    if (!has(/visa|residence permit|residency|\bnoc\b/i)) {
      tips.push(
        "UAE employers usually ask about visa status. Add it, for example “Employment visa”, “Visit visa”, or “Outside UAE, available to relocate”."
      );
    }
    if (!has(/nationality/i)) {
      tips.push("Many UAE employers expect nationality near your contact details.");
    }
  } else if (has(/father['’]?s name|marital status|declaration/i)) {
    tips.push(
      "Father's name, marital status and a “Declaration” section aren't needed and use up space. Consider removing them."
    );
  }

  if (
    level === "experienced" &&
    !has(/notice period|immediate(ly)? (joiner|available)|available (immediately|from)/i)
  ) {
    tips.push("Mention your notice period or when you can join.");
  }

  return { id: "contact", label: "Contact details", points, max: 10, issues, passed, tips };
}