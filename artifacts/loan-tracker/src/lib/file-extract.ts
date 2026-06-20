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

  // Amount: prefer labelled values, else first ₹/Rs amount.
  const amtLabel = flat.match(
    /(?:principal|loan\s*amount|sanctioned|disbursed|amount)\D{0,12}(₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac)?/i
  );
  if (amtLabel) {
    out.principalAmount = parseAmount(`${amtLabel[2]} ${amtLabel[3] ?? ""}`);
  }
  if (out.principalAmount == null) {
    const anyAmt = flat.match(/(₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac)?/i);
    if (anyAmt) out.principalAmount = parseAmount(`${anyAmt[2]} ${anyAmt[3] ?? ""}`);
  }

  // Interest rate. Capture a little trailing context so we can tell apart
  // monthly rates ("2% per month") from annual ones and annualise correctly.
  const rate =
    flat.match(/([\d.]+)\s*%\s*([^.,;\n]{0,18})/i) ||
    flat.match(/(?:interest|rate|roi)\D{0,10}([\d.]+)\s*%?\s*([^.,;\n]{0,18})/i);
  if (rate) {
    let parsed = parseRate(rate[1]);
    if (parsed != null && MONTHLY_RE.test(rate[2] ?? "")) {
      const annual = Math.round(parsed * 12 * 100) / 100;
      parsed = annual <= 100 ? annual : parsed;
    }
    out.interestRate = parsed;
  }

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

  // Borrower name.
  const name = text.match(/(?:borrower|name|lent to|customer|party)\s*[:\-]\s*([A-Za-z][A-Za-z .]{1,40})/i);
  if (name) out.borrowerName = name[1].trim().replace(/\s+/g, " ");

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
