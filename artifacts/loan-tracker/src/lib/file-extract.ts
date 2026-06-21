// Local, on-device file parsing for loan documents — no AI/LLM involved.
// JSON & CSV are read directly; PDFs via pdfjs text extraction; images via
// Tesseract OCR. Extracted fields are best-effort and always editable by the
// user in the review card.

// pdfjs is heavy (~1 MB) and only needed when a user actually uploads a PDF, so
// it is loaded lazily to keep it out of the public/landing entry bundle.
type PdfjsModule = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import("pdfjs-dist");
      const workerUrl = (
        await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
      ).default;
      lib.GlobalWorkerOptions.workerSrc = workerUrl;
      return lib;
    })();
  }
  return pdfjsPromise;
}

export interface ExtractedData {
  borrowerName: string | null;
  bankName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  tenureMonths: number | null;
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
  bankName: null,
  principalAmount: null,
  interestRate: null,
  tenureMonths: null,
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

// Coerces a structured tenure value (JSON/CSV) into a month count. Numbers are
// treated as months; strings reuse the free-text tenure parser so "20 years",
// "240 months", "5 yrs" all work.
export function parseTenure(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw > 0 && raw <= 600 ? Math.round(raw) : null;
  }
  const s = raw.toString().trim();
  if (!s) return null;
  const fromText = pickTenureMonths(s);
  if (fromText != null) return fromText;
  // Bare number string with no unit → assume months.
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 && n <= 600 ? Math.round(n) : null;
}

// Canonical bank/NBFC names matched against free text or structured values, so
// the extracted bank lines up with the loan form's bank dropdown. Each entry is
// the canonical label plus the substrings that should map to it. Order matters:
// more specific names first. Anything unmatched falls back to "Other".
const BANK_MATCHERS: { label: string; needles: RegExp }[] = [
  { label: "State Bank of India (SBI)", needles: /state\s*bank|\bsbi\b/i },
  { label: "HDFC Bank", needles: /\bhdfc\b/i },
  { label: "ICICI Bank", needles: /\bicici\b/i },
  { label: "Axis Bank", needles: /\baxis\b/i },
  { label: "Kotak Mahindra Bank", needles: /kotak/i },
  { label: "Punjab National Bank (PNB)", needles: /punjab\s*national|\bpnb\b/i },
  { label: "Bank of Baroda", needles: /bank\s*of\s*baroda|\bbob\b/i },
  { label: "Canara Bank", needles: /canara/i },
  { label: "Union Bank of India", needles: /union\s*bank/i },
  { label: "Bank of India", needles: /bank\s*of\s*india|\bboi\b/i },
  { label: "IndusInd Bank", needles: /indusind/i },
  { label: "Yes Bank", needles: /\byes\s*bank\b/i },
  { label: "IDFC First Bank", needles: /idfc/i },
  { label: "Indian Bank", needles: /\bindian\s*bank\b/i },
  { label: "Central Bank of India", needles: /central\s*bank/i },
  { label: "Bajaj Finserv", needles: /bajaj/i },
];

// Maps an arbitrary bank string to a canonical dropdown label (or "Other").
export function normalizeBank(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;
  for (const m of BANK_MATCHERS) if (m.needles.test(s)) return m.label;
  return "Other";
}

