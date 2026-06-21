---
name: Credit Cards / Cards & Accounts feature
description: How the graduated credit-card management feature is scoped and what's real vs preview in loan-tracker.
---

# Credit Cards ("Cards & Accounts")

Graduated from the approved canvas mockup "Cards & Auto-Sync". Lives at `/credit-cards` in loan-tracker.

## Real vs preview
- **Real, DB-backed per-user CRUD:** the credit-card wallet (add/edit/delete cards, summary strip, utilization bars). Full contract-first stack: `credit_cards` schema → openapi `/credit-cards` paths → codegen hooks/zod → `routes/credit-cards.ts`.
- **Real Auto-Sync (confirm-before-add):** Paste text → `POST /extract-financials` (AI gpt-5-mini via `lib/ai-extract.ts`). Gmail scan → `GET /gmail/status` + `POST /gmail/scan` (`lib/gmail.ts`, raw Replit connector proxy `connector_names=google-mail`, token never cached). Both return DETECTED items only; nothing is written until the user confirms. Detected cards confirm → `POST /credit-cards`; detected loans route to `/loans/new` prefill (never auto-created).

## Auto-Sync constraints (learned)
- **Single Repl-bound mailbox:** the Gmail connector authorizes one Google account for the whole Repl, so the feature is personal/single-user by nature. `/gmail/*` routes gate on optional `GMAIL_OWNER_USER_ID` (Clerk user id) so a multi-user deployment can stop other signed-in users reading the owner's derived financial data. **Why:** Repl-scoped credential + per-user app = cross-user data exposure without the gate.
- `GmailNotConnectedError` → HTTP 503 so the frontend shows a connect prompt rather than a hard failure. Connecting requires the user to OAuth via the Gmail connector (they may dismiss it; paste path works without Gmail).
- `toNum` in ai-extract defensively scales `lakh`/`crore` strings even though the prompt asks for numeric-only output.

## Mutation authz rule (review rejection fixed)
PATCH/DELETE by id must enforce ownership **in the write predicate** (`and(eq(id), eq(userId))`) and infer 404 from empty `.returning()`, not via a separate pre-check + id-only write. Also reject empty PATCH bodies (no fields → 400) before calling `.set()`, or drizzle throws a 500.
