// Local, on-device file parsing for loan documents — no AI/LLM involved.
// JSON & CSV are read directly; PDFs via pdfjs text extraction; images via
// Tesseract OCR. Extracted fields are best-effort and always editable by the
// user in the review card.

import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedData {
  borrowerName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  confidence: "high" | "medium" | "low";
  notes: string;
}

export type ExtractProgress = (info: { stage: string; percent?: number }) => void;

// Guardrails to keep on-device OCR/parsing from freezing the browser tab.
// Images run through Tesseract OCR (CPU-heavy), so cap them tightly; PDFs are
// parsed page-by-page, so cap by page count.
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_PAGES = 30;

function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EMPTY: Omit<ExtractedData, "confidence" | "notes"> = {
  borrowerName: null,
  principalAmount: null,
  interestRate: null,
  startDate: null,
  dueDate: null,
  description: null,
};

function fileKind(file: File): "json" | "csv" | "pdf" | "image" | "text" | "unknown" {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const mime = file.type.toLowerCase();
  if (mime === "application/json" || ext === "json") return "json";
  if (mime === "text/csv" || ext === "csv") return "csv";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (mime.startsWith("text/") || ext === "txt") return "text";
  return "unknown";
}

// ─── Number / date normalisers ───────────────────────────────────────────────

export function parseAmount(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  let s = raw.toString().trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/₹|rs\.?|inr/gi, "").trim();
  // lakh / crore multipliers
  let mult = 1;
  const crore = s.match(/([\d.,]+)\s*(crore|cr)\b/);
  const lakh = s.match(/([\d.,]+)\s*(lakh|lac|l)\b/);
  if (crore) {
    mult = 1e7;
    s = crore[1];
  } else if (lakh) {
    mult = 1e5;
    s = lakh[1];
  }
  const n = Number(s.replace(/,/g, "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n === 0) return null;
  return Math.round(n * mult);
}

export function parseRate(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const n = Number(raw.toString().replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0 || n > 100) return null;
  return n;
}

// Detects whether the matched rate is expressed per month so we can annualise it.
const MONTHLY_RE = /per\s*month|per\s*mensem|monthly|\/\s*mo(?:nth)?\b|\bp\.?\s*m\.?\b/i;

// Words that mean a nearby "%" is an interest rate, and words that mean it is
// some other charge (a fee, tax, penalty, …) that must NOT be read as the rate.
const RATE_CTX = /interest|roi|r\.o\.i|apr|\brate\b/i;
const FEE_CTX = /fee|gst|\btax\b|penalt|charge|processing|foreclos|prepay|cibil|tds|stamp|insur|late\s*(?:fee|payment|charge)/i;

function annualiseIfMonthly(rate: number, trailing: string): number {
  if (MONTHLY_RE.test(trailing)) {
    const annual = Math.round(rate * 12 * 100) / 100;
    return annual <= 100 ? annual : rate;
  }
  return rate;
}

// Picks the interest rate from free text. Prefers a "%" that sits next to an
// interest/rate label, skips percentages that belong to fees/GST/taxes/
// penalties/processing charges, and annualises monthly rates.
export function pickRate(flat: string): number | null {
  let labeled: { val: number; trail: string } | null = null;
  let firstClean: { val: number; trail: string } | null = null;
  for (const m of flat.matchAll(/([\d.]+)\s*%\s*([^.,;\n]{0,18})/gi)) {
    const val = parseRate(m[1]);
    if (val == null) continue;
    const idx = m.index ?? 0;
    const pre = flat.slice(Math.max(0, idx - 28), idx);
    const trail = m[2] ?? "";
    const isRate = RATE_CTX.test(pre);
    // A fee/tax/charge percentage is skipped — unless an interest/rate word is
    // also nearby (e.g. "interest charged at 2%"), where the rate wins.
    if (FEE_CTX.test(pre) && !isRate) continue;
    if (isRate && !labeled) labeled = { val, trail };
    if (!firstClean) firstClean = { val, trail };
  }
  let pick = labeled ?? firstClean;
  if (!pick) {
    // Labelled rate written without a "%" sign, e.g. "Interest 12 p.a.".
    const lm = flat.match(
      /(?:interest\s*rate|rate\s*of\s*interest|interest|roi|apr)\b[^%\d]{0,15}([\d.]+)\s*(%|p\.?\s*a\.?|per\s*annum|per\s*month|p\.?\s*m\.?)\b/i
    );
    if (lm) {
      const v = parseRate(lm[1]);
      if (v != null) pick = { val: v, trail: lm[2] ?? "" };
    }
  }
  return pick ? annualiseIfMonthly(pick.val, pick.trail) : null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// Returns YYYY-MM-DD or null. Assumes day-first for slash/dash numeric dates.
export function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toString().trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad(mo)}-${pad(d)}`;
  }
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (m) {
    let d = +m[1], mo = +m[2];
    let y = +m[3];
    if (y < 100) y += 2000;
    // If first group can't be a day but second can, swap (handles MM/DD).
    if (d > 31 && mo <= 31) [d, mo] = [mo, d];
    if (mo > 12 && d <= 12) [d, mo] = [mo, d];
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${y}-${pad(mo)}-${pad(d)}`;
  }
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  m = s.toLowerCase().match(/(\d{1,2})\s*([a-z]{3,})\s*(\d{4})/);
  if (m) {
    const d = +m[1];
    const mo = months.indexOf(m[2].slice(0, 3));
    const y = +m[3];
    if (mo >= 0 && d >= 1 && d <= 31) return `${y}-${pad(mo + 1)}-${pad(d)}`;
  }
  return null;
}