// Detects a lender in free text: first a labelled value ("Bank: HDFC Bank",
// "Lender - ICICI"), then any known bank name appearing anywhere in the text.
export function pickBank(flat: string): string | null {
  const labeled = flat.match(
    /(?:bank\s*name|lender|financier|lending\s*institution|bank)\s*[:\-]\s*([A-Za-z][A-Za-z.&'() ]{2,40})/i
  );
  if (labeled) {
    const norm = normalizeBank(labeled[1]);
    if (norm && norm !== "Other") return norm;
  }
  for (const m of BANK_MATCHERS) if (m.needles.test(flat)) return m.label;
  return labeled ? "Other" : null;
}

// ─── Structured parsers (JSON / CSV) ─────────────────────────────────────────

const KEY_ALIASES: Record<keyof typeof EMPTY, string[]> = {
  borrowerName: ["borrowername", "borrower", "name", "lentto", "customer", "party", "person"],
  bankName: ["bankname", "bank", "lender", "financier", "institution", "nbfc", "lendername", "lendinginstitution"],
  principalAmount: ["principalamount", "principal", "loanamount", "amount", "loan", "sanctioned", "disbursed"],
  interestRate: ["interestrate", "interest", "rate", "roi", "apr", "annualrate"],
  tenureMonths: ["tenuremonths", "tenure", "tenor", "term", "loanterm", "duration", "period", "repaymentperiod", "months"],
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
    bankName: ((): string | null => {
      const v = pick(KEY_ALIASES.bankName);
      return v == null ? null : normalizeBank(String(v));
    })(),
    principalAmount: parseAmount(pick(KEY_ALIASES.principalAmount) as string | number | null),
    interestRate: parseRate(pick(KEY_ALIASES.interestRate) as string | number | null),
    tenureMonths: parseTenure(pick(KEY_ALIASES.tenureMonths) as string | number | null),
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
  // Tenure (in months) as a first-class field. Also used to derive a due date
  // when only a start date is present ("Tenure: 240 months" → start + 240).
  out.tenureMonths = pickTenureMonths(flat);
  if (out.startDate && !out.dueDate && out.tenureMonths) {
    out.dueDate = addMonths(out.startDate, out.tenureMonths);
  }

  // Lender / bank, normalised to a known dropdown label where possible.
  out.bankName = pickBank(flat);

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
  if (d.tenureMonths != null) got.push("tenure");
  if (d.startDate) got.push("start date");
  if (d.dueDate) got.push("due date");
  if (d.borrowerName) got.push("name");
  if (d.bankName) got.push("bank");

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
  const pdfjsLib = await loadPdfjs();
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

// ─── Financial-profile extraction ────────────────────────────────────────────
// Reuses the same on-device file→text pipeline as loan extraction, but maps the
// content onto Global Financial Profile fields: monthly income from salary
// slips, recurring expenses from bank statements. All values are best-effort
// and reviewed by the user before anything is saved.

export interface ExtractedProfileFields {
  name: string | null;
  monthlyIncome: number | null;
  additionalIncome: number | null;
  rent: number | null;
  insurance: number | null;
  utilities: number | null;
  internet: number | null;
  schoolFees: number | null;
  food: number | null;
  fuel: number | null;
  travel: number | null;
  entertainment: number | null;
  shopping: number | null;
  medical: number | null;
}

// One month's total for a recurring expense category. `month` is the "YYYY-MM"
// bucket the spend was tagged to.
export interface ExpenseMonth {
  month: string;
  total: number;
}

// Expense categories that can be averaged across months (everything except the
// non-recurring fields).
export type ExpenseKey = Exclude<
  keyof ExtractedProfileFields,
  "name" | "monthlyIncome" | "additionalIncome"
>;

export interface ExtractedProfile extends ExtractedProfileFields {
  confidence: "high" | "medium" | "low";
  notes: string;
  // Per-month totals behind each averaged expense category. Only present for
  // categories detected across more than one month; single-month (or dateless)
  // categories are omitted since there's nothing to average.
  breakdown: Partial<Record<ExpenseKey, ExpenseMonth[]>>;
}

// Human labels for each field, used in review UI and confidence notes. The key
// order also drives the order fields appear in the review card.
export const PROFILE_FIELD_LABELS: Record<keyof ExtractedProfileFields, string> = {
  name: "Name",
  monthlyIncome: "Monthly Income",
  additionalIncome: "Additional Income",
  rent: "Rent",
  insurance: "Insurance",
  utilities: "Utilities",
  internet: "Internet",
  schoolFees: "School Fees",
  food: "Food",
  fuel: "Fuel",
  travel: "Travel",
  entertainment: "Subscriptions",
  shopping: "Shopping",
  medical: "Medical",
};

const EMPTY_PROFILE_FIELDS: ExtractedProfileFields = {
  name: null,
  monthlyIncome: null,
  additionalIncome: null,
  rent: null,
  insurance: null,
  utilities: null,
  internet: null,
  schoolFees: null,
  food: null,
  fuel: null,
  travel: null,
  entertainment: null,
  shopping: null,
  medical: null,
};

// Net/take-home pay wins over gross — it's what actually lands in the account.
const NET_INCOME_RE =
  /net\s*(?:pay|salary|payable|amount|earnings)|take[-\s]*home(?:\s*(?:pay|salary))?|amount\s*credited|salary\s*credited/i;
const GROSS_INCOME_RE = /gross\s*(?:pay|salary|earnings)|total\s*earnings/i;

// Per-category recurring-expense labels seen on Indian bank statements.
const EXPENSE_RE: Record<
  Exclude<keyof ExtractedProfileFields, "name" | "monthlyIncome" | "additionalIncome">,
  RegExp
> = {
  rent: /house\s*rent|monthly\s*rent|\brent\b|landlord/i,
  insurance: /insurance\s*premium|premium\s*paid|insurance|\blic\b|policy\s*premium/i,
  utilities:
    /electricity\s*bill|water\s*bill|gas\s*bill|utility\s*bill|utilities|power\s*bill|\bbescom\b|\bmseb\b|\btneb\b/i,
  internet: /internet\s*bill|broadband|wi-?fi|fibernet|telecom\s*bill|mobile\s*(?:bill|recharge)/i,
  schoolFees:
    /school\s*fee|tuition\s*fee|tuition|college\s*fee|education\s*fee|class\s*fee|coaching\s*fee|coaching|university\s*fee|exam\s*fee/i,
  food: /groceries|grocery|supermarket|big\s*basket|swiggy|zomato|food\s*expenses/i,
  fuel: /fuel\s*(?:expense|cost)?|petrol|diesel|indian\s*oil|bharat\s*petroleum|hp\s*petrol/i,
  travel:
    /\buber\b|\bola\b|irctc|flights?|airlines?|air\s*ticket|\bcab\b|\bmetro\b|redbus|makemytrip|goibibo|travel\s*(?:expense|booking)?|\btravel\b/i,
  entertainment:
    /netflix|amazon\s*prime|prime\s*video|hotstar|disney\+?|spotify|youtube\s*premium|sony\s*liv|sonyliv|zee5|\bott\b|gym\s*(?:membership|fee|subscription)?|subscription\s*(?:fee|charge)?|subscriptions?/i,
  shopping:
    /amazon(?!\s*prime)|flipkart|myntra|ajio|nykaa|meesho|snapdeal|tatacliq|\bmall\b|apparel|clothing|\bshopping\b/i,
  medical:
    /medical\s*(?:expense|bill)?|hospital|pharmacy|chemist|doctor\s*(?:fee|visit)?|clinic|apollo|medplus|pharmeasy|health\s*care|healthcare|diagnostic|lab\s*test/i,
};

const ADDITIONAL_INCOME_RE =
  /additional\s*income|other\s*income|secondary\s*income|side\s*income|rental\s*income|freelance|bonus|incentive/i;

// Finds an amount that sits just after a label (e.g. "Net Pay: Rs. 85,000").
function labeledAmount(flat: string, label: RegExp): number | null {
  const re = new RegExp(
    `(?:${label.source})\\D{0,25}(₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(crore|cr|lakh|lac)?(?!\\s*%)`,
    "i"
  );
  const m = flat.match(re);
  if (!m) return null;
  return parseAmount(`${m[2]} ${m[3] ?? ""}`);
}

// Like labeledAmount, but returns EVERY labelled amount together with its
// position in the text, so multiple occurrences (across a multi-month bank
// statement) can be grouped by month rather than just reading the first.
function labeledAmounts(flat: string, label: RegExp): { amount: number; index: number }[] {
  const re = new RegExp(
    `(?:${label.source})\\D{0,25}(₹|rs\\.?|inr)?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(crore|cr|lakh|lac)?(?!\\s*%)`,
    "gi"
  );
  const out: { amount: number; index: number }[] = [];
  for (const m of flat.matchAll(re)) {
    const amt = parseAmount(`${m[2]} ${m[3] ?? ""}`);
    if (amt != null) out.push({ amount: amt, index: m.index ?? 0 });
  }
  return out;
}

// Matches a single date token (same shapes accepted by normalizeDate).
const DATE_TOKEN_RE =
  /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s*[a-z]{3,}\s*\d{4})/gi;

// Every parseable date in the text, as { index, month } where month is the
// "YYYY-MM" bucket. Ordered by position (matchAll yields ascending indices).
function datesByIndex(flat: string): { index: number; month: string }[] {
  const out: { index: number; month: string }[] = [];
  for (const m of flat.matchAll(DATE_TOKEN_RE)) {
    const iso = normalizeDate(m[1]);
    if (!iso) continue;
    out.push({ index: m.index ?? 0, month: iso.slice(0, 7) });
  }
  return out;
}

// The month bucket for an amount at `index`: the nearest date at or before it,
// otherwise the nearest date after it. Null when the text has no dates.
function monthForIndex(
  index: number,
  dates: { index: number; month: string }[]
): string | null {
  if (!dates.length) return null;
  let before: string | null = null;
  for (const d of dates) {
    if (d.index <= index) before = d.month;
    else return before ?? d.month;
  }
  return before;
}

// Sums every labelled amount for a category per month, then averages across the
// months it appears in. A statement that repeats "Groceries" five times in one
// month yields that month's total; one spanning several months yields the
// per-month average. Returns the figure, the number of months averaged over
// (1 = a single month, i.e. no averaging applied), and the per-month totals so
// the review UI can show what went into the average.
function aggregateExpense(
  flat: string,
  label: RegExp,
  dates: { index: number; month: string }[]
): { value: number | null; months: number; breakdown: ExpenseMonth[] } {
  const matches = labeledAmounts(flat, label);
  if (!matches.length) return { value: null, months: 0, breakdown: [] };
  const perMonth = new Map<string, number>();
  for (const { amount, index } of matches) {
    const key = monthForIndex(index, dates) ?? "__single__";
    perMonth.set(key, (perMonth.get(key) ?? 0) + amount);
  }
  const sums = [...perMonth.values()];
  const total = sums.reduce((a, b) => a + b, 0);
  // Per-month totals, oldest first, excluding the synthetic single-bucket key
  // (a dateless statement has nothing to break down).
  const breakdown: ExpenseMonth[] = [...perMonth.entries()]
    .filter(([month]) => month !== "__single__")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, total: amount }));
  return { value: Math.round(total / sums.length), months: sums.length, breakdown };
}

