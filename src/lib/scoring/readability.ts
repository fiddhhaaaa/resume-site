
import type { Issue, ModuleResult, ScoreInput } from "./types";
import { CAP } from "./caps";

const MAX = 25;
const ICON_RE = /[\uE000-\uF8FF\uFFFD]/g; // icon-font symbols and broken characters

export function scoreReadability({ parsed, level }: ScoreInput): ModuleResult {
  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];

  // Nothing readable: stop here
  if (parsed.text.trim().length < 100) {
    issues.push({
      message:
        "We couldn't read any text in this file. It may be a scanned or image-only PDF. ATS software can't read images, so export a text-based PDF from Word or Google Docs.",
      lost: MAX,
    });

    return {
      id: "readability",
      label: "Readability",
      points: 0,
      max: MAX,
      issues,
      passed,
      tips,
      caps: [
        {
          max: CAP.unreadable,
          reason: "We couldn't read any text in your file, so software can't read it either.",
        },
      ],
    };
  }

  passed.push("Text can be read by software");

  // Columns
  if (parsed.twoColumns) {
    issues.push({
      message:
        "Two-column layout detected. Software may read the columns in the wrong order and mix up your details. A single column is safer.",
      lost: 8,
    });
  } else {
    passed.push("Single-column layout");
  }

  // Word-only checks (not detected in PDFs yet)
  if (parsed.kind === "docx") {
    const { tables, textBoxes, images } = parsed.layout;

    if (tables > 0) {
      issues.push({
        message: `${tables} table${tables > 1 ? "s" : ""} found. Some ATS tools read table cells out of order or skip them. Use plain text and headings instead.`,
        lost: Math.min(8, tables * 4),
      });
    } else {
      passed.push("No tables");
    }

    if (textBoxes > 0) {
      issues.push({
        message:
          "Text boxes found. Some ATS tools skip text inside boxes, so anything in them may be missed.",
        lost: 6,
      });
    } else {
      passed.push("No text boxes");
    }

    if (images >= 4) {
      issues.push({
        message:
          "Many images or icons found. Software can't read them, so make sure no information appears only in a graphic. A single photo is fine.",
        lost: 3,
      });
    }
  }

  // Icon-font symbols that show up as blank squares or odd characters
  const icons = parsed.text.match(ICON_RE)?.length ?? 0;

  if (icons > 0) {
    issues.push({
      message:
        "Special icon characters found. They may show up as blank squares in an ATS. Use plain words like “Email” and “Phone” next to your details.",
      lost: 3,
    });
  }

  // Length. Word files have no page count, so estimate from the word count
  const words = parsed.text.split(/\s+/).filter(Boolean).length;
  const pages = parsed.pages ?? Math.max(1, Math.ceil(words / 500));
  const maxPages = level === "fresher" ? 1 : 2;

  if (pages > maxPages) {
    issues.push({
      message:
        level === "fresher"
          ? `Your resume is about ${pages} pages. Freshers usually do best with one page.`
          : `Your resume is about ${pages} pages. Aim for two pages or fewer, with your strongest points first.`,
      lost: 3,
    });
  } else {
    passed.push("Good length");
  }

  const lost = issues.reduce((sum, i) => sum + i.lost, 0);

  return {
    id: "readability",
    label: "Readability",
    points: Math.max(0, MAX - lost),
    max: MAX,
    issues,
    passed,
    tips,
  };
}
