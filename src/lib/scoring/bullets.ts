// Turns the text of a section into a list of statements (bullets or sentences).

const MARKER_RE = /^\s*(?:[•●▪■◦○∙·➢➤►✓✔]\s*|[-–—*]\s+)/;

// Matches a job header line such as "Jan 2021 – Present"
const DATE_RANGE_RE =
  /\b(?:19|20)\d{2}\b\s*(?:-|–|—|to|till|until)\s*(?:(?:\d{1,2}[/.-])?(?:19|20)\d{2}|present|current|now|date)\b/i;

export function extractStatements(body: string): string[] {
  const merged: string[] = [];

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const hasMarker = MARKER_RE.test(line);
    const clean = line.replace(MARKER_RE, "").trim();
    if (!clean) continue;

    // A wrapped line from a PDF continues the previous statement
    if (!hasMarker && merged.length > 0 && /^[a-z(]/.test(clean)) {
      merged[merged.length - 1] += " " + clean;
      continue;
    }
    merged.push(clean);
  }

  return merged.filter(
    (s) => s.split(/\s+/).length >= 6 && !DATE_RANGE_RE.test(s)
  );
}

// True if the statement has a number that isn't just a year or a name like ES6
export function hasNumber(statement: string): boolean {
  const cleaned = statement
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\b[A-Za-z]+\d+\b/g, " ");
  return /\d/.test(cleaned);
}