// Full free-text profile parse, including the multi-month averaging metadata
// (the largest number of months any expense category was averaged over). The
// public profileFromText returns just the fields; the file pipeline uses the
// metadata to note averaging in the confidence summary.
function profileFromTextDetailed(text: string): {
  fields: ExtractedProfileFields;
  averagedMonths: number;
  breakdown: Partial<Record<ExpenseKey, ExpenseMonth[]>>;
} {
  const out = { ...EMPTY_PROFILE_FIELDS };
  const flat = text.replace(/\s+/g, " ");

  out.monthlyIncome = labeledAmount(flat, NET_INCOME_RE) ?? labeledAmount(flat, GROSS_INCOME_RE);
  out.additionalIncome = labeledAmount(flat, ADDITIONAL_INCOME_RE);

  // Recurring expenses are aggregated across the whole statement, not read once.
  const dates = datesByIndex(flat);
  let averagedMonths = 1;
  const breakdown: Partial<Record<ExpenseKey, ExpenseMonth[]>> = {};
  for (const key of Object.keys(EXPENSE_RE) as ExpenseKey[]) {
    const { value, months, breakdown: perMonth } = aggregateExpense(flat, EXPENSE_RE[key], dates);
    out[key] = value;
    if (months > averagedMonths) averagedMonths = months;
    // Only keep a breakdown when there's more than one month to compare.
    if (perMonth.length > 1) breakdown[key] = perMonth;
  }

  // Name on a salary slip / statement — colon or dash separated.
  const name = text.match(
    /(?:employee(?:'s)?\s*name|account\s*holder|name\s*of\s*(?:the\s*)?employee|customer\s*name|\bname)\s*[:\-]\s*([A-Za-z][A-Za-z.'\- ]{1,40})/i
  );
  if (name) {
    const nm = name[1]
      .trim()
      .replace(/\s+/g, " ")
      .split(/\s+(?:net|gross|pay|salary|date|account|emp|id|designation|department)\b/i)[0]
      .trim();
    if (nm) out.name = nm;
  }

  return { fields: out, averagedMonths, breakdown };
}