// Adds a whole number of months to a YYYY-MM-DD date, returning YYYY-MM-DD.
function addMonths(dateStr: string, months: number): string | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const dt = new Date(+m[1], +m[2] - 1 + months, +m[3]);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// Pulls a loan tenure (in months) from free text. Prefers a labelled tenure
// ("Tenure: 240 months", "Loan term 20 years"); otherwise falls back to the
// first clear "N months/years" phrase. Used to derive a due date when only a
// start date is present.
function pickTenureMonths(flat: string): number | null {
  const labeled = flat.match(
    /(?:tenure|tenor|loan\s*term|term|duration|period|repayment\s*period)\b[^\d]{0,15}(\d{1,3})\s*(years?|yrs?|y|months?|mos?|m)\b/i
  );
  const generic = labeled ?? flat.match(/(\d{1,3})\s*(years?|yrs?|months?|mos?)\b/i);
  if (!generic) return null;
  const n = +generic[1];
  if (!Number.isFinite(n) || n <= 0) return null;
  const months = /^y/i.test(generic[2]) ? n * 12 : n;
  return months > 0 && months <= 600 ? months : null;
}

// ─── Structured parsers (JSON / CSV) ─────────────────────────────────────────

const KEY_ALIASES: Record<keyof typeof EMPTY, string[]> = {
  borrowerName: ["borrowername", "borrower", "name", "lentto", "customer", "party", "person"],
  principalAmount: ["principalamount", "principal", "loanamount", "amount", "loan", "sanctioned", "disbursed"],
  interestRate: ["interestrate", "interest", "rate", "roi", "apr", "annualrate"],
  startDate: ["startdate", "start", "disbursaldate", "disbursementdate", "loandate", "from", "issued"],
  dueDate: ["duedate", "due", "enddate", "end", "maturity", "maturitydate", "to", "repaymentdate"],
  description: ["description", "desc", "notes", "remark", "remarks", "purpose"],
};

function mapRecord(rec: Record<string, unknown>): Omit<ExtractedData, "confidence" | "notes"> {
  const norm: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    norm[k.toLowerCase().replace(/[^a-z]/g, "")] = v;
  }
  const pick = (aliases: string[]): unknown => {
    for (const a of aliases) if (norm[a] != null && norm[a] !== "") return norm[a];
    return null;
  };
  return {
    borrowerName: ((): string | null => {
      const v = pick(KEY_ALIASES.borrowerName);
      return v == null ? null : String(v).trim() || null;
    })(),
    principalAmount: parseAmount(pick(KEY_ALIASES.principalAmount) as string | number | null),
    interestRate: parseRate(pick(KEY_ALIASES.interestRate) as string | number | null),
    startDate: normalizeDate(pick(KEY_ALIASES.startDate) as string | null),
    dueDate: normalizeDate(pick(KEY_ALIASES.dueDate) as string | null),
    description: ((): string | null => {
      const v = pick(KEY_ALIASES.description);
      return v == null ? null : String(v).trim() || null;
    })(),
  };
}

