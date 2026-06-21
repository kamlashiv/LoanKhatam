import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export type Confidence = "high" | "medium" | "low";

export interface DetectedCard {
  bank: string;
  cardName: string;
  last4: string;
  network: string;
  creditLimit: number | null;
  outstanding: number | null;
  dueDate: string | null;
  confidence: Confidence;
  source: string;
}

export interface DetectedLoan {
  lender: string;
  loanType: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  emi: number | null;
  startDate: string | null;
  dueDate: string | null;
  confidence: Confidence;
  source: string;
}

export interface ExtractResult {
  cards: DetectedCard[];
  loans: DetectedLoan[];
}

const SYSTEM_PROMPT = `You are a financial-data extractor for an Indian personal finance app. You read raw text from bank/credit-card statements, e-bills, and SMS/email transaction alerts, and you detect (1) CREDIT CARDS and (2) LOANS the person holds.

Return ONLY a valid JSON object of this exact shape (no markdown, no prose):
{
  "cards": [
    {
      "bank": string,                 // issuing bank, e.g. "HDFC Bank"
      "cardName": string,             // product name if present, else a sensible label like "Credit Card"
      "last4": string,                // exactly 4 digits; the last 4 of the card number
      "network": string,              // "VISA" | "MasterCard" | "RuPay" | "American Express" | "Diners Club" | "Unknown"
      "creditLimit": number | null,   // total credit limit in INR
      "outstanding": number | null,   // current total amount due / statement balance in INR
      "dueDate": "YYYY-MM-DD" | null, // payment due date
      "confidence": "high" | "medium" | "low"
    }
  ],
  "loans": [
    {
      "lender": string,               // lender/bank/NBFC, e.g. "Bajaj Finserv"
      "loanType": string | null,      // e.g. "Personal Loan", "Car Loan", "Home Loan"
      "principalAmount": number | null,// sanctioned/disbursed amount in INR
      "interestRate": number | null,  // annual %
      "emi": number | null,           // monthly instalment in INR
      "startDate": "YYYY-MM-DD" | null,
      "dueDate": "YYYY-MM-DD" | null, // next due date or maturity date
      "confidence": "high" | "medium" | "low"
    }
  ]
}

Rules:
- All money values are plain numbers in Indian Rupees: no symbols, no commas. Expand Indian units: 1 lakh = 100000, 1 crore = 10000000 (e.g. "2.5 lakh" => 250000). Read digits exactly; do not round.
- last4 MUST be exactly 4 digits. If you only see a masked number, use the trailing 4 digits. If you cannot find 4 digits, do not emit that card.
- interestRate is the ANNUAL percentage. If a monthly/p.m. rate is given, multiply by 12. Never return a rate above 100.
- Dates must be YYYY-MM-DD. Indian text is day-first (DD/MM/YYYY) — for ambiguous numeric dates assume the first number is the day.
- Only include an item if there is real evidence for it in the text. Do NOT invent cards or loans. If nothing is found, return {"cards": [], "loans": []}.
- Deduplicate: the same card (same bank + last4) or same loan must appear once. Merge details across multiple mentions.
- Set "confidence" to "high" only when the key fields are read with certainty; otherwise "medium" or "low".
- Return ONLY the JSON object.`;

function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim() !== "") return v.trim();
  return null;
}

function toConfidence(v: unknown): Confidence {
  return v === "high" || v === "low" ? v : "medium";
}

function normalize(parsed: any, source: string): ExtractResult {
  const rawCards = Array.isArray(parsed?.cards) ? parsed.cards : [];
  const rawLoans = Array.isArray(parsed?.loans) ? parsed.loans : [];

  const cards: DetectedCard[] = [];
  for (const c of rawCards) {
    const last4 = (toStr(c?.last4) ?? "").replace(/\D/g, "").slice(-4);
    const bank = toStr(c?.bank);
    if (last4.length !== 4 || !bank) continue;
    cards.push({
      bank,
      cardName: toStr(c?.cardName) ?? "Credit Card",
      last4,
      network: toStr(c?.network) ?? "Unknown",
      creditLimit: toNum(c?.creditLimit),
      outstanding: toNum(c?.outstanding),
      dueDate: toStr(c?.dueDate),
      confidence: toConfidence(c?.confidence),
      source,
    });
  }

  const loans: DetectedLoan[] = [];
  for (const l of rawLoans) {
    const lender = toStr(l?.lender);
    if (!lender) continue;
    loans.push({
      lender,
      loanType: toStr(l?.loanType),
      principalAmount: toNum(l?.principalAmount),
      interestRate: toNum(l?.interestRate),
      emi: toNum(l?.emi),
      startDate: toStr(l?.startDate),
      dueDate: toStr(l?.dueDate),
      confidence: toConfidence(l?.confidence),
      source,
    });
  }

  // Deduplicate
  const seenCards = new Set<string>();
  const dedupCards = cards.filter((c) => {
    const k = `${c.bank.toLowerCase()}|${c.last4}`;
    if (seenCards.has(k)) return false;
    seenCards.add(k);
    return true;
  });
  const seenLoans = new Set<string>();
  const dedupLoans = loans.filter((l) => {
    const k = `${l.lender.toLowerCase()}|${l.loanType ?? ""}|${l.principalAmount ?? ""}`;
    if (seenLoans.has(k)) return false;
    seenLoans.add(k);
    return true;
  });

  return { cards: dedupCards, loans: dedupLoans };
}

/**
 * Run the AI extractor over arbitrary text and return detected cards + loans.
 * `source` labels where the text came from (e.g. "Gmail", "Pasted").
 */
export async function extractFinancialsFromText(
  text: string,
  source: string,
): Promise<ExtractResult> {
  const trimmed = text.trim();
  if (!trimmed) return { cards: [], loans: [] };

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Detect all credit cards and loans in the following text. Return only the JSON object.\n\n${trimmed.slice(0, 24000)}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(cleanJson(content));
  return normalize(parsed, source);
}