export function profileFromText(text: string): ExtractedProfileFields {
  return profileFromTextDetailed(text).fields;
}

const PROFILE_KEY_ALIASES: Record<keyof ExtractedProfileFields, string[]> = {
  name: ["name", "employeename", "accountholder", "fullname"],
  monthlyIncome: [
    "monthlyincome", "netpay", "netsalary", "takehome", "netamount", "income", "salary",
  ],
  additionalIncome: ["additionalincome", "otherincome", "secondaryincome", "bonus", "incentive"],
  rent: ["rent", "houserent", "monthlyrent"],
  insurance: ["insurance", "premium", "insurancepremium"],
  utilities: ["utilities", "utility", "electricity", "power", "waterbill"],
  internet: ["internet", "broadband", "wifi"],
  schoolFees: ["schoolfees", "tuition", "tuitionfees", "educationfees", "education", "collegefees", "coaching"],
  food: ["food", "groceries", "grocery"],
  fuel: ["fuel", "petrol", "diesel"],
  travel: ["travel", "uber", "ola", "cab", "flights", "irctc"],
  entertainment: ["entertainment", "subscriptions", "subscription", "streaming", "netflix", "gym"],
  shopping: ["shopping", "amazon", "flipkart", "myntra", "apparel", "clothing"],
  medical: ["medical", "healthcare", "health", "pharmacy", "hospital", "medicalexpenses"],
};

