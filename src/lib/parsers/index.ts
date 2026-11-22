import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import JSZip from "jszip";

export type ParsedResume = {
  kind: "pdf" | "docx";
  text: string;
  pages: number | null;
  twoColumns: boolean;
  layout: { tables: number; textBoxes: number; images: number };
};

type PdfDoc = Awaited<ReturnType<typeof getDocumentProxy>>;
type PdfItem = { str: string; transform: number[]; width: number };

export async function extractResumeText(buffer: Buffer): Promise<ParsedResume> {
  // Check the real file type from its first bytes, not the file name
  const isPdf = buffer.subarray(0, 4).toString() === "%PDF";
  const isZip = buffer.subarray(0, 2).toString() === "PK";

  if (isPdf) return parsePdf(buffer);
  if (isZip) return parseDocx(buffer);
  throw new Error("Unsupported file type");
}

async function parsePdf(buffer: Buffer): Promise<ParsedResume> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  const twoColumns = await detectTwoColumns(pdf, Math.min(totalPages, 2));

  return {
    kind: "pdf",
    text,
    pages: totalPages,
    twoColumns,
    layout: { tables: 0, textBoxes: 0, images: 0 }, // not detected in PDFs yet
  };
}

// Looks for an empty vertical strip (a gutter) in the middle of the page,
// with a good amount of text on both sides of it.
async function detectTwoColumns(pdf: PdfDoc, pagesToCheck: number): Promise<boolean> {
  for (let p = 1; p <= pagesToCheck; p++) {
    const page = await pdf.getPage(p);
    const pageWidth = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();

    const items = (content.items as unknown[])
      .filter((i): i is PdfItem => {
        const it = i as Partial<PdfItem>;
        return (
          typeof it.str === "string" &&
          Array.isArray(it.transform) &&
          typeof it.width === "number"
        );
      })
      .filter((i) => i.str.trim().length > 2)
      .map((i) => ({
        x0: i.transform[4] / pageWidth,
        x1: (i.transform[4] + i.width) / pageWidth,
      }));

    if (items.length < 20) continue;

    // Count how many text pieces cover each 1% slice of the page width
    const BINS = 100;
    const cover = new Array<number>(BINS).fill(0);
    for (const it of items) {
      const from = Math.max(0, Math.floor(it.x0 * BINS));
      const to = Math.min(BINS - 1, Math.floor(it.x1 * BINS));
      for (let b = from; b <= to; b++) cover[b]++;
    }

    // Find the longest nearly-empty run between 25% and 75% of the width
    const limit = items.length * 0.03;
    let runStart = -1;
    let bestStart = -1;
    let bestLen = 0;
    for (let b = 25; b <= 75; b++) {
      if (cover[b] <= limit) {
        if (runStart === -1) runStart = b;
        const len = b - runStart + 1;
        if (len > bestLen) {
          bestLen = len;
          bestStart = runStart;
        }
      } else {
        runStart = -1;
      }
    }
    if (bestLen < 3) continue;

    const gutterStart = bestStart / BINS;
    const gutterEnd = (bestStart + bestLen) / BINS;
    const left = items.filter((i) => i.x1 <= gutterStart + 0.01).length;
    const right = items.filter((i) => i.x0 >= gutterEnd - 0.01).length;

    if (left >= items.length * 0.2 && right >= items.length * 0.2) return true;
  }
  return false;
}

async function parseDocx(buffer: Buffer): Promise<ParsedResume> {
  const { value } = await mammoth.extractRawText({ buffer });

  // A .docx file is a zip. The main content is in word/document.xml
  const zip = await JSZip.loadAsync(buffer);
  const xml = (await zip.file("word/document.xml")?.async("string")) ?? "";
  const count = (re: RegExp) => (xml.match(re) ?? []).length;

  return {
    kind: "docx",
    text: value,
    pages: null,
    twoColumns: /<w:cols[^>]*w:num="[2-9]"/.test(xml),
    layout: {
      tables: count(/<w:tbl>/g),
      textBoxes: count(/<w:txbxContent>/g),
      images: count(/<w:drawing>|<w:pict>/g),
    },
  };
}