---
name: Credit Cards / Cards & Accounts feature
description: How the graduated credit-card management feature is scoped and what's real vs preview in loan-tracker.
---

# Credit Cards ("Cards & Accounts")

Graduated from the approved canvas mockup "Cards & Auto-Sync". Lives at `/credit-cards` in loan-tracker.

## Real vs preview
- **Real, DB-backed per-user CRUD:** the credit-card wallet (add/edit/delete cards, summary strip, utilization bars). Full contract-first stack: `credit_cards` schema → openapi `/credit-cards` paths → codegen hooks/zod → `routes/credit-cards.ts`.
- **Intentionally "Coming soon" preview (NOT functional):** Auto-Sync hero (Gmail connect / mobile OTP), AI bank detection grid, "Loans found — confirm to add" list. All controls are `disabled`, clearly badged "Coming soon", and use example/illustrative data.

**Why preview:** live Gmail/SMS/all-bank sync is infeasible without Account Aggregator/Plaid licensing + Google API verification. Do not wire these up as if live; keep the honest labeling.

## Mutation authz rule (review rejection fixed)
PATCH/DELETE by id must enforce ownership **in the write predicate** (`and(eq(id), eq(userId))`) and infer 404 from empty `.returning()`, not via a separate pre-check + id-only write. Also reject empty PATCH bodies (no fields → 400) before calling `.set()`, or drizzle throws a 500.