function profileFromRecord(rec: Record<string, unknown>): ExtractedProfileFields {
  const norm: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    norm[k.toLowerCase().replace(/[^a-z]/g, "")] = v;
  }
  const pick = (aliases: string[]): unknown => {
    for (const a of aliases) if (norm[a] != null && norm[a] !== "") return norm[a];
    return null;
  };
  return {
    name: ((): string | null => {
      const v = pick(PROFILE_KEY_ALIASES.name);
      return v == null ? null : String(v).trim() || null;
    })(),
    monthlyIncome: parseAmount(pick(PROFILE_KEY_ALIASES.monthlyIncome) as string | number | null),
    additionalIncome: parseAmount(pick(PROFILE_KEY_ALIASES.additionalIncome) as string | number | null),
    rent: parseAmount(pick(PROFILE_KEY_ALIASES.rent) as string | number | null),
    insurance: parseAmount(pick(PROFILE_KEY_ALIASES.insurance) as string | number | null),
    utilities: parseAmount(pick(PROFILE_KEY_ALIASES.utilities) as string | number | null),
    internet: parseAmount(pick(PROFILE_KEY_ALIASES.internet) as string | number | null),
    schoolFees: parseAmount(pick(PROFILE_KEY_ALIASES.schoolFees) as string | number | null),
    food: parseAmount(pick(PROFILE_KEY_ALIASES.food) as string | number | null),
    fuel: parseAmount(pick(PROFILE_KEY_ALIASES.fuel) as string | number | null),
    travel: parseAmount(pick(PROFILE_KEY_ALIASES.travel) as string | number | null),
    entertainment: parseAmount(pick(PROFILE_KEY_ALIASES.entertainment) as string | number | null),
    shopping: parseAmount(pick(PROFILE_KEY_ALIASES.shopping) as string | number | null),
    medical: parseAmount(pick(PROFILE_KEY_ALIASES.medical) as string | number | null),
  };
}

