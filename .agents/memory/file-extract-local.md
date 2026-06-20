---
name: Local file extraction (web loan-tracker)
description: The web loan-tracker extracts loan data from uploads locally without any AI/LLM; the mobile app still uses the AI server route.
---

The web **loan-tracker** extracts loan fields from uploaded files entirely in the browser, **no AI/LLM**: JSON/CSV parsed directly (key-alias mapping), PDF via `pdfjs-dist` text extraction, images via `tesseract.js` OCR (dynamic import with a progress callback), plus a free-text regex parser (amounts with lakh/crore/₹, rate capped ≤100, dates parsed day-first with DD/MM↔MM/DD and month-name handling, borrower name). Confidence is scored by how many fields were found; user-facing notes are Hinglish.

**Why:** the user explicitly asked to stop using AI to extract uploaded files but to keep upload and read all types locally including PDF and image.

**How to apply:** keep upload parsing in the web app local. The AI server route `artifacts/api-server/src/routes/extract-loan.ts` and its OpenAI dep are intentionally **kept** because `ledger-mobile` (`app/loan/new.tsx`) still calls `/api/extract-loan`. Do not delete that route while mobile depends on it.

**Free-text parsing gotchas (regex parser):**
- Interest rate: a doc has many `%` (GST, processing fee, penalty). Pick the `%` next to an interest/rate label and skip fee-context ones — BUT rate-context must override fee-context, because "interest **charged** at 2%" contains the substring "charge". Skipping on fee words alone drops the real rate.
- Amount: check strong principal labels (principal/loan amount/sanctioned/disbursed) before the generic "amount" label, or an EMI/fee figure wins. Reject a number followed by `%` (it's a rate, not a principal).
- Borrower name: keep a `:`/`-` separator required (optional-separator matches prose like "Borrower agrees to…"). Names from single-line PDF/OCR bleed into the next field — trim trailing field-label words.
