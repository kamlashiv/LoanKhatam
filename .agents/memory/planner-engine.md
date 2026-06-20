---
name: Loan Payoff Planner engine
description: Design decisions for the standalone Planner's amortization simulation (loan-tracker web).
---

# Loan Payoff Planner engine

The standalone `/planner` page runs its own in-browser amortization simulation (separate from the per-loan bank-style schedule). Key decisions:

- **Baseline vs plan.** Baseline = principal/rate/tenure only (no extra, no lumps, no top-up). Plan = baseline + recurring extra EMI + per-year lump prepayments + optional top-up. `interestSaved`/`monthsSaved` are `Math.max(0, baseline - plan)` so a top-up that raises total interest never shows negative savings.
  **Why:** baseline must represent the original sanction so "savings" means savings vs doing nothing.

- **Per-month accounting invariant.** Each month records `emi` as the *actual installment paid* (`interest + scheduled principal`), not the nominal EMI. In the final/overpay month the installment is reduced to clear the exact balance and extra is zeroed. This keeps `sum(emi) + sum(extra) === sum(interest) + sum(principal)` and year/CSV/PDF totals consistent.
  **Why:** a prior version recorded the full nominal EMI in the payoff month, inflating ledger/export totals (caught in code review).
  **How to apply:** if you change the simulation loop, re-verify the reconciliation holds (emi+extra == interest+principal) and that the final closing balance is 0.

- **Top-up modeling.** At its disbursement month the top-up amount is added to the balance, the rate is blended weighted by outstanding balance, and the EMI is recomputed over the remaining tenure (so payoff still targets the original tenure). The top-up month is clamped to `[1, tenureMonths]` in the UI/export/simulation so they never disagree.

- **Editable ledger.** The year-by-year ledger's "Extra Prepaid" input edits a `yearLumps` map applied as a one-time lump at each year's last month; strategy presets populate it uniformly. This (plus the editable AI-extraction review card) is how the page satisfies "permission to edit the data".