export function profileFromJSON(text: string): ExtractedProfileFields {
  const data = JSON.parse(text);
  const rec = Array.isArray(data) ? data[0] : data;
  if (!rec || typeof rec !== "object") throw new Error("No profile object found in the JSON file.");
  return profileFromRecord(rec as Record<string, unknown>);
}

export function profileFromCSV(text: string): ExtractedProfileFields {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  const headers = splitCSVLine(lines[0]);
  const values = splitCSVLine(lines[1]);
  const rec: Record<string, unknown> = {};
  headers.forEach((h, i) => (rec[h] = values[i] ?? ""));
  return profileFromRecord(rec);
}

function scoreProfile(
  d: ExtractedProfileFields,
  source: string,
  averagedMonths = 1,
  breakdown: Partial<Record<ExpenseKey, ExpenseMonth[]>> = {}
): ExtractedProfile {
  const got: string[] = [];
  for (const key of Object.keys(PROFILE_FIELD_LABELS) as (keyof ExtractedProfileFields)[]) {
    if (d[key] != null && d[key] !== "") got.push(PROFILE_FIELD_LABELS[key].toLowerCase());
  }

  let confidence: ExtractedProfile["confidence"];
  if (got.length >= 4) confidence = "high";
  else if (got.length >= 2) confidence = "medium";
  else confidence = "low";

  // When a statement spans multiple months, the recurring expenses are an
  // average of each month's total — call that out so the figures aren't taken
  // as a single month's spend.
  const averagedNote =
    averagedMonths > 1
      ? ` Recurring expenses are averaged across ${averagedMonths} months of statement data.`
      : "";

  const notes =
    got.length === 0
      ? `No income or expense details found in ${source} — please fill the fields below manually.`
      : `Extracted from ${source}: ${got.join(", ")}.${averagedNote} Please review before saving.`;

  return { ...d, confidence, notes, breakdown };
}

export async function extractProfileFromFile(
  file: File,
  onProgress?: ExtractProgress
): Promise<ExtractedProfile> {
  const kind = fileKind(file);
  switch (kind) {
    case "json": {
      onProgress?.({ stage: "reading" });
      return scoreProfile(profileFromJSON(await file.text()), "JSON");
    }
    case "csv": {
      onProgress?.({ stage: "reading" });
      return scoreProfile(profileFromCSV(await file.text()), "CSV");
    }
    case "text": {
      onProgress?.({ stage: "reading" });
      const { fields, averagedMonths, breakdown } = profileFromTextDetailed(await file.text());
      return scoreProfile(fields, "Text", averagedMonths, breakdown);
    }
    case "pdf": {
      onProgress?.({ stage: "pdf" });
      const text = await pdfToText(file);
      if (!text.trim()) {
        throw new Error("No text found in this PDF (it may be a scanned image) — upload a screenshot instead, or fill the form manually.");
      }
      const { fields, averagedMonths, breakdown } = profileFromTextDetailed(text);
      return scoreProfile(fields, "PDF", averagedMonths, breakdown);
    }
    case "image": {
      onProgress?.({ stage: "ocr", percent: 0 });
      const text = await imageToText(file, onProgress);
      const { fields, averagedMonths, breakdown } = profileFromTextDetailed(text);
      return scoreProfile(fields, "Image (OCR)", averagedMonths, breakdown);
    }
    default:
      throw new Error("Unsupported file. Please upload a JSON, CSV, PDF, or image (PNG/JPG) file.");
  }
}