export function fromJSON(text: string): Omit<ExtractedData, "confidence" | "notes"> {
  const data = JSON.parse(text);
  const rec = Array.isArray(data) ? data[0] : data;
  if (!rec || typeof rec !== "object") throw new Error("No loan object found in the JSON file.");
  return mapRecord(rec as Record<string, unknown>);
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function fromCSV(text: string): Omit<ExtractedData, "confidence" | "notes"> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  const headers = splitCSVLine(lines[0]);
  const values = splitCSVLine(lines[1]);
  const rec: Record<string, unknown> = {};
  headers.forEach((h, i) => (rec[h] = values[i] ?? ""));
  return mapRecord(rec);
}

// ─── Free-text parser (used for PDF text and OCR output) ──────────────────────

export function fromText(text: string): Omit<ExtractedData, "confidence" | "notes"> {
  const out = { ...EMPTY };
  const flat = text.replace(/\s+/g, " ");

  // Amount: prefer strong principal labels, then a generic "amount" label,
  // then the first ₹/Rs figure. "\D{0,20}" lets the label sit a little away
  // from the number (e.g. "Loan Amount (Sanctioned): Rs. 5,00,000"), and the
  // "(?!\s*%)" guard rejects a figure that is actually a rate ("amount at 5%").
  const amtMult = "(crore|cr|lakh|lac)?(?!\\s*%)";
  const strongAmt = flat.match(
    new RegExp(
      `(?:principal(?:\\s*amount)?|loan\\s*amount|loan\\s*sum|amount\\s*of\\s*loan|sanctioned(?:\\s*amount)?|disbursed(?:\\s*amount)?)\\D{0,20}(₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*${amtMult}`,
      "i"
    )
  );
  const amt =
    strongAmt ??
    flat.match(
      new RegExp(`(?:amount)\\D{0,15}(₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*${amtMult}`, "i")
    );
  if (amt) {
    out.principalAmount = parseAmount(`${amt[2]} ${amt[3] ?? ""}`);
  }
  if (out.principalAmount == null) {
    // No labelled figure — the principal is almost always the largest money
    // amount in the document (vs EMI, fees, balances), so pick the maximum.
    const amounts: number[] = [];
    for (const mm of flat.matchAll(
      /(₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac)?(?!\s*%)/gi
    )) {
      const v = parseAmount(`${mm[2]} ${mm[3] ?? ""}`);
      if (v != null) amounts.push(v);
    }
    if (amounts.length) out.principalAmount = Math.max(...amounts);
  }

  // Interest rate — label-aware and fee-aware (see pickRate).
  out.interestRate = pickRate(flat);

  // Dates — collect all, then assign by label proximity.
  const dateRe = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s*[a-z]{3,}\s*\d{4})/gi;
  const startCtx = flat.match(
    /(?:start|disbursal|disbursement|loan date|from|issued)\D{0,15}(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s*[a-z]{3,}\s*\d{4})/i
  );
  const dueCtx = flat.match(
    /(?:due|maturity|end date|repayment|payoff)\D{0,15}(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s*[a-z]{3,}\s*\d{4})/i
  );
  if (startCtx) out.startDate = normalizeDate(startCtx[1]);
  if (dueCtx) out.dueDate = normalizeDate(dueCtx[1]);
  if (!out.startDate || !out.dueDate) {
    const all = [...flat.matchAll(dateRe)].map((m) => normalizeDate(m[1])).filter(Boolean) as string[];
    const sorted = [...new Set(all)].sort();
    if (!out.startDate && sorted[0]) out.startDate = sorted[0];
    if (!out.dueDate && sorted.length > 1) out.dueDate = sorted[sorted.length - 1];
  }
  // If a start date is known but the due date isn't, derive it from the tenure
  // (e.g. "Tenure: 240 months" → start + 240 months).
  if (out.startDate && !out.dueDate) {
    const months = pickTenureMonths(flat);
    if (months) out.dueDate = addMonths(out.startDate, months);
  }

  // Borrower name. Matched on the raw text (not "flat") so a newline ends the
  // name; a colon/dash separator is required to avoid grabbing prose like
  // "Borrower agrees to…". Trailing field labels that bleed onto the same line
  // (common in single-line PDF/OCR output) are trimmed off.
  const trimName = (raw: string): string | null => {
    let nm = raw.trim().replace(/\s+/g, " ");
    nm = nm
      .split(/\s+(?:amount|loan|principal|interest|rate|date|due|start|sum|disbursed|sanctioned|rs|inr)\b/i)[0]
      .trim();
    return nm || null;
  };
  const name = text.match(
    /(?:borrower(?:'s)?\s*name|name\s*of\s*(?:the\s*)?borrower|borrower|lent\s*to|loaned\s*to|customer|party|payee|debtor|name)\s*[:\-]\s*([A-Za-z][A-Za-z.'\- ]{1,40})/i
  );
  if (name) out.borrowerName = trimName(name[1]);
  // Fallback: tables/OCR often drop the colon ("Borrower Name  Rajesh Kumar").
  // Only for strong borrower labels, and only Capitalised words, to avoid prose.
  if (!out.borrowerName) {
    const name2 = text.match(
      /(?:borrower(?:'s)?\s*name|name\s*of\s*(?:the\s*)?borrower|lent\s*to|loaned\s*to|payee|debtor)\s+([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,3})/
    );
    if (name2) out.borrowerName = trimName(name2[1]);
  }

  // Purpose / description, when explicitly labelled.
  const purpose = text.match(/(?:purpose|description|remarks?|notes?)\s*[:\-]\s*([^\n]{2,80})/i);
  if (purpose) {
    const d = purpose[1].trim().replace(/\s+/g, " ");
    if (d) out.description = d;
  }

  return out;
}

// ─── Confidence scoring ──────────────────────────────────────────────────────

function score(
  d: Omit<ExtractedData, "confidence" | "notes">,
  source: string
): ExtractedData {
  const got: string[] = [];
  if (d.principalAmount != null) got.push("amount");
  if (d.interestRate != null) got.push("rate");
  if (d.startDate) got.push("start date");
  if (d.dueDate) got.push("due date");
  if (d.borrowerName) got.push("name");

  let confidence: ExtractedData["confidence"];
  if (got.length >= 4) confidence = "high";
  else if (got.length >= 2) confidence = "medium";
  else confidence = "low";

  const notes =
    got.length === 0
      ? `No loan details found in ${source} — please fill the fields below manually.`
      : `Extracted from ${source}: ${got.join(", ")}. Please verify the remaining fields manually.`;

  return { ...d, confidence, notes };
}

// ─── Public API ──────────────────────────────────────────────────────────────

async function pdfToText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  if (pdf.numPages > MAX_PDF_PAGES) {
    await pdf.cleanup();
    throw new Error(
      `This PDF has ${pdf.numPages} pages, which is too many to process in the browser (limit is ${MAX_PDF_PAGES}). Please upload a shorter PDF or just the relevant page, or fill the form manually.`
    );
  }
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text +=
      content.items
        .map((it) => ("str" in it ? it.str : ""))
        .join(" ") + "\n";
  }
  await pdf.cleanup();
  return text;
}

async function imageToText(file: File, onProgress?: ExtractProgress): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `This image is ${mb(file.size)}, which is too large to read in the browser (limit is ${mb(MAX_IMAGE_BYTES)}). Please upload a smaller or clearer screenshot, or fill the form manually.`
    );
  }
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress?.({ stage: "ocr", percent: Math.round(m.progress * 100) });
      }
    },
  });
  return data.text;
}

export async function extractFromFile(
  file: File,
  onProgress?: ExtractProgress
): Promise<ExtractedData> {
  const kind = fileKind(file);
  switch (kind) {
    case "json": {
      onProgress?.({ stage: "reading" });
      return score(fromJSON(await file.text()), "JSON");
    }
    case "csv": {
      onProgress?.({ stage: "reading" });
      return score(fromCSV(await file.text()), "CSV");
    }
    case "text": {
      onProgress?.({ stage: "reading" });
      return score(fromText(await file.text()), "Text");
    }
    case "pdf": {
      onProgress?.({ stage: "pdf" });
      const text = await pdfToText(file);
      if (!text.trim()) {
        throw new Error("No text found in this PDF (it may be a scanned image) — upload a screenshot instead, or fill the form manually.");
      }
      return score(fromText(text), "PDF");
    }
    case "image": {
      onProgress?.({ stage: "ocr", percent: 0 });
      const text = await imageToText(file, onProgress);
      return score(fromText(text), "Image (OCR)");
    }
    default:
      throw new Error("Unsupported file. Please upload a JSON, CSV, PDF, or image (PNG/JPG) file.");
  }
}
